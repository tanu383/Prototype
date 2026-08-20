"""
TrustTrail Risk Engine

Deterministic scoring formula:
  risk = complaint_signal × 0.35
       + price_anomaly    × 0.25
       + location_risk    × 0.20
       + recent_reports   × 0.20

All signals are on a 0–100 scale.
Final score is clamped to 0–100 and mapped to a risk level.

This module is intentionally isolated so that the formula can be
replaced with an ML model (e.g. XGBoost) without touching the API layer.
"""

from typing import Dict, Any


WEIGHTS = {
    "complaint_signal": 0.35,
    "price_anomaly": 0.25,
    "location_risk": 0.20,
    "recent_reports": 0.20,
}

THRESHOLDS = [
    (80, "CRITICAL"),
    (60, "HIGH"),
    (30, "MEDIUM"),
    (0,  "LOW"),
]

REASON_TEMPLATES = {
    "complaint_signal": [
        (80, "Critical number of fraud complaints on record"),
        (60, "Multiple complaints filed by tourists"),
        (30, "Few overcharging complaints reported"),
        (0,  "Minimal or no complaints"),
    ],
    "price_anomaly": [
        (80, "Price far exceeds official reference rate"),
        (60, "Significant price anomaly detected — charges well above market rate"),
        (30, "Pricing slightly above reference rate"),
        (0,  "Pricing within normal range"),
    ],
    "location_risk": [
        (80, "Operating in highest-risk tourist zone"),
        (60, "High-risk tourist area with frequent incidents"),
        (30, "Moderate-risk area — stay alert"),
        (0,  "Low-risk location"),
    ],
    "recent_reports": [
        (80, "Surge in recent incident reports — risk increasing"),
        (60, "Increasing number of recent incident reports"),
        (30, "Some recent activity reported"),
        (0,  "No notable recent reports"),
    ],
}


def _get_reason(signal_name: str, value: float) -> str:
    """Return the human-readable reason string for a given signal value."""
    for threshold, text in REASON_TEMPLATES[signal_name]:
        if value >= threshold:
            return text
    return REASON_TEMPLATES[signal_name][-1][1]


def _get_level(score: int) -> str:
    for threshold, level in THRESHOLDS:
        if score >= threshold:
            return level
    return "LOW"


def calculate_risk(vendor: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate a risk assessment for a vendor dict.

    Expected keys: complaint_signal, price_anomaly, location_risk, recent_reports
    Returns: { score: int, level: str, reasons: list[str] }
    """
    raw_score = (
        vendor.get("complaint_signal", 0) * WEIGHTS["complaint_signal"]
        + vendor.get("price_anomaly", 0) * WEIGHTS["price_anomaly"]
        + vendor.get("location_risk", 0) * WEIGHTS["location_risk"]
        + vendor.get("recent_reports", 0) * WEIGHTS["recent_reports"]
    )

    score = int(min(max(round(raw_score), 0), 100))
    level = _get_level(score)

    # Build reasons — only include signals that contribute meaningfully (> 20)
    reasons = []
    for signal in ["complaint_signal", "price_anomaly", "location_risk", "recent_reports"]:
        value = vendor.get(signal, 0)
        if value > 20:
            reasons.append(_get_reason(signal, value))

    # Always have at least one reason
    if not reasons:
        reasons = ["Low risk based on available data"]

    return {
        "vendor_id": vendor.get("id", ""),
        "vendor_name": vendor.get("name", ""),
        "score": score,
        "level": level,
        "reasons": reasons,
    }
