"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { HistoricalTrend, CountryDetail } from "@/lib/types";

interface StressTrendChartProps {
  historicalTrends: Record<string, HistoricalTrend[]>;
  countries: CountryDetail[];
}

const countryColors: Record<string, string> = {
  DE: "#3B82F6", FR: "#10B981", IT: "#EF4444", ES: "#F59E0B",
  NL: "#8B5CF6", BE: "#EC4899", PL: "#F97316", AT: "#06B6D4",
  PT: "#14B8A6", IE: "#6366F1",
};

const monthLabels: Record<string, string> = {
  "2025-08-01": "Aug", "2025-09-01": "Sep", "2025-10-01": "Oct",
  "2025-11-01": "Nov", "2025-12-01": "Dec", "2026-01-01": "Jan",
};

const eventHighlights = [
  { date: "2025-10-15", event: "ECB rate hike pause" },
  { date: "2025-12-15", event: "Italian budget concerns" },
  { date: "2026-01-11", event: "Russian gas halt" },
];

export function StressTrendChart({ historicalTrends, countries }: StressTrendChartProps) {
  const [dimension, setDimension] = useState<"total" | "breakdown">("total");
  const top5 = countries.sort((a, b) => b.totalRisk - a.totalRisk).slice(0, 5);

  // Build chart data by merging all country trends
  const allDates = [...new Set(
    Object.values(historicalTrends).flatMap((t) => t.map((d) => d.date))
  )].sort();

  const chartData = allDates.map((date) => {
    const point: any = { date: monthLabels[date] || date };
    top5.forEach((c) => {
      const trend = historicalTrends[c.code]?.find((t) => t.date === date);
      point[c.code] = trend?.riskScore ?? null;
    });
    return point;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      // Find matching event for this date
      const matchingEvent = eventHighlights.find(e => {
        const eventMonth = new Date(e.date).toLocaleString("en", { month: "short" });
        return eventMonth === label;
      });

      return (
        <div className="glass-card p-3 shadow-xl">
          <p className="text-xs font-semibold text-db-text-primary mb-2">{label}</p>
          {payload.map((p: any) => (
            <div key={p.name} className="flex items-center gap-2 text-[10px] mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-db-text-muted">{countries.find(c => c.code === p.name)?.name || p.name}:</span>
              <span className="font-bold text-db-text-primary">{p.value}</span>
            </div>
          ))}
          {matchingEvent && (
            <p className="text-[9px] text-db-warning mt-1 pt-1 border-t border-db-border">
              📌 {matchingEvent.event}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-db-text-primary">Risk Score Trend — Top 5 Countries</h3>
        <div className="flex gap-1">
          {["total", "breakdown"].map((d) => (
            <button
              key={d}
              onClick={() => setDimension(d as any)}
              className={`px-2 py-0.5 rounded text-[9px] font-medium transition-all ${
                dimension === d ? "bg-db-accent text-white" : "bg-db-surface text-db-text-muted"
              }`}
            >
              {d === "total" ? "Total Risk" : "By Dimension"}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E2756" />
          <XAxis dataKey="date" tick={{ fill: "#94A3B8", fontSize: 10 }} />
          <YAxis domain={[20, 90]} tick={{ fill: "#94A3B8", fontSize: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "10px", color: "#94A3B8" }}
            formatter={(value: string) => countries.find(c => c.code === value)?.name || value}
          />
          {top5.map((c) => (
            <Line
              key={c.code}
              type="monotone"
              dataKey={c.code}
              stroke={countryColors[c.code] || "#3B82F6"}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: countryColors[c.code] || "#3B82F6" }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Event highlights */}
      <div className="flex items-center gap-3 mt-3 pt-2 border-t border-db-border">
        <span className="text-[9px] text-db-text-muted font-medium">Key Events:</span>
        {eventHighlights.map((ev, i) => (
          <div key={i} className="flex items-center gap-1 text-[9px] text-db-text-muted">
            <span className="w-1 h-1 rounded-full bg-db-warning" />
            <span>{ev.event}</span>
            <span className="text-db-text-muted/50">{ev.date.split("-").slice(1).join("/")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
