"use client";

import { Search, Filter } from "lucide-react";

interface NewsFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSeverity: string;
  onSeverityChange: (severity: string) => void;
  severities: string[];
}

export function NewsFilterBar({
  searchQuery,
  onSearchChange,
  selectedSeverity,
  onSeverityChange,
  severities,
}: NewsFilterBarProps) {
  return (
    <div className="glass-card p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-db-text-muted" />
          <input
            type="text"
            placeholder="Search news, countries, sectors..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-db-surface border border-db-border rounded-lg pl-9 pr-3 py-2 text-sm text-db-text-primary placeholder:text-db-text-muted focus:outline-none focus:border-db-accent transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-db-text-muted" />
          <div className="flex gap-1">
            {severities.map((sev) => (
              <button
                key={sev}
                onClick={() => onSeverityChange(sev)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedSeverity === sev
                    ? "bg-db-accent text-white"
                    : "text-db-text-muted hover:text-db-text-primary hover:bg-db-surface"
                }`}
              >
                {sev === "all" ? "All" : sev.charAt(0).toUpperCase() + sev.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
