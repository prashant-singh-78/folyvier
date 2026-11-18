from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.security import get_current_user, get_optional_user
from app.routes.user import AssessmentPayload, submit_hair_assessment
from app.services.chatbot_service import get_chatbot_init, handle_chatbot_message

router = APIRouter(prefix="/api/chatbot", tags=["FOLIBEIR AI Assistant"])


class ChatMessagePayload(BaseModel):
    message: str = ""
    action: str = ""
    condition_code: str = ""


@router.get("/init")
async def chatbot_init():
    return await get_chatbot_init()


@router.post("/message")
async def chatbot_message(payload: ChatMessagePayload, user=Depends(get_optional_user)):
    return await handle_chatbot_message(
        message=payload.message,
        action=payload.action,
        condition_code=payload.condition_code,
        user=user,
    )


@router.post("/confirm-condition")
async def chatbot_confirm_condition(payload: AssessmentPayload, user=Depends(get_current_user)):
    if not payload.selected_condition:
        raise HTTPException(status_code=400, detail="Condition code is required.")
    return await submit_hair_assessment(payload, user)
