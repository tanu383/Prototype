import type { RiskLevel } from "../types";

interface Props {
  level: RiskLevel;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
}

const CONFIG = {
  LOW:      { label: "LOW RISK",      classes: "risk-badge-low" },
  MEDIUM:   { label: "MEDIUM RISK",   classes: "risk-badge-medium" },
  HIGH:     { label: "HIGH RISK",     classes: "risk-badge-high" },
  CRITICAL: { label: "CRITICAL RISK", classes: "risk-badge-critical" },
};

const SIZE = {
  sm: "badge-sm",
  md: "badge-md",
  lg: "badge-lg",
};

export default function RiskBadge({ level, size = "md", pulse }: Props) {
  const { label, classes } = CONFIG[level];
  return (
    <span
      className={`risk-badge ${classes} ${SIZE[size]} ${pulse && level === "CRITICAL" ? "badge-pulse" : ""}`}
    >
      <span className="badge-dot" />
      {label}
    </span>
  );
}
