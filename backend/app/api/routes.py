from __future__ import annotations

import json
from datetime import datetime, timezone

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.core.config import GENERAL_SPEC_PATH, HISTORY_PATH, SPEC_STORE_PATH
from app.models.domain import GeneralSpec, JsonStore, ReviewRecord
from app.repositories.json_repository import JsonRepository
from app.services.compare_engine import compare_spec
from app.services.spec_parser import normalize_rms_json

router = APIRouter(prefix="/api")
spec_repo = JsonRepository(SPEC_STORE_PATH)
general_repo = JsonRepository(GENERAL_SPEC_PATH)
history_repo = JsonRepository(HISTORY_PATH)


def load_store() -> JsonStore:
    return JsonStore.model_validate(spec_repo.load_dict({"summary": None, "specs": []}))


def save_store(store: JsonStore) -> None:
    spec_repo.save_dict(store.model_dump(mode="json"))


def load_general_specs() -> list[GeneralSpec]:
    data = general_repo.load_dict({"generalSpecs": []})
    return [GeneralSpec.model_validate(item) for item in data.get("generalSpecs", [])]


def save_general_specs(items: list[GeneralSpec]) -> None:
    general_repo.save_dict({"generalSpecs": [item.model_dump(mode="json") for item in items]})


def load_reviews() -> list[ReviewRecord]:
    data = history_repo.load_dict({"reviews": []})
    return [ReviewRecord.model_validate(item) for item in data.get("reviews", [])]


def save_reviews(items: list[ReviewRecord]) -> None:
    history_repo.save_dict({"reviews": [item.model_dump(mode="json") for item in items]})


@router.post("/spec/upload")
async def upload_spec(file: UploadFile = File(...)):
    raw = await file.read()
    try:
        data = json.loads(raw.decode("utf-8-sig"))
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Cannot read JSON file: {exc}") from exc
    parsed = normalize_rms_json(data)
    store = JsonStore(summary=parsed.summary, specs=parsed.specs)
    save_store(store)
    return parsed


@router.get("/specs")
def get_specs():
    return load_store()


@router.get("/specs/{ai_code}")
def get_spec(ai_code: str):
    store = load_store()
    for spec in store.specs:
        if spec.aiCode == ai_code:
            return spec
    raise HTTPException(status_code=404, detail="Spec not found")


@router.get("/general-specs/{ai_code}")
def get_general_spec(ai_code: str):
    for item in load_general_specs():
        if item.aiCode == ai_code:
            return item
    raise HTTPException(status_code=404, detail="General Spec not found")


@router.put("/general-specs/{ai_code}")
def upsert_general_spec(ai_code: str, payload: GeneralSpec):
    items = load_general_specs()
    payload.aiCode = ai_code
    payload.updatedAt = datetime.now(timezone.utc).isoformat()
    for idx, item in enumerate(items):
        if item.aiCode == ai_code:
            payload.createdAt = item.createdAt
            items[idx] = payload
            save_general_specs(items)
            return payload
    items.append(payload)
    save_general_specs(items)
    return payload


@router.post("/compare/{ai_code}")
def compare(ai_code: str, payload: GeneralSpec):
    store = load_store()
    spec = next((item for item in store.specs if item.aiCode == ai_code), None)
    if spec is None:
        raise HTTPException(status_code=404, detail="Spec not found")
    return compare_spec(spec, payload)


@router.get("/reviews")
def get_reviews():
    return {"reviews": load_reviews()}


@router.get("/reviews/{ai_code}")
def get_reviews_by_ai_code(ai_code: str):
    return {"reviews": [item for item in load_reviews() if item.aiCode == ai_code]}


@router.post("/reviews")
def create_review(payload: ReviewRecord):
    items = load_reviews()
    now = datetime.now(timezone.utc).isoformat()
    payload.createdAt = payload.createdAt or now
    payload.updatedAt = now
    items.append(payload)
    save_reviews(items)
    return payload


@router.put("/reviews/{review_id}")
def update_review(review_id: str, payload: ReviewRecord):
    items = load_reviews()
    for idx, item in enumerate(items):
        if item.id == review_id:
            payload.id = review_id
            payload.createdAt = item.createdAt
            payload.updatedAt = datetime.now(timezone.utc).isoformat()
            items[idx] = payload
            save_reviews(items)
            return payload
    raise HTTPException(status_code=404, detail="Review not found")


@router.get("/history")
def get_history():
    return {"reviews": load_reviews()}


@router.get("/history/{ai_code}")
def get_history_by_ai_code(ai_code: str):
    return {"reviews": [item for item in load_reviews() if item.aiCode == ai_code]}
