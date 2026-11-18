"""
Production Redis + Celery Worker Blueprint for FOLIBEIR WhatsApp Automation.
Run alongside FastAPI in distributed deployments:
    celery -A app.workers.celery_app worker --loglevel=info
"""
import asyncio
from celery import Celery

from app.config import settings

celery_app = Celery(
    "folibeir_workers",
    broker=settings.redis_url,
    backend=settings.redis_url,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=15)
def dispatch_whatsapp_task(self, message_id: str):
    from app.db.database import db
    from app.services.whatsapp_service import dispatch_whatsapp_record

    async def _execute():
        if db.mongo_db is None and settings.mongodb_uri:
            await db.connect()
        return await dispatch_whatsapp_record(message_id)

    result = asyncio.run(_execute())
    if not result.get("ok") and "missing or invalid" not in (result.get("error") or "").lower():
        raise self.retry(exc=RuntimeError(result.get("error", "WhatsApp dispatch failed")))
    return result
