import hashlib
import hmac
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import httpx

from app.config import settings
from app.core.security import normalize_phone
from app.db.database import db, new_id, utc_now_iso

WINDOW_24H_SECONDS = 24 * 60 * 60


def format_readable_timestamp(iso_ts: Optional[str] = None) -> str:
    try:
        dt = datetime.fromisoformat(iso_ts) if iso_ts else datetime.now(timezone.utc)
    except Exception:
        dt = datetime.now(timezone.utc)
    return dt.strftime("%Y-%m-%d %H:%M UTC")


def is_within_24h_window(last_inbound_at: Optional[str]) -> bool:
    if not last_inbound_at:
        return False
    try:
        dt = datetime.fromisoformat(last_inbound_at)
        elapsed = (datetime.now(timezone.utc) - dt).total_seconds()
        return 0 <= elapsed <= WINDOW_24H_SECONDS
    except Exception:
        return False


def verify_webhook_signature(raw_body: bytes, signature_header: Optional[str]) -> bool:
    if not settings.whatsapp_app_secret:
        return True
    if not signature_header:
        return False
    expected = "sha256=" + hmac.new(
        settings.whatsapp_app_secret.encode("utf-8"), raw_body, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature_header, expected)


async def get_whatsapp_settings() -> Dict[str, Any]:
    cfg = await db.find_one("whatsapp_settings", {"key": "default"})
    return cfg or {}


def render_template_text(template_str: str, values: Dict[str, str]) -> str:
    result = template_str or ""
    for k, v in values.items():
        result = result.replace("{" + k + "}", str(v or ""))
    return result


async def find_duplicate_recent_message(dedupe_key: str, window_seconds: int = 120) -> Optional[Dict[str, Any]]:
    if not dedupe_key:
        return None
    existing = await db.find("whatsapp_messages", {"dedupe_key": dedupe_key}, sort_field="sent_at", descending=True, limit=1)
    if not existing:
        return None
    msg = existing[0]
    if msg.get("message_status") == "failed":
        return None
    ts = msg.get("sent_at") or msg.get("created_at")
    if not ts:
        return None
    try:
        elapsed = (datetime.now(timezone.utc) - datetime.fromisoformat(ts)).total_seconds()
        if elapsed < window_seconds:
            return msg
    except Exception:
        return None
    return None


