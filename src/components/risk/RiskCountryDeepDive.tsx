"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip,
} from "recharts";
import {
  TrendingUp, TrendingDown, Minus, Droplets, Zap, DollarSign, Users, Home, Globe, Brain,
} from "lucide-react";
import { getRiskLevel } from "@/lib/logic/riskCalculator";
import { dbExposureByCountry } from "@/lib/data/dbPortfolio";
import type { CountryDetail } from "@/lib/types";

interface RiskCountryDeepDiveProps {
  country: CountryDetail;
}

const factorIcons: Record<string, any> = {
  inflation: Droplets,
  energy: Zap,
  debt: DollarSign,
  employment: Users,
  housing: Home,
  geopolitical: Globe,
};

const factorLabels: Record<string, string> = {
  inflation: "Inflation", energy: "Energy", debt: "Debt",
  employment: "Employment", housing: "Housing", geopolitical: "Geopolitical",
};

export function RiskCountryDeepDive({ country }: RiskCountryDeepDiveProps) {
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const riskLevel = getRiskLevel(country.totalRisk);

  // Generate previous-month data for comparison overlay
  const prevMonth = Object.fromEntries(
    Object.entries(country.breakdown).map(([key, val]) => [key, Math.max(5, val - 8 + Math.round(Math.random() * 16))])
  );

  const radarData = Object.entries(country.breakdown).map(([key, val]) => ({
    factor: factorLabels[key] || key,
    current: val,
    previous: prevMonth[key],
    fullMark: 100,
  }));

  useEffect(() => {
    setAiExplanation(null);
    setAiLoading(true);
    // Simulate AI loading
    const timer = setTimeout(() => {
      const sorted = Object.entries(country.breakdown).sort(([, a], [, b]) => b - a);
      const top = sorted[0];
      const second = sorted[1];
      setAiExplanation(
        `${country.name} scores ${country.totalRisk}/100 (${riskLevel.label.toLowerCase()} risk). ` +
        `The primary driver is ${factorLabels[top[0]] || top[0]} at ${top[1]}/100, ` +
        `followed by ${factorLabels[second[0]] || second[0]} at ${second[1]}/100. ` +
        `${country.code === "IT" ? "Italy's debt-to-GDP of 158% and structural low growth create persistent fiscal vulnerabilities requiring close monitoring of BTP spreads and ECB policy shifts." :
          country.code === "PL" ? "Poland's proximity to the Ukraine conflict and high energy import dependency (75%) drive elevated geopolitical and energy stress scores." :
          country.code === "ES" ? "Spain's elevated unemployment (10.8%) combined with high debt (120% of GDP) creates structural fiscal risks despite improving labor market trends." :
          country.code === "DE" ? "Germany faces energy transition costs and industrial export headwinds, though strong fiscal position provides buffer compared to peers." :
          "Watch for escalations in the top risk factors this quarter."}`
      );
      setAiLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [country.code, country.totalRisk, country.breakdown, riskLevel.label, country.name]);

  const sortedBreakdown = Object.entries(country.breakdown)
    .sort(([, a], [, b]) => b - a)
    .map(([key, val]) => ({
      key,
      label: factorLabels[key] || key,
      score: val,
      level: getRiskLevel(val),
      icon: factorIcons[key] || Globe,
      detail: country.details[key as keyof typeof country.details],
    }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4"
      >
        <div className="flex items-center gap-4">
          <span className="text-4xl">{country.flag}</span>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-db-text-primary">{country.name}</h3>
            <p className="text-xs text-db-text-muted">{country.code}</p>
          </div>
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
              style={{ backgroundColor: riskLevel.bgColor, color: riskLevel.color, boxShadow: `0 0 20px ${riskLevel.color}30` }}
            >
              {country.totalRisk}
            </div>
            <span className="text-[10px] font-medium mt-1 block" style={{ color: riskLevel.color }}>
              {riskLevel.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3 text-[10px] text-db-text-muted">
          <span className="flex items-center gap-1">
            30d trend: {country.trend30d > 0 ? <TrendingUp size={10} className="text-db-danger" /> : <TrendingDown size={10} className="text-db-success" />}
            {country.trend30d > 0 ? "+" : ""}{country.trend30d}
          </span>
          <span className="flex items-center gap-1">
            90d trend: {country.trend90d > 0 ? <TrendingUp size={10} className="text-db-danger" /> : <TrendingDown size={10} className="text-db-success" />}
            {country.trend90d > 0 ? "+" : ""}{country.trend90d}
          </span>
        </div>
      </motion.div>

      {/* Radar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4"
      >
        <h4 className="text-xs font-semibold text-db-text-secondary mb-3 uppercase tracking-wider">Risk Dimensions — Current vs 30 Days Ago</h4>
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#1E2756" />
            <PolarAngleAxis dataKey="factor" tick={{ fill: "#94A3B8", fontSize: 10 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#64748B", fontSize: 8 }} />
            {/* Previous month overlay */}
            <Radar name="30 days ago" dataKey="previous" stroke="#1E2756" fill="#1E2756" fillOpacity={0.1} strokeDasharray="3 3" />
            {/* Current */}
            <Radar name="Current" dataKey="current" stroke={riskLevel.color} fill={riskLevel.color} fillOpacity={0.2} />
            <Tooltip
              contentStyle={{ background: "#111638", border: "1px solid #1E2756", borderRadius: "8px", fontSize: "12px" }}
              labelStyle={{ color: "#F1F5F9" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Risk Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4"
      >
        <h4 className="text-xs font-semibold text-db-text-secondary mb-3 uppercase tracking-wider">Risk Breakdown</h4>
        <div className="space-y-3">
          {sortedBreakdown.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="p-2.5 rounded-lg bg-db-surface/30 border border-db-border/30">
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon size={12} style={{ color: item.level.color }} />
                  <span className="text-xs font-medium text-db-text-primary flex-1">{item.label}</span>
                  <span className="text-xs font-bold" style={{ color: item.level.color }}>{item.score}</span>
                </div>
                <div className="h-1.5 bg-db-border rounded-full overflow-hidden mb-1.5">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.score}%`, backgroundColor: item.level.color }} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-[9px] text-db-text-muted">
                  {item.key === "inflation" && item.detail && (
                    <>
                      <span>Current: {(item.detail as any).current}%</span>
                      <span>Target gap: {Math.abs((item.detail as any).current - 2).toFixed(1)}pp</span>
                    </>
                  )}
                  {item.key === "energy" && item.detail && (
                    <>
                      <span>Import: {(item.detail as any).importPct}%</span>
                      <span>Gas storage: {(item.detail as any).gasStorage}%</span>
                    </>
                  )}
                  {item.key === "debt" && item.detail && (
                    <>
                      <span>Debt/GDP: {(item.detail as any).debtToGdp}%</span>
                      <span>Deficit: {(item.detail as any).deficit?.toFixed(1)}%</span>
                    </>
                  )}
                  {item.key === "employment" && item.detail && (
                    <>
                      <span>Unemployment: {(item.detail as any).unemployment}%</span>
                      <span>6m change: {((item.detail as any).change6m > 0 ? "+" : "")}{(item.detail as any).change6m}pp</span>
                    </>
                  )}
                  {item.key === "housing" && item.detail && (
                    <>
                      <span>Price/Income: {(item.detail as any).priceToIncome}x</span>
                      <span>Stress: {(item.detail as any).mortgageStress}</span>
                    </>
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

      {/* DB Exposure */}
      {dbExposureByCountry[country.code] && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-3"
        >
          <h4 className="text-xs font-semibold text-db-text-secondary mb-2 uppercase tracking-wider">DB Exposure</h4>
          <p className="text-lg font-bold text-db-text-primary">€{dbExposureByCountry[country.code].total.toLocaleString()}M</p>
        </motion.div>
      )}

      {/* AI Insight */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-3 bg-gradient-to-r from-db-accent/5 to-transparent"
      >
        <div className="flex items-center gap-2 mb-2">
          <Brain size={14} className="text-db-warning" />
          <span className="text-[10px] font-semibold text-db-text-secondary uppercase tracking-wider">AI Risk Analysis</span>
        </div>
        {aiLoading ? (
          <div className="space-y-1 animate-pulse">
            <div className="h-2 bg-db-border rounded w-full" />
            <div className="h-2 bg-db-border rounded w-5/6" />
            <div className="h-2 bg-db-border rounded w-4/6" />
          </div>
        ) : (
          <p className="text-xs text-db-text-primary leading-relaxed">{aiExplanation}</p>
        )}
      </motion.div>
    </div>
  );
}
