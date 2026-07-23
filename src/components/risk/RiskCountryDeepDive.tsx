"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Droplets, Zap, DollarSign, Users, Home, Globe } from "lucide-react";
import { getRiskLevel } from "@/lib/logic/riskCalculator";
import { dbExposureByCountry } from "@/lib/data/dbPortfolio";
import type { CountryDetail } from "@/lib/types";

interface RiskCountryDeepDiveProps {
  country: CountryDetail;
}

const factorIcons: Record<string, any> = {
  inflation: Droplets, energy: Zap, debt: DollarSign,
  employment: Users, housing: Home, geopolitical: Globe,
};

const factorLabels: Record<string, string> = {
  inflation: "Inflation", energy: "Energy", debt: "Debt",
  employment: "Employment", housing: "Housing", geopolitical: "Geopolitical",
};

export function RiskCountryDeepDive({ country }: RiskCountryDeepDiveProps) {
  const riskLevel = getRiskLevel(country.totalRisk);

  const prevMonth = useMemo(() =>
    Object.fromEntries(
      Object.entries(country.breakdown).map(([key, val]) => [key, Math.max(5, val - 8 + Math.round(Math.random() * 16))])
    ), [country.breakdown]);

  const radarData = useMemo(() =>
    Object.entries(country.breakdown).map(([key, val]) => ({
      factor: factorLabels[key] || key, current: val, previous: prevMonth[key], fullMark: 100,
    })), [country.breakdown, prevMonth]);

  const sortedBreakdown = Object.entries(country.breakdown)
    .sort(([, a], [, b]) => b - a)
    .map(([key, val]) => ({
      key, label: factorLabels[key] || key, score: val,
      level: getRiskLevel(val), icon: factorIcons[key] || Globe,
      detail: country.details[key as keyof typeof country.details],
    }));

  const dbExposure = dbExposureByCountry[country.code];

  // Top 3 exposure departments
  const topExposureDepts = dbExposure
    ? Object.entries(dbExposure.breakdown)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
    : [];

  const exposureTotalFormatted = dbExposure
    ? `€${(dbExposure.total / 1000).toFixed(1)}B`
    : null;

  return (
    <div className="space-y-3">
      {/* Header Card — redesigned with integrated DB Exposure */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        {/* Top accent bar */}
        <div className="h-1 w-full" style={{ backgroundColor: riskLevel.color }} />

        <div className="p-4">
          {/* Row 1: Country info + Risk Score + DB Exposure total */}
          <div className="flex items-start gap-3">
            {/* Flag */}
            <span className="text-3xl leading-none mt-0.5">{country.flag}</span>

            {/* Name + Code */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-text-primary truncate">{country.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-mono font-medium text-text-secondary bg-gray-100 px-1.5 py-0.5 rounded">
                  {country.code}
                </span>
                {/* Trend pills */}
                <span className={`text-[9px] font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${
                  country.trend30d > 0 ? "bg-red-50 text-[#E5484D]" : country.trend30d < -2 ? "bg-green-50 text-[#2FAE60]" : "bg-gray-50 text-text-secondary"
                }`}>
                  {country.trend30d > 0 ? <TrendingUp size={8} /> : country.trend30d < -2 ? <TrendingDown size={8} /> : <Minus size={8} />}
                  {country.trend30d > 0 ? "+" : ""}{country.trend30d}d
                </span>
                <span className={`text-[9px] font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${
                  country.trend90d > 0 ? "bg-red-50 text-[#E5484D]" : country.trend90d < -2 ? "bg-green-50 text-[#2FAE60]" : "bg-gray-50 text-text-secondary"
                }`}>
                  {country.trend90d > 0 ? <TrendingUp size={8} /> : country.trend90d < -2 ? <TrendingDown size={8} /> : <Minus size={8} />}
                  {country.trend90d > 0 ? "+" : ""}{country.trend90d}d
                </span>
              </div>
            </div>

            {/* Risk Score Circle */}
            <div className="text-center flex-shrink-0">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold shadow-sm"
                style={{ backgroundColor: riskLevel.bgColor, color: riskLevel.color }}
              >
                {country.totalRisk}
              </div>
              <span className="text-[8px] font-semibold mt-0.5 block uppercase tracking-wider" style={{ color: riskLevel.color }}>
                {riskLevel.label}
              </span>
            </div>
          </div>

          {/* Row 2: DB Exposure — full-width bar with total */}
          {dbExposure && (
            <>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-semibold text-text-secondary uppercase tracking-wider">
                    DB Exposure
                  </span>
                  <span className="text-sm font-extrabold text-text-primary tabular-nums">
                    {exposureTotalFormatted}
                  </span>
                </div>
                {/* Exposure breakdown bars */}
                <div className="space-y-1.5">
                  {topExposureDepts.map(([dept, amount]) => {
                    const pct = Math.round((amount / dbExposure.total) * 100);
                    return (
                      <div key={dept} className="flex items-center gap-2">
                        <span className="text-[8px] text-text-secondary w-20 truncate flex-shrink-0">
                          {dept}
                        </span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, backgroundColor: riskLevel.color }}
                          />
                        </div>
                        <span className="text-[9px] font-semibold text-text-primary tabular-nums w-14 text-right">
                          €{(amount / 1000).toFixed(0)}B
                        </span>
                      </div>
                    );
                  })}
                </div>
                {Object.keys(dbExposure.breakdown).length > 3 && (
                  <p className="text-[8px] text-text-secondary mt-1.5 text-right">
                    +{Object.keys(dbExposure.breakdown).length - 3} more departments
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Radar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="card p-4"
      >
        <h4 className="text-[10px] font-semibold text-text-secondary mb-2 uppercase tracking-wider">Risk Dimensions</h4>
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#E5E7EB" />
            <PolarAngleAxis dataKey="factor" tick={{ fill: "#6B7280", fontSize: 9 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#9CA3AF", fontSize: 7 }} />
            <Radar name="30 days ago" dataKey="previous" stroke="#D1D5DB" fill="#D1D5DB" fillOpacity={0.1} strokeDasharray="3 3" />
            <Radar name="Current" dataKey="current" stroke={riskLevel.color} fill={riskLevel.color} fillOpacity={0.2} />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Risk Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card p-4"
      >
        <h4 className="text-[10px] font-semibold text-text-secondary mb-3 uppercase tracking-wider">Risk Breakdown</h4>
        <div className="space-y-2">
          {sortedBreakdown.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="p-2.5 rounded-lg bg-gray-50/60 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={11} style={{ color: item.level.color }} />
                  <span className="text-[11px] font-medium text-text-primary flex-1">{item.label}</span>
                  <span className="text-[11px] font-bold" style={{ color: item.level.color }}>{item.score}</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.score}%`, backgroundColor: item.level.color }} />
                </div>
                <div className="grid grid-cols-2 gap-1 text-[8px] text-text-secondary">
                  {item.key === "inflation" && item.detail && (
                    <><span>Rate: {(item.detail as any).current}%</span><span>Target gap: {Math.abs((item.detail as any).current - 2).toFixed(1)}pp</span></>
                  )}
                  {item.key === "energy" && item.detail && (
                    <><span>Import: {(item.detail as any).importPct}%</span><span>Storage: {(item.detail as any).gasStorage}%</span></>
                  )}
                  {item.key === "debt" && item.detail && (
                    <><span>Debt/GDP: {(item.detail as any).debtToGdp}%</span><span>Deficit: {(item.detail as any).deficit?.toFixed(1)}%</span></>
                  )}
                  {item.key === "employment" && item.detail && (
                    <><span>Unemp: {(item.detail as any).unemployment}%</span><span>6m: {((item.detail as any).change6m > 0 ? "+" : "")}{(item.detail as any).change6m}pp</span></>
                  )}
                  {item.key === "housing" && item.detail && (
                    <><span>Price/Inc: {(item.detail as any).priceToIncome}x</span><span>Stress: {(item.detail as any).mortgageStress}</span></>
                  )}
                  {item.key === "geopolitical" && item.detail && (
                    <span className="col-span-2">{(item.detail as any).factors?.slice(0, 2).join(", ")}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
