"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  AlertOctagon,
  AlertCircle,
  Lightbulb,
  Building2,
  Shield,
  ArrowRight,
  Siren,
  Brain,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { SidebarInsight, ViewMode } from "@/lib/types";

interface DBImpactPanelProps {
  insight: SidebarInsight | null;
  loading?: boolean;
  currentPage?: string;
}

const alertLevelConfig = {
  green: {
    icon: AlertCircle,
    color: "#10B981",
    bgColor: "bg-db-success/10",
    borderColor: "border-db-success/30",
    label: "Low Risk",
    textColor: "text-db-success",
  },
  yellow: {
    icon: AlertTriangle,
    color: "#F59E0B",
    bgColor: "bg-db-warning/10",
    borderColor: "border-db-warning/30",
    label: "Moderate Risk",
    textColor: "text-db-warning",
  },
  orange: {
    icon: AlertOctagon,
    color: "#F97316",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    label: "High Risk",
    textColor: "text-orange-400",
  },
  red: {
    icon: Siren,
    color: "#EF4444",
    bgColor: "bg-db-danger/10",
    borderColor: "border-db-danger/30",
    label: "Critical Risk",
    textColor: "text-db-danger",
  },
};

const severityStyles = {
  critical: { color: "#EF4444", bgColor: "bg-db-danger/10", dotColor: "bg-db-danger" },
  high: { color: "#F59E0B", bgColor: "bg-db-warning/10", dotColor: "bg-db-warning" },
  medium: { color: "#3B82F6", bgColor: "bg-db-accent/10", dotColor: "bg-db-accent" },
  low: { color: "#10B981", bgColor: "bg-db-success/10", dotColor: "bg-db-success" },
};

export function DBImpactPanel({
  insight,
  loading = false,
  currentPage = "dashboard",
}: DBImpactPanelProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("banker");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    earlyWarnings: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading) {
    return (
      <aside className="w-[360px] flex-shrink-0 bg-db-navy-light border-l border-db-border flex flex-col">
        <PanelHeader currentPage={currentPage} viewMode={viewMode} />
        <div className="flex-1 p-4 space-y-4 animate-pulse">
          <div className="h-24 bg-db-surface rounded-xl" />
          <div className="h-16 bg-db-surface rounded-xl" />
          <div className="h-16 bg-db-surface rounded-xl" />
          <div className="h-32 bg-db-surface rounded-xl" />
        </div>
      </aside>
    );
  }

  if (!insight) {
    return (
      <aside className="w-[360px] flex-shrink-0 bg-db-navy-light border-l border-db-border flex flex-col">
        <PanelHeader currentPage={currentPage} viewMode={viewMode} />
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-db-text-muted text-center">
            No insights available for this page
          </p>
        </div>
      </aside>
    );
  }

  const alertConfig = alertLevelConfig[insight.alertLevel];
  const AlertIcon = alertConfig.icon;

  return (
    <aside className="w-[360px] flex-shrink-0 bg-db-navy-light border-l border-db-border flex flex-col">
      {/* Panel Header */}
      <PanelHeader currentPage={currentPage} viewMode={viewMode} />

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        {/* Alert Level Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl border ${alertConfig.borderColor} ${alertConfig.bgColor} p-3`}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <AlertIcon size={24} color={alertConfig.color} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: alertConfig.color, opacity: 0.5 }} />
            </div>
            <div>
              <p className={`text-sm font-bold ${alertConfig.textColor}`}>
                {alertConfig.label}
              </p>
              <p className="text-[11px] text-db-text-muted">
                Current Alert Level
              </p>
            </div>
          </div>
        </motion.div>

        {/* Top Insight */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="glass-card p-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={14} className="text-db-warning" />
            <span className="text-xs font-semibold text-db-text-secondary uppercase tracking-wider">
              Top Insight
            </span>
          </div>
          <p className="text-sm text-db-text-primary leading-relaxed">
            {insight.topInsight}
          </p>
        </motion.div>

        {/* Impact Cards */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={14} className="text-db-accent" />
            <span className="text-xs font-semibold text-db-text-secondary uppercase tracking-wider">
              Impact by Department
            </span>
          </div>
          <div className="space-y-2">
            {insight.impactCards.map((card, index) => {
              const styles = severityStyles[card.severity];
              return (
                <div
                  key={index}
                  className="glass-card p-3 border-l-2"
                  style={{ borderLeftColor: styles.color }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${styles.dotColor}`} />
                    <span className="text-xs font-semibold text-db-text-secondary">
                      {card.department}
                    </span>
                  </div>
                  <p className="text-xs text-db-text-primary leading-relaxed">
                    {card.impact}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Action Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
          className="glass-card p-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <Shield size={14} className="text-db-success" />
            <span className="text-xs font-semibold text-db-text-secondary uppercase tracking-wider">
              Recommended Actions
            </span>
          </div>
          <ul className="space-y-2">
            {insight.actions.map((action, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-db-accent/15 flex items-center justify-center mt-0.5">
                  <span className="text-[10px] font-bold text-db-accent">
                    {index + 1}
                  </span>
                </span>
                <span className="text-xs text-db-text-primary">{action}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Early Warnings */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.35 } }}
        >
          <button
            onClick={() => toggleSection("earlyWarnings")}
            className="flex items-center gap-2 w-full mb-2"
          >
            <Siren size={14} className="text-db-danger" />
            <span className="text-xs font-semibold text-db-text-secondary uppercase tracking-wider flex-1 text-left">
              Early Warnings
            </span>
            {expandedSections.earlyWarnings ? (
              <ChevronUp size={12} className="text-db-text-muted" />
            ) : (
              <ChevronDown size={12} className="text-db-text-muted" />
            )}
          </button>
          <AnimatePresence>
            {expandedSections.earlyWarnings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-2"
              >
                {insight.earlyWarnings.map((warning, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2.5 rounded-lg bg-db-danger/5 border border-db-danger/10"
                  >
                    <ArrowRight size={12} className="text-db-danger mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-db-text-primary">{warning}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Mode Toggle */}
      <div className="p-3 border-t border-db-border">
        <div className="glass-card p-1.5">
          <div className="flex items-center gap-1">
            {(["simple", "banker", "detailed"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all ${
                  viewMode === mode
                    ? "bg-db-accent text-white shadow-lg shadow-db-accent/25"
                    : "text-db-text-muted hover:text-db-text-primary"
                }`}
              >
                {mode === "banker" ? "Banker" : mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

// Panel header sub-component
function PanelHeader({
  currentPage,
  viewMode,
}: {
  currentPage: string;
  viewMode: ViewMode;
}) {
  return (
    <div className="flex items-center gap-2 px-4 h-16 border-b border-db-border flex-shrink-0">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-db-accent to-blue-400 flex items-center justify-center">
        <Brain size={14} className="text-white" />
      </div>
      <div>
        <p className="text-xs font-semibold text-db-text-primary">
          What This Means
        </p>
        <p className="text-[10px] text-db-text-muted">for Deutsche Bank</p>
      </div>
    </div>
  );
}
