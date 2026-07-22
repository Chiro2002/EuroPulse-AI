"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  AlertOctagon,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Activity,
  Zap,
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Area,
  AreaChart,
} from "recharts";
import { EuropeMap } from "@/components/shared/EuropeMap";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { CountryDetailDrawer } from "@/components/dashboard/CountryDetailDrawer";

import type { DashboardData, CountryRisk } from "@/lib/types";

const alertSeverityStyles = {
  critical: { bg: "bg-db-danger/15", border: "border-db-danger/30", icon: AlertOctagon, color: "#EF4444", text: "text-db-danger" },
  high: { bg: "bg-db-warning/15", border: "border-db-warning/30", icon: AlertTriangle, color: "#F59E0B", text: "text-db-warning" },
  medium: { bg: "bg-db-accent/15", border: "border-db-accent/30", icon: AlertCircle, color: "#3B82F6", text: "text-db-accent" },
  low: { bg: "bg-db-success/15", border: "border-db-success/30", icon: AlertCircle, color: "#10B981", text: "text-db-success" },
};

// Severity to number for TopEvent display
const severityNumStyle = (sev: number) => {
  if (sev >= 8) return { color: "#EF4444", bg: "rgba(239,68,68,0.15)", label: "Critical" };
  if (sev >= 6) return { color: "#F59E0B", bg: "rgba(245,158,11,0.15)", label: "High" };
  if (sev >= 4) return { color: "#3B82F6", bg: "rgba(59,130,246,0.15)", label: "Medium" };
  return { color: "#10B981", bg: "rgba(16,185,129,0.15)", label: "Low" };
};

