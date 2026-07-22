"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, TrendingUp, TrendingDown, Minus, ArrowUpDown } from "lucide-react";
import { getRiskLevel } from "@/lib/logic/riskCalculator";
import type { CountryDetail, RiskDimension } from "@/lib/types";

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
      let aVal: any = a[sortKey as keyof CountryDetail];
      let bVal: any = b[sortKey as keyof CountryDetail];
      
      // For breakdown dimensions, get the value from breakdown object
      if (sortKey !== "code" && sortKey !== "totalRisk" && sortKey !== "trend30d") {
        aVal = a.breakdown[sortKey as keyof typeof a.breakdown];
        bVal = b.breakdown[sortKey as keyof typeof b.breakdown];
      }

      if (typeof aVal === "string") return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return sortAsc ? (aVal || 0) - (bVal || 0) : (bVal || 0) - (aVal || 0);
    });
  }, [countries, sortKey, sortAsc, searchQuery]);

  const columns: { key: SortKey; label: string; width?: string }[] = [
    { key: "code", label: "Country", width: "w-32" },
    { key: "totalRisk", label: "Total" },
    { key: "inflation", label: "Inflation" },
    { key: "energy", label: "Energy" },
    { key: "debt", label: "Debt" },
    { key: "employment", label: "Employment" },
    { key: "housing", label: "Housing" },
    { key: "geopolitical", label: "Geopolitical" },
    { key: "trend30d", label: "Trend" },
  ];

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  return (
    <div className="glass-card p-4">
      {/* Search */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-db-text-muted" />
          <input
            type="text"
            placeholder="Search country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-db-surface border border-db-border rounded-lg pl-7 pr-2 py-1.5 text-xs text-db-text-primary placeholder:text-db-text-muted focus:outline-none focus:border-db-accent transition-colors"
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
                  className={`text-left pb-2 pr-2 cursor-pointer hover:text-db-accent transition-colors ${
                    col.width || ""
                  } ${sortKey === col.key ? "text-db-accent" : "text-db-text-muted"}`}
                >
                  <div className="flex items-center gap-1 text-[9px] font-medium uppercase tracking-wider">
                    {col.label === "Country" ? (
                      <span>Country</span>
                    ) : (
                      <>
                        {col.label}
                        <ArrowUpDown size={9} />
                      </>
                    )}
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
                  className={`cursor-pointer transition-all ${
                    isSelected ? "bg-db-accent/10" : "hover:bg-db-surface"
                  }`}
                >
                  <td className="py-1.5 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{country.flag}</span>
                      <span className="font-medium text-db-text-primary">{country.code}</span>
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
                        <span
                          className="text-[10px] font-medium"
                          style={{ color: dimLevel.color }}
                        >
                          {country.breakdown[dim]}
                        </span>
                      </td>
                    );
                  })}
                  <td className="py-1.5">
                    <div className="flex items-center gap-1">
                      {country.trend30d > 5 ? (
                        <TrendingUp size={11} className="text-db-danger" />
                      ) : country.trend30d < -2 ? (
                        <TrendingDown size={11} className="text-db-success" />
                      ) : (
                        <Minus size={11} className="text-db-text-muted" />
                      )}
                      <span className={`text-[10px] font-medium ${
                        country.trend30d > 5 ? "text-db-danger" : country.trend30d < -2 ? "text-db-success" : "text-db-text-muted"
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
