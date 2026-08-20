from fastapi import APIRouter, HTTPException
from app import store

router = APIRouter(prefix="/locations", tags=["locations"])


@router.get("")
def get_locations():
    return store.locations


@router.get("/{location_id}")
def get_location(location_id: str):
    loc = next((l for l in store.locations if l["id"] == location_id), None)
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    return loc
