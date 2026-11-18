import secrets
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel

from app.config import settings
from app.core.security import normalize_phone, require_super_admin, sanitize_user
from app.db.database import db, new_id
from app.db.seed import COMING_SOON
from app.services.whatsapp_service import dispatch_whatsapp_record

router = APIRouter(
    prefix="/api/admin",
    tags=["Super Admin Dashboard"],
    dependencies=[Depends(require_super_admin)],
)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".avif"}
MAX_UPLOAD_BYTES = 5 * 1024 * 1024


class ProductCreateUpdate(BaseModel):
    product_name: str
    product_description: str = COMING_SOON
    wavelength: str = "650 nm"
    specifications: str = COMING_SOON
    components: str = COMING_SOON
    usage_instructions: str = COMING_SOON
    safety_information: str = COMING_SOON
    features: List[str] = [COMING_SOON]
    condition_mapping: List[str] = []
    product_images: List[str] = ["/images/folibeir-device-650nm.jpg"]


class ConditionUpdate(BaseModel):
    title: Optional[str] = None
    category_label: Optional[str] = None
    severity_tag: Optional[str] = None
    description: Optional[str] = None
    detailed_overview: Optional[str] = None
    visual_indicators: Optional[List[str]] = None
    image_url: Optional[str] = None
    disclaimer: Optional[str] = None


class TechnologyUpdate(BaseModel):
    wavelength: str = "650 nm"
    title: str = "FOLIBEIR 650 nm Red Light Wavelength System"
    technical_description: str = COMING_SOON
    device_components: str = COMING_SOON
    operating_specifications: str = COMING_SOON
    usage_instructions: str = COMING_SOON
    safety_information: str = COMING_SOON
    features: List[str] = ["650 nm Red Light Wavelength System"]
    hero_image: str = "/images/folibeir-device-650nm.jpg"


class WhatsAppSettingsUpdate(BaseModel):
    owner_whatsapp_number: Optional[str] = None
    notify_owner_on_register: Optional[bool] = None
    notify_owner_on_first_login: Optional[bool] = None
    notify_owner_on_assessment: Optional[bool] = None
    auto_message_customer_on_assessment: Optional[bool] = None
    owner_template_name: Optional[str] = None
    customer_template_name: Optional[str] = None
    template_language: Optional[str] = None
    owner_assessment_template: Optional[str] = None
    owner_register_template: Optional[str] = None
    owner_first_login_template: Optional[str] = None
    customer_templates: Optional[Dict[str, str]] = None


def _clean_text(val: Optional[str], fallback: str = COMING_SOON) -> str:
    txt = (val or "").strip()
    return txt if txt else fallback


# 1. Dashboard Statistics (Strictly NO CRM modules)
@router.get("/stats")
async def get_admin_stats():
    users = await db.find("users", {"role": "user"})
    assessments = await db.find("hair_assessments", {}, sort_field="assessment_timestamp", descending=True)
    wa_messages = await db.find("whatsapp_messages", {}, sort_field="sent_at", descending=True)

    c1 = sum(1 for a in assessments if a.get("selected_condition") == "condition-1")
    c2 = sum(1 for a in assessments if a.get("selected_condition") == "condition-2")
    c3 = sum(1 for a in assessments if a.get("selected_condition") == "condition-3")

    sent_count = sum(
        1
        for m in wa_messages
        if m.get("message_status") in {"sent", "delivered", "read", "sandbox_logged"}
    )
    failed_count = sum(1 for m in wa_messages if m.get("message_status") == "failed")

    return {
        "system_status": {
            "database_mode": db.mode,
            "whatsapp_cloud_configured": settings.whatsapp_cloud_configured,
            "webhook_url": f"{settings.public_backend_url}/api/whatsapp/webhook",
        },
        "stats": {
            "total_registered_users": len(users),
            "total_assessments": len(assessments),
            "condition_1_selections": c1,
            "condition_2_selections": c2,
            "condition_3_selections": c3,
            "whatsapp_messages_sent": sent_count,
            "failed_whatsapp_messages": failed_count,
        },
        "recent_assessments": assessments[:10],
    }


