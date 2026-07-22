"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import { topicColors } from "@/lib/logic/newsClassifier";
import type { ClassifiedNews } from "@/lib/types";

interface NewsTimelineProps {
  items: ClassifiedNews[];
  onEventClick: (id: string) => void;
  selectedId?: string | null;
}

export function NewsTimeline({ items, onEventClick, selectedId }: NewsTimelineProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Sort by timestamp
  const sorted = [...items].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const minTime = sorted.length > 0 ? new Date(sorted[0].timestamp).getTime() : Date.now();
  const maxTime = sorted.length > 0 ? new Date(sorted[sorted.length - 1].timestamp).getTime() : Date.now();
  const timeRange = maxTime - minTime || 1;

  const maxSeverity = Math.max(...sorted.map((i) => i.severityNum), 1);
  const barHeight = 60;

  const getX = (timestamp: string) => {
    return ((new Date(timestamp).getTime() - minTime) / timeRange) * 100;
  };

  const getHeight = (sev: number) => {
    return Math.max(8, (sev / maxSeverity) * barHeight);
  };

  const getSeverityColor = (sev: number) => {
    if (sev >= 8) return "#EF4444";
    if (sev >= 6) return "#F59E0B";
    if (sev >= 4) return "#3B82F6";
    return "#10B981";
  };

  return (
    <div className="glass-card p-4">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between w-full mb-2"
      >
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-db-accent" />
          <span className="text-xs font-semibold text-db-text-primary">Event Timeline</span>
          <span className="text-[10px] text-db-text-muted">({sorted.length} events)</span>
        </div>
        {collapsed ? <ChevronUp size={14} className="text-db-text-muted" /> : <ChevronDown size={14} className="text-db-text-muted" />}
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 90, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative overflow-hidden"
          >
            {/* Horizontal line */}
            <div className="absolute bottom-4 left-0 right-0 h-px bg-db-border" />

            {/* Events */}
            {sorted.map((item) => {
              const x = getX(item.timestamp);
              const h = getHeight(item.severityNum);
              const color = getSeverityColor(item.severityNum);
              const isSelected = selectedId === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onEventClick(item.id)}
                  className="absolute bottom-0 transition-all hover:z-10"
                  style={{
                    left: `${x}%`,
                    marginLeft: "-4px",
                    width: "8px",
                  }}
                  title={item.headline}
                >
                  <motion.div
                    animate={{
                      height: isSelected ? h + 8 : h,
                      opacity: isSelected ? 1 : 0.7,
                    }}
                    className="w-full rounded-full transition-colors hover:opacity-100"
                    style={{
                      backgroundColor: color,
                      boxShadow: isSelected ? `0 0 8px ${color}` : "none",
                    }}
                  />
                </button>
              );
            })}

            {/* Selected indicator */}
            {selectedId && (
              <p className="absolute bottom-[-16px] left-0 right-0 text-[8px] text-db-text-muted text-center">
                Selected event shown below
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
