"use client";

import { motion } from "framer-motion";
import { AlertTriangle, AlertOctagon, AlertCircle, Info, X } from "lucide-react";
import { useState } from "react";

interface AlertCardProps {
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  timestamp?: string;
  actionable?: boolean;
  onDismiss?: () => void;
}

const severityStyles = {
  critical: {
    icon: AlertOctagon,
    borderColor: "border-db-danger/30",
    bgColor: "bg-db-danger/10",
    glowColor: "shadow-db-danger/20",
    textColor: "text-db-danger",
    iconColor: "#EF4444",
  },
  high: {
    icon: AlertTriangle,
    borderColor: "border-db-warning/30",
    bgColor: "bg-db-warning/10",
    glowColor: "shadow-db-warning/20",
    textColor: "text-db-warning",
    iconColor: "#F59E0B",
  },
  medium: {
    icon: AlertCircle,
    borderColor: "border-db-accent/30",
    bgColor: "bg-db-accent/10",
    glowColor: "shadow-db-accent/20",
    textColor: "text-db-accent",
    iconColor: "#3B82F6",
  },
  low: {
    icon: Info,
    borderColor: "border-db-success/30",
    bgColor: "bg-db-success/10",
    glowColor: "shadow-db-success/20",
    textColor: "text-db-success",
    iconColor: "#10B981",
  },
};

export function AlertCard({
  title,
  description,
  severity,
  timestamp,
  actionable = true,
  onDismiss,
}: AlertCardProps) {
  const [isVisible, setIsVisible] = useState(true);
  const styles = severityStyles[severity];
  const Icon = styles.icon;

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={`relative overflow-hidden rounded-xl border ${styles.borderColor} ${styles.bgColor} ${styles.glowColor} shadow-lg`}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="mt-0.5 flex-shrink-0">
          <Icon size={18} color={styles.iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`text-sm font-semibold ${styles.textColor}`}>
              {title}
            </h4>
            {timestamp && (
              <span className="text-xs text-db-text-muted">{timestamp}</span>
            )}
          </div>
          <p className="mt-1 text-sm text-db-text-secondary">{description}</p>
          {actionable && (
            <button className="mt-2 text-xs font-medium text-db-accent hover:text-blue-300 transition-colors">
              Take Action →
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={() => {
              setIsVisible(false);
              onDismiss();
            }}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X size={14} className="text-db-text-muted" />
          </button>
        )}
      </div>
      {/* Severity indicator bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5"
        style={{ backgroundColor: styles.iconColor, opacity: 0.3 }}
      />
    </motion.div>
  );
}
