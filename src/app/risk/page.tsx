"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  BarChart3,
  PieChart,
} from "lucide-react";
import { riskScores } from "@/lib/data/mockData";
import { euCountries, countryNames } from "@/lib/data/countries";
import { getRiskLevel, calculateAggregateRisk, getSectorRiskBreakdown } from "@/lib/logic/riskCalculator";
import { EuropeMap } from "@/components/shared/EuropeMap";
import type { RiskScore } from "@/lib/types";

export default function RiskPage() {
  const [selectedCountry, setSelectedCountry] = useState<string>("DE");
  const [viewMode, setViewMode] = useState<"overview" | "country">("overview");

  const aggregate = useMemo(() => calculateAggregateRisk(riskScores), []);

  const selectedRiskScore = useMemo(
    () => riskScores.find((r) => r.country === selectedCountry)!,
    [selectedCountry]
  );

  const sectorBreakdown = useMemo(
    () => (selectedRiskScore ? getSectorRiskBreakdown(selectedRiskScore) : []),
    [selectedRiskScore]
  );

  // Build map data
  const mapData: Record<string, { value: number; color: string }> = {};
  riskScores.forEach((rs) => {
    const level = getRiskLevel(rs.total);
    mapData[rs.country] = { value: rs.total, color: level.color + "99" };
  });

  const sortedByRisk = useMemo(
    () => [...riskScores].sort((a, b) => b.total - a.total),
    []
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-db-text-primary flex items-center gap-2">
          <ShieldAlert size={22} className="text-db-warning" />
          Risk Assessment
        </h2>
        <p className="text-sm text-db-text-muted mt-1">
          Multi-factor risk scores across 10 EU countries with Deutsche Bank exposure overlay
        </p>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4"
        >
          <p className="text-xs text-db-text-muted mb-1">Weighted Avg Risk</p>
          <p className="text-2xl font-bold text-db-text-primary">{aggregate.weightedByGDP}</p>
          <p className="text-xs text-db-text-muted">GDP-weighted across EU</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.05 } }}
          className="glass-card p-4"
        >
          <p className="text-xs text-db-text-muted mb-1">Highest Risk</p>
          <p className="text-2xl font-bold text-db-danger">{aggregate.highest?.total}</p>
          <p className="text-xs text-db-text-muted">{aggregate.highest ? countryNames[aggregate.highest.country] : ""}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="glass-card p-4"
        >
          <p className="text-xs text-db-text-muted mb-1">Lowest Risk</p>
          <p className="text-2xl font-bold text-db-success">{aggregate.lowest?.total}</p>
          <p className="text-xs text-db-text-muted">{aggregate.lowest ? countryNames[aggregate.lowest.country] : ""}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }}
          className="glass-card p-4"
        >
          <p className="text-xs text-db-text-muted mb-1">Countries at Risk</p>
          <p className="text-2xl font-bold text-db-warning">
            {riskScores.filter((r) => r.total >= 60).length}
          </p>
          <p className="text-xs text-db-text-muted">Score ≥ 60 (High/Critical)</p>
        </motion.div>
      </div>

      {/* Map and Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <EuropeMap
            countryData={mapData}
            onCountryClick={(code) => {
              setSelectedCountry(code);
              setViewMode("country");
            }}
            selectedCountry={selectedCountry === selectedCountry ? selectedCountry : null}
            height={350}
          />
        </div>

        {/* Rankings */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-db-text-primary mb-3">Risk Rankings</h3>
          <div className="space-y-1">
            {sortedByRisk.map((rs, i) => {
              const level = getRiskLevel(rs.total);
              const country = euCountries.find((c) => c.code === rs.country);
              return (
                <motion.button
                  key={rs.country}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => {
                    setSelectedCountry(rs.country);
                    setViewMode("country");
                  }}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all hover:bg-db-surface ${
                    selectedCountry === rs.country ? "bg-db-surface ring-1 ring-db-accent/30" : ""
                  }`}
                >
                  <span className="text-xs font-bold text-db-text-muted w-4">{i + 1}</span>
                  <span className="text-base">{country?.flag}</span>
                  <span className="flex-1 text-xs font-medium text-db-text-primary text-left">
                    {country?.name}
                  </span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded"
                    style={{ backgroundColor: level.bgColor, color: level.color }}
                  >
                    {rs.total}
                  </span>
                  {rs.trend === "up" && <TrendingUp size={12} className="text-db-danger" />}
                  {rs.trend === "down" && <TrendingDown size={12} className="text-db-success" />}
                  {rs.trend === "stable" && <Minus size={12} className="text-db-text-muted" />}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Country Detail */}
      {viewMode === "country" && selectedRiskScore && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">
              {euCountries.find((c) => c.code === selectedCountry)?.flag}
            </span>
            <div>
              <h3 className="text-base font-bold text-db-text-primary">
                {countryNames[selectedCountry]}
              </h3>
              <p className="text-xs text-db-text-muted">
                Risk Score: {selectedRiskScore.total}/100 · Trend: {selectedRiskScore.trend}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getRiskLevel(selectedRiskScore.total).color }}
              />
              <span className="text-sm font-bold" style={{ color: getRiskLevel(selectedRiskScore.total).color }}>
                {getRiskLevel(selectedRiskScore.total).label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {sectorBreakdown.map((sector) => {
              const level = getRiskLevel(sector.score);
              return (
                <div key={sector.sector} className="glass-card p-3">
                  <p className="text-[10px] text-db-text-muted mb-1">{sector.sector}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-db-border rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${sector.score}%`,
                          backgroundColor: level.color,
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold" style={{ color: level.color }}>
                      {sector.score}
                    </span>
                  </div>
                  <p className="text-[9px] text-db-text-muted mt-1">
                    Weight: {Math.round(sector.weight * 100)}%
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Risk Insights */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold text-db-text-primary mb-3 flex items-center gap-2">
          <BarChart3 size={14} className="text-db-accent" />
          Risk Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              title: "Concentration Risk",
              description: "Italy (74) and Spain (70) represent 22% of DB's EU exposure with risk scores above 65. Combined €130B exposure requires enhanced monitoring.",
              severity: "high",
            },
            {
              title: "Geopolitical Exposure",
              description: "Poland (75 geopolitical score) and Germany (60) face elevated risks from Ukraine conflict proximity and energy supply disruption.",
              severity: "high",
            },
            {
              title: "Dutch Housing Risk",
              description: "Netherlands housing score of 75 with €18B mortgage exposure presents a growing concern as prices rise 12% YoY.",
              severity: "medium",
            },
            {
              title: "Improving Outlook",
              description: "Ireland (44, trend down), Netherlands (50, trend down), and Austria (50, trend down) show improving risk profiles offering portfolio diversification opportunities.",
              severity: "low",
            },
          ].map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-3 rounded-lg border-l-2"
              style={{
                borderLeftColor:
                  insight.severity === "high" ? "#EF4444" : insight.severity === "medium" ? "#F59E0B" : "#10B981",
                backgroundColor:
                  insight.severity === "high"
                    ? "rgba(239, 68, 68, 0.05)"
                    : insight.severity === "medium"
                    ? "rgba(245, 158, 11, 0.05)"
                    : "rgba(16, 185, 129, 0.05)",
              }}
            >
              <h4 className="text-xs font-semibold text-db-text-primary mb-1">{insight.title}</h4>
              <p className="text-xs text-db-text-secondary leading-relaxed">{insight.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
