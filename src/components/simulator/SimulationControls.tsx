"use client";

import { motion } from "framer-motion";
import { Sliders, Clock, Plus } from "lucide-react";

interface Props {
  intensity: number;
  timeHorizon: "immediate" | "3M" | "6M" | "12M";
  showAddSecond: boolean;
  onIntensityChange: (v: number) => void;
  onTimeHorizonChange: (v: "immediate" | "3M" | "6M" | "12M") => void;
  onAddSecondScenario: () => void;
}

const timeOptions: { label: string; value: "immediate" | "3M" | "6M" | "12M" }[] = [
  { label: "Immediate", value: "immediate" },
  { label: "3 Months", value: "3M" },
  { label: "6 Months", value: "6M" },
  { label: "1 Year", value: "12M" },
];

export default function SimulationControls({
  intensity,
  timeHorizon,
  showAddSecond,
  onIntensityChange,
  onTimeHorizonChange,
  onAddSecondScenario,
}: Props) {
  return (
    <div className="glass-card p-4">
      <h3 className="text-xs font-bold text-db-text-primary mb-3 flex items-center gap-2">
        <Sliders size={12} className="text-db-accent" />
        Simulation Controls
      </h3>

      {/* Intensity Slider */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[10px] text-db-text-muted font-medium uppercase tracking-wider">
            Intensity
          </label>
          <motion.span
            key={intensity}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-xs font-bold text-db-accent tabular-nums"
          >
            {intensity.toFixed(1)}x
          </motion.span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={intensity}
            onChange={(e) => onIntensityChange(parseFloat(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3B82F6 ${((intensity - 0.5) / 1.5) * 100}%, #1E293B ${((intensity - 0.5) / 1.5) * 100}%)`,
            }}
          />
          <div className="flex justify-between text-[8px] text-db-text-muted mt-0.5">
            <span>0.5x</span>
            <span>1.0x</span>
            <span>1.5x</span>
            <span>2.0x</span>
          </div>
        </div>
      </div>

      {/* Time Horizon */}
      <div className="mb-4">
        <label className="text-[10px] text-db-text-muted font-medium uppercase tracking-wider block mb-1.5">
          <Clock size={10} className="inline mr-1" />
          Time Horizon
        </label>
        <div className="grid grid-cols-4 gap-1">
          {timeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onTimeHorizonChange(opt.value)}
              className={`text-[10px] px-1.5 py-1.5 rounded-lg border transition-all font-medium ${
                timeHorizon === opt.value
                  ? "border-db-accent bg-db-accent/15 text-db-accent"
                  : "border-db-border text-db-text-muted hover:border-db-accent/30"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add Second Scenario */}
      <button
        onClick={onAddSecondScenario}
        disabled={showAddSecond}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-db-border text-[10px] text-db-text-muted hover:border-db-accent/30 hover:text-db-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus size={12} />
        {showAddSecond ? "Compound mode active" : "Add second scenario"}
      </button>
    </div>
  );
}
