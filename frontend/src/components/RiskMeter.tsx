import { useEffect, useState } from "react";
import type { RiskLevel } from "../types";

interface Props {
  score: number;
  level: RiskLevel;
  animate?: boolean;
}

const LEVEL_COLOR = {
  LOW:      "#16a34a",
  MEDIUM:   "#d97706",
  HIGH:     "#ea580c",
  CRITICAL: "#dc2626",
};

export default function RiskMeter({ score, level, animate = true }: Props) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score);
  const [progress, setProgress] = useState(animate ? 0 : score);

  useEffect(() => {
    if (!animate) return;
    let start = 0;
    const end = score;
    const duration = 1200;
    const step = 16;
    const increment = (end / duration) * step;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setDisplayScore(Math.round(start));
      setProgress(Math.round(start));
    }, step);

    return () => clearInterval(timer);
  }, [score, animate]);

  const color = LEVEL_COLOR[level];
  const circumference = 2 * Math.PI * 54;
  const strokeDash = circumference - (progress / 100) * circumference;

  return (
    <div className="risk-meter">
      <svg viewBox="0 0 120 120" className="risk-meter-svg">
        {/* Track */}
        <circle
          cx="60" cy="60" r="54"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="10"
        />
        {/* Progress */}
        <circle
          cx="60" cy="60" r="54"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDash}
          transform="rotate(-90 60 60)"
          style={{
            transition: "stroke-dashoffset 0.016s linear",
          }}
        />
        {/* Score text */}
        <text x="60" y="55" textAnchor="middle" className="meter-score-text" fill={color}>
          {displayScore}
        </text>
        <text x="60" y="72" textAnchor="middle" className="meter-label-text" fill="#94a3b8">
          / 100
        </text>
      </svg>
      <p className="risk-meter-level" style={{ color }}>{level} RISK</p>
    </div>
  );
}
