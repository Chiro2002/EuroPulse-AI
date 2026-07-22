"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, RefreshCw, Info, Sparkles, Brain, ChevronDown, ChevronUp, ArrowUp, ArrowDown,
} from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { InflationForecastCard, ECBCard, FXCard, BondsCard, RecessionCard, SectorsCard } from "@/components/forecast/ForecastCards";
import type { ForecastAPIResponse, ForecastDriver } from "@/lib/types";

export default function ForecastPage() {
  const [data, setData] = useState<ForecastAPIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [horizon, setHorizon] = useState("quarterly");
  const [selectedCountries, setSelectedCountries] = useState(["DE", "FR", "IT", "ES", "NL"]);
  const [narrative, setNarrative] = useState("");
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);
  const [showDrivers, setShowDrivers] = useState(true);
  const [showNarrative, setShowNarrative] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("countries", selectedCountries.join(","));
      params.set("horizon", horizon);
      const res = await fetch(`/api/forecast?${params.toString()}`);
      const json = await res.json();
      setData(json);
      setNarrative(json.narrative || "");
    } catch (e) {
      console.error("Failed to fetch forecasts", e);
    } finally {
      setLoading(false);
    }
  }, [selectedCountries, horizon]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const generateNarrative = async () => {
    setNarrativeLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("countries", selectedCountries.join(","));
      params.set("horizon", horizon);
      params.set("narrative", "true");
      const res = await fetch(`/api/forecast?${params.toString()}`);
      const json = await res.json();
      setNarrative(json.narrative || "");
    } catch (e) {
      console.error("Failed to generate narrative", e);
    } finally {
      setNarrativeLoading(false);
    }
  };

  const toggleCountry = (code: string) => {
    setSelectedCountries((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  if (loading) {
    return <div className="p-6"><LoadingSpinner fullPage text="Generating forecasts..." /></div>;
  }

  if (!data) {
    return <div className="p-6 flex items-center justify-center min-h-[400px]"><p className="text-db-text-muted">Failed to load forecasts.</p></div>;
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-db-text-primary flex items-center gap-2">
            <TrendingUp size={22} className="text-db-success" />
            Forecast Engine
          </h1>
          <p className="text-sm text-db-text-muted mt-1">AI-augmented predictions for European macro &amp; markets</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Time horizon toggle */}
          <div className="flex gap-0.5 bg-db-surface rounded-lg p-0.5">
            {[
              { value: "quarterly", label: "Next Quarter" },
              { value: "6months", label: "6 Months" },
              { value: "1year", label: "1 Year" },
            ].map((h) => (
              <button
                key={h.value}
                onClick={() => setHorizon(h.value)}
                className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all ${
                  horizon === h.value ? "bg-db-accent text-white" : "text-db-text-muted hover:text-db-text-primary"
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>
          {/* Country selector */}
          <div className="flex gap-0.5 bg-db-surface rounded-lg p-0.5">
            {["DE", "FR", "IT", "ES", "NL"].map((c) => (
              <button
                key={c}
                onClick={() => toggleCountry(c)}
                className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                  selectedCountries.includes(c) ? "bg-db-accent text-white" : "text-db-text-muted hover:text-db-text-primary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <button onClick={() => setShowMethodology(true)} className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-db-surface text-db-text-muted text-[10px] hover:text-db-text-primary transition-colors">
            <Info size={11} /> How this works
          </button>
          <button onClick={fetchData} className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-db-surface text-db-text-muted text-[10px] hover:text-db-text-primary transition-colors">
            <RefreshCw size={11} /> Refresh
          </button>
        </div>
      </div>

      {/* Top Insights Bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Most Likely ECB Move", value: data.topInsights?.likelyECBMove || "—", color: "#3B82F6" },
          { label: "Highest Recession Risk", value: data.topInsights?.highestRecessionRisk || "—", color: "#EF4444" },
          { label: "Biggest Forecast Change", value: data.topInsights?.biggestForecastChange || "—", color: "#F59E0B" },
        ].map((insight, i) => (
          <motion.div key={insight.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-3">
            <p className="text-[9px] text-db-text-muted uppercase tracking-wider mb-1">{insight.label}</p>
            <p className="text-xs font-bold" style={{ color: insight.color }}>{insight.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Forecast Grid (2x3) */}
      {data.inflation && data.inflation.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InflationForecastCard inflation={data.inflation} delay={0} />
          <ECBCard ecbPath={data.ecbPath} delay={0.05} />
          <FXCard fx={data.fx} delay={0.1} />
          <BondsCard bonds={data.bonds} delay={0.15} />
          <RecessionCard recession={data.recession} delay={0.2} />
          <SectorsCard sectors={data.sectors} delay={0.25} />
        </div>
      )}

      {/* Key Drivers Panel */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-4">
        <button onClick={() => setShowDrivers(!showDrivers)} className="flex items-center justify-between w-full mb-3">
          <h3 className="text-sm font-bold text-db-text-primary flex items-center gap-2">
            <TrendingUp size={14} className="text-db-accent" /> Key Drivers
          </h3>
          {showDrivers ? <ChevronUp size={14} className="text-db-text-muted" /> : <ChevronDown size={14} className="text-db-text-muted" />}
        </button>
        <AnimatePresence>
          {showDrivers && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-semibold text-db-success mb-2 flex items-center gap-1">
                    <ArrowUp size={10} /> What&apos;s moving forecasts up
                  </p>
                  <div className="space-y-2">
                    {(data.drivers?.positive || []).map((d, i) => (
                      <DriverCard key={i} driver={d} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-db-danger mb-2 flex items-center gap-1">
                    <ArrowDown size={10} /> What&apos;s moving forecasts down
                  </p>
                  <div className="space-y-2">
                    {(data.drivers?.negative || []).map((d, i) => (
                      <DriverCard key={i} driver={d} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* AI Forecast Narrative */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-4">
        <button onClick={() => setShowNarrative(!showNarrative)} className="flex items-center justify-between w-full mb-3">
          <h3 className="text-sm font-bold text-db-text-primary flex items-center gap-2">
            <Brain size={14} className="text-db-warning" /> The Story Behind the Forecasts
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); generateNarrative(); }}
              disabled={narrativeLoading}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-db-accent/15 text-db-accent text-[10px] font-medium hover:bg-db-accent/25 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={10} className={narrativeLoading ? "animate-spin" : ""} />
              Regenerate
            </button>
            {showNarrative ? <ChevronUp size={14} className="text-db-text-muted" /> : <ChevronDown size={14} className="text-db-text-muted" />}
          </div>
        </button>
        <AnimatePresence>
          {showNarrative && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              {narrativeLoading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-3 bg-db-border rounded w-full" />
                  <div className="h-3 bg-db-border rounded w-5/6" />
                  <div className="h-3 bg-db-border rounded w-4/6" />
                  <div className="h-3 bg-db-border rounded w-full" />
                  <div className="h-3 bg-db-border rounded w-3/4" />
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <Sparkles size={16} className="text-db-warning mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-db-text-primary leading-relaxed whitespace-pre-line">
                    {narrative || "Click 'Regenerate' to generate an AI-powered narrative."}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Methodology Modal */}
      <AnimatePresence>
        {showMethodology && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowMethodology(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 p-4">
              <div className="glass-card p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-db-text-primary flex items-center gap-2">
                    <Info size={14} className="text-db-accent" /> Methodology
                  </h3>
                  <button onClick={() => setShowMethodology(false)} className="p-1 rounded-lg hover:bg-db-surface transition-colors">
                    <ChevronDown size={14} className="text-db-text-muted" />
                  </button>
                </div>
                <div className="space-y-3 text-xs text-db-text-secondary leading-relaxed">
                  <p><strong className="text-db-text-primary">Model Type:</strong> Factor-based forecasting models combine historical relationships with current economic data to generate predictions.</p>
                  <p><strong className="text-db-text-primary">Confidence:</strong> Confidence levels reflect data volatility and model certainty. Higher volatility = lower confidence.</p>
                  <p><strong className="text-db-text-primary">AI Interpretation:</strong> AI (Gemini) provides narrative interpretation and contextual analysis, not raw predictions.</p>
                  <p><strong className="text-db-text-primary">Sources:</strong> ECB, Eurostat, Bloomberg, national statistical agencies, market-implied pricing.</p>
                  <p><strong className="text-db-text-primary">Update Frequency:</strong> Forecasts are updated daily with new data. AI narrative regenerated on demand.</p>
                </div>
                <button onClick={() => setShowMethodology(false)} className="w-full mt-4 py-2 rounded-lg bg-db-accent text-white text-xs font-medium hover:bg-blue-600 transition-colors">Close</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Driver card sub-component
function DriverCard({ driver }: { driver: ForecastDriver }) {
  const isUp = driver.direction === "up";
  return (
    <motion.div
      initial={{ opacity: 0, x: isUp ? -10 : 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-2 p-2.5 rounded-lg border-l-2 text-xs"
      style={{
        borderLeftColor: isUp ? "#10B981" : "#EF4444",
        backgroundColor: isUp ? "rgba(16,185,129,0.05)" : "rgba(239,68,68,0.05)",
      }}
    >
      <div className="flex-1">
        <div className="flex items-center gap-1.5">
          {isUp ? <ArrowUp size={10} className="text-db-success" /> : <ArrowDown size={10} className="text-db-danger" />}
          <span className="font-medium text-db-text-primary">{driver.label}</span>
          <span className="text-[9px] px-1 py-0.5 rounded bg-db-surface" style={{ color: isUp ? "#10B981" : "#EF4444" }}>{driver.magnitude}</span>
        </div>
        <p className="text-[10px] text-db-text-muted mt-0.5">{driver.description}</p>
      </div>
    </motion.div>
  );
}
