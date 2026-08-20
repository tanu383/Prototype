from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app import store
from app.risk.engine import calculate_risk

router = APIRouter(prefix="/vendors", tags=["vendors"])


@router.get("")
def get_vendors(location_id: Optional[str] = Query(default=None)):
    vendors = store.vendors
    if location_id:
        vendors = [v for v in vendors if v.get("location_id") == location_id]
    # Attach computed risk score to each vendor listing
    result = []
    for v in vendors:
        risk = calculate_risk(v)
        result.append({**v, "risk_score": risk["score"], "risk_level": risk["level"]})
    return result


@router.get("/{vendor_id}")
def get_vendor(vendor_id: str):
    vendor = next((v for v in store.vendors if v["id"] == vendor_id), None)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    risk = calculate_risk(vendor)
    return {**vendor, "risk_score": risk["score"], "risk_level": risk["level"]}


@router.get("/{vendor_id}/risk")
def get_vendor_risk(vendor_id: str):
    vendor = next((v for v in store.vendors if v["id"] == vendor_id), None)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return calculate_risk(vendor)
