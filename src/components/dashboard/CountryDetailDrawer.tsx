"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, TrendingDown, Building2, AlertTriangle } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { getRiskLevel } from "@/lib/logic/riskCalculator";
import { dbExposureByCountry } from "@/lib/data/dbPortfolio";
import type { CountryRisk } from "@/lib/types";

interface CountryDetailDrawerProps {
  country: CountryRisk | null;
  open: boolean;
  onClose: () => void;
}

interface RadarDataPoint {
  factor: string;
  score: number;
  fullMark: 100;
}

const factorLabels: Record<string, string> = {
  inflation: "Inflation",
  energy: "Energy",
  debt: "Debt",
  unemployment: "Unemployment",
  housing: "Housing",
  geopolitical: "Geopolitical",
};

export function CountryDetailDrawer({ country, open, onClose }: CountryDetailDrawerProps) {
  if (!country) return null;

  const level = getRiskLevel(country.riskScore);
  const exposureData = dbExposureByCountry[country.country];

  const radarData: RadarDataPoint[] = Object.entries(country.breakdown).map(([key, value]) => ({
    factor: factorLabels[key] || key,
    score: value,
    fullMark: 100,
  }));

  const topConcerns = Object.entries(country.breakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([key, value]) => ({
      factor: factorLabels[key] || key,
      score: value,
    }));

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-[420px] bg-db-navy-light border-l border-db-border shadow-2xl z-50 overflow-y-auto scrollbar-thin"
          >
            {/* Header */}
            <div className="sticky top-0 bg-db-navy-light border-b border-db-border p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{country.flag}</span>
                <div>
                  <h3 className="text-base font-bold text-db-text-primary">{country.countryName}</h3>
                  <p className="text-xs text-db-text-muted">{country.country}</p>
                </div>
                <div
                  className="ml-2 px-2 py-0.5 rounded text-xs font-bold"
                  style={{ backgroundColor: level.bgColor, color: level.color }}
                >
                  {country.riskScore}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-db-surface transition-colors"
              >
                <X size={18} className="text-db-text-muted" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Risk Level */}
              <div className="glass-card p-3 flex items-center justify-between">
                <span className="text-sm text-db-text-secondary">Risk Level</span>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: level.color }} />
                  <span className="text-sm font-semibold" style={{ color: level.color }}>
                    {level.label}
                  </span>
                </div>
              </div>

              {/* Radar Chart */}
              <div className="glass-card p-3">
                <h4 className="text-xs font-semibold text-db-text-secondary mb-2 uppercase tracking-wider">
                  Risk Breakdown
                </h4>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#1E2756" />
                    <PolarAngleAxis
                      dataKey="factor"
                      tick={{ fill: "#94A3B8", fontSize: 10 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fill: "#64748B", fontSize: 9 }}
                    />
                    <Radar
                      name="Risk Score"
                      dataKey="score"
                      stroke={level.color}
                      fill={level.color}
                      fillOpacity={0.2}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#111638",
                        border: "1px solid #1E2756",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      labelStyle={{ color: "#F1F5F9" }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Top Concerns */}
              <div className="glass-card p-3">
                <h4 className="text-xs font-semibold text-db-text-secondary mb-2 uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle size={11} className="text-db-warning" />
                  Top Risk Factors
                </h4>
                <div className="space-y-2">
                  {topConcerns.map((concern, i) => {
                    const concernLevel = getRiskLevel(concern.score);
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-db-text-muted w-20">{concern.factor}</span>
                        <div className="flex-1 h-2 bg-db-border rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${concern.score}%`,
                              backgroundColor: concernLevel.color,
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold w-8 text-right" style={{ color: concernLevel.color }}>
                          {concern.score}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DB Exposure */}
              {exposureData && (
                <div className="glass-card p-3">
                  <h4 className="text-xs font-semibold text-db-text-secondary mb-2 uppercase tracking-wider flex items-center gap-1">
                    <Building2 size={11} className="text-db-accent" />
                    DB Exposure
                  </h4>
                  <p className="text-lg font-bold text-db-text-primary mb-2">
                    €{exposureData.total.toLocaleString()}M
                  </p>
                  <div className="space-y-1.5">
                    {Object.entries(exposureData.breakdown).map(([dept, amount]) => (
                      <div key={dept} className="flex items-center justify-between text-xs">
                        <span className="text-db-text-muted">{dept}</span>
                        <span className="text-db-text-primary font-medium">
                          €{amount.toLocaleString()}M
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2 rounded-lg bg-db-accent text-white text-xs font-medium hover:bg-blue-600 transition-colors"
                >
                  View on News Page →
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2 rounded-lg bg-db-surface text-db-text-secondary text-xs font-medium hover:text-db-text-primary transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
