import { useState } from "react";
import { Link } from "react-router-dom";
import { submitReport } from "../services/api";
import type { Vendor, VendorRisk } from "../types";
import RiskBadge from "./RiskBadge";

interface Props {
  vendors: Vendor[];
  initialVendorId?: string;
}

const CATEGORIES = [
  { value: "overcharge", label: "Overcharging / Price Fraud" },
  { value: "fake_service", label: "Fake or Non-existent Service" },
  { value: "harassment", label: "Harassment or Coercion" },
  { value: "fake_ticket", label: "Fake Ticket / Document" },
  { value: "wrong_destination", label: "Wrong Destination / Detour" },
  { value: "general", label: "Other" },
];

export default function ReportForm({ vendors, initialVendorId = "" }: Props) {
  const [vendorId, setVendorId] = useState(initialVendorId);
  const [category, setCategory] = useState("overcharge");
  const [description, setDescription] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [updatedRisk, setUpdatedRisk] = useState<VendorRisk | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId || !description.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await submitReport({
        vendor_id: vendorId,
        description: description.trim(),
        amount_paid: amountPaid ? parseFloat(amountPaid) : undefined,
        category,
      });
      setUpdatedRisk(res.updated_risk);
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setSubmitted(false);
    setUpdatedRisk(null);
    setVendorId("");
    setCategory("overcharge");
    setDescription("");
    setAmountPaid("");
  };

  if (submitted && updatedRisk) {
    const color =
      updatedRisk.level === "CRITICAL"
        ? "var(--risk-critical)"
        : updatedRisk.level === "HIGH"
          ? "var(--risk-high)"
          : "var(--risk-medium)";
    return (
      <div className="report-success">
        <div className="success-icon">✓</div>
        <h3 className="success-title">Report Submitted</h3>
        <p className="success-msg">
          Thank you for helping keep tourists safe. Your report has been recorded and the
          vendor's risk score has been recalculated. It stays marked "Not Verified Yet"
          until our team reviews it.
        </p>
        <div className="risk-update-box">
          <div className="risk-update-label">Updated Risk Score</div>
          <div className="risk-update-score" style={{ color }}>{updatedRisk.score}</div>
          <RiskBadge level={updatedRisk.level} size="md" pulse />
        </div>
        <div className="report-success-actions">
          <button className="btn-secondary" onClick={reset}>Report another incident</button>
          <Link to={`/vendor/${vendorId}`} className="btn-secondary">View vendor profile</Link>
          <Link to="/admin" className="btn-secondary">View in Admin Panel</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error-banner">{error}</div>}

      <div className="form-group">
        <label className="form-label" htmlFor="report-vendor">Vendor</label>
        <select
          id="report-vendor"
          className="form-select"
          value={vendorId}
          onChange={e => setVendorId(e.target.value)}
          required
        >
          <option value="">Select a vendor...</option>
          {vendors.map(v => (
            <option key={v.id} value={v.id}>
              {v.name} · {v.location_name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="report-category">Incident Type</label>
        <select
          id="report-category"
          className="form-select"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="report-description">What happened? *</label>
        <textarea
          id="report-description"
          className="form-textarea"
          placeholder="e.g. The guide demanded ₹1500 for a service that normally costs ₹500."
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="report-amount">Amount Paid (₹) (optional)</label>
        <input
          id="report-amount"
          className="form-input"
          type="number"
          placeholder="e.g. 1500"
          value={amountPaid}
          onChange={e => setAmountPaid(e.target.value)}
          min={0}
        />
      </div>

      <button
        id="report-submit-btn"
        type="submit"
        className="submit-btn"
        disabled={submitting || !description.trim() || !vendorId}
      >
        {submitting ? "Submitting..." : "Submit Incident Report"}
      </button>
    </form>
  );
}