# 2. User Management
@router.get("/users")
async def list_registered_users():
    users = await db.find("users", {"role": "user"}, sort_field="created_at", descending=True)
    assessments = await db.find("hair_assessments", {}, sort_field="assessment_timestamp", descending=True)
    asmt_by_user: Dict[str, List[Dict[str, Any]]] = {}
    for a in assessments:
        asmt_by_user.setdefault(a["user_id"], []).append(a)

    enriched = []
    for u in users:
        safe = sanitize_user(u)
        u_asmts = asmt_by_user.get(u["user_id"], [])
        safe["assessment_count"] = len(u_asmts)
        safe["latest_assessment"] = u_asmts[0] if u_asmts else None
        enriched.append(safe)
    return {"users": enriched}


# 3. Secure Image Upload (Product / Condition / 650 nm Tech)
@router.post("/upload", status_code=201)
async def upload_image(image: UploadFile = File(...)):
    ext = Path(image.filename or "img.jpg").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, WebP, or AVIF images are allowed.")

    content = await image.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="Image file exceeds 5 MB maximum size.")

    filename = f"folibeir-{secrets.token_hex(8)}{ext}"
    target = settings.uploads_dir / filename
    target.write_bytes(content)
    return {"url": f"/uploads/{filename}", "filename": filename, "size": len(content)}


# 4. Product & 650 nm Technology Management
@router.get("/products")
async def admin_list_products():
    products = await db.find("products")
    wa_cfg = await db.find_one("whatsapp_settings", {"key": "default"}) or {}
    return {"products": products, "technology_650nm": wa_cfg.get("technology_650nm") or {}}


@router.post("/products", status_code=201)
async def admin_create_product(payload: ProductCreateUpdate):
    feats = [f.strip() for f in payload.features if f and f.strip()] or [COMING_SOON]
    imgs = [i.strip() for i in payload.product_images if i and i.strip()] or ["/images/folibeir-device-650nm.jpg"]
    created = await db.insert_one(
        "products",
        {
            "product_id": new_id("prod"),
            "product_name": _clean_text(payload.product_name, "FOLIBEIR Product"),
            "product_description": _clean_text(payload.product_description),
            "wavelength": _clean_text(payload.wavelength, "650 nm"),
            "specifications": _clean_text(payload.specifications),
            "components": _clean_text(payload.components),
            "usage_instructions": _clean_text(payload.usage_instructions),
            "safety_information": _clean_text(payload.safety_information),
            "features": feats,
            "condition_mapping": payload.condition_mapping,
            "product_images": imgs,
        },
    )
    return {"product": created}


