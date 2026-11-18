import re
import time
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import Depends, HTTPException, Request, Response, status

from app.config import settings
from app.db.database import db

ph = PasswordHasher()

# Simple sliding-window login rate limiter (max 8 attempts per 5 minutes per key)
_LOGIN_ATTEMPTS: Dict[str, List[float]] = defaultdict(list)
RATE_LIMIT_WINDOW_SEC = 300
RATE_LIMIT_MAX_ATTEMPTS = 8


def hash_password(password: str) -> str:
    return ph.hash(password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    if not password_hash:
        return False
    try:
        return ph.verify(password_hash, plain_password)
    except VerifyMismatchError:
        return False
    except Exception:
        return False


def normalize_phone(raw: str) -> str:
    return "".join(ch for ch in str(raw or "") if ch.isdigit())


def validate_whatsapp_number(raw: str) -> str:
    digits = normalize_phone(raw)
    if len(digits) < 10 or len(digits) > 15:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter a valid WhatsApp number with country code (10 to 15 digits).",
        )
    return digits


def validate_password_strength(password: str) -> None:
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long.")
    if not re.search(r"[A-Z]", password) or not re.search(r"[a-z]", password) or not re.search(r"\d", password):
        raise HTTPException(
            status_code=400,
            detail="Password must include uppercase, lowercase, and at least one number.",
        )


def check_login_rate_limit(key: str) -> None:
    now = time.time()
    recent = [ts for ts in _LOGIN_ATTEMPTS[key] if now - ts < RATE_LIMIT_WINDOW_SEC]
    _LOGIN_ATTEMPTS[key] = recent
    if len(recent) >= RATE_LIMIT_MAX_ATTEMPTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed login attempts. Please wait 5 minutes and try again.",
        )


def record_failed_login(key: str) -> None:
    _LOGIN_ATTEMPTS[key].append(time.time())


def clear_failed_logins(key: str) -> None:
    _LOGIN_ATTEMPTS.pop(key, None)


def create_access_token(user: Dict[str, Any], remember_me: bool = False) -> tuple[str, int]:
    ttl = (
        timedelta(days=settings.jwt_remember_days)
        if remember_me
        else timedelta(hours=settings.jwt_expire_hours)
    )
    now = datetime.now(timezone.utc)
    exp = now + ttl
    payload = {
        "sub": user["user_id"],
        "email": user["email"],
        "role": user.get("role", "user"),
        "name": user.get("full_name", ""),
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }
    token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return token, int(ttl.total_seconds())


def set_session_cookie(response: Response, token: str, max_age: int) -> None:
    response.set_cookie(
        key=settings.cookie_name,
        value=token,
        max_age=max_age,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        path="/",
    )


def clear_session_cookie(response: Response) -> None:
    response.delete_cookie(key=settings.cookie_name, path="/")


def extract_token_from_request(request: Request) -> Optional[str]:
    cookie_token = request.cookies.get(settings.cookie_name)
    if cookie_token:
        return cookie_token
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header[7:].strip()
    return None


def sanitize_user(user: Dict[str, Any]) -> Dict[str, Any]:
    hidden = {"password_hash", "otp_code", "otp_expires_at", "reset_otp", "reset_otp_expires_at"}
    return {k: v for k, v in user.items() if k not in hidden}


async def get_optional_user(request: Request) -> Optional[Dict[str, Any]]:
    token = extract_token_from_request(request)
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        user_id = payload.get("sub")
        if not user_id:
            return None
        user = await db.find_one("users", {"user_id": user_id})
        return user
    except Exception:
        return None


async def get_current_user(request: Request) -> Dict[str, Any]:
    user = await get_optional_user(request)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in to continue.",
        )
    return user


async def require_super_admin(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    if user.get("role") != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super Admin access required.",
        )
    return user
