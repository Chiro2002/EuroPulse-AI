"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, TrendingUp, TrendingDown, Minus, ArrowUpDown } from "lucide-react";
import { getRiskLevel } from "@/lib/logic/riskCalculator";
import type { CountryDetail } from "@/lib/types";

interface CountryRiskTableProps {
  countries: CountryDetail[];
  selectedCountry: string;
  onCountrySelect: (code: string) => void;
}

type SortKey = "code" | "totalRisk" | "inflation" | "energy" | "debt" | "employment" | "housing" | "geopolitical" | "trend30d";

export function CountryRiskTable({ countries, selectedCountry, onCountrySelect }: CountryRiskTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("totalRisk");
  const [sortAsc, setSortAsc] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const sorted = useMemo(() => {
    let filtered = countries;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = countries.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
    }
    return [...filtered].sort((a, b) => {
      const getVal = (item: CountryDetail, key: SortKey): number => {
        if (key === "code") return 0;
        if (key === "totalRisk") return item.totalRisk;
        if (key === "trend30d") return item.trend30d;
        return item.breakdown[key as keyof typeof item.breakdown] ?? 0;
      };
      const aVal = getVal(a, sortKey);
      const bVal = getVal(b, sortKey);
      if (sortKey === "code") return sortAsc ? a.code.localeCompare(b.code) : b.code.localeCompare(a.code);
      return sortAsc ? aVal - bVal : bVal - aVal;
    });
  }, [countries, sortKey, sortAsc, searchQuery]);

  const columns: { key: SortKey; label: string }[] = [
    { key: "code", label: "Country" },
    { key: "totalRisk", label: "Total" },
    { key: "inflation", label: "Infl." },
    { key: "energy", label: "Energy" },
    { key: "debt", label: "Debt" },
    { key: "employment", label: "Employ." },
    { key: "housing", label: "Housing" },
    { key: "geopolitical", label: "Geo." },
    { key: "trend30d", label: "Trend" },
  ];

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-border rounded-lg pl-7 pr-2 py-1.5 text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`text-left pb-2 pr-2 cursor-pointer hover:text-primary transition-colors ${
                    sortKey === col.key ? "text-primary" : "text-text-secondary"
                  }`}
                >
                  <div className="flex items-center gap-1 text-[9px] font-medium uppercase tracking-wider">
                    {col.label}
                    {col.key !== "code" && <ArrowUpDown size={9} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((country, i) => {
              const level = getRiskLevel(country.totalRisk);
              const isSelected = selectedCountry === country.code;
              return (
                <motion.tr
                  key={country.code}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => onCountrySelect(country.code)}
                  className={`cursor-pointer transition-all rounded-lg ${
                    isSelected ? "bg-primary/5" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="py-1.5 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{country.flag}</span>
                      <span className="font-medium text-text-primary text-[11px]">{country.code}</span>
                    </div>
                  </td>
                  <td className="py-1.5 pr-2">
                    <span
                      className="font-bold px-1.5 py-0.5 rounded text-[10px]"
                      style={{ backgroundColor: level.bgColor, color: level.color }}
                    >
                      {country.totalRisk}
                    </span>
                  </td>
                  {(["inflation", "energy", "debt", "employment", "housing", "geopolitical"] as const).map((dim) => {
                    const dimLevel = getRiskLevel(country.breakdown[dim]);
                    return (
                      <td key={dim} className="py-1.5 pr-2">
                        <span className="text-[10px] font-medium" style={{ color: dimLevel.color }}>
                          {country.breakdown[dim]}
                        </span>
                      </td>
                    );
                  })}
                  <td className="py-1.5">
                    <div className="flex items-center gap-1">
                      {country.trend30d > 5 ? (
                        <TrendingUp size={11} className="text-[#E5484D]" />
                      ) : country.trend30d < -2 ? (
                        <TrendingDown size={11} className="text-[#2FAE60]" />
                      ) : (
                        <Minus size={11} className="text-text-secondary" />
                      )}
                      <span className={`text-[10px] font-medium ${
                        country.trend30d > 5 ? "text-[#E5484D]" : country.trend30d < -2 ? "text-[#2FAE60]" : "text-text-secondary"
                      }`}>
                        {country.trend30d > 0 ? "+" : ""}{country.trend30d}
                      </span>
                    </div>
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
