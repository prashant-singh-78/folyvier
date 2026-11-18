from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import PlainTextResponse

from app.config import settings
from app.services.whatsapp_service import process_meta_webhook_payload, verify_webhook_signature

router = APIRouter(prefix="/api/whatsapp", tags=["WhatsApp Business Cloud API Webhook"])


@router.get("/webhook")
async def verify_whatsapp_webhook(
    hub_mode: str = Query(default="", alias="hub.mode"),
    hub_verify_token: str = Query(default="", alias="hub.verify_token"),
    hub_challenge: str = Query(default="", alias="hub.challenge"),
):
    if hub_mode == "subscribe" and hub_verify_token == settings.whatsapp_verify_token:
        return PlainTextResponse(content=hub_challenge, status_code=200)
    raise HTTPException(status_code=403, detail="Webhook verification token mismatch.")


@router.post("/webhook")
async def receive_whatsapp_webhook(request: Request):
    raw_body = await request.body()
    signature = request.headers.get("X-Hub-Signature-256")
    if not verify_webhook_signature(raw_body, signature):
        raise HTTPException(status_code=403, detail="Invalid Meta webhook signature.")

    payload = await request.json()
    processed = []
    if payload.get("object") == "whatsapp_business_account":
        processed = await process_meta_webhook_payload(payload)
    return {"status": "EVENT_RECEIVED", "processed": len(processed)}
