"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, RefreshCw, Info, Brain, Sparkles, ChevronDown, ChevronUp,
  AlertTriangle, Lightbulb, Target, ShieldCheck, CheckCircle2,
} from "lucide-react";
import {
  Skeleton, SkeletonLine, SkeletonForecastCard, SkeletonKPIInsight,
} from "@/components/shared/Skeleton";
import {
  InflationDirectionCard, EURUSDMovementCard,
  BondYieldPressureCard, RecessionStagflationCard,
} from "@/components/forecast/ForecastCards";
import { AIReasoningPipeline } from "@/components/forecast/AIReasoningPipeline";
import type { ForecastAPIResponse, SidebarInsight } from "@/lib/types";

// ─── Mode options for the switch ──────────────────────────────────────
type ForecastMode = "base_case" | "risk_case" | "opportunity_case";

const modeConfig: Record<ForecastMode, { label: string; icon: any; color: string; description: string }> = {
  base_case: { label: "Base Case", icon: Target, color: "#3B82F6", description: "Most likely macro trajectory" },
  risk_case: { label: "Risk View", icon: AlertTriangle, color: "#E5484D", description: "Downside risks & tail events" },
  opportunity_case: { label: "Opportunity", icon: Lightbulb, color: "#2FAE60", description: "Upside potential & alpha generation" },
};

