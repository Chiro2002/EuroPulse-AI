"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, BellDot, Circle } from "lucide-react";

interface TopBarProps {
  alertCount?: number;
  criticalAlertCount?: number;
}

export function TopBar({ alertCount = 5, criticalAlertCount = 2 }: TopBarProps) {
  const [currentTime, setCurrentTime] = useState("");
  const [showAlerts, setShowAlerts] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " • " +
        now.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-db-navy border-b border-db-border flex items-center justify-between px-6 flex-shrink-0">
      {/* Left: Logo and page context */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-base font-bold text-db-text-primary tracking-tight">
            EU Macro Intelligence
          </h1>
          <p className="text-[10px] text-db-text-muted">
            AI-Powered Risk Advisory • Deutsche Bank
          </p>
        </div>
      </div>

      {/* Right: Time, Alerts, Mode */}
      <div className="flex items-center gap-4">
        {/* Current Time */}
        <div className="hidden md:block">
          <p className="text-xs font-mono text-db-text-secondary">{currentTime}</p>
        </div>

        {/* Alert Indicator */}
        <div className="relative">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="relative p-2 rounded-xl hover:bg-db-surface-light/50 transition-colors"
          >
            {criticalAlertCount > 0 ? (
              <BellDot size={18} className="text-db-warning" />
            ) : (
              <Bell size={18} className="text-db-text-secondary" />
            )}
            {criticalAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-db-danger text-[9px] font-bold text-white flex items-center justify-center">
                {criticalAlertCount}
              </span>
            )}
          </button>

          {/* Alert dropdown */}
          {showAlerts && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-12 w-72 glass-card p-3 shadow-xl z-50"
            >
              <p className="text-xs font-semibold text-db-text-secondary mb-2">
                Active Alerts
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-db-danger/10">
                  <Circle size={8} className="text-db-danger fill-db-danger" />
                  <span className="text-xs text-db-text-primary">Italian debt crisis — BTP spread @ 185bps</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-db-warning/10">
                  <Circle size={8} className="text-db-warning fill-db-warning" />
                  <span className="text-xs text-db-text-primary">French downgrade to AA-</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-db-warning/10">
                  <Circle size={8} className="text-db-warning fill-db-warning" />
                  <span className="text-xs text-db-text-primary">German IP contraction -1.2% MoM</span>
                </div>
              </div>
              <button className="w-full mt-2 text-xs text-db-accent font-medium py-1.5 hover:text-blue-300 transition-colors">
                View All Alerts →
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}
