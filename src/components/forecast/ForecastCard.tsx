"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, ChevronDown } from "lucide-react";
import { formatForecastValue, getConfidenceConfig } from "@/lib/logic/forecastEngine";
import type { Forecast } from "@/lib/types";

interface ForecastCardProps {
  forecast: Forecast;
  countryName: string;
}

export function ForecastCard({ forecast, countryName }: ForecastCardProps) {
  const [expanded, setExpanded] = useState(false);
  const confidenceConfig = getConfidenceConfig(forecast.confidence);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-hover p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-db-text-primary">{countryName}</span>
          <span className="text-xs text-db-text-muted">•</span>
          <span className="text-xs font-medium text-db-accent">{forecast.metric}</span>
        </div>
        {forecast.direction === "up" && <TrendingUp size={16} className="text-db-success" />}
        {forecast.direction === "down" && <TrendingDown size={16} className="text-db-danger" />}
        {forecast.direction === "stable" && <Minus size={16} className="text-db-text-muted" />}
      </div>

      <div className="flex items-center gap-4 mb-2">
        <div>
          <p className="text-[10px] text-db-text-muted">Current</p>
          <p className="text-lg font-bold text-db-text-primary">{formatForecastValue(forecast.currentValue, forecast.metric)}</p>
        </div>
        <div className="text-db-text-muted">→</div>
        <div>
          <p className="text-[10px] text-db-text-muted">Predicted</p>
          <p className="text-lg font-bold" style={{ color: confidenceConfig.color }}>{formatForecastValue(forecast.predictedValue, forecast.metric)}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-[10px] text-db-text-muted">Confidence</p>
          <p className="text-xs font-bold" style={{ color: confidenceConfig.color }}>{forecast.confidence}%</p>
        </div>
      </div>

      <div className="h-1 bg-db-border rounded-full overflow-hidden mb-2">
        <div className={`h-full rounded-full ${confidenceConfig.barColor}`} style={{ width: `${forecast.confidence}%` }} />
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        {forecast.drivers.map((driver, i) => (
          <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full bg-db-surface text-db-text-muted">{driver}</span>
        ))}
      </div>

      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-[10px] text-db-text-muted hover:text-db-accent transition-colors">
        {expanded ? "Hide analysis" : "Show analysis"}
        <ChevronDown size={10} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      {expanded && (
        <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="text-[11px] text-db-text-secondary mt-2 leading-relaxed">
          {forecast.explanation}
        </motion.p>
      )}
    </motion.div>
  );
}
