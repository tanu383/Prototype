import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getVendor, getVendorRisk } from "../services/api";
import type { Vendor, VendorRisk } from "../types";
import RiskBadge from "../components/RiskBadge";
import RiskMeter from "../components/RiskMeter";

const CATEGORY_ICONS: Record<string, string> = {
  "Tour Guide": "TG",
  "Transport & Tour": "TT",
  "Ticketing Service": "TS",
  "Sightseeing Package": "SP",
  "default": "TT",
};

const SIGNAL_COLORS: Record<string, string> = {
  complaint_signal: "#dc2626",
  price_anomaly:    "#d97706",
  location_risk:    "#ea580c",
  recent_reports:   "#1d4ed8",
};

export default function VendorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [vendor, setVendor]   = useState<Vendor | null>(null);
  const [risk, setRisk]       = useState<VendorRisk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getVendor(id), getVendorRisk(id)])
      .then(([v, r]) => { setVendor(v); setRisk(r); })
      .catch(() => setError("Vendor not found or backend is unavailable."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="page vendor-detail-page">
      <div className="loading-spinner">⏳ Loading vendor profile…</div>
    </div>
  );
  if (error || !vendor || !risk) return (
    <div className="page vendor-detail-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      <div className="error-banner">{error || "Vendor not found."}</div>
    </div>
  );

  const icon = CATEGORY_ICONS[vendor.category] ?? CATEGORY_ICONS["default"];
  const signals = [
    { key: "complaint_signal", label: "Complaint Signal",  value: vendor.complaint_signal },
    { key: "price_anomaly",    label: "Price Anomaly",     value: vendor.price_anomaly    },
    { key: "location_risk",    label: "Location Risk",     value: vendor.location_risk    },
    { key: "recent_reports",   label: "Recent Reports",    value: vendor.recent_reports   },
  ];

  return (
    <div className="page vendor-detail-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      {/* Header card */}
      <div className="vendor-detail-card">
        <div className="vendor-detail-top">
          <div className="vendor-detail-info">
            <div className="vendor-detail-icon">{icon}</div>
            <h1 className="vendor-detail-name">{vendor.name}</h1>
            <div className="vendor-detail-cat">{vendor.category}</div>
            <div className="vendor-detail-loc">{vendor.location_name}, {vendor.city}</div>
            <div className="vendor-meta-chips">
              <span className="meta-chip">{vendor.contact}</span>
              <span className="meta-chip">Operating since {vendor.operating_since}</span>
              <span className="meta-chip">{vendor.complaint_count} complaint{vendor.complaint_count !== 1 ? "s" : ""}</span>
            </div>
          </div>
          <RiskMeter score={risk.score} level={risk.level} />
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
          {vendor.description}
        </p>
      </div>

      {/* Risk Assessment Panel */}
      <div className="risk-assessment-panel">
        <div className="panel-title">Risk Assessment</div>
        <div className="risk-panel-body">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <RiskBadge level={risk.level} size="lg" pulse />
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Score: {risk.score}/100</span>
          </div>
          <div className="risk-reasons" style={{ flex: 1 }}>
            <div className="reasons-title">Why this risk level?</div>
            {risk.reasons.map((r, i) => (
              <div key={i} className="reason-item">
                <span className="reason-bullet">•</span>
                <span>{r}</span>
              </div>
            ))}
            <p className="risk-disclaimer">
              This is a risk assessment based on available signals, not a confirmed accusation.
              High risk means exercise caution and verify before engaging.
            </p>
          </div>
        </div>
      </div>

      {/* Signal Bars */}
      <div className="risk-assessment-panel">
        <div className="panel-title">Risk Signal Breakdown</div>
        <div className="signal-bars">
          {signals.map(s => (
            <div key={s.key} className="signal-row">
              <div className="signal-label-row">
                <span className="signal-label">{s.label}</span>
                <span className="signal-value">{Math.round(s.value)}/100</span>
              </div>
              <div className="signal-track">
                <div
                  className="signal-fill"
                  style={{
                    width: `${s.value}%`,
                    background: SIGNAL_COLORS[s.key],
                    opacity: 0.85,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Button */}
      <Link
        to={`/report/${vendor.id}`}
        className="report-btn"
        id={`report-btn-${vendor.id}`}
      >
        Report an Incident with this Vendor
      </Link>
    </div>
  );
}
