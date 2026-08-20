import { useEffect, useState, useCallback } from "react";
import { getReports, verifyReport } from "../services/api";
import type { Report } from "../types";
import RiskBadge from "../components/RiskBadge";

export default function AdminPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const fetchReports = useCallback(() => {
    setLoading(true);
    setError("");
    getReports()
      .then(setReports)
      .catch(() => setError("Could not load reports. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleVerify = async (id: string) => {
    setVerifyingId(id);
    setError("");
    try {
      const updated = await verifyReport(id);
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: updated.status } : r));
    } catch {
      setError("Could not verify the report. Is the backend running?");
    } finally {
      setVerifyingId(null);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return iso; }
  };

  const CATEGORY_LABELS: Record<string, string> = {
    overcharge:      "Overcharging",
    fake_service:    "Fake Service",
    harassment:      "Harassment",
    fake_ticket:     "Fake Ticket",
    wrong_destination: "Wrong Destination",
    general:         "General",
  };

  return (
    <div className="page admin-page">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Admin Panel</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Submitted incident reports: {reports.length} total
          </p>
        </div>
        <button id="refresh-reports-btn" className="refresh-btn" onClick={fetchReports}>
          Refresh
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="reports-table-wrap">
        {loading ? (
          <div className="admin-empty">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="admin-empty">
            <p style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>No reports yet</p>
            <p style={{ fontSize: "0.82rem", marginTop: "0.4rem" }}>
              Submit an incident report from a vendor profile to see it here.
            </p>
          </div>
        ) : (
          <table className="reports-table">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Description</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Current Risk</th>
                <th>Submitted</th>
                <th>Verification</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id} id={`report-row-${r.id}`}>
                  <td className="td-vendor">
                    <strong>{r.vendor_name}</strong>
                    <span>{r.vendor_id}</span>
                  </td>
                  <td className="td-desc">{r.description}</td>
                  <td>
                    <span style={{
                      fontSize: "0.75rem", color: "var(--text-secondary)",
                      background: "var(--bg-soft)", border: "1px solid var(--border)",
                      padding: "0.2rem 0.6rem", borderRadius: "99px",
                    }}>
                      {CATEGORY_LABELS[r.category] ?? r.category}
                    </span>
                  </td>
                  <td className="td-amount">
                    {r.amount_paid != null ? `₹${r.amount_paid.toLocaleString("en-IN")}` : "N/A"}
                  </td>
                  <td>
                    {r.current_risk
                      ? <RiskBadge level={r.current_risk.level} size="sm" />
                      : <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>N/A</span>
                    }
                  </td>
                  <td className="td-date">{formatDate(r.created_at)}</td>
                  <td>
                    <div className="status-cell">
                      <span className={`status-pill status-${r.status}`}>
                        {r.status === "verified" ? "Verified" : "Not Verified Yet"}
                      </span>
                      {r.status === "pending" && (
                        <button
                          className="verify-btn"
                          onClick={() => handleVerify(r.id)}
                          disabled={verifyingId === r.id}
                        >
                          {verifyingId === r.id ? "Approving..." : "Approve"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}