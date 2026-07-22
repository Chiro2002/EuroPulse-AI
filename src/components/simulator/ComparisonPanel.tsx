"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ComparisonRow } from "@/lib/types";

interface Props {
  changes: ComparisonRow[];
  isAnimating: boolean;
}

function formatValue(value: number, unit: string): string {
  if (unit === "%") return value.toFixed(1);
  if (unit === "bp") return value.toFixed(0);
  if (unit === "pp") return value.toFixed(1);
  return value.toFixed(2);
}

function formatChange(change: number, unit: string): string {
  const prefix = change > 0 ? "+" : "";
  if (unit === "%") return `${prefix}${change.toFixed(1)}%`;
  if (unit === "bp") return `${prefix}${change.toFixed(0)}bp`;
  if (unit === "pp") return `${prefix}${change.toFixed(1)}pp`;
  return `${prefix}${change.toFixed(2)}`;
}

export default function ComparisonPanel({ changes, isAnimating }: Props) {
  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-bold text-db-text-primary mb-3 flex items-center gap-2">
        <TrendingUp size={14} className="text-db-accent" />
        Before vs After Comparison
      </h3>

      <div className="overflow-hidden rounded-lg border border-db-border">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-db-surface/50 border-b border-db-border">
              <th className="text-left py-2 px-3 text-db-text-muted font-medium">Metric</th>
              <th className="text-right py-2 px-3 text-db-text-muted font-medium">Current</th>
              <th className="text-right py-2 px-3 text-db-text-muted font-medium">Simulated</th>
              <th className="text-right py-2 px-3 text-db-text-muted font-medium">Change</th>
            </tr>
          </thead>
          <tbody>
            {changes.map((row, i) => (
              <motion.tr
                key={row.metric}
                initial={isAnimating ? { opacity: 0, x: 10 } : false}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: isAnimating ? i * 0.08 : 0 }}
                className="border-b border-db-border/50 last:border-0 hover:bg-db-surface/30 transition-colors"
              >
                <td className="py-2 px-3 text-db-text-primary font-medium whitespace-nowrap">
                  {row.metric}
                </td>
                <td className="py-2 px-3 text-right text-db-text-secondary tabular-nums">
                  {formatValue(row.current, row.unit)}
                  <span className="text-[9px] text-db-text-muted ml-0.5">{row.unit === "pp" ? "" : row.unit === "%" ? "" : row.unit}</span>
                </td>
                <td className="py-2 px-3 text-right font-medium tabular-nums"
                  style={{ color: row.direction === "neutral" ? "#94A3B8" : row.direction === "up" ? (row.metric.includes("ECB") || row.metric.includes("Oil") ? "#F59E0B" : "#EF4444") : "#10B981" }}
                >
                  {formatValue(row.simulated, row.unit)}
                </td>
                <td className="py-2 px-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {row.direction === "up" ? (
                      <TrendingUp size={11} className={row.metric.includes("GDP") || row.metric.includes("EUR") ? "text-db-success" : "text-db-danger"} />
                    ) : row.direction === "down" ? (
                      <TrendingDown size={11} className={row.metric.includes("GDP") || row.metric.includes("EUR") ? "text-db-danger" : "text-db-success"} />
                    ) : (
                      <Minus size={11} className="text-db-text-muted" />
                    )}
                    <span className={`tabular-nums font-bold ${
                      row.direction === "neutral" ? "text-db-text-muted" :
                      row.direction === "up" ? "text-db-danger" : "text-db-success"
                    }`}>
                      {formatChange(row.change, row.unit)}
                    </span>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
