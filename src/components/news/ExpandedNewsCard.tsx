"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Globe,
  AlertTriangle,
  Lightbulb,
  Users,
  TrendingUp,
  Building2,
  ListChecks,
  ExternalLink,
  Beaker,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { severityConfig, getTimeAgo, topicColors, getTopicLabel, calculateDBRelevance } from "@/lib/logic/newsClassifier";
import { countryNames, euCountries } from "@/lib/data/countries";

const countryFlagMap: Record<string, string> = euCountries.reduce(
  (acc, c) => ({ ...acc, [c.code]: c.flag }),
  {} as Record<string, string>
);
import type { ClassifiedNews, MarketDirection } from "@/lib/types";

interface ExpandedNewsCardProps {
  item: ClassifiedNews;
  index: number;
}

const directionIcon = (dir: string) => {
  if (dir === "up" || dir === "strengthen" || dir === "positive" || dir === "yields_up") return <ArrowUp size={10} className="text-db-danger" />;
  if (dir === "down" || dir === "weaken" || dir === "negative" || dir === "yields_down") return <ArrowDown size={10} className="text-db-success" />;
  return <Minus size={10} className="text-db-text-muted" />;
};

const directionLabel = (val: string) => {
  const labels: Record<string, string> = {
    up: "↑", down: "↓", neutral: "→",
    strengthen: "↑", weaken: "↓",
    positive: "↑", negative: "↓",
    yields_up: "↑", yields_down: "↓",
  };
  return labels[val] || "→";
};

