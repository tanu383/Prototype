from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
import uuid
from app import store
from app.risk.engine import calculate_risk
from app.schemas.models import ReportCreate

router = APIRouter(prefix="/reports", tags=["reports"])

# Increment amounts applied to vendor signals when a new report arrives
COMPLAINT_BUMP = 8.0   # bump complaint_signal
RECENT_BUMP = 6.0      # bump recent_reports


@router.post("")
def submit_report(report: ReportCreate):
    # Find vendor
    vendor = next((v for v in store.vendors if v["id"] == report.vendor_id), None)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    # Create report record
    new_report = {
        "id": str(uuid.uuid4()),
        "vendor_id": report.vendor_id,
        "vendor_name": vendor["name"],
        "description": report.description,
        "amount_paid": report.amount_paid,
        "category": report.category or "general",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "pending",
    }
    store.reports.append(new_report)

    # Update vendor signals (in-memory mutation)
    vendor["complaint_count"] = vendor.get("complaint_count", 0) + 1
    vendor["complaint_signal"] = min(vendor.get("complaint_signal", 0) + COMPLAINT_BUMP, 100)
    vendor["recent_reports"] = min(vendor.get("recent_reports", 0) + RECENT_BUMP, 100)

    # Recalculate risk after signal bump
    updated_risk = calculate_risk(vendor)
    new_report["updated_risk"] = updated_risk

    return {
        "report": new_report,
        "updated_risk": updated_risk,
        "message": "Report submitted. Risk score has been recalculated.",
    }


@router.post("/{report_id}/verify")
def verify_report(report_id: str):
    """Admin approval: marks a report as verified after review."""
    report = next((r for r in store.reports if r["id"] == report_id), None)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report["status"] = "verified"
    report["reviewed_at"] = datetime.now(timezone.utc).isoformat()
    return report


@router.get("")
def get_reports():
    # Return reports newest-first with vendor risk snapshot
    result = []
    for r in reversed(store.reports):
        vendor = next((v for v in store.vendors if v["id"] == r["vendor_id"]), None)
        risk = calculate_risk(vendor) if vendor else None
        result.append({**r, "current_risk": risk})
    return result
