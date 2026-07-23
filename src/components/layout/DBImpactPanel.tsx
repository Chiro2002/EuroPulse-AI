"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  AlertOctagon,
  Building2,
  ShieldCheck,
  Bell,
  Brain,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import type { SidebarInsight } from "@/lib/types";

interface DBImpactPanelProps {
  insight: SidebarInsight | null;
  loading?: boolean;
  currentPage?: string;
}

const alertLevelConfig = {
  green: {
    icon: ShieldCheck,
    color: "#2FAE60",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    label: "Low Risk",
    textColor: "text-green-600",
  },
  yellow: {
    icon: AlertTriangle,
    color: "#F5A623",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    label: "Moderate Risk",
    textColor: "text-amber-600",
  },
  orange: {
    icon: AlertOctagon,
    color: "#F97316",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    label: "High Risk",
    textColor: "text-orange-600",
  },
  red: {
    icon: Bell,
    color: "#E5484D",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    label: "Critical Risk",
    textColor: "text-red-600",
  },
};

// ─── Fallback/default content when insight is null ─────────────────────
const DEFAULT_INSIGHT_TEXT =
  "EuroPulse AI is analyzing current market conditions across European markets. Preliminary indicators suggest elevated volatility in peripheral bond markets with potential spillover effects to the banking sector.";

const DEFAULT_ACTIONS = [
  "Monitor Italian BTP-Bund spread widening beyond 180bps",
  "Review energy sector loan book exposure concentrations",
  "Prepare risk committee briefing on French fiscal trajectory",
];

const DEFAULT_WARNINGS = [
  "BTP spread approaching 200bps — historical stress level",
  "German IFO business climate index declining for 3rd month",
];