export function ExpandedNewsCard({ item, index }: ExpandedNewsCardProps) {
  const [expanded, setExpanded] = useState(false);

  const severityStyle = severityConfig[item.severity];
  const dbRelevance = calculateDBRelevance(item);
  const topicColor = topicColors[item.eventType] || "#94A3B8";

  // Numeric severity badge color
  const sevColor = item.severityNum >= 8 ? "#EF4444" : item.severityNum >= 6 ? "#F59E0B" : item.severityNum >= 4 ? "#3B82F6" : "#10B981";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="glass-card overflow-hidden"
    >
      {/* Collapsed State Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 hover:bg-db-surface-light/30 transition-colors"
      >
        <div className="flex items-start gap-3">
          {/* Severity badge */}
          <div
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: `${sevColor}20`, color: sevColor }}
          >
            {item.severityNum}
          </div>

          <div className="flex-1 min-w-0">
            {/* Meta row */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                style={{ backgroundColor: topicColor + "20", color: topicColor }}
              >
                {getTopicLabel(item.eventType)}
              </span>
              <span
                className="text-[9px] font-medium px-1.5 py-0.5 rounded"
                style={{ backgroundColor: severityStyle.bgColor, color: severityStyle.color }}
              >
                {severityStyle.label}
              </span>
              <span className="text-[9px] text-db-text-muted flex items-center gap-1">
                <Clock size={9} />
                {getTimeAgo(item.timestamp)}
              </span>
              {dbRelevance >= 75 && (
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-db-accent/10 text-db-accent">
                  High DB Relevance
                </span>
              )}
            </div>

            {/* Headline */}
            <h3 className="text-sm font-bold text-db-text-primary leading-snug mb-1">
              {item.headline}
            </h3>

            {/* 1-line summary */}
            <p className="text-xs text-db-text-secondary line-clamp-1">
              {item.summary}
            </p>

            {/* Tags row */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {item.affectedCountries.map((code) => (
                <span key={code} className="text-xs" title={countryNames[code] || code}>
                  {countryFlagMap[code] || "🇪🇺"}
                </span>
              ))}
              <span className="text-[9px] text-db-text-muted">{item.source}</span>
              <div className="ml-auto flex items-center gap-1">
                {item.marketImpactDetail.inflation !== "neutral" && (
                  <span className={`text-[8px] px-1 py-0.5 rounded ${item.marketImpactDetail.inflation === "up" ? "bg-db-danger/10 text-db-danger" : "bg-db-success/10 text-db-success"}`}>
                    {directionLabel(item.marketImpactDetail.inflation)} Inflation
                  </span>
                )}
                {item.marketImpactDetail.eur !== "neutral" && (
                  <span className={`text-[8px] px-1 py-0.5 rounded ${item.marketImpactDetail.eur === "weaken" ? "bg-db-danger/10 text-db-danger" : "bg-db-success/10 text-db-success"}`}>
                    {directionLabel(item.marketImpactDetail.eur)} EUR
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Expand indicator */}
          <div className="flex-shrink-0 mt-1">
            {expanded ? (
              <ChevronUp size={16} className="text-db-text-muted" />
            ) : (
              <ChevronDown size={16} className="text-db-text-muted" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-db-border overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* 🔍 WHAT HAPPENED */}
              <div className="glass-card p-3 bg-db-surface/30">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <AlertTriangle size={12} className="text-db-accent" />
                  <span className="text-[10px] font-bold text-db-text-secondary uppercase tracking-wider">What Happened</span>
                </div>
                <p className="text-xs text-db-text-primary leading-relaxed">{item.whatHappened}</p>
              </div>

              {/* 💡 WHY IT MATTERS */}
              <div className="glass-card p-3 bg-db-surface/30">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Lightbulb size={12} className="text-db-warning" />
                  <span className="text-[10px] font-bold text-db-text-secondary uppercase tracking-wider">Why It Matters</span>
                </div>
                <p className="text-xs text-db-text-primary leading-relaxed">{item.whyItMatters}</p>
              </div>

              {/* 🌍 WHO'S AFFECTED */}
              <div className="glass-card p-3 bg-db-surface/30">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Users size={12} className="text-db-success" />
                  <span className="text-[10px] font-bold text-db-text-secondary uppercase tracking-wider">Who's Affected</span>
                </div>
                <p className="text-xs text-db-text-primary mb-2">{item.whoIsAffected}</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.affectedCountries.map((code) => (
                    <span key={code} className="text-[9px] px-2 py-0.5 rounded-full bg-db-surface text-db-text-muted">
                      {countryNames[code] || code}
                    </span>
                  ))}
                  {item.affectedSectors.map((sector) => (
                    <span key={sector} className="text-[9px] px-2 py-0.5 rounded-full bg-db-accent/5 text-db-accent">
                      {sector}
                    </span>
                  ))}
                </div>
              </div>

              {/* 📈 LIKELY MARKET REACTION */}
              <div className="glass-card p-3 bg-db-surface/30">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp size={12} className="text-db-accent" />
                  <span className="text-[10px] font-bold text-db-text-secondary uppercase tracking-wider">Likely Market Reaction</span>
                </div>
                <div className="grid grid-cols-5 gap-2 text-center">
                  {[
                    { label: "Inflation", value: item.marketImpactDetail.inflation },
                    { label: "EUR/USD", value: item.marketImpactDetail.eur },
                    { label: "Bonds", value: item.marketImpactDetail.bonds },
                    { label: "Equities", value: item.marketImpactDetail.equities },
                    { label: "Oil", value: item.marketImpactDetail.oil },
                  ].map((metric) => (
                    <div key={metric.label} className="glass-card p-2 bg-db-surface/50">
                      <p className="text-[8px] text-db-text-muted mb-1">{metric.label}</p>
                      <p className="text-sm font-bold">{directionLabel(metric.value)}</p>
                      <p className="text-[7px] text-db-text-muted mt-0.5">{item.timeHorizon}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 🏦 DB IMPACT */}
              <div className="glass-card p-3 bg-db-surface/30">
                <div className="flex items-center gap-1.5 mb-2">
                  <Building2 size={12} className="text-db-accent" />
                  <span className="text-[10px] font-bold text-db-text-secondary uppercase tracking-wider">DB Impact</span>
                </div>
                <div className="space-y-1.5">
                  {item.dbImpact.map((impact, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor:
                            impact.severity === "high" ? "#EF4444" : impact.severity === "medium" ? "#F59E0B" : "#10B981",
                        }}
                      />
                      <span className="font-medium text-db-text-primary w-28">{impact.department}:</span>
                      <span className="text-db-text-secondary">{impact.effect}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 📋 RECOMMENDED ACTIONS */}
              <div className="glass-card p-3 bg-db-surface/30">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ListChecks size={12} className="text-db-success" />
                  <span className="text-[10px] font-bold text-db-text-secondary uppercase tracking-wider">Recommended Actions</span>
                </div>
                <ul className="space-y-1">
                  {item.recommendedActions.map((action, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs">
                      <span className="flex-shrink-0 w-4 h-4 rounded-full bg-db-accent/15 flex items-center justify-center mt-0.5">
                        <span className="text-[7px] font-bold text-db-accent">{i + 1}</span>
                      </span>
                      <span className="text-db-text-primary">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-1">
                <a
                  href={`/simulator?scenario=${item.eventType}&headline=${encodeURIComponent(item.headline)}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-db-accent/15 text-db-accent text-[10px] font-medium hover:bg-db-accent/25 transition-colors"
                >
                  <Beaker size={11} />
                  Simulate this in Scenario Simulator
                </a>
                <span className="text-[9px] text-db-text-muted">
                  Source: {item.source}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
