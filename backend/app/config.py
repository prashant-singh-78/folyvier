import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


class Settings:
    app_env: str = os.getenv("APP_ENV", "development")
    port: int = int(os.getenv("PORT", "8000"))
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    public_backend_url: str = os.getenv("PUBLIC_BACKEND_URL", f"http://localhost:{os.getenv('PORT', '8000')}")

    mongodb_uri: str = os.getenv("MONGODB_URI", "").strip()
    mongodb_db_name: str = os.getenv("MONGODB_DB_NAME", "folibeir").strip()

    jwt_secret: str = os.getenv("JWT_SECRET", "folibeir-dev-jwt-secret-change-in-production")
    jwt_algorithm: str = "HS256"
    jwt_expire_hours: int = int(os.getenv("JWT_EXPIRE_HOURS", "12"))
    jwt_remember_days: int = int(os.getenv("JWT_REMEMBER_DAYS", "14"))
    cookie_name: str = "folibeir_session"
    cookie_secure: bool = os.getenv("COOKIE_SECURE", "false").lower() == "true"
    cookie_samesite: str = os.getenv("COOKIE_SAMESITE", "lax")

    default_admin_name: str = os.getenv("DEFAULT_ADMIN_NAME", "FOLIBEIR Super Admin")
    default_admin_email: str = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@folibeir.com").lower().strip()
    default_admin_password: str = os.getenv("DEFAULT_ADMIN_PASSWORD", "FolibeirAdmin@2026")

    whatsapp_api_version: str = os.getenv("WHATSAPP_API_VERSION", "v21.0")
    whatsapp_phone_number_id: str = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "").strip()
    whatsapp_business_account_id: str = os.getenv("WHATSAPP_BUSINESS_ACCOUNT_ID", "").strip()
    whatsapp_access_token: str = os.getenv("WHATSAPP_ACCESS_TOKEN", "").strip()
    whatsapp_verify_token: str = os.getenv("WHATSAPP_VERIFY_TOKEN", "folibeir_webhook_verify_token")
    whatsapp_app_secret: str = os.getenv("WHATSAPP_APP_SECRET", "").strip()
    business_owner_whatsapp_number: str = "".join(
        ch for ch in os.getenv("BUSINESS_OWNER_WHATSAPP_NUMBER", "") if ch.isdigit()
    )
    whatsapp_owner_template_name: str = os.getenv("WHATSAPP_OWNER_TEMPLATE_NAME", "").strip()
    whatsapp_customer_template_name: str = os.getenv("WHATSAPP_CUSTOMER_TEMPLATE_NAME", "").strip()
    whatsapp_template_language: str = os.getenv("WHATSAPP_TEMPLATE_LANGUAGE", "en_US")

    google_client_id: str = os.getenv("GOOGLE_CLIENT_ID", "").strip()

    smtp_host: str = os.getenv("SMTP_HOST", "").strip()
    smtp_port: int = int(os.getenv("SMTP_PORT", "587"))
    smtp_user: str = os.getenv("SMTP_USER", "").strip()
    smtp_password: str = os.getenv("SMTP_PASSWORD", "").strip()
    smtp_from: str = os.getenv("SMTP_FROM", "no-reply@folibeir.com")

    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    uploads_dir: Path = BASE_DIR / "uploads"
    data_dir: Path = BASE_DIR / "data"

    @property
    def whatsapp_cloud_configured(self) -> bool:
        return bool(self.whatsapp_phone_number_id and self.whatsapp_access_token)


settings = Settings()
settings.uploads_dir.mkdir(parents=True, exist_ok=True)
settings.data_dir.mkdir(parents=True, exist_ok=True)
