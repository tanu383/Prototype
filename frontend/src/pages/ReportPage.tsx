import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getVendor, getVendors } from "../services/api";
import type { Vendor } from "../types";
import RiskBadge from "../components/RiskBadge";
import ReportForm from "../components/ReportForm";

export default function ReportPage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();

  const [vendor, setVendor]       = useState<Vendor | null>(null);
  const [vendors, setVendors]     = useState<Vendor[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  useEffect(() => {
    if (!vendorId) return;
    Promise.all([getVendor(vendorId), getVendors()])
      .then(([v, vs]) => { setVendor(v); setVendors(vs); })
      .catch(() => setError("Vendor not found."))
      .finally(() => setLoading(false));
  }, [vendorId]);

  if (loading) return (
    <div className="page report-page">
      <div className="loading-spinner">Loading...</div>
    </div>
  );

  return (
    <div className="page report-page" style={{ paddingTop: "1.5rem" }}>
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="report-form-card">
        <h1 className="form-title">Report an Incident</h1>
        <p className="form-subtitle">
          Help other tourists by reporting suspicious or fraudulent vendor behaviour.
          Your report updates the vendor's risk score in real-time.
        </p>

        {/* Vendor info banner */}
        {vendor && (
          <div className="report-vendor-banner">
            <div>
              <div className="rvb-name">{vendor.name}</div>
              <div className="rvb-meta">{vendor.category} · {vendor.location_name}</div>
            </div>
            {vendor.risk_level && <RiskBadge level={vendor.risk_level} size="sm" />}
          </div>
        )}

        {error && <div className="error-banner">{error}</div>}

        {vendors.length > 0 && <ReportForm vendors={vendors} initialVendorId={vendorId} />}
      </div>
    </div>
  );
}