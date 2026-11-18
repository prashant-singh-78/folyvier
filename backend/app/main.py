from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.db.database import db, utc_now_iso
from app.db.seed import seed_database
from app.routes import admin, auth, chatbot, public, user, whatsapp


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await db.connect()
    await seed_database()
    yield
    await db.close()


app = FastAPI(
    title="FOLIBEIR API",
    description="AI-Powered Hair Analysis, 650 nm Red Light Product Platform & Dual WhatsApp Automation API",
    version="2.0.0",
    lifespan=lifespan,
)

origins = [o.strip() for o in settings.frontend_url.split(",") if o.strip()]
if "http://localhost:5173" not in origins:
    origins.append("http://localhost:5173")
if "http://127.0.0.1:5173" not in origins:
    origins.append("http://127.0.0.1:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=str(settings.uploads_dir)), name="uploads")

app.include_router(auth.router)
app.include_router(public.router)
app.include_router(user.router)
app.include_router(chatbot.router)
app.include_router(whatsapp.router)
app.include_router(admin.router)


@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "service": "FOLIBEIR FastAPI Backend",
        "database_mode": db.mode,
        "whatsapp_cloud_configured": settings.whatsapp_cloud_configured,
        "timestamp": utc_now_iso(),
    }
