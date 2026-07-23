"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Droplets, Flame, Landmark, Home, ShieldAlert } from "lucide-react";

interface FlowNode {
  step: number;
  icon: any;
  title: string;
  severity: "high" | "medium" | "low";
  description: string;
  projectedChange: string;
  color: string;
}

const flowNodes: FlowNode[] = [
  {
    step: 1, icon: Droplets, title: "Oil Price",
    severity: "high", color: "#E5484D",
    projectedChange: "Brent crude rises ~20%",
    description: "Supply disruption drives prices up sharply",
  },
  {
    step: 2, icon: Flame, title: "Inflation",
    severity: "high", color: "#F97316",
    projectedChange: "Headline CPI rises +0.9 pp",
    description: "Energy costs pass through to consumer prices",
  },
  {
    step: 3, icon: Landmark, title: "ECB Rate",
    severity: "medium", color: "#F5A623",
    projectedChange: "Policy rate increases +50 bps",
    description: "Central bank responds to inflation pressure",
  },
  {
    step: 4, icon: Home, title: "Mortgage Rates",
    severity: "medium", color: "#F5A623",
    projectedChange: "Avg. mortgage rate rises +60 bps",
    description: "Higher policy rate transmits to lending rates",
  },
  {
    step: 5, icon: ShieldAlert, title: "DB Lending Risk",
    severity: "high", color: "#E5484D",
    projectedChange: "Higher PD and LGD outlook",
    description: "Credit quality deterioration in loan book",
  },
];

interface ShockTransmissionFlowProps {
  delay?: number;
}

export function ShockTransmissionFlow({ delay = 0 }: ShockTransmissionFlowProps) {
  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 pt-4 pb-2">
        <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">2</span>
        <h2 className="text-sm font-bold text-text-primary">Shock Transmission Flow</h2>
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[7px] font-bold text-primary bg-primary/5 border border-primary/10 uppercase tracking-wider">
          <Sparkles size={6} className="text-primary" />
          AI
        </span>
      </div>

      {/* Flow nodes - desktop horizontal */}
      <div className="px-5 pb-4 pt-2">
        <div className="hidden lg:flex items-center justify-center gap-0">
          {flowNodes.map((node, i) => {
            const Icon = node.icon;
            return (
              <div key={node.step} className="flex items-center gap-0 flex-1 max-w-[200px]">
                {/* Node box */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: delay + i * 0.1, duration: 0.4 }}
                  className="flex-1 bg-white rounded-xl border shadow-sm overflow-hidden group hover:shadow-md transition-all"
                  style={{ borderColor: `${node.color}25` }}
                >
                  {/* Top accent */}
                  <div className="h-1 w-full" style={{ backgroundColor: node.color }} />

                  <div className="p-3">
                    {/* Number badge */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <span
                        className="w-4 h-4 rounded text-[8px] font-bold flex items-center justify-center text-white"
                        style={{ backgroundColor: node.color }}
                      >
                        {node.step}
                      </span>
                      <span className="text-[10px] font-bold text-text-primary flex items-center gap-1">
                        {node.title}
                        <span className="text-[#E5484D]">
                          <ArrowRight size={10} className="inline" />
                        </span>
                      </span>
                    </div>

                    {/* Icon row */}
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${node.color}12` }}
                      >
                        <Icon size={13} style={{ color: node.color }} />
                      </div>
                      <span
                        className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${node.color}15`,
                          color: node.color,
                        }}
                      >
                        {node.severity === "high" ? "High" : node.severity === "medium" ? "Medium" : "Low"} Impact
                      </span>
                    </div>

                    {/* Projected change */}
                    <p className="text-[10px] font-bold text-text-primary tabular-nums">
                      {node.projectedChange}
                    </p>
                    <p className="text-[7px] text-text-secondary mt-0.5 leading-tight">
                      {node.description}
                    </p>
                  </div>
                </motion.div>

                {/* Arrow connector */}
                {i < flowNodes.length - 1 && (
                  <div className="flex-shrink-0 flex items-center justify-center w-8">
                    <div className="relative flex items-center justify-center">
                      {/* Line */}
                      <div
                        className="absolute w-6 h-px"
                        style={{ background: `linear-gradient(90deg, ${node.color}, ${flowNodes[i + 1].color})`, opacity: 0.3 }}
                      />
                      {/* Animated dot */}
                      <motion.div
                        animate={{ x: [-4, 4, -4] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: i * 0.2 }}
                        className="relative z-10"
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: flowNodes[i + 1].color, boxShadow: `0 0 4px ${flowNodes[i + 1].color}` }}
                        />
                      </motion.div>
                      {/* AI badge on arrow */}
                      <div
                        className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-1 py-0.5 rounded"
                        style={{ backgroundColor: `${flowNodes[i + 1].color}10` }}
                      >
                        <Sparkles size={6} style={{ color: flowNodes[i + 1].color }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile: vertical */}
        <div className="lg:hidden space-y-2">
          {flowNodes.map((node, i) => {
            const Icon = node.icon;
            return (
              <motion.div
                key={node.step}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + i * 0.08 }}
                className="flex items-start gap-3"
              >
                <div className="flex flex-col items-center">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: `${node.color}15`, border: `1.5px solid ${node.color}30` }}
                  >
                    <Icon size={14} style={{ color: node.color }} />
                  </div>
                  {i < flowNodes.length - 1 && (
                    <div className="w-px h-6 my-0.5 bg-gray-200" />
                  )}
                </div>
                <div className="flex-1 pb-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold" style={{ color: node.color }}>{node.step}.</span>
                    <span className="text-[11px] font-semibold text-text-primary">{node.title}</span>
                    <ArrowRight size={10} className="text-[#E5484D]" />
                    <span className="text-[8px] font-semibold px-1 py-0.5 rounded-full" style={{ backgroundColor: `${node.color}12`, color: node.color }}>
                      {node.severity}
                    </span>
                  </div>
                  <p className="text-[9px] font-bold text-text-primary mt-0.5 tabular-nums">{node.projectedChange}</p>
                  <p className="text-[8px] text-text-secondary mt-0.5">{node.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* AI attribution */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-100">
          <Sparkles size={10} className="text-primary/50" />
          <p className="text-[8px] text-text-secondary">
            AI Agent simulated this transmission based on historical data and current market conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
