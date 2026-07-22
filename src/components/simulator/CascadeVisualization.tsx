"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, Clock } from "lucide-react";
import type { CascadeStep } from "@/lib/types";

const stepIcons: Record<string, string> = {
  trigger: "⚡",
  direct: "📌",
  secondary: "🔄",
  tertiary: "🌊",
  bank_impact: "🏦",
};

const delayColors: Record<string, string> = {
  immediate: "#3B82F6",
  hours: "#8B5CF6",
  days: "#F59E0B",
  weeks: "#F97316",
  months: "#EF4444",
  ongoing: "#DC2626",
};

const stepTypeColors: Record<string, string> = {
  trigger: "border-blue-500/40 bg-blue-500/10",
  direct: "border-yellow-500/40 bg-yellow-500/10",
  secondary: "bg-db-warning/10 border-db-warning/30",
  tertiary: "border-orange-500/40 bg-orange-500/10",
  bank_impact: "border-red-500/40 bg-red-500/10",
};

interface Props {
  steps: CascadeStep[];
  isAnimating: boolean;
}

export default function CascadeVisualization({ steps, isAnimating }: Props) {
  return (
    <div className="glass-card p-5 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-db-text-primary flex items-center gap-2">
          <Zap size={14} className="text-db-warning" />
          Cascade Impact Visualization
        </h3>
        {isAnimating && (
          <span className="text-[10px] text-db-accent animate-pulse">Simulating...</span>
        )}
      </div>

      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-[18px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-db-accent/60 via-db-warning/40 to-db-danger/60 rounded-full" />

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {steps.map((step, i) => (
              <motion.div
                key={`${step.step}-${step.event}`}
                initial={isAnimating ? { opacity: 0, x: -20, scale: 0.95 } : false}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: isAnimating ? i * 0.25 : 0, duration: 0.4, ease: "easeOut" }}
                className={`relative flex items-start gap-3 p-3 rounded-lg border ${stepTypeColors[step.type] || "border-db-border bg-db-surface"} transition-all duration-300 hover:border-opacity-80`}
              >
                {/* Step number dot */}
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-db-surface border border-db-border flex items-center justify-center text-sm z-10 shadow-lg shadow-black/20">
                  <span className="text-sm">{stepIcons[step.type] || "➡️"}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-db-text-primary capitalize">
                      Step {step.step}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-db-text-muted px-1.5 py-0.5 rounded bg-db-surface border border-db-border">
                      {step.type.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-db-text-secondary">{step.event}</p>
                </div>

                {/* Delay badge */}
                <div className="flex-shrink-0 flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border"
                  style={{
                    borderColor: delayColors[step.delay] || "#6B7280",
                    color: delayColors[step.delay] || "#6B7280",
                    backgroundColor: `${delayColors[step.delay] || "#6B7280"}15`,
                  }}
                >
                  <Clock size={10} />
                  {step.delay}
                </div>

                {/* Arrow connecting to next step */}
                {i < steps.length - 1 && (
                  <div className="absolute -bottom-2 left-[22px] text-[8px] text-db-text-muted opacity-40">
                    ↓
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
