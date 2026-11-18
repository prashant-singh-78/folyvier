from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel, EmailStr, Field

from app.config import settings
from app.core.security import (
    check_login_rate_limit,
    clear_failed_logins,
    clear_session_cookie,
    create_access_token,
    get_current_user,
    hash_password,
    normalize_phone,
    record_failed_login,
    sanitize_user,
    set_session_cookie,
    validate_password_strength,
    validate_whatsapp_number,
    verify_password,
)
from app.db.database import db, new_id, utc_now_iso
from app.services.job_queue import enqueue_whatsapp_dispatch
from app.services.whatsapp_service import create_owner_notification_record

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


class RegisterPayload(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    mobile_number: str = Field(..., min_length=8, max_length=20)
    whatsapp_number: str = Field(..., min_length=10, max_length=20)
    password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str = Field(..., min_length=8, max_length=128)
    accept_terms: bool
    accept_privacy: bool
    whatsapp_consent: bool = False


class LoginPayload(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False


class GoogleLoginPayload(BaseModel):
    credential: str
    whatsapp_number: Optional[str] = None
    whatsapp_consent: bool = False


class ResetPasswordDirectPayload(BaseModel):
    email: EmailStr
    whatsapp_number: str = Field(..., min_length=10, max_length=20)
    new_password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str = Field(..., min_length=8, max_length=128)


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(payload: RegisterPayload, response: Response):
    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")
    if not payload.accept_terms or not payload.accept_privacy:
        raise HTTPException(
            status_code=400,
            detail="You must accept the Terms & Conditions and Privacy Policy to register.",
        )

    validate_password_strength(payload.password)
    wa_digits = validate_whatsapp_number(payload.whatsapp_number)
    mobile_digits = normalize_phone(payload.mobile_number)
    if len(mobile_digits) < 8:
        raise HTTPException(status_code=400, detail="Please enter a valid mobile number.")

    email_norm = payload.email.lower().strip()
    existing = await db.find_one("users", {"email": email_norm})
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    now = utc_now_iso()
    user_doc = await db.insert_one(
        "users",
        {
            "user_id": new_id("usr"),
            "full_name": payload.full_name.strip(),
            "email": email_norm,
            "mobile_number": mobile_digits,
            "whatsapp_number": wa_digits,
            "password_hash": hash_password(payload.password),
            "email_verified": True,
            "whatsapp_consent": bool(payload.whatsapp_consent),
            "consent_timestamp": now if payload.whatsapp_consent else None,
            "role": "user",
            "selected_condition": "",
            "first_login_notified": False,
            "created_at": now,
        },
    )

    # Trigger Owner WhatsApp notification on registration
    owner_msg = await create_owner_notification_record(event_type="registration", user=user_doc)
    if owner_msg:
        enqueue_whatsapp_dispatch([owner_msg["message_id"]])

    # Sign user in immediately without OTP
    token, max_age = create_access_token(user_doc, remember_me=True)
    set_session_cookie(response, token, max_age)

    return {
        "success": True,
        "message": "Account created successfully! Welcome to FOLIBEIR.",
        "user": sanitize_user(user_doc),
        "token": token,
    }


@router.post("/login")
async def login_user(payload: LoginPayload, request: Request, response: Response):
    email_norm = payload.email.lower().strip()
    client_ip = request.client.host if request.client else "unknown"
    rate_key = f"{client_ip}:{email_norm}"
    check_login_rate_limit(rate_key)

    user = await db.find_one("users", {"email": email_norm})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        record_failed_login(rate_key)
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    clear_failed_logins(rate_key)

    # Notify business owner on customer's first login
    if user.get("role") == "user" and not user.get("first_login_notified"):
        user = await db.update_one(
            "users",
            {"user_id": user["user_id"]},
            {"first_login_notified": True, "last_login_at": utc_now_iso()},
        ) or user
        owner_msg = await create_owner_notification_record(event_type="first_login", user=user)
        if owner_msg:
            enqueue_whatsapp_dispatch([owner_msg["message_id"]])
    else:
        await db.update_one("users", {"user_id": user["user_id"]}, {"last_login_at": utc_now_iso()})

    token, max_age = create_access_token(user, remember_me=payload.remember_me)
    set_session_cookie(response, token, max_age)

    return {
        "success": True,
        "user": sanitize_user(user),
        "token": token,
    }


@router.post("/google")
async def google_login(payload: GoogleLoginPayload, response: Response):
    if not payload.credential:
        raise HTTPException(status_code=400, detail="Missing Google ID token.")

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(
                "https://oauth2.googleapis.com/tokeninfo",
                params={"id_token": payload.credential},
            )
            if r.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid Google authentication token.")
            info = r.json()
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=503, detail="Unable to verify Google token right now.")

    if settings.google_client_id and info.get("aud") != settings.google_client_id:
        raise HTTPException(status_code=401, detail="Google token audience mismatch.")

    email_norm = (info.get("email") or "").lower().strip()
    if not email_norm:
        raise HTTPException(status_code=400, detail="Google account did not return an email address.")

    user = await db.find_one("users", {"email": email_norm})
    now = utc_now_iso()
    if not user:
        wa_digits = normalize_phone(payload.whatsapp_number or "")
        user = await db.insert_one(
            "users",
            {
                "user_id": new_id("usr"),
                "full_name": info.get("name") or email_norm.split("@")[0],
                "email": email_norm,
                "mobile_number": wa_digits,
                "whatsapp_number": wa_digits,
                "password_hash": "",
                "google_id": info.get("sub", ""),
                "email_verified": True,
                "whatsapp_consent": bool(payload.whatsapp_consent),
                "consent_timestamp": now if payload.whatsapp_consent else None,
                "role": "user",
                "selected_condition": "",
                "first_login_notified": True,
                "created_at": now,
            },
        )
        owner_msg = await create_owner_notification_record(event_type="registration", user=user)
        if owner_msg:
            enqueue_whatsapp_dispatch([owner_msg["message_id"]])

    token, max_age = create_access_token(user, remember_me=True)
    set_session_cookie(response, token, max_age)
    return {"success": True, "user": sanitize_user(user), "token": token}


@router.post("/reset-password")
async def reset_password_direct(payload: ResetPasswordDirectPayload):
    if payload.new_password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")
    validate_password_strength(payload.new_password)

    email_norm = payload.email.lower().strip()
    wa_digits = validate_whatsapp_number(payload.whatsapp_number)

    user = await db.find_one("users", {"email": email_norm})
    if not user or normalize_phone(user.get("whatsapp_number", "")) != wa_digits:
        raise HTTPException(
            status_code=400,
            detail="Email and registered WhatsApp number did not match any account.",
        )

    await db.update_one(
        "users",
        {"user_id": user["user_id"]},
        {"password_hash": hash_password(payload.new_password)},
    )
    return {"success": True, "message": "Password updated successfully. You can now log in."}


@router.post("/logout")
async def logout_user(response: Response):
    clear_session_cookie(response)
    return {"success": True, "message": "Logged out securely."}


@router.get("/me")
async def get_me(user=Depends(get_current_user)):
    return {"user": sanitize_user(user)}
