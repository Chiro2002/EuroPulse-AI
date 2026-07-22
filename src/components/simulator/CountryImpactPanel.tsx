"use client";

import { motion } from "framer-motion";
import { Globe, TrendingUp, TrendingDown } from "lucide-react";
import type { CountryImpactResult } from "@/lib/types";
import { euCountries } from "@/lib/data/countries";

interface Props {
  countryImpacts: Record<string, CountryImpactResult>;
  isAnimating: boolean;
}

function getChangeColor(change: number): string {
  if (change > 10) return "#EF4444";
  if (change > 5) return "#F59E0B";
  if (change > 2) return "#F97316";
  if (change < -5) return "#10B981";
  if (change < -2) return "#22C55E";
  return "#94A3B8";
}

function getChangeBg(change: number): string {
  if (change > 10) return "rgba(239,68,68,0.15)";
  if (change > 5) return "rgba(245,158,11,0.15)";
  if (change > 2) return "rgba(249,115,22,0.15)";
  if (change < -5) return "rgba(16,185,129,0.15)";
  if (change < -2) return "rgba(34,197,94,0.15)";
  return "rgba(148,163,184,0.1)";
}

export default function CountryImpactPanel({ countryImpacts, isAnimating }: Props) {
  const entries = Object.entries(countryImpacts).sort(([, a], [, b]) => Math.abs(b.change) - Math.abs(a.change));

  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-bold text-db-text-primary mb-3 flex items-center gap-2">
        <Globe size={14} className="text-db-accent" />
        Country Impact Assessment
      </h3>

      <div className="overflow-hidden rounded-lg border border-db-border">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-db-surface/50 border-b border-db-border">
              <th className="text-left py-2 px-3 text-db-text-muted font-medium">Country</th>
              <th className="text-right py-2 px-3 text-db-text-muted font-medium">Risk Before</th>
              <th className="text-right py-2 px-3 text-db-text-muted font-medium">Risk After</th>
              <th className="text-right py-2 px-3 text-db-text-muted font-medium">Change</th>
              <th className="text-left py-2 px-3 text-db-text-muted font-medium hidden md:table-cell">Key Impact</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([code, impact], i) => {
              const country = euCountries.find((c) => c.code === code);
              const changeColor = getChangeColor(impact.change);
              const changeBg = getChangeBg(impact.change);

              return (
                <motion.tr
                  key={code}
                  initial={isAnimating ? { opacity: 0, x: -10 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: isAnimating ? i * 0.05 : 0 }}
                  className="border-b border-db-border/30 last:border-0 hover:bg-db-surface/30 transition-colors"
                >
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{country?.flag || "🇪🇺"}</span>
                      <span className="font-medium text-db-text-primary">{code}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums text-db-text-secondary">
                    {impact.riskBefore}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <motion.span
                      key={impact.riskAfter}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      className="font-bold tabular-nums"
                      style={{ color: changeColor }}
                    >
                      {impact.riskAfter}
                    </motion.span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ color: changeColor, backgroundColor: changeBg }}
                    >
                      {impact.change > 0 ? <TrendingUp size={10} /> : impact.change < 0 ? <TrendingDown size={10} /> : null}
                      {impact.change > 0 ? "+" : ""}{impact.change}
                    </motion.div>
                  </td>
                  <td className="py-2 px-3 text-db-text-muted text-[10px] hidden md:table-cell max-w-[200px] truncate">
                    {impact.keyImpact}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
