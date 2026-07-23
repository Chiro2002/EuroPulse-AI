"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Newspaper,
  ShieldAlert,
  TrendingUp,
  Beaker,
  Bell,
  BellDot,
  Circle,
  User,
  PanelRightClose,
  PanelRightOpen,
  ChevronDown,
  LogOut,
  Settings,
  HelpCircle,
  Menu,
  X,
} from "lucide-react";

interface TopBarProps {
  alertCount?: number;
  criticalAlertCount?: number;
  panelOpen?: boolean;
  onTogglePanel?: () => void;
}

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/risk", label: "Risk Radar", icon: ShieldAlert },
  { href: "/forecast", label: "Forecast", icon: TrendingUp },
  { href: "/simulator", label: "Simulator", icon: Beaker },
];

// ─── Custom SVG "Z" Logo ──────────────────────────────────────────────
function ZLogo() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-white"
    >
      <path
        d="M4 4H20L12 20L4 4Z"
        fill="currentColor"
        fillOpacity="0.9"
      />
      <path
        d="M8 7H16L12 15L8 7Z"
        fill="white"
        fillOpacity="0.3"
      />
      <path
        d="M6 6L18 6L12 18L6 6Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TopBar({
  alertCount = 5,
  criticalAlertCount = 2,
  panelOpen = true,
  onTogglePanel = () => {},
}: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState("");
  const [showAlerts, setShowAlerts] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Glassmorphic scroll effect
  useEffect(() => {
    const mainEl = document.querySelector("main");
    if (!mainEl) return;
    const handleScroll = () => {
      setScrolled(mainEl.scrollTop > 10);
    };
    mainEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => mainEl.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-alerts-dropdown]") && !target.closest("[data-user-menu]")) {
        setShowAlerts(false);
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };



  return (
    <header
      className={`h-14 flex items-center justify-between px-3 sm:px-5 flex-shrink-0 relative z-40 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-white border-b border-border"
      }`}
    >
      {/* LEFT: Logo + Nav */}
      <div className="flex items-center gap-2 sm:gap-6 flex-shrink-0">
        {/* EuroPulse AI Logo with stylized Z */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/20 group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-105">
            <ZLogo />
          </div>
          <div className="hidden sm:flex items-baseline gap-1">
            <span className="text-sm font-bold text-text-primary tracking-tight">
              EuroPulse
            </span>
            <span className="text-[9px] font-semibold text-primary bg-primary/5 px-1.5 py-0.5 rounded-md leading-none border border-primary/10">
              AI
            </span>
          </div>
        </button>

        {/* Vertical divider */}
        <div className="hidden sm:block w-px h-6 bg-border/60" />

        {/* Desktop Navigation - labels hidden on md screens, full on lg+ */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`relative flex items-center gap-1.5 px-2 lg:px-3 h-8 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  active
                    ? "text-primary"
                    : "text-[#4A5568] hover:text-text-primary hover:bg-surface-hover"
                }`}
              >
                <Icon
                  size={15}
                  className={`transition-all duration-200 ${
                    active
                      ? "text-primary"
                      : "text-[#4A5568]/60 group-hover:text-text-secondary"
                  }`}
                />
                <span className="hidden lg:inline relative">
                  {item.label}
                  {/* Micro-glow on hover */}
                  <span
                    className={`absolute -inset-x-2 -inset-y-1 rounded-lg transition-opacity duration-300 ${
                      active ? "opacity-100 bg-primary/5" : "opacity-0 group-hover:opacity-100 bg-gray-100/50"
                    }`}
                    style={{ zIndex: -1 }}
                  />
                </span>
                {/* Underline active indicator */}
                {active && (
                  <motion.div
                    layoutId="activeNavUnderline"
                    className="absolute -bottom-0.5 left-2 right-2 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Mobile menu toggle (md:hidden) */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 rounded-lg hover:bg-surface-hover transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? (
            <X size={18} className="text-text-primary" />
          ) : (
            <Menu size={18} className="text-text-primary" />
          )}
        </button>
      </div>

      {/* RIGHT: Time, Alerts, User Avatar, Panel Toggle */}
      <div className="flex items-center gap-1">
        {/* Time */}
        <div className="hidden xl:block text-xs font-mono text-[#4A5568]/60 tabular-nums px-1.5">
          {currentTime}
        </div>

        {/* Notification Bell */}
        <div className="relative" data-alerts-dropdown>
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="relative p-1.5 rounded-lg hover:bg-surface-hover transition-colors"
          >
            {criticalAlertCount > 0 ? (
              <BellDot size={16} className="text-amber-500" />
            ) : (
              <Bell size={16} className="text-[#4A5568]/60" />
            )}
            {criticalAlertCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 text-[7px] font-bold text-white flex items-center justify-center shadow-sm shadow-red-500/30">
                {criticalAlertCount}
              </span>
            )}
          </button>

          {/* Alerts Dropdown */}
          <AnimatePresence>
            {showAlerts && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-dropdown z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <p className="text-xs font-semibold text-text-primary">Alerts</p>
                  <span className="text-[10px] text-[#4A5568]/60 bg-gray-100 px-2 py-0.5 rounded-full">
                    {alertCount} total
                  </span>
                </div>
                <div className="p-2 space-y-0.5 max-h-64 overflow-y-auto">
                  {[
                    { severity: "danger", text: "Italian debt crisis — BTP spread @ 185bps" },
                    { severity: "warning", text: "French downgrade to AA-" },
                    { severity: "warning", text: "German IP contraction -1.2% MoM" },
                    { severity: "info", text: "ECB hints at rate hold through Q3" },
                  ].map((alert, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg transition-colors hover:bg-gray-50 ${
                        alert.severity === "danger"
                          ? "bg-red-50"
                          : alert.severity === "warning"
                          ? "bg-amber-50"
                          : ""
                      }`}
                    >
                      <Circle
                        size={6}
                        className={`mt-1.5 flex-shrink-0 ${
                          alert.severity === "danger"
                            ? "text-red-500 fill-red-500"
                            : alert.severity === "warning"
                            ? "text-amber-500 fill-amber-500"
                            : "text-[#4A5568]/40 fill-[#4A5568]/40"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-text-primary leading-snug">{alert.text}</p>
                        <span className="text-[9px] font-medium uppercase tracking-wider text-[#4A5568]/50">
                          {alert.severity === "danger" ? "Critical" : alert.severity === "warning" ? "High" : "Info"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => router.push("/news")}
                  className="w-full text-xs text-primary font-medium py-2.5 border-t border-gray-100 hover:bg-gray-50 transition-colors rounded-b-xl"
                >
                  View all alerts
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200/60 mx-1" />

        {/* User Avatar with Dropdown */}
        <div className="relative" data-user-menu>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-surface-hover transition-colors group"
          >
            {/* Suited man placeholder — professional headshot */}
            <div className="w-7 h-7 rounded-full overflow-hidden border border-gray-200 shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face"
                alt="John Doe"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.classList.add('bg-gradient-to-br', 'from-primary', 'to-accent', 'flex', 'items-center', 'justify-center');
                  (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-white text-[10px] font-bold">JD</span>';
                }}
              />
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-medium text-text-primary leading-tight">John Doe</p>
              <p className="text-[9px] text-[#4A5568]/60 leading-tight">Senior Analyst</p>
            </div>
            <ChevronDown size={11} className="text-[#4A5568]/40 hidden lg:block transition-transform duration-200 group-hover:rotate-180" />
          </button>

          {/* User Dropdown */}
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-gray-200 shadow-dropdown z-50"
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-text-primary">John Doe</p>
                  <p className="text-xs text-[#4A5568]/60">john.doe@db.com</p>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/5 border border-primary/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    <span className="text-[9px] font-medium text-primary">Senior Analyst</span>
                  </div>
                </div>
                <div className="p-1">
                  {[
                    { icon: User, label: "Profile" },
                    { icon: Settings, label: "Settings" },
                    { icon: HelpCircle, label: "Help & Support" },
                  ].map((item, i) => (
                    <button
                      key={i}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#4A5568] hover:text-text-primary hover:bg-gray-50 transition-colors"
                    >
                      <item.icon size={14} className="text-[#4A5568]/50" />
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="border-t border-gray-100 p-1">
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut size={14} className="text-red-400" />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Panel Toggle - hidden on mobile */}
        <button
          onClick={onTogglePanel}
          className="hidden sm:flex relative p-1.5 rounded-lg hover:bg-surface-hover transition-colors group ml-0.5"
          title={panelOpen ? "Close insight panel" : "Open insight panel"}
        >
          {panelOpen ? (
            <PanelRightClose size={16} className="text-primary" />
          ) : (
            <PanelRightOpen size={16} className="text-[#4A5568]/60 group-hover:text-text-secondary" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 bg-white border-b border-border shadow-lg overflow-hidden md:hidden z-50"
          >
            <div className="p-2 space-y-0.5">
              {navItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? "bg-primary/5 text-primary"
                        : "text-[#4A5568] hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={16} className={active ? "text-primary" : "text-[#4A5568]/60"} />
                    {item.label}
                    {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
