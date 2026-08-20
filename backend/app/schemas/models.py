from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Location(BaseModel):
    id: str
    name: str
    city: str
    latitude: float
    longitude: float
    risk_level: str
    description: str


class Vendor(BaseModel):
    id: str
    name: str
    category: str
    location_id: str
    location_name: str
    city: str
    complaint_count: int
    complaint_signal: float
    price_anomaly: float
    location_risk: float
    recent_reports: float
    description: str
    contact: str
    operating_since: str
    reasons: list[str]


class VendorRisk(BaseModel):
    vendor_id: str
    vendor_name: str
    score: int
    level: str
    reasons: list[str]


class ReportCreate(BaseModel):
    vendor_id: str
    description: str
    amount_paid: Optional[float] = None
    category: Optional[str] = "general"


class Report(BaseModel):
    id: str
    vendor_id: str
    vendor_name: str
    description: str
    amount_paid: Optional[float] = None
    category: str
    created_at: str
    status: str
    updated_risk: Optional[VendorRisk] = None
