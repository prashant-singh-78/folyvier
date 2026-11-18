from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.core.security import (
    get_current_user,
    normalize_phone,
    sanitize_user,
    validate_whatsapp_number,
)
from app.db.database import db, new_id, utc_now_iso
from app.services.job_queue import enqueue_whatsapp_dispatch
from app.services.whatsapp_service import (
    create_customer_assessment_record,
    create_owner_notification_record,
)

router = APIRouter(prefix="/api/user", tags=["User Dashboard & Assessment"])


class ProfileUpdatePayload(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=2, max_length=120)
    mobile_number: Optional[str] = Field(default=None, min_length=8, max_length=20)
    whatsapp_number: Optional[str] = Field(default=None, min_length=10, max_length=20)
    whatsapp_consent: Optional[bool] = None


class AssessmentPayload(BaseModel):
    selected_condition: str  # condition-1 | condition-2 | condition-3
    confirm_whatsapp_consent: Optional[bool] = None


@router.get("/dashboard")
async def get_user_dashboard(user=Depends(get_current_user)):
    assessments = await db.find(
        "hair_assessments",
        {"user_id": user["user_id"]},
        sort_field="assessment_timestamp",
        descending=True,
    )
    conditions = await db.find("conditions", {}, sort_field="stage_number")
    products = await db.find("products")
    wa_cfg = await db.find_one("whatsapp_settings", {"key": "default"}) or {}
    wa_messages = await db.find(
        "whatsapp_messages",
        {"user_id": user["user_id"]},
        sort_field="sent_at",
        descending=True,
        limit=25,
    )

    active_code = user.get("selected_condition") or (assessments[0]["selected_condition"] if assessments else "")
    active_condition = next((c for c in conditions if c["code"] == active_code), None)
    matched_products = (
        [p for p in products if active_code in (p.get("condition_mapping") or [])]
        if active_code
        else products[:1]
    )

    return {
        "user": sanitize_user(user),
        "selected_condition": active_condition,
        "assessments": assessments,
        "matched_products": matched_products,
        "technology_650nm": wa_cfg.get("technology_650nm") or {},
        "whatsapp_messages": wa_messages,
    }


@router.put("/profile")
async def update_profile(payload: ProfileUpdatePayload, user=Depends(get_current_user)):
    updates = {}
    if payload.full_name is not None:
        updates["full_name"] = payload.full_name.strip()
    if payload.mobile_number is not None:
        digits = normalize_phone(payload.mobile_number)
        if len(digits) < 8:
            raise HTTPException(status_code=400, detail="Invalid mobile number.")
        updates["mobile_number"] = digits
    if payload.whatsapp_number is not None:
        updates["whatsapp_number"] = validate_whatsapp_number(payload.whatsapp_number)
    if payload.whatsapp_consent is not None:
        updates["whatsapp_consent"] = bool(payload.whatsapp_consent)
        if payload.whatsapp_consent:
            updates["consent_timestamp"] = utc_now_iso()

    updated = await db.update_one("users", {"user_id": user["user_id"]}, updates) or user
    return {"success": True, "message": "Profile updated successfully.", "user": sanitize_user(updated)}


@router.post("/assessments", status_code=201)
async def submit_hair_assessment(payload: AssessmentPayload, user=Depends(get_current_user)):
    """
    Core FOLIBEIR Automated Dual-WhatsApp Workflow:
    1. Saves confirmed hair condition assessment to `hair_assessments`.
    2. Updates user profile (`selected_condition`, optional opt-in consent).
    3. Queues & dispatches BOTH:
       - Business Owner WhatsApp Notification
       - Customer Personalized WhatsApp Message (when opted in)
    """
    condition = await db.find_one("conditions", {"code": payload.selected_condition})
    if not condition:
        raise HTTPException(status_code=400, detail="Please select Condition 1, Condition 2, or Condition 3.")

    now = utc_now_iso()

    # Allow user to confirm opt-in consent right at assessment confirmation
    user_updates = {"selected_condition": condition["code"]}
    if payload.confirm_whatsapp_consent is True and not user.get("whatsapp_consent"):
        user_updates["whatsapp_consent"] = True
        user_updates["consent_timestamp"] = now

    updated_user = await db.update_one("users", {"user_id": user["user_id"]}, user_updates) or user

    assessment = await db.insert_one(
        "hair_assessments",
        {
            "assessment_id": new_id("asmt"),
            "user_id": updated_user["user_id"],
            "selected_condition": condition["code"],
            "condition_label": condition["category_label"],
            "assessment_timestamp": now,
        },
    )

    products = await db.find("products")
    matched_product = next(
        (p for p in products if condition["code"] in (p.get("condition_mapping") or [])),
        products[0] if products else None,
    )

    # Queue BOTH Owner notification and Customer personalized WhatsApp message
    owner_msg = await create_owner_notification_record(
        event_type="assessment",
        user=updated_user,
        condition=condition,
        product=matched_product,
        assessment_timestamp=now,
    )
    customer_msg = await create_customer_assessment_record(
        user=updated_user,
        condition=condition,
    )

    to_dispatch = []
    if owner_msg and owner_msg.get("message_status") == "queued":
        to_dispatch.append(owner_msg["message_id"])
    if customer_msg and customer_msg.get("message_status") == "queued":
        to_dispatch.append(customer_msg["message_id"])

    if to_dispatch:
        enqueue_whatsapp_dispatch(to_dispatch)

    return {
        "success": True,
        "message": (
            "Assessment saved! Automated WhatsApp notifications have been triggered for both your registered WhatsApp number and Team FOLIBEIR."
            if customer_msg
            else "Assessment saved! Team FOLIBEIR has been notified. Enable WhatsApp consent in your profile to receive automated customer messages."
        ),
        "assessment": assessment,
        "condition": condition,
        "product": matched_product,
        "whatsapp_automation": {
            "owner_notification": owner_msg,
            "customer_message": customer_msg,
            "customer_consent": bool(updated_user.get("whatsapp_consent")),
        },
    }
