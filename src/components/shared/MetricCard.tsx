"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "stable";
  icon?: LucideIcon;
  color?: string;
  loading?: boolean;
  onClick?: () => void;
}

const trendIcons: Record<string, LucideIcon> = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

const trendColors: Record<string, string> = {
  up: "text-db-success",
  down: "text-db-danger",
  stable: "text-db-text-muted",
};

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  color = "#3B82F6",
  loading = false,
  onClick,
}: MetricCardProps) {
  const TrendIcon = trend ? trendIcons[trend] : null;

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02, y: -2 } : {}}
      onClick={onClick}
      className={`glass-card-hover p-4 ${onClick ? "cursor-pointer" : ""}`}
    >
      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-3 bg-db-border rounded w-2/3" />
          <div className="h-6 bg-db-border rounded w-1/2" />
          <div className="h-2 bg-db-border rounded w-1/3" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-db-text-secondary uppercase tracking-wider">
              {title}
            </span>
            {Icon && (
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${color}15` }}>
                <Icon size={14} color={color} />
              </div>
            )}
          </div>

          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-db-text-primary">
              {value}
            </span>
            {TrendIcon && trend && (
              <div className={`flex items-center gap-1 mb-1 ${trendColors[trend]}`}>
                <TrendIcon size={14} />
                {subtitle && (
                  <span className="text-xs font-medium">{subtitle}</span>
                )}
              </div>
            )}
          </div>

          {subtitle && !trend && (
            <p className="mt-1 text-xs text-db-text-muted">{subtitle}</p>
          )}
        </>
      )}
    </motion.div>
  );
}
