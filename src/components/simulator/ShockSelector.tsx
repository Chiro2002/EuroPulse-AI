"use client";

import { motion } from "framer-motion";
import { Droplets, AlertTriangle, Percent, TrendingDown, Euro } from "lucide-react";

export type ShockType = "oil_spike" | "war_escalation" | "ecb_rate" | "eu_recession" | "currency_weakening";

interface ShockConfig {
  id: ShockType;
  icon: any;
  label: string;
  iconBg: string;
  iconColor: string;
}

const shockOptions: ShockConfig[] = [
  { id: "oil_spike", icon: Droplets, label: "Oil Price Spike", iconBg: "bg-red-50", iconColor: "#E5484D" },
  { id: "war_escalation", icon: AlertTriangle, label: "War Escalation", iconBg: "bg-orange-50", iconColor: "#F97316" },
  { id: "ecb_rate", icon: Percent, label: "ECB Rate Hike / Cut", iconBg: "bg-blue-50", iconColor: "#3B82F6" },
  { id: "eu_recession", icon: TrendingDown, label: "EU Recession", iconBg: "bg-amber-50", iconColor: "#F5A623" },
  { id: "currency_weakening", icon: Euro, label: "Currency Weakening", iconBg: "bg-purple-50", iconColor: "#8B5CF6" },
];

interface ShockSelectorProps {
  selected: ShockType;
  onSelect: (shock: ShockType) => void;
  intensity: number; // -20 to +40
  onIntensityChange: (value: number) => void;
  intensityLabel: string; // e.g. "Oil +20%"
  intensityCaption: string; // e.g. "Oil prices increase by 20% vs. baseline"
}

export function ShockSelector({
  selected, onSelect, intensity, onIntensityChange,
  intensityLabel, intensityCaption,
}: ShockSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Step label */}
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">1</span>
        <h2 className="text-sm font-bold text-text-primary">Choose a Shock</h2>
      </div>

      {/* Shock pills */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
        {shockOptions.map((shock) => {
          const Icon = shock.icon;
          const isSelected = selected === shock.id;
          return (
            <motion.button
              key={shock.id}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(shock.id)}
              className={`relative p-3 rounded-xl text-left transition-all duration-200 ${
                isSelected
                  ? "bg-white shadow-md border-2"
                  : "bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm"
              }`}
              style={isSelected ? { borderColor: shock.iconColor, backgroundColor: `${shock.iconColor}08` } : {}}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${shock.iconBg} transition-all ${
                    isSelected ? "scale-110" : ""
                  }`}
                >
                  <Icon size={16} style={{ color: shock.iconColor }} />
                </div>
                <span className={`text-[11px] font-semibold transition-colors ${
                  isSelected ? "text-text-primary" : "text-text-secondary"
                }`}>
                  {shock.label}
                </span>
              </div>
              {isSelected && (
                <motion.div
                  layoutId="shock-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                  style={{ backgroundColor: shock.iconColor }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Intensity slider */}
      <div className="card p-4 bg-white/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
              Adjust Shock Intensity
            </span>
          </div>
          <motion.div
            key={intensity}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20"
          >
            <span className="text-[11px] font-bold text-primary">{intensityLabel}</span>
          </motion.div>
        </div>

        {/* Slider */}
        <div className="relative pt-4 pb-1">
          {/* Tick marks */}
          <div className="flex justify-between mb-2 px-0">
            {[-20, -10, 0, 10, 20, 30, 40].map((tick) => (
              <div key={tick} className="flex flex-col items-center">
                <div className="w-px h-2 bg-gray-300" />
                <span className="text-[7px] text-text-secondary mt-1">{tick > 0 ? `+${tick}%` : `${tick}%`}</span>
              </div>
            ))}
          </div>

          <input
            type="range"
            min={-20}
            max={40}
            step={1}
            value={intensity}
            onChange={(e) => onIntensityChange(parseInt(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-gray-200
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md
              [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
              [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110"
            style={{
              background: `linear-gradient(to right, #3B82F6 ${((intensity + 20) / 60) * 100}%, #E5E7EB ${((intensity + 20) / 60) * 100}%)`,
            }}
          />

          {/* Range labels */}
          <div className="flex justify-between text-[8px] text-text-secondary mt-1">
            <span>Mild</span>
            <span>Moderate</span>
            <span>Severe</span>
          </div>
        </div>

        {/* Caption */}
        <p className="text-[10px] text-text-secondary mt-2 leading-relaxed">
          Current selection: <strong className="text-primary">{intensityCaption}</strong>
        </p>
      </div>
    </div>
  );
}
