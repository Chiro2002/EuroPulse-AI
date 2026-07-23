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
    borderColor: "border-[#E5484D]/30",
    bgColor: "bg-[#E5484D]/10",
    textColor: "text-[#E5484D]",
    iconColor: "#E5484D",
  },
  high: {
    icon: AlertTriangle,
    borderColor: "border-[#F5A623]/30",
    bgColor: "bg-[#F5A623]/10",
    textColor: "text-[#F5A623]",
    iconColor: "#F5A623",
  },
  medium: {
    icon: AlertCircle,
    borderColor: "border-primary/30",
    bgColor: "bg-primary/10",
    textColor: "text-primary",
    iconColor: "#3B82F6",
  },
  low: {
    icon: Info,
    borderColor: "border-[#2FAE60]/30",
    bgColor: "bg-[#2FAE60]/10",
    textColor: "text-[#2FAE60]",
    iconColor: "#2FAE60",
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
      className={`relative overflow-hidden rounded-xl border ${styles.borderColor} ${styles.bgColor} shadow-sm`}
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
              <span className="text-xs text-text-secondary">{timestamp}</span>
            )}
          </div>
          <p className="mt-1 text-sm text-text-secondary">{description}</p>
          {actionable && (
            <button className="mt-2 text-xs font-medium text-primary hover:brightness-150 transition-colors">
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
            <X size={14} className="text-text-secondary" />
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
