import { useNavigate } from "react-router-dom";
import type { Vendor } from "../types";
import RiskBadge from "./RiskBadge";

interface Props {
  vendor: Vendor;
}

const CATEGORY_ICONS: Record<string, string> = {
  "Tour Guide": "TG",
  "Transport & Tour": "TT",
  "Ticketing Service": "TS",
  "Sightseeing Package": "SP",
  "default": "TT",
};

export default function VendorCard({ vendor }: Props) {
  const navigate = useNavigate();
  const icon = CATEGORY_ICONS[vendor.category] ?? CATEGORY_ICONS["default"];
  const level = vendor.risk_level ?? "LOW";

  return (
    <div
      className={`vendor-card vendor-card-${level.toLowerCase()}`}
      onClick={() => navigate(`/vendor/${vendor.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/vendor/${vendor.id}`)}
      id={`vendor-card-${vendor.id}`}
    >
      <div className="vendor-card-header">
        <span className="vendor-icon">{icon}</span>
        <div className="vendor-card-meta">
          <span className="vendor-category">{vendor.category}</span>
          <span className="vendor-location">{vendor.location_name}</span>
        </div>
      </div>
      <h3 className="vendor-card-name">{vendor.name}</h3>
      <p className="vendor-card-desc">{vendor.description}</p>
      <div className="vendor-card-footer">
        <RiskBadge level={level} size="sm" pulse />
        {vendor.risk_score !== undefined && (
          <span className="vendor-score">Score: <strong>{vendor.risk_score}</strong></span>
        )}
      </div>
    </div>
  );
}