async def dispatch_whatsapp_record(message_id: str) -> Dict[str, Any]:
    """
    Executes actual delivery for a queued/failed WhatsApp message record via Official Meta Cloud API.
    If Meta credentials are not yet configured in environment variables, logs cleanly in sandbox_logged mode
    so local end-to-end verification works while keeping production Meta Cloud API code 100% live.
    """
    record = await db.find_one("whatsapp_messages", {"message_id": message_id})
    if not record:
        return {"ok": False, "error": "Message record not found."}

    recipient_number = normalize_phone(record.get("recipient_number", ""))
    if len(recipient_number) < 10:
        err = (
            "Recipient WhatsApp number is missing or invalid. "
            "Configure Business Owner WhatsApp Number in Admin -> WhatsApp Settings."
            if record.get("recipient_type") == "owner"
            else "Customer WhatsApp number is invalid."
        )
        updated = await db.update_one(
            "whatsapp_messages",
            {"message_id": message_id},
            {"message_status": "failed", "error_details": err, "sent_at": utc_now_iso()},
        )
        return {"ok": False, "record": updated, "error": err}

    body_text = record.get("message_body", "")
    template_name = record.get("meta_template_name", "")
    template_lang = record.get("meta_template_language", settings.whatsapp_template_language)
    template_params = record.get("meta_template_params", [])

    # Check if Meta Cloud API credentials are set
    if not settings.whatsapp_cloud_configured:
        now = utc_now_iso()
        updated = await db.update_one(
            "whatsapp_messages",
            {"message_id": message_id},
            {
                "message_status": "sandbox_logged",
                "provider_message_id": f"sandbox_{message_id}",
                "sent_at": now,
                "error_details": (
                    "WhatsApp Cloud API credentials (WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN) "
                    "not configured in backend .env yet. Automated payload verified and logged."
                ),
            },
        )
        return {"ok": True, "mode": "sandbox_logged", "record": updated}

    endpoint = f"https://graph.facebook.com/{settings.whatsapp_api_version}/{settings.whatsapp_phone_number_id}/messages"

    if template_name:
        payload: Dict[str, Any] = {
            "messaging_product": "whatsapp",
            "to": recipient_number,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {"code": template_lang},
            },
        }
        if template_params:
            payload["template"]["components"] = [
                {
                    "type": "body",
                    "parameters": [{"type": "text", "text": str(p)} for p in template_params],
                }
            ]
    else:
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": recipient_number,
            "type": "text",
            "text": {"preview_url": False, "body": body_text},
        }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                endpoint,
                headers={
                    "Authorization": f"Bearer {settings.whatsapp_access_token}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
            data = resp.json()

        if resp.status_code >= 400:
            err_msg = data.get("error", {}).get("message") or f"Meta API HTTP {resp.status_code}"
            updated = await db.update_one(
                "whatsapp_messages",
                {"message_id": message_id},
                {
                    "message_status": "failed",
                    "error_details": err_msg,
                    "retry_count": int(record.get("retry_count", 0)) + 1,
                },
            )
            return {"ok": False, "mode": "live", "record": updated, "error": err_msg}

        wa_msg_id = (data.get("messages") or [{}])[0].get("id", "")
        updated = await db.update_one(
            "whatsapp_messages",
            {"message_id": message_id},
            {
                "message_status": "sent",
                "provider_message_id": wa_msg_id,
                "sent_at": utc_now_iso(),
                "error_details": "",
            },
        )
        return {"ok": True, "mode": "live", "record": updated, "provider_message_id": wa_msg_id}
    except Exception as exc:
        updated = await db.update_one(
            "whatsapp_messages",
            {"message_id": message_id},
            {
                "message_status": "failed",
                "error_details": str(exc),
                "retry_count": int(record.get("retry_count", 0)) + 1,
            },
        )
        return {"ok": False, "mode": "live", "record": updated, "error": str(exc)}


async def create_owner_notification_record(
    *,
    event_type: str,  # registration | first_login | assessment
    user: Dict[str, Any],
    condition: Optional[Dict[str, Any]] = None,
    product: Optional[Dict[str, Any]] = None,
    assessment_timestamp: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    cfg = await get_whatsapp_settings()
    if event_type == "registration" and not cfg.get("notify_owner_on_register", True):
        return None
    if event_type == "first_login" and not cfg.get("notify_owner_on_first_login", True):
        return None
    if event_type == "assessment" and not cfg.get("notify_owner_on_assessment", True):
        return None

    owner_number = normalize_phone(
        cfg.get("owner_whatsapp_number") or settings.business_owner_whatsapp_number or ""
    )

    condition_label = condition.get("category_label") if condition else "Not yet selected"
    product_name = product.get("product_name") if product else "FOLIBEIR Product"
    consent_status = "Opted In" if user.get("whatsapp_consent") else "Not Opted In"

    tpl_key = {
        "registration": "owner_register_template",
        "first_login": "owner_first_login_template",
        "assessment": "owner_assessment_template",
    }.get(event_type, "owner_assessment_template")

    body_text = render_template_text(
        cfg.get(tpl_key, ""),
        {
            "customer_name": user.get("full_name", "Customer"),
            "customer_email": user.get("email", ""),
            "customer_whatsapp": user.get("whatsapp_number", ""),
            "condition_label": condition_label,
            "product_name": product_name,
            "consent_status": consent_status,
            "date_time": format_readable_timestamp(assessment_timestamp),
        },
    )

    dedupe_key = f"owner:{event_type}:{user.get('user_id')}:{condition.get('code') if condition else 'none'}"
    dup = await find_duplicate_recent_message(dedupe_key)
    if dup:
        return dup

    owner_tpl_name = cfg.get("owner_template_name") or settings.whatsapp_owner_template_name
    record = await db.insert_one(
        "whatsapp_messages",
        {
            "message_id": new_id("wamsg"),
            "user_id": user.get("user_id", ""),
            "customer_name": user.get("full_name", ""),
            "recipient_type": "owner",
            "recipient_number": owner_number,
            "message_template": f"owner_{event_type}",
            "message_body": body_text,
            "message_status": "queued",
            "provider_message_id": "",
            "meta_template_name": owner_tpl_name,
            "meta_template_language": cfg.get("template_language", settings.whatsapp_template_language),
            "meta_template_params": [
                user.get("full_name", "Customer"),
                user.get("whatsapp_number", ""),
                condition_label,
            ],
            "dedupe_key": dedupe_key,
            "retry_count": 0,
            "sent_at": utc_now_iso(),
            "delivered_at": None,
            "error_details": "",
        },
    )
    return record


async def create_customer_assessment_record(
    *,
    user: Dict[str, Any],
    condition: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    """
    Strictly enforces explicit WhatsApp opt-in consent before queuing automated customer message.
    """
    cfg = await get_whatsapp_settings()
    if not cfg.get("auto_message_customer_on_assessment", True):
        return None
    if not user.get("whatsapp_consent"):
        return None

    customer_number = normalize_phone(user.get("whatsapp_number", ""))
    cond_code = condition.get("code", "condition-1")
    templates = cfg.get("customer_templates") or {}
    raw_tpl = templates.get(cond_code) or templates.get("condition-1") or ""

    body_text = render_template_text(
        raw_tpl,
        {
            "customer_name": user.get("full_name", "Customer"),
            "condition_label": condition.get("category_label", ""),
        },
    )

    dedupe_key = f"customer:assessment:{user.get('user_id')}:{cond_code}"
    dup = await find_duplicate_recent_message(dedupe_key)
    if dup:
        return dup

    # Meta Policy: use approved template outside 24h customer-service window if configured
    in_window = is_within_24h_window(user.get("last_whatsapp_inbound_at"))
    meta_tpl = "" if in_window else (cfg.get("customer_template_name") or settings.whatsapp_customer_template_name)

    record = await db.insert_one(
        "whatsapp_messages",
        {
            "message_id": new_id("wamsg"),
            "user_id": user.get("user_id", ""),
            "customer_name": user.get("full_name", ""),
            "recipient_type": "customer",
            "recipient_number": customer_number,
            "message_template": f"customer_{cond_code}",
            "message_body": body_text,
            "message_status": "queued",
            "provider_message_id": "",
            "meta_template_name": meta_tpl,
            "meta_template_language": cfg.get("template_language", settings.whatsapp_template_language),
            "meta_template_params": [
                user.get("full_name", "Customer"),
                condition.get("category_label", ""),
            ],
            "dedupe_key": dedupe_key,
            "retry_count": 0,
            "sent_at": utc_now_iso(),
            "delivered_at": None,
            "error_details": "",
        },
    )
    return record


async def process_meta_webhook_payload(payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    processed: List[Dict[str, Any]] = []
    for entry in payload.get("entry") or []:
        for change in entry.get("changes") or []:
            value = change.get("value") or {}

            # 1. Delivery status callbacks (sent -> delivered -> read -> failed)
            for st in value.get("statuses") or []:
                wa_id = st.get("id")
                status_val = st.get("status")
                if wa_id and status_val in {"sent", "delivered", "read", "failed"}:
                    patch: Dict[str, Any] = {"message_status": status_val}
                    if status_val in {"delivered", "read"}:
                        patch["delivered_at"] = utc_now_iso()
                    if status_val == "failed":
                        errs = st.get("errors") or []
                        patch["error_details"] = errs[0].get("title", "Delivery failed") if errs else "Delivery failed"
                    await db.update_one("whatsapp_messages", {"provider_message_id": wa_id}, patch)
                    processed.append({"type": "status", "wa_id": wa_id, "status": status_val})

            # 2. Inbound customer replies (opens 24h Meta customer-service window)
            for msg in value.get("messages") or []:
                from_phone = normalize_phone(msg.get("from", ""))
                if not from_phone:
                    continue
                user = await db.find_one("users", {"whatsapp_number": from_phone})
                now = utc_now_iso()
                if user:
                    await db.update_one(
                        "users",
                        {"user_id": user["user_id"]},
                        {"last_whatsapp_inbound_at": now},
                    )
                text_body = (msg.get("text") or {}).get("body") or "[WhatsApp media/interactive reply]"
                await db.insert_one(
                    "whatsapp_messages",
                    {
                        "message_id": new_id("wamsg"),
                        "user_id": user["user_id"] if user else "",
                        "customer_name": user["full_name"] if user else from_phone,
                        "recipient_type": "inbound_customer",
                        "recipient_number": from_phone,
                        "message_template": "inbound_message",
                        "message_body": text_body,
                        "message_status": "delivered",
                        "provider_message_id": msg.get("id", ""),
                        "dedupe_key": f"inbound:{msg.get('id', now)}",
                        "retry_count": 0,
                        "sent_at": now,
                        "delivered_at": now,
                        "error_details": "",
                    },
                )
                processed.append({"type": "inbound", "from": from_phone})
    return processed
