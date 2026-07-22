"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Hash } from "lucide-react";
import type { NewsTheme } from "@/lib/types";

interface TopThemesPanelProps {
  themes: NewsTheme[];
  selectedTopic: string;
  onTopicSelect: (topic: string) => void;
}

export function TopThemesPanel({ themes, selectedTopic, onTopicSelect }: TopThemesPanelProps) {
  return (
    <div className="glass-card p-4">
      <h3 className="text-xs font-bold text-db-text-primary mb-3 flex items-center gap-1.5 uppercase tracking-wider">
        <Hash size={12} className="text-db-accent" />
        Top Themes
      </h3>

      <div className="space-y-1.5">
        <button
          onClick={() => onTopicSelect("all")}
          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all ${
            selectedTopic === "all"
              ? "bg-db-accent text-white"
              : "text-db-text-muted hover:text-db-text-primary hover:bg-db-surface"
          }`}
        >
          <span className="flex-1 text-left font-medium">All Topics</span>
          <span className="text-[10px] opacity-70">Clear filter</span>
        </button>

        {themes.map((theme, i) => (
          <motion.button
            key={theme.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onTopicSelect(theme.rawKey)}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all ${
              selectedTopic === theme.rawKey
                ? "bg-db-surface ring-1 ring-db-accent/30"
                : "hover:bg-db-surface"
            }`}
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: theme.color }}
            />
            <span className="flex-1 text-left text-db-text-primary font-medium">{theme.name}</span>
            <span className="text-[10px] text-db-text-muted">{theme.count}</span>
            {theme.trend === "up" && <TrendingUp size={10} className="text-db-danger" />}
            {theme.trend === "down" && <TrendingDown size={10} className="text-db-success" />}
            {theme.trend === "stable" && <Minus size={10} className="text-db-text-muted" />}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
