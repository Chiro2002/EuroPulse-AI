"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { getRiskLevel } from "@/lib/logic/riskCalculator";
import { dbExposureByCountry } from "@/lib/data/dbPortfolio";
import type { SectorStressData, CountryDetail } from "@/lib/types";

interface SectorHeatmapProps {
  sectorStress: SectorStressData;
  countries: CountryDetail[];
}

const sectorLabels: Record<string, string> = {
  banking: "Banking",
  energy: "Energy",
  real_estate: "Real Estate",
  manufacturing: "Manufacturing",
  retail: "Retail",
  tech: "Tech",
  utilities: "Utilities",
  transport: "Transport",
};

export function SectorHeatmap({ sectorStress, countries }: SectorHeatmapProps) {
  const [selectedCell, setSelectedCell] = useState<{ sector: string; country: string } | null>(null);
  const sectors = Object.keys(sectorStress);

  return (
    <div className="glass-card p-4 overflow-x-auto">
      <h3 className="text-sm font-bold text-db-text-primary mb-3">Sector Stress Heatmap</h3>
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left text-db-text-muted font-medium pb-2 pr-3 sticky left-0 bg-db-navy-light z-10">Sector</th>
            {countries.map((c) => (
              <th key={c.code} className="text-center pb-2 px-2 min-w-[48px]" title={c.name}>
                <span className="text-base">{c.flag}</span>
                <span className="block text-[8px] text-db-text-muted">{c.code}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sectors.map((sector, si) => (
            <motion.tr
              key={sector}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: si * 0.03 }}
            >
              <td className="text-db-text-primary font-medium py-1.5 pr-3 sticky left-0 bg-db-navy-light z-10 whitespace-nowrap">
                {sectorLabels[sector] || sector}
              </td>
              {countries.map((country) => {
                const score = sectorStress[sector]?.[country.code] ?? 50;
                const level = getRiskLevel(score);
                const hasDBExposure = dbExposureByCountry[country.code]?.total > 0;
                const isSelected = selectedCell?.sector === sector && selectedCell?.country === country.code;

                return (
                  <td
                    key={country.code}
                    className="text-center p-0.5"
                  >
                    <button
                      onClick={() => setSelectedCell(isSelected ? null : { sector, country: country.code })}
                      className={`w-full py-1.5 px-1 rounded-md transition-all relative ${
                        isSelected ? "ring-1 ring-db-accent" : ""
                      }`}
                      style={{ backgroundColor: level.bgColor }}
                      title={`${sectorLabels[sector] || sector} - ${country.name}: ${score}/100`}
                    >
                      <span className="text-[10px] font-bold" style={{ color: level.color }}>
                        {score}
                      </span>
                      {hasDBExposure && (
                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-db-accent" title="DB has exposure" />
                      )}
                    </button>
                  </td>
                );
              })}
            </motion.tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-2 border-t border-db-border">
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-4 h-3 rounded-sm"
              style={{
                backgroundColor:
                  i === 1 ? "rgba(16, 185, 129, 0.4)" :
                  i === 2 ? "rgba(59, 130, 246, 0.4)" :
                  i === 3 ? "rgba(245, 158, 11, 0.4)" :
                  i === 4 ? "rgba(249, 115, 22, 0.4)" : "rgba(239, 68, 68, 0.4)",
              }}
            />
          ))}
        </div>
        <span className="text-[9px] text-db-text-muted">Low → High Stress</span>
        <div className="flex items-center gap-1 ml-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-db-accent" />
          <span className="text-[9px] text-db-text-muted">DB Exposure</span>
        </div>
      </div>

      {/* Selected cell detail */}
      {selectedCell && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 rounded-lg bg-db-surface border border-db-border"
        >
          <p className="text-xs text-db-text-primary">
            <strong>{sectorLabels[selectedCell.sector] || selectedCell.sector}</strong> stress in{" "}
            <strong>{countries.find(c => c.code === selectedCell.country)?.name}</strong>:{" "}
            <span className="font-bold" style={{ color: getRiskLevel(sectorStress[selectedCell.sector]?.[selectedCell.country] ?? 50).color }}>
              {sectorStress[selectedCell.sector]?.[selectedCell.country] ?? "N/A"}/100
            </span>
          </p>
          {dbExposureByCountry[selectedCell.country] && (
            <p className="text-[10px] text-db-text-muted mt-1">
              DB exposure: €{dbExposureByCountry[selectedCell.country].total.toLocaleString()}M
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