@router.put("/products/{product_id}")
async def admin_update_product(product_id: str, payload: ProductCreateUpdate):
    existing = await db.find_one("products", {"product_id": product_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found.")
    feats = [f.strip() for f in payload.features if f and f.strip()] or [COMING_SOON]
    imgs = [i.strip() for i in payload.product_images if i and i.strip()] or existing.get("product_images", [])
    updated = await db.update_one(
        "products",
        {"product_id": product_id},
        {
            "product_name": _clean_text(payload.product_name, existing["product_name"]),
            "product_description": _clean_text(payload.product_description),
            "wavelength": _clean_text(payload.wavelength, "650 nm"),
            "specifications": _clean_text(payload.specifications),
            "components": _clean_text(payload.components),
            "usage_instructions": _clean_text(payload.usage_instructions),
            "safety_information": _clean_text(payload.safety_information),
            "features": feats,
            "condition_mapping": payload.condition_mapping,
            "product_images": imgs,
        },
    )
    return {"product": updated}


@router.delete("/products/{product_id}")
async def admin_delete_product(product_id: str):
    ok = await db.delete_one("products", {"product_id": product_id})
    if not ok:
        raise HTTPException(status_code=404, detail="Product not found.")
    return {"success": True}


@router.put("/technology")
async def admin_update_technology(payload: TechnologyUpdate):
    feats = [f.strip() for f in payload.features if f and f.strip()] or ["650 nm Red Light Wavelength System"]
    tech_data = {
        "wavelength": _clean_text(payload.wavelength, "650 nm"),
        "title": _clean_text(payload.title, "FOLIBEIR 650 nm Red Light Wavelength System"),
        "technical_description": _clean_text(payload.technical_description),
        "device_components": _clean_text(payload.device_components),
        "operating_specifications": _clean_text(payload.operating_specifications),
        "usage_instructions": _clean_text(payload.usage_instructions),
        "safety_information": _clean_text(payload.safety_information),
        "features": feats,
        "hero_image": payload.hero_image.strip() or "/images/folibeir-device-650nm.jpg",
    }
    await db.update_one("whatsapp_settings", {"key": "default"}, {"technology_650nm": tech_data})
    return {"technology_650nm": tech_data}


# 5. Condition Management
@router.get("/conditions")
async def admin_list_conditions():
    conditions = await db.find("conditions", {}, sort_field="stage_number")
    return {"conditions": conditions}


@router.put("/conditions/{code}")
async def admin_update_condition(code: str, payload: ConditionUpdate):
    existing = await db.find_one("conditions", {"code": code})
    if not existing:
        raise HTTPException(status_code=404, detail="Hair condition not found.")
    updates = {k: v for k, v in payload.model_dump(exclude_none=True).items()}
    updated = await db.update_one("conditions", {"code": code}, updates)
    return {"condition": updated}


# 6. WhatsApp Settings, Delivery Tracking & Retry Failed Messages
@router.get("/whatsapp/settings")
async def admin_get_whatsapp_settings():
    cfg = await db.find_one("whatsapp_settings", {"key": "default"}) or {}
    return {
        "settings": cfg,
        "cloud_api": {
            "configured": settings.whatsapp_cloud_configured,
            "api_version": settings.whatsapp_api_version,
            "webhook_url": f"{settings.public_backend_url}/api/whatsapp/webhook",
            "has_verify_token": bool(settings.whatsapp_verify_token),
            "has_app_secret": bool(settings.whatsapp_app_secret),
        },
    }


@router.put("/whatsapp/settings")
async def admin_update_whatsapp_settings(payload: WhatsAppSettingsUpdate):
    updates = payload.model_dump(exclude_none=True)
    if "owner_whatsapp_number" in updates:
        updates["owner_whatsapp_number"] = normalize_phone(updates["owner_whatsapp_number"])
    updated = await db.update_one("whatsapp_settings", {"key": "default"}, updates)
    return {"success": True, "settings": updated}


@router.get("/whatsapp/messages")
async def admin_list_whatsapp_messages(status_filter: str = "all"):
    msgs = await db.find("whatsapp_messages", {}, sort_field="sent_at", descending=True, limit=200)
    if status_filter != "all":
        msgs = [m for m in msgs if m.get("message_status") == status_filter]
    return {"messages": msgs}


@router.post("/whatsapp/messages/{message_id}/retry")
async def admin_retry_whatsapp_message(message_id: str):
    record = await db.find_one("whatsapp_messages", {"message_id": message_id})
    if not record:
        raise HTTPException(status_code=404, detail="WhatsApp message record not found.")

    # Refresh owner number if retrying an owner notification whose number was previously unset
    if record.get("recipient_type") == "owner":
        cfg = await db.find_one("whatsapp_settings", {"key": "default"}) or {}
        owner_num = normalize_phone(cfg.get("owner_whatsapp_number") or settings.business_owner_whatsapp_number or "")
        if owner_num:
            await db.update_one("whatsapp_messages", {"message_id": message_id}, {"recipient_number": owner_num})

    result = await dispatch_whatsapp_record(message_id)
    return {"success": result.get("ok", False), "result": result}