// Custom tooltip for mini charts
const MiniChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card px-2 py-1 shadow-lg">
        <p className="text-[10px] text-db-text-muted">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-[10px] font-semibold" style={{ color: p.color }}>
            {p.name}: {p.value.toFixed(2)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Sparkline mini-chart component
function Sparkline({ data, color, trend, index }: { data: number[]; color: string; trend: "up" | "down" | "stable"; index: number }) {
  const chartData = data.map((v, i) => ({ i, v }));
  const lineColor = trend === "up" ? "#10B981" : trend === "down" ? "#EF4444" : "#94A3B8";
  const gradId = `spark-grad-${index}`;
  return (
    <div className="w-full h-8">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity={0.2} />
              <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={lineColor}
            strokeWidth={1.5}
            fill={`url(#${gradId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Mini market chart
function MiniMarketChart({ data, color, name }: { data: { day: string; value: number }[]; color: string; name: string }) {
  return (
    <div className="h-16">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
          <Tooltip content={<MiniChartTooltip />} />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<CountryRisk | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("Failed to load dashboard", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Map data from countryRisks
  const mapData = useMemo(() => {
    if (!data) return {};
    const md: Record<string, { value: number; color: string }> = {};
    data.countryRisks.forEach((cr) => {
      md[cr.country] = { value: cr.riskScore, color: cr.color + "99" };
    });
    return md;
  }, [data]);

  const handleCountryClick = (code: string) => {
    const country = data?.countryRisks.find((c) => c.country === code) ?? null;
    setSelectedCountry(country);
    setDrawerOpen(true);
  };

  const refreshInsights = async () => {
    setInsightsLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      setData((prev) => prev ? { ...prev, quickInsights: json.quickInsights } : json);
    } catch (e) {
      console.error("Failed to refresh insights", e);
    } finally {
      setInsightsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner fullPage text="Loading dashboard data..." />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <p className="text-db-text-muted">Failed to load dashboard. Please try again.</p>
      </div>
    );
  }

  const alertStyle = alertSeverityStyles[data.topAlert.severity];
  const AlertIcon = alertStyle.icon;

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* ============================== */}
      {/* 1. TOP ALERT BANNER */}
      {/* ============================== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`sticky top-0 z-30 rounded-xl border ${alertStyle.border} ${alertStyle.bg} backdrop-blur-md p-3 flex items-center gap-3`}
      >
        <div className="relative flex-shrink-0">
          <AlertIcon size={22} color={alertStyle.color} />
          <span
            className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-ping"
            style={{ backgroundColor: alertStyle.color, opacity: 0.5 }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${alertStyle.text}`}>
            {data.topAlert.headline}
          </p>
          <p className="text-[11px] text-db-text-muted mt-0.5">
            {new Date(data.topAlert.timestamp).toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <a
          href={data.topAlert.link}
          className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium text-db-accent"
        >
          View details <ChevronRight size={12} />
        </a>
      </motion.div>

      {/* ============================== */}
      {/* 2. KEY METRICS ROW (6 cards) */}
      {/* ============================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {data.keyMetrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card p-3 hover:bg-db-surface-light/50 transition-colors"
          >
            <p className="text-[10px] font-medium text-db-text-muted uppercase tracking-wider mb-1">
              {metric.label}
            </p>
            <p className="text-lg font-bold text-db-text-primary">{metric.value}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {metric.trend === "up" && <TrendingUp size={10} className="text-db-danger" />}
              {metric.trend === "down" && <TrendingDown size={10} className="text-db-success" />}
              {metric.trend === "stable" && <Minus size={10} className="text-db-text-muted" />}
              <span
                className={`text-[9px] font-medium ${
                  metric.trend === "up"
                    ? "text-db-danger"
                    : metric.trend === "down"
                    ? "text-db-success"
                    : "text-db-text-muted"
                }`}
              >
                {metric.change}
              </span>
            </div>
            <Sparkline data={metric.sparkline} color="#3B82F6" trend={metric.trend} index={i} />
          </motion.div>
        ))}
      </div>

      {/* ============================== */}
      {/* 3. EUROPE MAP (60%) + TOP EVENTS (40%) */}
      {/* ============================== */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3"
        >
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-db-text-primary">Europe Risk Heatmap</h3>
                <p className="text-[10px] text-db-text-muted">Real-time country risk assessment</p>
              </div>
              <div className="flex items-center gap-2">
                {(["green", "yellow", "orange", "red"] as const).map((lvl) => (
                  <div key={lvl} className="flex items-center gap-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          lvl === "green" ? "#10B981" : lvl === "yellow" ? "#F59E0B" : lvl === "orange" ? "#F97316" : "#EF4444",
                      }}
                    />
                    <span className="text-[8px] text-db-text-muted capitalize">{lvl}</span>
                  </div>
                ))}
              </div>
            </div>
            <EuropeMap
              countryData={mapData}
              onCountryClick={handleCountryClick}
              selectedCountry={selectedCountry?.country ?? null}
              height={360}
            />
          </div>
        </motion.div>

        {/* Top Events */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <div className="glass-card p-4 h-full">
            <h3 className="text-sm font-bold text-db-text-primary mb-3">Top Events Today</h3>
            <div className="space-y-2">
              {data.topEvents.map((event, i) => {
                const style = severityNumStyle(event.severity);
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card-hover p-3"
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold"
                        style={{ backgroundColor: style.bg, color: style.color }}
                      >
                        {event.severity}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-db-text-primary leading-snug line-clamp-2">
                          {event.headline}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {event.affectedCountries.map((code) => {
                            const country = data.countryRisks.find((c) => c.country === code);
                            return (
                              <span key={code} className="text-xs" title={country?.countryName ?? code}>
                                {country?.flag ?? code}
                              </span>
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                          {event.impactTags.slice(0, 2).map((tag, ti) => (
                            <span
                              key={ti}
                              className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                                tag.includes("↑") ? "bg-db-danger/10 text-db-danger" : "bg-db-success/10 text-db-success"
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                          <span className="text-[9px] text-db-text-muted ml-auto">{event.timeAgo}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <a
              href="/news"
              className="flex items-center justify-center gap-1 mt-3 py-2 rounded-lg bg-db-surface hover:bg-db-surface-light/50 transition-colors text-xs font-medium text-db-accent"
            >
              View all news <ArrowRight size={12} />
            </a>
          </div>
        </motion.div>
      </div>

      {/* ============================== */}
      {/* 4. MARKET PULSE */}
      {/* ============================== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4"
      >
        <h3 className="text-sm font-bold text-db-text-primary mb-3 flex items-center gap-2">
          <Activity size={14} className="text-db-accent" />
          Market Pulse
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Bonds */}
          <div>
            <p className="text-[10px] font-semibold text-db-text-muted uppercase tracking-wider mb-2">Bonds</p>
            <div className="space-y-2">
              {data.marketPulse.bonds.map((series) => (
                <div key={series.name}>
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="text-db-text-primary">{series.name}</span>
                    <span className="text-db-text-muted">{series.data[series.data.length - 1]?.value.toFixed(2)}%</span>
                  </div>
                  <MiniMarketChart data={series.data} color={series.color} name={series.name} />
                </div>
              ))}
            </div>
          </div>

          {/* Equities */}
          <div>
            <p className="text-[10px] font-semibold text-db-text-muted uppercase tracking-wider mb-2">Equities</p>
            <div className="space-y-2">
              {data.marketPulse.equities.map((series) => (
                <div key={series.name}>
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="text-db-text-primary">{series.name}</span>
                    <span className="text-db-text-muted">{Math.round(series.data[series.data.length - 1]?.value ?? 0)}</span>
                  </div>
                  <MiniMarketChart data={series.data} color={series.color} name={series.name} />
                </div>
              ))}
            </div>
          </div>

          {/* FX */}
          <div>
            <p className="text-[10px] font-semibold text-db-text-muted uppercase tracking-wider mb-2">FX</p>
            <div className="space-y-2">
              {data.marketPulse.fx.map((series) => (
                <div key={series.name}>
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="text-db-text-primary">{series.name}</span>
                    <span className="text-db-text-muted">{series.data[series.data.length - 1]?.value.toFixed(4)}</span>
                  </div>
                  <MiniMarketChart data={series.data} color={series.color} name={series.name} />
                </div>
              ))}
            </div>
          </div>

          {/* Commodities */}
          <div>
            <p className="text-[10px] font-semibold text-db-text-muted uppercase tracking-wider mb-2">Commodities</p>
            <div className="space-y-2">
              {data.marketPulse.commodities.map((series) => (
                <div key={series.name}>
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="text-db-text-primary">{series.name}</span>
                    <span className="text-db-text-muted">${Math.round(series.data[series.data.length - 1]?.value ?? 0)}</span>
                  </div>
                  <MiniMarketChart data={series.data} color={series.color} name={series.name} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ============================== */}
      {/* 5. STRESS RADAR + QUICK INSIGHTS */}
      {/* ============================== */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Stress Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2"
        >
          <div className="glass-card p-4 h-full flex flex-col">
            <h3 className="text-sm font-bold text-db-text-primary mb-3 flex items-center gap-2">
              <Zap size={14} className="text-db-warning" />
              Stress Radar
            </h3>

            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-[220px] h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={[
                    { factor: "Inflation", score: data.stressRadar.inflation, fullMark: 100 },
                    { factor: "Energy", score: data.stressRadar.energy, fullMark: 100 },
                    { factor: "FX", score: data.stressRadar.fx, fullMark: 100 },
                    { factor: "Geo-political", score: data.stressRadar.geopolitical, fullMark: 100 },
                    { factor: "Bond", score: data.stressRadar.bond, fullMark: 100 },
                    { factor: "Housing", score: data.stressRadar.housing, fullMark: 100 },
                  ]}>
                    <PolarGrid stroke="#1E2756" />
                    <PolarAngleAxis dataKey="factor" tick={{ fill: "#94A3B8", fontSize: 9 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#64748B", fontSize: 8 }} />
                    <Radar name="Current" dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.15} />
                  </RadarChart>
                </ResponsiveContainer>
                {/* Center score */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-[22px] font-bold text-db-text-primary">{data.stressRadar.overall}</p>
                    <p className="text-[9px] text-db-text-muted">/ 100</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                { label: "Inflation", value: data.stressRadar.inflation, color: "#F59E0B" },
                { label: "Energy", value: data.stressRadar.energy, color: "#EF4444" },
                { label: "FX", value: data.stressRadar.fx, color: "#3B82F6" },
                { label: "Geo-Pol", value: data.stressRadar.geopolitical, color: "#F97316" },
                { label: "Bond", value: data.stressRadar.bond, color: "#8B5CF6" },
                { label: "Housing", value: data.stressRadar.housing, color: "#10B981" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className="text-[10px] font-medium" style={{ color: item.color }}>{item.value}</p>
                  <p className="text-[8px] text-db-text-muted">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3"
        >
          <div className="glass-card p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-db-text-primary flex items-center gap-2">
                <Sparkles size={14} className="text-db-warning" />
                Quick Insights
              </h3>
              <button
                onClick={refreshInsights}
                disabled={insightsLoading}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-db-surface hover:bg-db-surface-light/50 transition-colors text-[10px] text-db-text-muted disabled:opacity-50"
              >
                <RefreshCw size={11} className={insightsLoading ? "animate-spin" : ""} />
                {insightsLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            <div className="flex-1 space-y-3">
              {data.quickInsights.map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-db-accent/5 to-db-surface border border-db-accent/10"
                >
                  <div
                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor:
                        i === 0 ? "rgba(239,68,68,0.15)" : i === 1 ? "rgba(245,158,11,0.15)" : "rgba(59,130,246,0.15)",
                      color: i === 0 ? "#EF4444" : i === 1 ? "#F59E0B" : "#3B82F6",
                    }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-xs text-db-text-primary leading-relaxed flex-1">{insight}</p>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-db-border">
              <span className="text-[9px] text-db-text-muted flex items-center gap-1">
                <Sparkles size={9} />
                Powered by AI analysis
              </span>
              <button
                onClick={refreshInsights}
                className="text-[10px] text-db-accent hover:text-blue-300 transition-colors font-medium"
              >
                Refresh insights
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ============================== */}
      {/* COUNTRY DETAIL DRAWER */}
      {/* ============================== */}
      <CountryDetailDrawer
        country={selectedCountry}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