export function DBImpactPanel({
  insight,
  loading = false,
  currentPage = "dashboard",
}: DBImpactPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    earlyWarnings: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Use insight data or fall back to defaults
  const hasInsight = insight !== null;
  const alertLevel = insight?.alertLevel || "yellow";
  const topInsight = insight?.topInsight || DEFAULT_INSIGHT_TEXT;
  const actions = insight?.actions?.length ? insight.actions : DEFAULT_ACTIONS;
  const earlyWarnings = insight?.earlyWarnings?.length ? insight.earlyWarnings : DEFAULT_WARNINGS;
  const impactCards = insight?.impactCards || [];

  if (loading) {
    return (
      <aside className="w-full bg-[#EEF2FB] border-l border-gray-200/80 flex flex-col h-full">
        <PanelHeader />
        <div className="flex-1 p-4 space-y-3 animate-pulse">
          <div className="h-24 bg-white/70 rounded-xl" />
          <div className="h-16 bg-white/70 rounded-xl" />
          <div className="h-16 bg-white/70 rounded-xl" />
          <div className="h-20 bg-white/70 rounded-xl" />
        </div>
      </aside>
    );
  }

  const alertConfig = alertLevelConfig[alertLevel];
  const AlertIcon = alertConfig.icon;

  return (
    <aside className="w-full bg-[#EEF2FB] border-l border-gray-200/80 flex flex-col h-full">
      {/* Panel Header */}
      <PanelHeader />

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3">
        {/* ─── 1. What This Means for DB — Summary ─────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-primary/10 bg-white p-3.5 ai-glow-subtle shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-md bg-primary/5 flex items-center justify-center">
              <Sparkles size={11} className="text-primary" />
            </div>
            <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              What This Means for Deutsche Bank
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[7px] font-bold text-primary bg-primary/5 border border-primary/10 uppercase tracking-wider">
                AI
              </span>
            </span>
          </div>
          <p className="text-xs text-text-primary leading-relaxed">
            {topInsight}
          </p>
        </motion.div>

        {/* ─── 2. Alert Level — Conditional ────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.06 } }}
          className={`rounded-xl border ${alertConfig.borderColor} ${alertConfig.bgColor} p-3`}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <AlertIcon size={20} className={alertConfig.textColor} />
              <span
                className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-ping"
                style={{ backgroundColor: alertConfig.color, opacity: 0.4 }}
              />
            </div>
            <div>
              <p className={`text-sm font-semibold ${alertConfig.textColor}`}>
                {alertConfig.label}
              </p>
              <p className="text-[10px] text-[#4A5568]/60">Current Alert Level</p>
            </div>
          </div>
        </motion.div>

        {/* ─── 3. Impact by Department ─────────────────────────────── */}
        {impactCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          >
            <div className="flex items-center gap-2 mb-2 px-0.5">
              <Building2 size={11} className="text-[#4A5568]/50" />
              <span className="text-[9px] font-semibold text-[#4A5568]/70 uppercase tracking-widest">
                Department Impact
              </span>
            </div>
            <div className="space-y-1.5">
              {impactCards.slice(0, 3).map((card, index) => {
                const severityColors: Record<string, { color: string; dot: string }> = {
                  critical: { color: "#E5484D", dot: "bg-red-500" },
                  high: { color: "#F5A623", dot: "bg-amber-500" },
                  medium: { color: "#0018A8", dot: "bg-primary" },
                  low: { color: "#2FAE60", dot: "bg-green-500" },
                };
                const style = severityColors[card.severity] || severityColors.medium;
                return (
                  <div
                    key={index}
                    className="rounded-xl bg-white border border-gray-100 p-2.5 border-l-2 shadow-sm hover:shadow-card-hover transition-shadow"
                    style={{ borderLeftColor: style.color }}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      <span className="text-[11px] font-medium text-text-primary">
                        {card.department}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#4A5568]/80 leading-relaxed ml-3">
                      {card.impact}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ─── 4. Early Warning Card — Amber left border + Bell ────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }}

        >
          <button
            onClick={() => toggleSection("earlyWarnings")}
            className="flex items-center gap-2 w-full mb-1.5 px-0.5"
          >
            <Bell size={11} className="text-amber-500" />
            <span className="text-[9px] font-semibold text-[#4A5568]/70 uppercase tracking-widest flex-1 text-left">
              Early Warnings
            </span>
            {expandedSections.earlyWarnings ? (
              <ChevronUp size={10} className="text-[#4A5568]/40" />
            ) : (
              <ChevronDown size={10} className="text-[#4A5568]/40" />
            )}
          </button>
          <AnimatePresence>
            {expandedSections.earlyWarnings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-1.5"
              >
                {earlyWarnings.slice(0, 3).map((warning, index) => (
                  <div
                    key={index}
                    className="rounded-xl bg-amber-50/80 border-l-4 border-amber-400 p-2.5 shadow-sm"
                  >
                    <div className="flex items-start gap-2">
                      <Bell size={12} className="text-amber-500 mt-0.5 flex-shrink-0" />
                      <span className="text-[11px] text-amber-900/90 leading-snug">{warning}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ─── 5. Recommended Action Card — Always visible, green check ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
          className="rounded-xl bg-white border border-green-100 p-3 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 rounded-md bg-green-50 flex items-center justify-center">
              <ShieldCheck size={12} className="text-green-600" />
            </div>
            <span className="text-[9px] font-semibold text-green-700 uppercase tracking-widest">
              Recommended Action
            </span>
          </div>
          <div className="space-y-2">
            {actions.slice(0, 2).map((action, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle2 size={13} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-[11px] text-text-primary leading-snug">{action}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </aside>
  );
}

// ─── Panel Header ─────────────────────────────────────────────────────
function PanelHeader() {
  return (
    <div className="flex items-center gap-2.5 px-4 h-14 border-b border-gray-200/60 flex-shrink-0 bg-white/30">
      <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/10">
        <Brain size={14} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
          AI Insights
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        </p>
        <p className="text-[9px] text-[#4A5568]/60 truncate">What This Means for Deutsche Bank</p>
      </div>
    </div>
  );
}
