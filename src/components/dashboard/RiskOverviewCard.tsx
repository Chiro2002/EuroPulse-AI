"use client";

import { motion } from "framer-motion";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";

interface RiskOverviewCardProps {
  countryCode: string;
  countryName: string;
  flag: string;
  riskScore: number;
  trend: "up" | "down" | "stable";
  topRisk: string;
}

export function RiskOverviewCard({
  countryCode,
  countryName,
  flag,
  riskScore,
  trend,
  topRisk,
}: RiskOverviewCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 75) return { text: "text-db-danger", bg: "bg-db-danger/10", bar: "bg-db-danger" };
    if (score >= 60) return { text: "text-db-warning", bg: "bg-db-warning/10", bar: "bg-db-warning" };
    if (score >= 40) return { text: "text-db-accent", bg: "bg-db-accent/10", bar: "bg-db-accent" };
    return { text: "text-db-success", bg: "bg-db-success/10", bar: "bg-db-success" };
  };

  const colors = getScoreColor(riskScore);

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="glass-card-hover p-3"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{flag}</span>
          <span className="text-xs font-semibold text-db-text-primary">{countryCode}</span>
        </div>
        <div className="flex items-center gap-1">
          {trend === "up" && <TrendingUp size={12} className="text-db-danger" />}
          {trend === "down" && <TrendingDown size={12} className="text-db-success" />}
          <span className={`text-xs font-bold ${colors.text}`}>{riskScore}</span>
        </div>
      </div>
      <p className="text-[10px] text-db-text-muted mb-1">{countryName}</p>
      <div className="h-1.5 bg-db-border rounded-full overflow-hidden mb-1">
        <div className={`h-full rounded-full ${colors.bar}`} style={{ width: `${riskScore}%` }} />
      </div>
      <p className="text-[9px] text-db-text-muted truncate">{topRisk}</p>
    </motion.div>
  );
}
