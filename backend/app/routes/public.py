from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field

from app.config import settings
from app.db.database import db, new_id, utc_now_iso

router = APIRouter(prefix="/api/public", tags=["Public"])


class ContactPayload(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    whatsapp_number: str = Field(default="", max_length=20)
    subject: str = Field(default="General Question", max_length=160)
    message: str = Field(..., min_length=5, max_length=2000)


@router.get("/bootstrap")
async def get_bootstrap():
    conditions = await db.find("conditions", {}, sort_field="stage_number")
    products = await db.find("products")
    wa_cfg = await db.find_one("whatsapp_settings", {"key": "default"}) or {}
    return {
        "brand": "FOLIBEIR",
        "conditions": conditions,
        "products": products,
        "technology_650nm": wa_cfg.get("technology_650nm") or {},
        "google_client_id": settings.google_client_id,
        "whatsapp_cloud_configured": settings.whatsapp_cloud_configured,
    }


@router.get("/conditions")
async def list_conditions():
    conditions = await db.find("conditions", {}, sort_field="stage_number")
    return {"conditions": conditions}


@router.get("/conditions/{slug_or_code}")
async def get_condition_detail(slug_or_code: str):
    cond = await db.find_one("conditions", {"slug": slug_or_code})
    if not cond:
        cond = await db.find_one("conditions", {"code": slug_or_code})
    if not cond:
        raise HTTPException(status_code=404, detail="Hair condition category not found.")

    products = await db.find("products")
    matched = [p for p in products if cond["code"] in (p.get("condition_mapping") or [])]
    wa_cfg = await db.find_one("whatsapp_settings", {"key": "default"}) or {}
    return {
        "condition": cond,
        "products": matched,
        "technology_650nm": wa_cfg.get("technology_650nm") or {},
    }


@router.get("/products")
async def list_products(condition_code: str = ""):
    products = await db.find("products")
    if condition_code:
        products = [p for p in products if condition_code in (p.get("condition_mapping") or [])]
    wa_cfg = await db.find_one("whatsapp_settings", {"key": "default"}) or {}
    return {
        "products": products,
        "technology_650nm": wa_cfg.get("technology_650nm") or {},
    }


@router.post("/contact", status_code=201)
async def submit_contact_message(payload: ContactPayload):
    record = await db.insert_one(
        "contact_messages",
        {
            "contact_id": new_id("cnt"),
            "full_name": payload.full_name.strip(),
            "email": payload.email.lower().strip(),
            "whatsapp_number": payload.whatsapp_number.strip(),
            "subject": payload.subject.strip(),
            "message": payload.message.strip(),
            "created_at": utc_now_iso(),
        },
    )
    return {
        "success": True,
        "message": "Your message has been received by Team FOLIBEIR.",
        "contact": record,
    }
