"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Building2,
  Home,
  Landmark,
  TrendingUp,
  PiggyBank,
  BadgeEuro,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import type { DBBusinessLineImpactResult } from "@/lib/types";

interface Props {
  dbImpact: Record<string, DBBusinessLineImpactResult>;
  totalPnL: number;
  isAnimating: boolean;
}

const lineConfig: Record<string, { label: string; icon: any; color: string }> = {
  corporate_lending: { label: "Corporate Lending", icon: Building2, color: "#3B82F6" },
  mortgage_book: { label: "Mortgage Book", icon: Home, color: "#8B5CF6" },
  sovereign_bonds: { label: "Sovereign Bonds", icon: Landmark, color: "#F59E0B" },
  trading: { label: "FX Trading", icon: TrendingUp, color: "#10B981" },
  retail_banking: { label: "Retail Banking", icon: PiggyBank, color: "#06B6D4" },
  treasury: { label: "Treasury", icon: BadgeEuro, color: "#F97316" },
  trading_desk: { label: "Trading Desk", icon: TrendingUp, color: "#EC4899" },
  net_interest_income: { label: "Net Interest Income", icon: DollarSign, color: "#6366F1" },
};

function getSeverityClass(direction: string): string {
  if (direction === "positive") return "border-db-success/30 bg-db-success/10";
  if (direction === "neutral") return "border-db-border bg-db-surface";
  if (direction === "negative" || direction === "slightly_negative") return "border-db-danger/30 bg-db-danger/10";
  return "border-db-border bg-db-surface";
}

function getSeverityDot(direction: string): string {
  if (direction === "positive") return "bg-db-success";
  if (direction === "neutral") return "bg-db-text-muted";
  return "bg-db-danger";
}

export default function DBImpactSection({ dbImpact, totalPnL, isAnimating }: Props) {
  const entries = Object.entries(dbImpact);
  const totalColor = totalPnL >= 0 ? "#10B981" : "#EF4444";
  const totalText = totalPnL >= 0 ? "Positive" : "Negative";

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-db-text-primary flex items-center gap-2">
          <Shield size={14} className="text-db-accent" />
          Deutsche Bank Impact
        </h3>
        <motion.div
          key={totalPnL}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="text-right"
        >
          <p className="text-[9px] text-db-text-muted uppercase tracking-wider">Total P&L Impact</p>
          <motion.p
            className="text-lg font-bold tabular-nums"
            style={{ color: totalColor }}
          >
            €{Math.abs(totalPnL).toFixed(0)}M
          </motion.p>
          <p className="text-[10px] font-medium" style={{ color: totalColor }}>
            {totalText}
          </p>
        </motion.div>
      </div>

      {/* Risk indicator bar */}
      <div className="h-2 bg-db-border rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full rounded-full"
          initial={isAnimating ? { width: "0%" } : false}
          animate={{ width: `${Math.min(100, Math.abs(totalPnL) / 25)}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ backgroundColor: totalColor }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {entries.map(([key, impact], i) => {
          const config = lineConfig[key] || { label: key.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()), icon: Building2, color: "#6B7280" };
          const Icon = config.icon;
          const isPositive = impact.direction === "positive";
          const isNegative = impact.direction === "negative" || impact.direction === "slightly_negative";

          return (
            <motion.div
              key={key}
              initial={isAnimating ? { opacity: 0, y: 15 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isAnimating ? i * 0.1 : 0 }}
              className={`rounded-lg border p-3 ${getSeverityClass(impact.direction)} transition-all duration-300 hover:shadow-lg`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${config.color}20` }}>
                    <Icon size={14} style={{ color: config.color }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-db-text-primary">{config.label}</p>
                    <p className="text-[9px] text-db-text-muted">Exposure: Impacted</p>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${getSeverityDot(impact.direction)}`} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {isPositive ? (
                    <TrendingUp size={12} className="text-db-success" />
                  ) : isNegative ? (
                    <TrendingDown size={12} className="text-db-danger" />
                  ) : null}
                  <span className={`text-sm font-bold tabular-nums ${isPositive ? "text-db-success" : isNegative ? "text-db-danger" : "text-db-text-muted"}`}>
                    {impact.pnl_estimate >= 0 ? "+" : ""}€{impact.pnl_estimate.toFixed(0)}M
                  </span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border capitalize ${
                  impact.magnitude === "severe" ? "border-db-danger/30 text-db-danger bg-db-danger/10" :
                  impact.magnitude === "moderate" ? "border-db-warning/30 text-db-warning bg-db-warning/10" :
                  "border-db-border text-db-text-muted bg-db-surface"
                }`}>
                  {impact.magnitude}
                </span>
              </div>

              <p className="text-[10px] text-db-text-muted mt-2 leading-relaxed">
                {impact.reason}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* RWA & Capital Impact */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-db-border">
        <motion.div
          initial={isAnimating ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          className="p-3 rounded-lg bg-db-surface border border-db-border"
        >
          <p className="text-[10px] text-db-text-muted">RWA Impact Estimate</p>
          <p className="text-sm font-bold text-db-text-primary mt-0.5">
            €{Math.round(Math.abs(totalPnL) * 2.5)}M
          </p>
          <p className="text-[9px] text-db-text-muted">Risk-weighted assets</p>
        </motion.div>
        <motion.div
          initial={isAnimating ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="p-3 rounded-lg bg-db-surface border border-db-border"
        >
          <p className="text-[10px] text-db-text-muted">Capital Ratio Impact</p>
          <p className="text-sm font-bold tabular-nums mt-0.5" style={{ color: totalColor }}>
            {totalPnL >= 0 ? "+" : ""}{(totalPnL / 60000).toFixed(2)}pp
          </p>
          <p className="text-[9px] text-db-text-muted">CET1 ratio change</p>
        </motion.div>
      </div>
    </div>
  );
}
