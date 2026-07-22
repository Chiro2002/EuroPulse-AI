"use client";

import { motion } from "framer-motion";
import { getRiskLevel, getSectorRiskBreakdown } from "@/lib/logic/riskCalculator";
import type { RiskScore } from "@/lib/types";

interface RiskCountryDetailProps {
  countryCode: string;
  countryName: string;
  flag: string;
  riskScore: RiskScore;
}

export function RiskCountryDetail({
  countryCode,
  countryName,
  flag,
  riskScore,
}: RiskCountryDetailProps) {
  const level = getRiskLevel(riskScore.total);
  const sectors = getSectorRiskBreakdown(riskScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{flag}</span>
        <div>
          <h3 className="text-base font-bold text-db-text-primary">{countryName}</h3>
          <p className="text-xs text-db-text-muted">
            Risk Score: {riskScore.total}/100 · Trend: {riskScore.trend}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: level.color }} />
          <span className="text-sm font-bold" style={{ color: level.color }}>{level.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {sectors.map((sector) => {
          const sectorLevel = getRiskLevel(sector.score);
          return (
            <div key={sector.sector} className="glass-card p-3">
              <p className="text-[10px] text-db-text-muted mb-1">{sector.sector}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-db-border rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${sector.score}%`, backgroundColor: sectorLevel.color }} />
                </div>
                <span className="text-xs font-bold" style={{ color: sectorLevel.color }}>{sector.score}</span>
              </div>
              <p className="text-[9px] text-db-text-muted mt-1">Weight: {Math.round(sector.weight * 100)}%</p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