export default function ForecastPage() {
  const [data, setData] = useState<ForecastAPIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [horizon, setHorizon] = useState("quarterly");
  const [selectedCountries, setSelectedCountries] = useState(["DE", "FR", "IT", "ES", "NL"]);
  // Note: Cards use self-contained mock data — API fetch is for sidebar insights only
  const [forecastMode, setForecastMode] = useState<ForecastMode>("base_case");
  const [showMethodology, setShowMethodology] = useState(false);
  const [sidebarData, setSidebarData] = useState<SidebarInsight | null>(null);
  const [sidebarLoading, setSidebarLoading] = useState(true);
  const fetchCountRef = useRef(0);

  // ── Fetch forecast data ──────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    fetchCountRef.current += 1;
    setLoading(true);
    setFetchFailed(false);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const params = new URLSearchParams();
      params.set("countries", selectedCountries.join(","));
      params.set("horizon", horizon);
      const res = await fetch(`/api/forecast?${params.toString()}`, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      console.error("Failed to fetch forecasts", e);
      if (fetchCountRef.current < 2) {
        setTimeout(() => fetchData(), 1500);
      } else {
        setFetchFailed(true);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedCountries, horizon]);

  useEffect(() => {
    const controller = new AbortController();
    const fallbackTimeout = setTimeout(() => {
      if (!data && fetchCountRef.current >= 2) {
        setFetchFailed(true);
        setLoading(false);
      }
    }, 6000);
    fetchData();
    return () => { controller.abort(); clearTimeout(fallbackTimeout); };
  }, [fetchData]);

  // ── Fetch sidebar insight for forecast page ──────────────────────────
  const fetchSidebar = useCallback(async () => {
    setSidebarLoading(true);
    try {
      const res = await fetch("/api/sidebar?page=forecast");
      const json = await res.json();
      setSidebarData(json.insight);
    } catch (e) {
      console.error("Failed to fetch sidebar", e);
    } finally {
      setSidebarLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSidebar();
  }, [fetchSidebar, forecastMode]);

  const toggleCountry = (code: string) => {
    setSelectedCountries((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // ── Sidebar content by mode ──────────────────────────────────────────
  const modeSummary = useMemo(() => {
    if (!data) return "";
    switch (forecastMode) {
      case "base_case":
        return `ECB expected to cut 25bp in ${data.ecbPath.nextMeetings[0]?.date ?? "March"}, with rate reaching 3.10% by September. Inflation trending toward 2% target. EUR/USD under near-term pressure from rate differential.`;
      case "risk_case":
        return `Recession risk elevated at ${Math.round(data.recession.probabilities.reduce((s, r) => s + r.probability, 0) / data.recession.probabilities.length)}% average. Italian BTP spread widening to ${data.bonds.spreads[0]?.predicted ?? 220}bps is the primary tail risk. German industrial contraction deepening.`;
      case "opportunity_case":
        return `Duration extension opportunity as ECB pivot approaches. German GDP recovery forecast (+0.8%) supports loan book improvement. IT-DE spread widening creates relative value in BTPs.`;
    }
  }, [data, forecastMode]);

  const modeTakeaway = useMemo(() => {
    if (!data) return "";
    switch (forecastMode) {
      case "base_case":
        return `Prepare for gradual ECB easing cycle — extend bond duration, monitor NIM compression of 12-18bps.`;
      case "risk_case":
        return `Increase provisioning for German manufacturing loans by 10%. Reduce BTP duration by 15-20%. Activate CEE energy crisis contingency.`;
      case "opportunity_case":
        return `Scale German corporate lending origination. Add BTP relative value position. Extend EU government bond duration 0.5yr ahead of ECB pivot.`;
    }
  }, [data, forecastMode]);

  const modeActions = useMemo(() => {
    if (!sidebarData) return [
      "Monitor ECB March meeting for rate path guidance",
      "Review energy sector loan book exposure concentrations",
      "Prepare risk committee briefing on Italian spread dynamics",
    ];
    return sidebarData.actions.slice(0, 2);
  }, [sidebarData]);

  // ── Loading State ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="w-6 h-6 rounded" />
              <SkeletonLine width="w-44" height="h-5" />
            </div>
            <SkeletonLine width="w-56" height="h-3" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Skeleton className="w-48 h-7 rounded-lg" />
            <Skeleton className="w-40 h-7 rounded-lg" />
            <Skeleton className="w-24 h-7 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonForecastCard key={i} />)}
        </div>
        <SkeletonKPIInsight />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 sm:p-6 flex flex-col items-center justify-center gap-4 min-h-[50vh]">
        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
          <TrendingUp size={22} className="text-amber-500" />
        </div>
        <div className="text-center max-w-md">
          <p className="text-sm font-semibold text-text-primary mb-1">
            {fetchFailed ? "Unable to load forecasts" : "Loading forecasts..."}
          </p>
          <p className="text-xs text-text-secondary leading-relaxed">
            {fetchFailed
              ? "Forecast data is taking longer than expected."
              : "Generating AI-augmented macro forecasts for European markets."}
          </p>
        </div>
        {fetchFailed && (
          <button
            onClick={() => { fetchCountRef.current = 0; fetchData(); }}
            className="flex items-center gap-1.5 px-4 h-9 rounded-lg bg-primary text-white text-xs font-semibold hover:brightness-110 transition-colors shadow-sm"
          >
            <RefreshCw size={13} />
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
      {/* ═══════════════════════════════════════════════════════════════
          HEADER + CONTROLS
      ════════════════════════════════════════════════════════════════ */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm">
              <TrendingUp size={14} className="text-white" />
            </div>
            Forecast Engine
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            AI-augmented predictions for European macro &amp; markets
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Horizon toggle */}
          <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5">
            {[
              { value: "quarterly", label: "1Q" },
              { value: "6months", label: "2Q" },
              { value: "1year", label: "1Y" },
            ].map((h) => (
              <button
                key={h.value}
                onClick={() => setHorizon(h.value)}
                className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                  horizon === h.value ? "bg-white text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>
          {/* Country toggles */}
          <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5">
            {["DE", "FR", "IT", "ES", "NL"].map((c) => (
              <button
                key={c}
                onClick={() => toggleCountry(c)}
                className={`w-7 h-6 rounded text-[9px] font-semibold transition-all ${
                  selectedCountries.includes(c)
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowMethodology(true)}
            className="flex items-center gap-1 px-2 h-7 rounded-lg bg-gray-100 text-text-secondary text-[9px] hover:text-text-primary transition-colors"
          >
            <Info size={10} /> How it works
          </button>
          <button
            onClick={fetchData}
            className="flex items-center gap-1 px-2 h-7 rounded-lg bg-gray-100 text-text-secondary text-[9px] hover:text-text-primary transition-colors"
          >
            <RefreshCw size={10} /> Refresh
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN GRID: 2×2 Forecast Cards + Sidebar
      ════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: 2×2 Cards */}
        <div className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InflationDirectionCard delay={0} />
            <EURUSDMovementCard delay={0.05} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BondYieldPressureCard delay={0.1} />
            <RecessionStagflationCard delay={0.15} />
          </div>

          {/* AI Agent Chain */}
          <AIReasoningPipeline />
        </div>

        {/* Right: Forecast Intelligence Sidebar */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-20 space-y-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-[#EEF2FB] rounded-xl border border-primary/5 overflow-hidden"
            >
              {/* ── Sidebar Header ── */}
              <div className="flex items-center gap-2.5 px-4 h-12 border-b border-gray-200/60 bg-white/40">
                <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/10">
                  <Brain size={12} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-text-primary">
                    What DB Should Prepare For
                  </p>
                  <p className="text-[8px] text-[#4A5568]/60">Based on these predictions</p>
                </div>
                {/* Mode Switch */}
                <div className="flex gap-0.5 bg-white/80 rounded-lg p-0.5 border border-gray-200/60">
                  {(Object.entries(modeConfig) as [ForecastMode, typeof modeConfig[ForecastMode]][]).map(([key, config]) => {
                    const Icon = config.icon;
                    const isActive = forecastMode === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setForecastMode(key)}
                        className={`px-1.5 py-1 rounded text-[8px] font-semibold transition-all flex items-center gap-0.5 ${
                          isActive
                            ? "bg-white shadow-sm"
                            : "text-text-secondary hover:text-text-primary"
                        }`}
                        style={isActive ? { color: config.color } : {}}
                        title={config.description}
                      >
                        <Icon size={9} />
                        <span className="hidden sm:inline">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Sidebar Body ── */}
              <div className="p-3 space-y-3">
                {/* Mode indicator */}
                <motion.div
                  key={forecastMode}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/80 border border-gray-200/60"
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: modeConfig[forecastMode].color }} />
                  <span className="text-[10px] font-medium" style={{ color: modeConfig[forecastMode].color }}>
                    {modeConfig[forecastMode].label}
                  </span>
                  <span className="text-[8px] text-text-secondary">{modeConfig[forecastMode].description}</span>
                </motion.div>

                {/* Summary */}
                <motion.div
                  key={`summary-${forecastMode}`}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="rounded-xl border border-primary/10 bg-white p-3.5 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-md bg-primary/5 flex items-center justify-center">
                      <Sparkles size={8} className="text-primary" />
                    </div>
                    <span className="text-[9px] font-semibold text-text-secondary uppercase tracking-wider">Summary</span>
                  </div>
                  <p className="text-[11px] text-text-primary leading-relaxed">
                    {modeSummary || sidebarData?.topInsight || "Analyzing forecast data to generate strategic insights..."}
                  </p>
                </motion.div>

                {/* Key Takeaway */}
                <motion.div
                  key={`takeaway-${forecastMode}`}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-xl border border-[#F5A623]/20 bg-amber-50/60 p-3 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-4 h-4 rounded-md bg-amber-100 flex items-center justify-center">
                      <Lightbulb size={8} className="text-amber-600" />
                    </div>
                    <span className="text-[9px] font-semibold text-amber-700 uppercase tracking-wider">Key Takeaway</span>
                  </div>
                  <p className="text-[11px] text-amber-900/90 leading-snug font-medium">
                    {modeTakeaway || "Monitor ECB guidance and energy price trends for directional signals."}
                  </p>
                </motion.div>

                {/* Recommended Action */}
                <motion.div
                  key={`action-${forecastMode}`}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="rounded-xl bg-white border border-green-100 p-3 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-md bg-green-50 flex items-center justify-center">
                      <ShieldCheck size={9} className="text-green-600" />
                    </div>
                    <span className="text-[9px] font-semibold text-green-700 uppercase tracking-wider">
                      Recommended Action
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {modeActions.map((action, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 size={10} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-[10px] text-text-primary leading-snug">{action}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          METHODOLOGY MODAL
      ════════════════════════════════════════════════════════════════ */}
      {showMethodology && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowMethodology(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 p-4"
          >
            <div className="card p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <Info size={14} className="text-primary" /> Methodology
                </h3>
                <button onClick={() => setShowMethodology(false)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                  <ChevronDown size={14} className="text-text-secondary" />
                </button>
              </div>
              <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
                <p><strong className="text-text-primary">Model Type:</strong> Factor-based forecasting combines historical relationships with current economic data to generate predictions.</p>
                <p><strong className="text-text-primary">Confidence:</strong> Levels reflect data volatility and model certainty. Higher volatility = lower confidence.</p>
                <p><strong className="text-text-primary">AI Interpretation:</strong> AI provides narrative interpretation and contextual analysis, not raw predictions.</p>
                <p><strong className="text-text-primary">Sources:</strong> ECB, Eurostat, Bloomberg, national statistical agencies, market-implied pricing.</p>
                <p><strong className="text-text-primary">Update Frequency:</strong> Daily refresh with new data.</p>
              </div>
              <button
                onClick={() => setShowMethodology(false)}
                className="w-full mt-4 py-2 rounded-lg bg-primary text-white text-xs font-medium hover:brightness-110 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
