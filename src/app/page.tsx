"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Brain,
  Clock,
  Activity,
  Map as MapIcon,
  Database,
} from "lucide-react";
import dynamic from "next/dynamic";
import {
  Skeleton,
  SkeletonLine,
  SkeletonChart,
} from "@/components/shared/Skeleton";
import type { CountryDetailData } from "@/components/shared/EuropeMap";

import type { DashboardData, CountryRisk, ExecutiveBriefing } from "@/lib/types";

const EuropeMap = dynamic(
  () => import("@/components/shared/EuropeMap").then((m) => ({ default: m.EuropeMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center bg-gray-50 rounded-xl" style={{ height: 380 }}>
        <div className="flex items-center gap-2 text-text-secondary text-xs">
          <div className="animate-spin w-3 h-3 border-2 border-primary border-t-transparent rounded-full" />
          Loading map...
        </div>
      </div>
    ),
  }
);

// ─── Helpers ────────────────────────────────────────────────────────────

const criticalityConfig: Record<string, { color: string; bg: string; label: string; icon: typeof AlertTriangle }> = {
  crisis: { color: "#DC2626", bg: "rgba(220,38,38,0.12)", label: "CRISIS", icon: AlertOctagon },
  urgent: { color: "#EA580C", bg: "rgba(234,88,12,0.12)", label: "URGENT", icon: AlertTriangle },
  elevated: { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", label: "ELEVATED", icon: AlertTriangle },
  routine: { color: "#2FAE60", bg: "rgba(47,174,96,0.12)", label: "ROUTINE", icon: ShieldCheck },
};

const trendIcon = (t: "up" | "down" | "stable") =>
  t === "up" ? <TrendingUp size={12} className="text-[#E5484D]" /> :
  t === "down" ? <TrendingDown size={12} className="text-[#2FAE60]" /> :
  <Minus size={12} className="text-[#94A3B8]" />;

// ─── Compact Executive Brief ────────────────────────────────────────────

function BriefStrip({ briefing }: { briefing: ExecutiveBriefing }) {
  const cfg = criticalityConfig[briefing.criticalityLevel];
  const Icon = cfg.icon;
  const top3 = briefing.keyIntelligence.slice(0, 3);

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="card p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary/[0.03] to-transparent rounded-full -mr-12 -mt-12 pointer-events-none" />
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center ai-glow-subtle">
          <Brain size={18} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
              <Icon size={10} /> {cfg.label}
            </span>
            <span className="flex items-center gap-1 text-[9px] text-text-secondary">
              <Sparkles size={9} className="text-primary" /> AI brief
            </span>
          </div>
          <h2 className="text-sm font-bold text-text leading-snug mb-2">{briefing.headline}</h2>
          <div className="flex flex-wrap gap-2">
            {top3.map((k, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[11px] text-text-secondary bg-gray-50 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: i === 0 ? "#E5484D" : i === 1 ? "#F59E0B" : "#0018A8" }} />
                {k.insight.length > 80 ? k.insight.slice(0, 80) + "…" : k.insight}
              </span>
            ))}
          </div>
        </div>
        <div className="flex-shrink-0 hidden lg:flex items-center gap-2 text-[10px] text-text-secondary">
          <Activity size={10} />
          <span className="capitalize">{briefing.marketRegime.current.replace("_", " ")}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Metric Tile (no sparkline, compact) ────────────────────────────────

function MetricTile({ label, value, trend, subtitle }: { label: string; value: string; trend: "up" | "down" | "stable"; subtitle: string }) {
  return (
    <div className="card p-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium text-text-secondary uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-text mt-0.5">{value}</p>
        <div className="flex items-center gap-1 mt-0.5">
          {trendIcon(trend)}
          <span className={`text-[9px] font-medium ${trend === "up" ? "text-[#E5484D]" : trend === "down" ? "text-[#2FAE60]" : "text-text-secondary"}`}>
            {subtitle}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchFailed, setFetchFailed] = useState(false);
  const fetchCountRef = useRef(0);
  const dataRef = useRef(data);
  dataRef.current = data;

  const fetchDashboard = useCallback(async (signal?: AbortSignal) => {
    fetchCountRef.current += 1;
    setLoading(true);
    setFetchFailed(false);
    try {
      const res = await fetch("/api/dashboard", { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      console.error("Failed to load dashboard", e);
      if (fetchCountRef.current < 2) {
        // Auto-retry once after a short delay
        setTimeout(() => fetchDashboard(signal), 1500);
      } else {
        setFetchFailed(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const retry = useCallback(() => {
    fetchCountRef.current = 0;
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    const abortController = new AbortController();
    // Show fallback after 6 seconds if data hasn't arrived
    const fallbackTimeout = setTimeout(() => {
      if (!dataRef.current && fetchCountRef.current >= 2) {
        setFetchFailed(true);
        setLoading(false);
      }
    }, 6000);

    fetchDashboard(abortController.signal);

    return () => {
      abortController.abort();
      clearTimeout(fallbackTimeout);
    };
  }, [fetchDashboard]);

  const mapData = useMemo(() => {
    if (!data) return {};
    const md: Record<string, { value: number; color: string }> = {};
    data.countryRisks.forEach((cr) => { md[cr.country] = { value: cr.riskScore, color: cr.color + "99" }; });
    return md;
  }, [data]);

  // Build country details for the map tooltips
  const countryDetails: CountryDetailData[] = useMemo(() => {
    if (!data) return [];
    return data.countryRisks.map(cr => ({
      country: cr.country,
      countryName: cr.countryName,
      flag: cr.flag,
      riskScore: cr.riskScore,
      color: cr.color,
      breakdown: {
        inflation: cr.breakdown.inflation,
        energy: cr.breakdown.energy,
        debt: cr.breakdown.debt,
        geopolitical: cr.breakdown.geopolitical,
      },
    }));
  }, [data]);

  // ─── Loading ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-4 animate-fade-in">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <div className="flex-1 space-y-1.5">
              <SkeletonLine width="w-28" height="h-3" />
              <SkeletonLine width="w-3/4" height="h-3.5" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="card p-3"><SkeletonLine width="w-16" height="h-2.5" /><SkeletonLine width="w-20" height="h-5" /></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-4"><SkeletonChart height="h-[380px]" /></div>
          <div className="card p-4 space-y-2">
            {[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
          </div>
        </div>
        <div className="card p-4"><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-12 rounded-lg" />)}</div></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 sm:p-6 flex flex-col items-center justify-center gap-4 min-h-[50vh]">
        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
          <AlertTriangle size={22} className="text-amber-500" />
        </div>
        <div className="text-center max-w-md">
          <p className="text-sm font-semibold text-text-primary mb-1">
            {fetchFailed ? "Unable to load dashboard" : "Connecting to data sources..."}
          </p>
          <p className="text-xs text-text-secondary leading-relaxed">
            {fetchFailed
              ? "External market data APIs are taking longer than expected. This may be due to network latency or API rate limits."
              : "Fetching live market data from ECB, Eurostat, and other sources. This may take a moment on first load."}
          </p>
        </div>
        {fetchFailed && (
          <div className="flex items-center gap-2">
            <button
              onClick={retry}
              className="flex items-center gap-1.5 px-4 h-9 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors shadow-sm"
            >
              <RefreshCw size={13} />
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  // ─── Top metrics from API ─────────────────────────────────────────────
  const ecb = data.keyMetrics.find(m => m.label === "ECB Rate");
  const eurusd = data.keyMetrics.find(m => m.label === "EUR/USD");
  const infl = data.keyMetrics.find(m => m.label === "EU Inflation");
  const stress = data.keyMetrics.find(m => m.label === "Stress Score");

  return (
    <div className="p-4 sm:p-6 space-y-4 animate-fade-in">
      {/* ── Tiny status bar ── */}
      <div className="flex flex-wrap items-center justify-between text-[10px] text-text-secondary gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1"><Clock size={10} />{new Date((data as any).timestamp || Date.now()).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} CET</span>
          <span className="hidden sm:inline"><Database size={10} className="inline mr-1" />{(data as any).dataFreshness?.sourcesQueried || 0} sources</span>
          {(data as any).warning && <span className="text-amber-600"><AlertTriangle size={10} className="inline mr-1" />Fallback mode</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-primary"><Sparkles size={9} className="inline mr-0.5" />AI</span>
          <button onClick={() => fetchDashboard()} className="hover:text-text transition-colors"><RefreshCw size={10} /></button>
        </div>
      </div>

      {/* ── 1. KEY METRICS — 4 tiles at top ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ecb && <MetricTile label={ecb.label} value={ecb.value} trend={ecb.trend} subtitle={ecb.change} />}
        {eurusd && <MetricTile label={eurusd.label} value={eurusd.value} trend={eurusd.trend} subtitle="Live ECB ref. rate" />}
        {infl && <MetricTile label={infl.label} value={infl.value} trend={infl.trend} subtitle={infl.change} />}
        {stress && <MetricTile label={stress.label} value={stress.value} trend={stress.trend} subtitle="Composite" />}
      </div>

      {/* ── 2. MARKET PULSE — compact table ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-4">
        <h3 className="text-sm font-bold text-text mb-3 flex items-center gap-2">
          <Activity size={14} className="text-primary" />
          Market Pulse
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(["bonds","equities","fx","commodities"] as const).map(cat => (
            <div key={cat}>
              <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-2">
                {cat === "fx" ? "FX" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </p>
              <div className="space-y-1.5">
                {data.marketPulse[cat].map(s => {
                  const last = s.data[s.data.length - 1]?.value ?? 0;
                  const prev = s.data[s.data.length - 2]?.value ?? last;
                  const dir = last > prev ? "up" as const : last < prev ? "down" as const : "stable" as const;
                  return (
                    <div key={s.name} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-gray-50/60">
                      <span className="text-[11px] font-medium text-text">{s.name}</span>
                      <span className="flex items-center gap-1">
                        <span className="text-[11px] font-semibold text-text">
                          {s.name === "EUR/USD" || s.name === "EUR/GBP" || s.name === "EUR/CHF" ? last.toFixed(4) :
                           cat === "bonds" ? last.toFixed(2) + "%" :
                           "$" + Math.round(last)}
                        </span>
                        {trendIcon(dir)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── 3. MAP + TOP EVENTS side by side ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Map */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="card p-4 h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapIcon size={14} className="text-primary" />
                <h3 className="text-sm font-bold text-text">Europe Risk Heatmap</h3>
              </div>
              <span className="text-[9px] text-text-secondary">Hover · Click for details</span>
            </div>
            <EuropeMap
              countryData={mapData}
              countryDetails={countryDetails}
              height={380}
            />
          </div>
        </motion.div>

        {/* Right: Top Events */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="card p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-text">Top Events</h3>
              <a href="/news" className="flex items-center gap-1 text-[10px] font-medium text-primary hover:underline">
                All news <ArrowRight size={10} />
              </a>
            </div>
            <div className="flex-1 space-y-2">
              {data.topEvents.slice(0, 3).map((evt, i) => {
                const sevStyle = evt.severity >= 8 ? { color: "#E5484D", bg: "rgba(229,72,77,0.12)" } : evt.severity >= 6 ? { color: "#F5A623", bg: "rgba(245,166,35,0.12)" } : evt.severity >= 4 ? { color: "#3B82F6", bg: "rgba(59,130,246,0.12)" } : { color: "#2FAE60", bg: "rgba(47,174,96,0.12)" };
                return (
                  <div key={evt.id} className="flex items-start gap-2.5 p-3 rounded-lg bg-gray-50/60 hover:bg-gray-100 transition-colors">
                    <span className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: sevStyle.bg, color: sevStyle.color }}>{evt.severity}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-text leading-snug line-clamp-2">{evt.headline}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {evt.affectedCountries.slice(0, 3).map(c => { const cr = data.countryRisks.find(r => r.country === c); return <span key={c} className="text-xs" title={cr?.countryName}>{cr?.flag}</span>; })}
                        <span className="text-[9px] text-text-secondary ml-auto">{evt.timeAgo}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {data.topEvents.length > 3 && (
                <a href="/news" className="flex items-center justify-center gap-1 mt-2 py-2 rounded-lg text-[10px] font-medium text-primary hover:bg-gray-50 transition-colors">
                  View all {data.topEvents.length} events <ArrowRight size={10} />
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── EXECUTIVE BRIEF — compact strip at bottom ── */}
      {data.briefing && <BriefStrip briefing={data.briefing} />}

    </div>
  );
}
