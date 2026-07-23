"use client";

import { motion } from "framer-motion";
import { Database, Brain, TrendingUp, MessageSquareText, ArrowRight, Sparkles } from "lucide-react";

const agentChain = [
  {
    icon: Database,
    label: "Data Agent",
    description: "Collects real-time economic data",
    color: "#3B82F6",
    delay: 0,
  },
  {
    icon: Brain,
    label: "Analysis Agent",
    description: "Detects patterns and signals",
    color: "#8B5CF6",
    delay: 0.12,
  },
  {
    icon: TrendingUp,
    label: "Forecast Agent",
    description: "Generates probabilistic forecasts",
    color: "#06B6D4",
    delay: 0.24,
  },
  {
    icon: MessageSquareText,
    label: "Explainer Agent",
    description: "Explains drivers and potential outcomes",
    color: "#2FAE60",
    delay: 0.36,
  },
];

export function AIReasoningPipeline() {
  return (
    <div className="card overflow-hidden">
      {/* Header label with AI badge */}
      <div className="flex items-center gap-2 px-5 pt-4 pb-2">
        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm shadow-blue-500/20">
          <Sparkles size={10} className="text-white" />
        </div>
        <h3 className="text-[11px] font-bold text-text-primary">AI Agent Chain</h3>
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[7px] font-bold text-primary bg-primary/5 border border-primary/10 uppercase tracking-wider">
          <Sparkles size={6} className="text-primary" />
          AI
        </span>
      </div>

      {/* Agent nodes row */}
      <div className="px-5 pb-5 pt-1">
        {/* Desktop: horizontal */}
        <div className="hidden md:flex items-center justify-center gap-0">
          {agentChain.map((agent, i) => {
            const Icon = agent.icon;
            return (
              <div key={agent.label} className="flex items-center gap-0 flex-1 max-w-[220px]">
                {/* Node */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: agent.delay, duration: 0.4 }}
                  className="flex flex-col items-center group"
                >
                  {/* Glowing icon circle */}
                  <div className="relative">
                    <div
                      className="absolute -inset-2 rounded-full opacity-15 blur-md transition-opacity group-hover:opacity-30"
                      style={{ backgroundColor: agent.color }}
                    />
                    <div
                      className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: `${agent.color}12`,
                        border: `1.5px solid ${agent.color}30`,
                        boxShadow: `0 0 12px ${agent.color}15`,
                      }}
                    >
                      <Icon size={16} style={{ color: agent.color }} />
                      {/* Pulse dot */}
                      <span
                        className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ backgroundColor: agent.color }}
                      />
                    </div>
                  </div>
                  {/* Label */}
                  <span className="text-[10px] font-semibold text-text-primary mt-2 text-center">{agent.label}</span>
                  {/* Description */}
                  <span className="text-[7px] text-text-secondary text-center mt-0.5 max-w-[110px] leading-tight">
                    {agent.description}
                  </span>
                </motion.div>

                {/* Arrow connector */}
                {i < agentChain.length - 1 && (
                  <div className="flex-1 flex items-center justify-center px-1 min-w-[40px]">
                    <div className="relative w-full flex items-center justify-center">
                      {/* Gradient line */}
                      <div
                        className="absolute w-full h-px"
                        style={{
                          background: `linear-gradient(90deg, ${agent.color}, ${agentChain[i + 1].color})`,
                          opacity: 0.35,
                        }}
                      />
                      {/* Animated dot */}
                      <motion.div
                        animate={{ x: ["-50%", "50%", "-50%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: agent.delay }}
                        className="relative z-10"
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: agentChain[i + 1].color, boxShadow: `0 0 4px ${agentChain[i + 1].color}` }}
                        />
                      </motion.div>
                      <ArrowRight
                        size={10}
                        className="absolute right-0"
                        style={{ color: agentChain[i + 1].color, opacity: 0.4 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile: vertical */}
        <div className="md:hidden space-y-2.5">
          {agentChain.map((agent, i) => {
            const Icon = agent.icon;
            return (
              <motion.div
                key={agent.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: agent.delay }}
                className="flex items-center gap-3"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative"
                  style={{ backgroundColor: `${agent.color}12`, border: `1.5px solid ${agent.color}30` }}
                >
                  <Icon size={14} style={{ color: agent.color }} />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: agent.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-text-primary">{agent.label}</p>
                  <p className="text-[8px] text-text-secondary">{agent.description}</p>
                </div>
                {i < agentChain.length - 1 && (
                  <ArrowRight size={10} className="text-text-secondary flex-shrink-0" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
