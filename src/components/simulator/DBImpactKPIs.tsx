"use client";

import { motion } from "framer-motion";
import { BarChart3, Euro, AlertTriangle, Sparkles, TrendingUp } from "lucide-react";

interface KPIItem {
  icon: any;
  iconBg: string;
  iconColor: string;
  title: string;
  value: string;
  valueColor: string;
  description: string;
  impactLevel: "high" | "medium";
  impactColor: string;
  impactLabel: string;
}

const kpiData: KPIItem[] = [
  {
    icon: BarChart3, iconBg: "bg-red-50", iconColor: "#E5484D",
    title: "Impact on DB Credit Risk",
    value: "+18 bps", valueColor: "#E5484D",
    description: "Probability of Default increases across corporate loan portfolio driven by energy sector exposure and GDP slowdown",
    impactLevel: "high", impactColor: "#E5484D", impactLabel: "High Impact",
  },
  {
    icon: Euro, iconBg: "bg-amber-50", iconColor: "#F5A623",
    title: "Impact on Net Interest Income",
    value: "-1.2%", valueColor: "#E5484D",
    description: "NIM compression from rising funding costs, rate path uncertainty, and deposit repricing lag",
    impactLevel: "medium", impactColor: "#F5A623", impactLabel: "Medium Impact",
  },
  {
    icon: AlertTriangle, iconBg: "bg-orange-50", iconColor: "#F97316",
    title: "Exposure at Risk",
    value: "€8.6B", valueColor: "#F97316",
    description: "Total vulnerable portfolio exposure across corporate loans (€4.2B), sovereign bonds (€2.8B), and derivatives (€1.6B)",
    impactLevel: "high", impactColor: "#E5484D", impactLabel: "High Impact",
  },
];

interface DBImpactKPIsProps {
  delay?: number;
}

export function DBImpactKPIs({ delay = 0 }: DBImpactKPIsProps) {
  return (
    <div className="space-y-3">
      {/* Step label */}
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">3</span>
        <h2 className="text-sm font-bold text-text-primary">Simulated Impact on DB</h2>
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[7px] font-bold text-primary bg-primary/5 border border-primary/10 uppercase tracking-wider">
          <Sparkles size={6} className="text-primary" />
          AI
        </span>
      </div>

      {/* KPI stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {kpiData.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: delay + i * 0.1, duration: 0.4 }}
              className="card p-4 overflow-hidden relative hover:shadow-md transition-shadow"
            >
              {/* Mini accent bar */}
              <div className="h-0.5 w-full rounded-full mb-3" style={{ backgroundColor: kpi.iconColor, opacity: 0.3 }} />

              {/* Icon + Title row */}
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: kpi.iconBg }}
                >
                  <Icon size={14} style={{ color: kpi.iconColor }} />
                </div>
                <h3 className="text-[10px] font-semibold text-text-primary leading-tight flex-1">
                  {kpi.title}
                </h3>
              </div>

              {/* Large bold stat value */}
              <div className="flex items-baseline gap-1 mb-2">
                <span
                  className="text-2xl font-extrabold tabular-nums tracking-tight"
                  style={{ color: kpi.valueColor }}
                >
                  {kpi.value}
                </span>
                <TrendingUp size={14} className="flex-shrink-0" style={{ color: kpi.valueColor }} />
              </div>

              {/* Description */}
              <p className="text-[9px] text-text-secondary leading-relaxed mb-3">
                {kpi.description}
              </p>

              {/* Impact-level pill */}
              <div
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-semibold"
                style={{
                  backgroundColor: `${kpi.impactColor}12`,
                  color: kpi.impactColor,
                }}
              >
                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: kpi.impactColor }} />
                {kpi.impactLabel}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[8px] text-text-secondary pt-1">
        <span>Source: EuroPulse AI Models</span>
        <span>Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
      </div>
    </div>
  );
}
