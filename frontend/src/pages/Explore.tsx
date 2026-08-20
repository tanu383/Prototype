import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getVendors, getLocation } from "../services/api";
import type { Vendor, Location, RiskLevel } from "../types";
import VendorCard from "../components/VendorCard";
import RiskBadge from "../components/RiskBadge";

const RISK_ORDER: RiskLevel[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

export default function Explore() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const locationId = searchParams.get("location") ?? "";

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<RiskLevel | "ALL">("ALL");

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([
      getVendors(locationId || undefined),
      locationId ? getLocation(locationId) : Promise.resolve(null),
    ])
      .then(([v, l]) => {
        // Sort by risk score descending
        setVendors([...v].sort((a, b) => (b.risk_score ?? 0) - (a.risk_score ?? 0)));
        setLocation(l);
      })
      .catch(() => setError("Could not load vendors. Is the backend running?"))
      .finally(() => setLoading(false));
  }, [locationId]);

  const filtered = filter === "ALL"
    ? vendors
    : vendors.filter(v => v.risk_level === filter);

  const counts = vendors.reduce<Record<string, number>>((acc, v) => {
    const lvl = v.risk_level ?? "LOW";
    acc[lvl] = (acc[lvl] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="page explore-page">
      <div className="explore-header-bar">
        <div>
          <button className="back-btn" onClick={() => navigate("/")}>← Back to Dashboard</button>
          <h1 className="explore-title">
            {location ? `Vendors near ${location.name}` : "All Vendors"}
          </h1>
        </div>
        <div className="explore-location-badge">
          {location ? (
            <>
              <RiskBadge level={location.risk_level} size="sm" />
              <span>{location.city} · {location.risk_level} area risk</span>
            </>
          ) : (
            <span>{vendors.length} vendors across all locations</span>
          )}
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Filters */}
      <div className="filter-row">
        <button
          id="filter-all"
          className={`filter-btn ${filter === "ALL" ? "active" : ""}`}
          onClick={() => setFilter("ALL")}
        >
          All ({vendors.length})
        </button>
        {RISK_ORDER.map(level => counts[level] ? (
          <button
            key={level}
            id={`filter-${level.toLowerCase()}`}
            className={`filter-btn ${filter === level ? "active" : ""}`}
            onClick={() => setFilter(level)}
          >
            {level} ({counts[level]})
          </button>
        ) : null)}
      </div>

      {loading ? (
        <div className="loading-grid">
          {[1,2,3,4].map(i => <div key={i} className="skeleton-card" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p>No vendors match this filter.</p>
        </div>
      ) : (
        <div className="vendor-grid">
          {filtered.map(v => <VendorCard key={v.id} vendor={v} />)}
        </div>
      )}
    </div>
  );
}
