"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper,
  Filter,
  Search,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Globe,
} from "lucide-react";
import { newsItems } from "@/lib/data/mockData";
import { severityConfig, impactConfig, getTimeAgo, getNewsStats, calculateDBRelevance } from "@/lib/logic/newsClassifier";
import { countryNames } from "@/lib/data/countries";
import type { NewsItem } from "@/lib/types";

export default function NewsPage() {
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedImpact, setSelectedImpact] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const stats = useMemo(() => getNewsStats(newsItems), []);

  const filteredNews = useMemo(() => {
    return newsItems.filter((item) => {
      if (selectedSeverity !== "all" && item.severity !== selectedSeverity) return false;
      if (selectedImpact !== "all" && item.marketImpact !== selectedImpact) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.headline.toLowerCase().includes(query) ||
          item.summary.toLowerCase().includes(query) ||
          item.affectedCountries.some((c) => c.toLowerCase().includes(query)) ||
          item.affectedSectors.some((s) => s.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [selectedSeverity, selectedImpact, searchQuery]);

  const severities = ["all", "critical", "high", "medium", "low"];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-db-text-primary flex items-center gap-2">
          <Newspaper size={22} className="text-db-accent" />
          News Intelligence
        </h2>
        <p className="text-sm text-db-text-muted mt-1">
          AI-classified macroeconomic news with Deutsche Bank impact analysis
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Articles", value: stats.total, color: "#3B82F6" },
          { label: "Critical", value: stats.criticalCount, color: "#EF4444" },
          { label: "High", value: stats.highCount, color: "#F59E0B" },
          { label: "Medium", value: stats.mediumCount, color: "#3B82F6" },
          { label: "Low", value: stats.lowCount, color: "#10B981" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-3 text-center"
          >
            <p className="text-2xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="text-xs text-db-text-muted">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-db-text-muted" />
            <input
              type="text"
              placeholder="Search news, countries, sectors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-db-surface border border-db-border rounded-lg pl-9 pr-3 py-2 text-sm text-db-text-primary placeholder:text-db-text-muted focus:outline-none focus:border-db-accent transition-colors"
            />
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-db-text-muted" />
            <div className="flex gap-1">
              {severities.map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedSeverity === sev
                      ? sev === "all"
                        ? "bg-db-accent text-white"
                        : `${severityConfig[sev]?.bgColor || "bg-db-accent/15"} ${severityConfig[sev]?.color ? `text-[${severityConfig[sev].color}]` : "text-db-accent"}`
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

      {/* News Feed */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredNews.map((item, index) => {
            const severityStyle = severityConfig[item.severity];
            const impactStyle = impactConfig[item.marketImpact];
            const dbRelevance = calculateDBRelevance(item);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card-hover p-4"
              >
                <div className="flex items-start gap-4">
                  {/* Severity Indicator */}
                  <div
                    className="flex-shrink-0 w-1 h-16 rounded-full mt-1"
                    style={{ backgroundColor: severityStyle.color }}
                  />

                  <div className="flex-1 min-w-0">
                    {/* Meta Row */}
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: severityStyle.bgColor,
                          color: severityStyle.color,
                        }}
                      >
                        {severityStyle.label}
                      </span>
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor:
                            item.marketImpact === "positive"
                              ? "rgba(16, 185, 129, 0.15)"
                              : item.marketImpact === "negative"
                              ? "rgba(239, 68, 68, 0.15)"
                              : "rgba(148, 163, 184, 0.15)",
                          color: impactStyle.color,
                        }}
                      >
                        {impactStyle.label} Impact
                      </span>
                      <span className="text-[10px] text-db-text-muted flex items-center gap-1">
                        <Clock size={10} />
                        {getTimeAgo(item.timestamp)}
                      </span>
                      {dbRelevance >= 75 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-db-accent/10 text-db-accent">
                          High DB Relevance
                        </span>
                      )}
                    </div>

                    {/* Headline */}
                    <h3 className="text-sm font-semibold text-db-text-primary leading-snug mb-1">
                      {item.headline}
                    </h3>

                    {/* Summary */}
                    <p className="text-xs text-db-text-secondary leading-relaxed mb-2">
                      {item.summary}
                    </p>

                    {/* DB Explanation */}
                    <p className="text-[11px] text-db-text-muted italic bg-db-surface/50 p-2 rounded-lg mb-2">
                      <span className="font-semibold text-db-accent not-italic">DB Impact: </span>
                      {item.explanation}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {item.affectedCountries.map((code) => (
                        <span
                          key={code}
                          className="text-[10px] px-1.5 py-0.5 rounded-full bg-db-surface text-db-text-muted flex items-center gap-1"
                        >
                          <Globe size={10} />
                          {countryNames[code] || code}
                        </span>
                      ))}
                      {item.affectedSectors.slice(0, 3).map((sector) => (
                        <span
                          key={sector}
                          className="text-[10px] px-1.5 py-0.5 rounded-full bg-db-accent/5 text-db-accent"
                        >
                          {sector}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Source */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-[10px] text-db-text-muted">{item.source}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredNews.length === 0 && (
          <div className="glass-card p-8 text-center">
            <p className="text-sm text-db-text-muted">No news items match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
