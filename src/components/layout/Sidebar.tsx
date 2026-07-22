"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Newspaper,
  ShieldAlert,
  TrendingUp,
  Beaker,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/risk", label: "Risk", icon: ShieldAlert },
  { href: "/forecast", label: "Forecast", icon: TrendingUp },
  { href: "/simulator", label: "Simulator", icon: Beaker },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative flex flex-col bg-db-navy-light border-r border-db-border transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-db-border flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-db-accent to-blue-400 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">EM</span>
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="overflow-hidden"
          >
            <p className="text-sm font-semibold text-db-text-primary leading-tight">
              EU Macro
            </p>
            <p className="text-[10px] text-db-text-muted">Intelligence</p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? "bg-db-accent/15 text-db-accent"
                  : "text-db-text-secondary hover:text-db-text-primary hover:bg-db-surface-light/50"
              }`}
            >
              {/* Active indicator bar */}
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 w-1 h-6 bg-db-accent rounded-r-full"
                />
              )}

              <Icon
                size={20}
                className={`flex-shrink-0 transition-colors ${
                  isActive ? "text-db-accent" : ""
                }`}
              />
              
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap">
                  {item.label}
                </span>
              )}

              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="absolute left-14 px-2 py-1 bg-db-navy-lighter text-db-text-primary text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 border-t border-db-border text-db-text-muted hover:text-db-text-primary transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
