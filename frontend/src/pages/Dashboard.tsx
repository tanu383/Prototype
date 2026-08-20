import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getLocations, getVendors } from "../services/api";
import type { Location, Vendor } from "../types";
import RiskBadge from "../components/RiskBadge";
import ReportForm from "../components/ReportForm";

export default function Dashboard() {
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [highRisk, setHighRisk] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getLocations(), getVendors()]).then(([locs, vends]) => {
      setLocations(locs);
      setVendors(vends);
      const sorted = [...vends].sort((a, b) => (b.risk_score ?? 0) - (a.risk_score ?? 0));
      setHighRisk(sorted.slice(0, 3));
      setLoading(false);
    });
  }, []);

  const LEVEL_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

  const scrollToReport = () => {
    reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="page dashboard-page">
      {/* Hero */}
      <section className="hero-section">
        <div className="hero-badge">Smart India Hackathon 2026</div>
        <h1 className="hero-title">
          <span className="brand-trust">Trust</span>
          <span className="brand-trail">Trail</span>
        </h1>
        <p className="hero-subtitle">
          AI-Powered Tourism Scam Risk & Safety Platform
        </p>
        <p className="hero-desc">
          Know the risk before you engage. TrustTrail analyses vendor complaints, pricing
          anomalies, and location signals to give you an explainable risk score in seconds.
        </p>
        <div className="hero-cta">
          <button className="btn-primary" onClick={() => navigate("/explore")}>
            Explore Vendors
          </button>
          <button className="btn-outline" onClick={scrollToReport}>
            Report an Incident
          </button>
        </div>
        <div className="hero-stats">
          <div className="stat-pill">
            <span className="stat-number">4</span>
            <span className="stat-label">Risk Signals</span>
          </div>
          <div className="stat-pill">
            <span className="stat-number">Real-time</span>
            <span className="stat-label">Score Updates</span>
          </div>
          <div className="stat-pill">
            <span className="stat-number">100%</span>
            <span className="stat-label">Explainable</span>
          </div>
        </div>
      </section>

      {/* Report an Incident */}
      <section className="section" ref={reportRef}>
        <div className="report-section-card">
          <div className="report-section-copy">
            <h2 className="section-title">Report an Incident</h2>
            <p className="section-subtitle">
              Experienced overcharging, a fake service, or suspicious behaviour? Submit a
              report so other tourists know before they engage.
            </p>
            <ul className="report-section-points">
              <li>Pick the vendor involved</li>
              <li>Describe what happened</li>
              <li>The risk score updates instantly</li>
              <li>Admins review and approve reports before they count as verified</li>
            </ul>
          </div>
          <div className="report-form-card report-section-form">
            <ReportForm vendors={vendors} />
          </div>
        </div>
      </section>

      {/* Location Select */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Select a Tourism Location</h2>
          <p className="section-subtitle">Choose a Jaipur landmark to explore nearby vendors</p>
        </div>
        {loading ? (
          <div className="loading-grid">
            {[1,2,3].map(i => <div key={i} className="skeleton-card" />)}
          </div>
        ) : (
          <div className="location-grid">
            {[...locations].sort((a, b) => LEVEL_ORDER.indexOf(a.risk_level) - LEVEL_ORDER.indexOf(b.risk_level)).map(loc => (
              <button
                key={loc.id}
                id={`location-btn-${loc.id}`}
                className={`location-card location-${loc.risk_level.toLowerCase()}`}
                onClick={() => navigate(`/explore?location=${loc.id}`)}
              >
                <div className="loc-card-top">
                  <span className="loc-name">{loc.name}</span>
                  <RiskBadge level={loc.risk_level} size="sm" />
                </div>
                <p className="loc-desc">{loc.description}</p>
                <span className="loc-city">{loc.city}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* High Risk Preview */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">High-Risk Vendors to Watch</h2>
          <p className="section-subtitle">Top vendors flagged by tourist reports and signal analysis</p>
        </div>
        <div className="high-risk-list">
          {highRisk.map((v, i) => (
            <button
              key={v.id}
              id={`high-risk-preview-${v.id}`}
              className="high-risk-item"
              onClick={() => navigate(`/vendor/${v.id}`)}
            >
              <span className="rank-badge">#{i + 1}</span>
              <div className="hr-info">
                <span className="hr-name">{v.name}</span>
                <span className="hr-location">{v.location_name}</span>
              </div>
              <div className="hr-right">
                <RiskBadge level={v.risk_level ?? "LOW"} size="sm" pulse />
                <span className="hr-score">{v.risk_score}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">How TrustTrail Works</h2>
        </div>
        <div className="how-grid">
          {[
            { title: "Complaint Signal", desc: "Tourist-submitted incident reports weight the vendor's complaint score", weight: "35%" },
            { title: "Price Anomaly", desc: "Detected when charges significantly exceed official reference rates", weight: "25%" },
            { title: "Location Risk", desc: "Area-level risk based on historical fraud concentration", weight: "20%" },
            { title: "Recent Reports", desc: "Surge detection: increasing reports raise the risk score faster", weight: "20%" },
          ].map((item, i) => (
            <div key={item.title} className="how-card">
              <div className="how-index">{String(i + 1).padStart(2, "0")}</div>
              <h3 className="how-title">{item.title}</h3>
              <p className="how-desc">{item.desc}</p>
              <span className="how-weight">{item.weight} weight</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}