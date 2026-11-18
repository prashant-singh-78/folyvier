import asyncio
from typing import List

from app.services.whatsapp_service import dispatch_whatsapp_record

MAX_AUTOMATIC_RETRIES = 3


async def _run_with_retries(message_id: str) -> None:
    delay = 1.5
    for attempt in range(MAX_AUTOMATIC_RETRIES):
        result = await dispatch_whatsapp_record(message_id)
        if result.get("ok"):
            return
        # If failed due to missing owner phone number (config error), don't spam retries
        if "missing or invalid" in (result.get("error") or "").lower():
            return
        if attempt < MAX_AUTOMATIC_RETRIES - 1:
            await asyncio.sleep(delay)
            delay *= 2


def enqueue_whatsapp_dispatch(message_ids: List[str]) -> None:
    """
    Reliable async background dispatcher with automatic exponential-backoff retry.
    For multi-worker production deployments, swap or bridge with app.workers.celery_app.
    """
    loop = asyncio.get_running_loop()
    for mid in message_ids:
        if mid:
            loop.create_task(_run_with_retries(mid))
