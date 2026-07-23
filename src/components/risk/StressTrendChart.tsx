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

const eventHighlights = [
  { date: "2025-10-15", event: "ECB rate hike pause" },
  { date: "2025-12-15", event: "Italian budget concerns" },
  { date: "2026-01-11", event: "Russian gas halt" },
];

export function StressTrendChart({ historicalTrends, countries }: StressTrendChartProps) {
  const top5 = countries.sort((a, b) => b.totalRisk - a.totalRisk).slice(0, 5);

  const allDates = [...new Set(
    Object.values(historicalTrends).flatMap((t) => t.map((d) => d.date))
  )].sort();

  const chartData = allDates.map((date) => {
    const point: any = { date: new Date(date).toLocaleString("en", { month: "short" }) };
    top5.forEach((c) => {
      const trend = historicalTrends[c.code]?.find((t) => t.date === date);
      point[c.code] = trend?.riskScore ?? null;
    });
    return point;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      const matchingEvent = eventHighlights.find(e => {
        const eventMonth = new Date(e.date).toLocaleString("en", { month: "short" });
        return eventMonth === label;
      });
      return (
        <div className="card p-3 shadow-xl border border-border">
          <p className="text-xs font-semibold text-text-primary mb-2">{label}</p>
          {payload.map((p: any) => (
            <div key={p.name} className="flex items-center gap-2 text-[10px] mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-text-secondary">{countries.find(c => c.code === p.name)?.name || p.name}:</span>
              <span className="font-bold text-text-primary">{p.value}</span>
            </div>
          ))}
          {matchingEvent && (
            <p className="text-[9px] text-[#F5A623] mt-1 pt-1 border-t border-border">📌 {matchingEvent.event}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card p-4">
      <h3 className="text-sm font-bold text-text-primary mb-3">Risk Score Trend — Top 5 Countries</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="date" tick={{ fill: "#6B7280", fontSize: 10 }} />
          <YAxis domain={[20, 90]} tick={{ fill: "#6B7280", fontSize: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "10px", color: "#6B7280" }}
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
      <div className="flex items-center gap-3 mt-3 pt-2 border-t border-border">
        <span className="text-[9px] text-text-secondary font-medium">Key Events:</span>
        {eventHighlights.map((ev, i) => (
          <div key={i} className="flex items-center gap-1 text-[9px] text-text-secondary">
            <span className="w-1 h-1 rounded-full bg-[#F5A623]" />
            <span>{ev.event}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
