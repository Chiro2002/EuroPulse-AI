"use client";

import { motion } from "framer-motion";
import { ChevronDown, Clock, Sparkles, Gavel } from "lucide-react";
import { useRouter } from "next/navigation";
import { severityConfig, getTimeAgo, topicColors, getTopicLabel, calculateDBRelevance } from "@/lib/logic/newsClassifier";
import { euCountries } from "@/lib/data/countries";
import type { ClassifiedNews } from "@/lib/types";

const countryFlagMap: Record<string, string> = euCountries.reduce(
  (acc, c) => ({ ...acc, [c.code]: c.flag }), {} as Record<string, string>
);

interface ExpandedNewsCardProps {
  item: ClassifiedNews;
  index: number;
  onClick?: (id: string) => void;
}

export function ExpandedNewsCard({ item, index, onClick }: ExpandedNewsCardProps) {
  const router = useRouter();
  const severityStyle = severityConfig[item.severity];
  const dbRelevance = calculateDBRelevance(item);
  const topicColor = topicColors[item.eventType] || "#94A3B8";
  const sevColor = item.severityNum >= 8 ? "#E5484D" : item.severityNum >= 6 ? "#F5A623" : item.severityNum >= 4 ? "#3B82F6" : "#2FAE60";

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => onClick?.(item.id)}
      className="w-full text-left card overflow-hidden hover:shadow-card-hover hover:bg-gray-50/30 transition-all duration-200 group"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Severity badge */}
          <div
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold group-hover:scale-105 transition-transform"
            style={{ backgroundColor: `${sevColor}15`, color: sevColor }}
          >
            {item.severityNum}
          </div>

          <div className="flex-1 min-w-0">
            {/* Meta row */}
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                style={{ backgroundColor: topicColor + "15", color: topicColor }}
              >
                {getTopicLabel(item.eventType)}
              </span>
              <span
                className="text-[9px] font-medium px-1.5 py-0.5 rounded-md"
                style={{ backgroundColor: severityStyle.bgColor, color: severityStyle.color }}
              >
                {severityStyle.label}
              </span>
              <span className="text-[9px] text-text-secondary flex items-center gap-1">
                <Clock size={9} />
                {getTimeAgo(item.timestamp)}
              </span>
              {dbRelevance >= 75 && (
                <span className="inline-flex items-center gap-1 text-[8px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/10">
                  <Sparkles size={7} />
                  High DB Relevance
                </span>
              )}
            </div>

            {/* Headline */}
            <h3 className="text-sm font-bold text-text-primary leading-snug mb-1">
              {item.headline}
            </h3>

            {/* Summary preview */}
            <p className="text-xs text-text-secondary line-clamp-1">
              {item.summary}
            </p>

            {/* Footer tags */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {item.affectedCountries.map((code) => (
                <span key={code} className="text-xs">{countryFlagMap[code] || "🇪🇺"}</span>
              ))}
              <span className="text-[9px] text-text-secondary">{item.source}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex flex-col items-center gap-1.5 mt-0.5">
            {/* Click hint */}
            <div className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronDown size={14} />
            </div>
            {/* Debate button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/boardroom?topic=${encodeURIComponent(`Should DB act on: ${item.headline.slice(0, 80)}?`)}`);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-700 text-[8px] font-medium hover:bg-amber-100 border border-amber-200 whitespace-nowrap"
              title="Convene committee to debate this event"
            >
              <Gavel size={9} />
              Debate
            </button>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
