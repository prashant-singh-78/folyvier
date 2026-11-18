import copy
import json
import threading
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

COLLECTIONS = [
    "users",
    "hair_assessments",
    "products",
    "conditions",
    "whatsapp_messages",
    "whatsapp_settings",
    "contact_messages",
]


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class DatabaseRepository:
    """
    Unified Async Repository supporting:
    1. Production MongoDB Atlas via Motor (when MONGODB_URI is configured and reachable).
    2. Persistent local JSON store fallback (backend/data/folibeir-db.json) for instant local dev.
    """

    def __init__(self) -> None:
        self.mode: str = "local_json"
        self.client: Optional[AsyncIOMotorClient] = None
        self.mongo_db = None
        self._lock = threading.Lock()
        self._store_file = settings.data_dir / "folibeir-db.json"
        self._local_data: Dict[str, List[Dict[str, Any]]] = {c: [] for c in COLLECTIONS}

    async def connect(self) -> str:
        if settings.mongodb_uri:
            try:
                client = AsyncIOMotorClient(settings.mongodb_uri, serverSelectionTimeoutMS=5000)
                await client.admin.command("ping")
                self.client = client
                self.mongo_db = client[settings.mongodb_db_name]
                self.mode = "mongodb"
                await self._ensure_mongo_indexes()
                print(f"[DB] Connected to MongoDB Atlas ({settings.mongodb_db_name}).")
                return self.mode
            except Exception as exc:
                print(f"[DB] MongoDB connection failed ({exc}). Falling back to local JSON store.")

        self.mode = "local_json"
        self._load_local()
        print(f"[DB] Running with persistent local JSON store ({self._store_file}).")
        return self.mode

    async def close(self) -> None:
        if self.client:
            self.client.close()

    async def _ensure_mongo_indexes(self) -> None:
        if self.mongo_db is None:
            return
        await self.mongo_db["users"].create_index("email", unique=True)
        await self.mongo_db["users"].create_index("user_id", unique=True)
        await self.mongo_db["hair_assessments"].create_index("user_id")
        await self.mongo_db["products"].create_index("product_id", unique=True)
        await self.mongo_db["conditions"].create_index("code", unique=True)
        await self.mongo_db["whatsapp_messages"].create_index("message_id", unique=True)
        await self.mongo_db["whatsapp_messages"].create_index("dedupe_key")

    def _load_local(self) -> None:
        with self._lock:
            if self._store_file.exists():
                try:
                    raw = json.loads(self._store_file.read_text(encoding="utf-8"))
                    self._local_data = {c: raw.get(c, []) for c in COLLECTIONS}
                    return
                except Exception:
                    pass
            self._local_data = {c: [] for c in COLLECTIONS}
            self._persist_local_unlocked()

    def _persist_local_unlocked(self) -> None:
        self._store_file.parent.mkdir(parents=True, exist_ok=True)
        self._store_file.write_text(json.dumps(self._local_data, indent=2), encoding="utf-8")

    @staticmethod
    def _clean(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        if doc is None:
            return None
        cleaned = dict(doc)
        cleaned.pop("_id", None)
        return cleaned

    @staticmethod
    def _matches(item: Dict[str, Any], filt: Dict[str, Any]) -> bool:
        for k, v in filt.items():
            if v is None:
                continue
            if item.get(k) != v:
                return False
        return True

    async def find(
        self,
        collection: str,
        filt: Optional[Dict[str, Any]] = None,
        sort_field: Optional[str] = None,
        descending: bool = False,
        limit: int = 0,
    ) -> List[Dict[str, Any]]:
        filt = filt or {}
        if self.mode == "mongodb" and self.mongo_db is not None:
            cursor = self.mongo_db[collection].find(filt, {"_id": 0})
            if sort_field:
                cursor = cursor.sort(sort_field, -1 if descending else 1)
            if limit > 0:
                cursor = cursor.limit(limit)
            return await cursor.to_list(length=limit or 2000)

        with self._lock:
            items = [copy.deepcopy(x) for x in self._local_data.get(collection, []) if self._matches(x, filt)]
        if sort_field:
            items.sort(key=lambda x: (x.get(sort_field) is None, x.get(sort_field) or ""), reverse=descending)
        if limit > 0:
            items = items[:limit]
        return items

    async def find_one(self, collection: str, filt: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if self.mode == "mongodb" and self.mongo_db is not None:
            doc = await self.mongo_db[collection].find_one(filt, {"_id": 0})
            return self._clean(doc)

        with self._lock:
            for item in self._local_data.get(collection, []):
                if self._matches(item, filt):
                    return copy.deepcopy(item)
        return None

    async def insert_one(self, collection: str, doc: Dict[str, Any]) -> Dict[str, Any]:
        record = copy.deepcopy(doc)
        now = utc_now_iso()
        record.setdefault("created_at", now)
        record.setdefault("updated_at", now)

        if self.mode == "mongodb" and self.mongo_db is not None:
            await self.mongo_db[collection].insert_one(copy.deepcopy(record))
            return self._clean(record)  # type: ignore

        with self._lock:
            self._local_data.setdefault(collection, []).append(record)
            self._persist_local_unlocked()
        return copy.deepcopy(record)

    async def update_one(
        self, collection: str, filt: Dict[str, Any], updates: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        patch = copy.deepcopy(updates)
        patch["updated_at"] = utc_now_iso()

        if self.mode == "mongodb" and self.mongo_db is not None:
            res = await self.mongo_db[collection].find_one_and_update(
                filt, {"$set": patch}, return_document=True, projection={"_id": 0}
            )
            return self._clean(res)

        with self._lock:
            for idx, item in enumerate(self._local_data.get(collection, [])):
                if self._matches(item, filt):
                    updated = {**item, **patch}
                    self._local_data[collection][idx] = updated
                    self._persist_local_unlocked()
                    return copy.deepcopy(updated)
        return None

    async def delete_one(self, collection: str, filt: Dict[str, Any]) -> bool:
        if self.mode == "mongodb" and self.mongo_db is not None:
            res = await self.mongo_db[collection].delete_one(filt)
            return res.deleted_count > 0

        with self._lock:
            items = self._local_data.get(collection, [])
            for idx, item in enumerate(items):
                if self._matches(item, filt):
                    items.pop(idx)
                    self._persist_local_unlocked()
                    return True
        return False

    async def count(self, collection: str, filt: Optional[Dict[str, Any]] = None) -> int:
        filt = filt or {}
        if self.mode == "mongodb" and self.mongo_db is not None:
            return await self.mongo_db[collection].count_documents(filt)
        with self._lock:
            return sum(1 for item in self._local_data.get(collection, []) if self._matches(item, filt))


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


db = DatabaseRepository()
