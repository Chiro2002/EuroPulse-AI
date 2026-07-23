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
    if (score >= 75) return { text: "text-[#E5484D]", bg: "bg-[#E5484D]/10", bar: "bg-[#E5484D]" };
    if (score >= 60) return { text: "text-[#F5A623]", bg: "bg-[#F5A623]/10", bar: "bg-[#F5A623]" };
    if (score >= 40) return { text: "text-primary", bg: "bg-primary/10", bar: "bg-primary" };
    return { text: "text-[#2FAE60]", bg: "bg-[#2FAE60]/10", bar: "bg-[#2FAE60]" };
  };

  const colors = getScoreColor(riskScore);

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white rounded-xl border border-border shadow-sm p-3 hover:shadow-md transition-shadow hover:border-primary/30"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{flag}</span>
          <span className="text-xs font-semibold text-text-primary">{countryCode}</span>
        </div>
        <div className="flex items-center gap-1">
          {trend === "up" && <TrendingUp size={12} className="text-[#E5484D]" />}
          {trend === "down" && <TrendingDown size={12} className="text-[#2FAE60]" />}
          <span className={`text-xs font-bold ${colors.text}`}>{riskScore}</span>
        </div>
      </div>
      <p className="text-[10px] text-text-secondary mb-1">{countryName}</p>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
        <div className={`h-full rounded-full ${colors.bar}`} style={{ width: `${riskScore}%` }} />
      </div>
      <p className="text-[9px] text-text-secondary truncate">{topRisk}</p>
    </motion.div>
  );
}
