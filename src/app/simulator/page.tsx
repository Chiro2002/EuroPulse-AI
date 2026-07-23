"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Beaker, Play, RotateCcw, Save, Info, Sliders, X,
  Brain, Sparkles, ShieldCheck, CheckCircle2, Bell,
} from "lucide-react";
import { SCENARIO_DEFINITIONS } from "@/lib/data/scenarios";
import { runSimulation, runCustomSimulation } from "@/lib/logic/simulatorEngine";
import type { SimulationResult, DBAction } from "@/lib/types";
import { ShockSelector, type ShockType } from "@/components/simulator/ShockSelector";
import { ShockTransmissionFlow } from "@/components/simulator/ShockTransmissionFlow";
import { DBImpactKPIs } from "@/components/simulator/DBImpactKPIs";

// Map scenario IDs to shock types
const scenarioToShock: Record<string, ShockType> = {
  oil_spike_20pct: "oil_spike",
  oil_spike_40pct: "oil_spike",
  russia_escalation: "war_escalation",
  ecb_emergency_cut: "ecb_rate",
  ecb_hike: "ecb_rate",
  eu_recession: "eu_recession",
  stagflation: "eu_recession",
  currency_crisis: "currency_weakening",
};

// Mock AI functions
function generateMockNarrative(result: SimulationResult): string {
  const totalPnL = result.totalDBPnL;
  const topCountries = Object.entries(result.countryImpacts)
    .sort(([, a], [, b]) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 3)
    .map(([c]) => c);
  return `In the "${result.scenario}" scenario, the sequence of events unfolds rapidly. The initial trigger — ${result.cascadeSteps[0]?.event || "the shock event"} — immediately impacts market pricing, with key metrics showing significant moves within days. Secondary effects compound through the financial system within weeks.\n\nThe hardest-hit countries are ${topCountries.join(", ")}, where economic sensitivity amplifies the impact. Energy-intensive and export-dependent sectors face disproportionate pressure on margins and employment.\n\nFor Deutsche Bank, the estimated total P&L impact is approximately €${Math.abs(totalPnL).toFixed(0)}M (${totalPnL >= 0 ? "positive" : "negative"}). The most affected business lines require immediate attention.`;
}

function generateMockActions(result: SimulationResult): DBAction[] {
  return [
    { category: "IMMEDIATE", department: "Risk", action: `Increase loan loss provisions by €${Math.round(Math.abs(result.totalDBPnL) * 0.15)}M for affected sectors`, reason: "Scenario indicates elevated credit risk" },
    { category: "IMMEDIATE", department: "Treasury", action: "Hedge additional 15% of EUR/USD exposure using 3-month forwards", reason: "EUR volatility expected to increase" },
    { category: "IMMEDIATE", department: "Trading", action: "Reduce duration on peripheral bond holdings by 20%", reason: "Spread widening risk" },
    { category: "SHORT_TERM", department: "Corporate", action: "Contact top 20 most exposed clients for stress assessment", reason: "Proactive engagement for covenant breaches" },
    { category: "SHORT_TERM", department: "Risk", action: "Run portfolio-wide stress test incorporating this scenario at 1.5x intensity", reason: "Severity may exceed baseline" },
    { category: "MONITORING", department: "Credit Risk", action: "Weekly review of manufacturing and energy sector NPL trends", reason: "Early warning indicators critical" },
  ];
}

export default function SimulatorPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [intensity, setIntensity] = useState(1.0);
  const [timeHorizon, setTimeHorizon] = useState<"immediate" | "3M" | "6M" | "12M">("12M");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [customParams, setCustomParams] = useState({
    oilChange: 0, ecbRateChange: 0, eurUsdChange: 0, gasChange: 0, geopoliticalIntensity: 0,
  });
  const [narrative, setNarrative] = useState("");
  const [actions, setActions] = useState<DBAction[]>([]);

  // ── Shock selector state ────────────────────────────────────────────
  const [shockType, setShockType] = useState<ShockType>("oil_spike");
  const [shockIntensity, setShockIntensity] = useState(20);

  const shockIntensityLabel = useMemo(() => {
    const labels: Record<ShockType, string> = {
      oil_spike: "Oil", war_escalation: "Conflict", ecb_rate: "Rate",
      eu_recession: "GDP", currency_weakening: "EUR",
    };
    return `${labels[shockType]} ${shockIntensity >= 0 ? "+" : ""}${shockIntensity}%`;
  }, [shockType, shockIntensity]);

  const shockIntensityCaption = useMemo(() => {
    const labels: Record<ShockType, string> = {
      oil_spike: "Oil prices increase by", war_escalation: "Conflict intensity increases by",
      ecb_rate: "ECB rate changes by", eu_recession: "GDP contraction of",
      currency_weakening: "EUR/USD weakens by",
    };
    return `${labels[shockType]} ${shockIntensity}% vs. baseline`;
  }, [shockType, shockIntensity]);

  // ── Run simulation ──────────────────────────────────────────────────
  const runPreset = useCallback((id: string) => {
    setSelectedId(id);
    const shock = scenarioToShock[id] || "oil_spike";
    setShockType(shock);
    setIsAnimating(true);
    setNarrative("");
    setActions([]);
    setTimeout(() => {
      const simResult = runSimulation(id, intensity, timeHorizon);
      setResult(simResult);
      setIsAnimating(false);
      setNarrative(generateMockNarrative(simResult));
      setActions(generateMockActions(simResult));
    }, 500);
  }, [intensity, timeHorizon]);

  const runCustom = useCallback(() => {
    setSelectedId("custom");
    setIsAnimating(true);
    setNarrative("");
    setActions([]);
    setTimeout(() => {
      const simResult = runCustomSimulation(customParams, intensity);
      setResult(simResult);
      setIsAnimating(false);
      setNarrative(generateMockNarrative(simResult));
      setActions(generateMockActions(simResult));
    }, 500);
  }, [customParams, intensity]);

  const reset = useCallback(() => {
    setSelectedId(null);
    setResult(null);
    setIsAnimating(false);
    setNarrative("");
    setActions([]);
    setShowCustom(false);
  }, []);

  const sortedScenarios = useMemo(() =>
    [...SCENARIO_DEFINITIONS].sort((a, b) => b.severity - a.severity),
  []);

  const actionsByCategory = useMemo(() => {
    const cats: Record<string, DBAction[]> = {
      IMMEDIATE: [], SHORT_TERM: [], MONITORING: [],
    };
    actions.forEach((a) => {
      if (cats[a.category]) cats[a.category].push(a);
    });
    return cats;
  }, [actions]);

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* ═══════════════════════════════════════════════════════════════
          PAGE HEADER
      ════════════════════════════════════════════════════════════════ */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
              <Beaker size={14} className="text-white" />
            </div>
            Scenario Simulator
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Simulate macro shocks and see cascading impacts across markets, economies, and DB portfolio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowInfoModal(true)}
            className="flex items-center gap-1 px-2 h-7 rounded-lg border border-border text-[9px] text-text-secondary hover:border-primary/30 hover:text-primary transition-all"
          >
            <Info size={10} /> How this works
          </button>
          {result && (
            <>
              <button className="flex items-center gap-1 px-2 h-7 rounded-lg bg-primary/10 border border-primary/20 text-[9px] text-primary hover:bg-primary/15 transition-all">
                <Save size={10} /> Save
              </button>
              <button onClick={reset}
                className="flex items-center gap-1 px-2 h-7 rounded-lg border border-border text-[9px] text-text-secondary hover:border-[#E5484D]/30 hover:text-[#E5484D] transition-all"
              >
                <RotateCcw size={10} /> Reset
              </button>
            </>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          PRESET SELECTION (shown when no result)
      ════════════════════════════════════════════════════════════════ */}
      {!result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Preset Scenarios */}
          <div className="card p-5">
            <h2 className="text-sm font-bold text-text-primary mb-4">Preset Scenarios</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {sortedScenarios.map((scenario) => (
                <motion.button
                  key={scenario.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => runPreset(scenario.id)}
                  className="bg-white rounded-xl p-4 text-left transition-all border border-border hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{scenario.icon}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: scenario.severity >= 8 ? "rgba(239,68,68,0.12)" : scenario.severity >= 6 ? "rgba(245,162,35,0.12)" : "rgba(30,95,217,0.12)",
                        color: scenario.severity >= 8 ? "#E5484D" : scenario.severity >= 6 ? "#F5A623" : "#1E5FD9",
                      }}
                    >Sev {scenario.severity}/10</span>
                  </div>
                  <p className="text-xs font-semibold text-text-primary mb-1">{scenario.name}</p>
                  <p className="text-[9px] text-text-secondary line-clamp-2 leading-relaxed">{scenario.description}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                    <span className="text-[8px] text-text-secondary truncate max-w-[120px]">📖 {scenario.historicalPrecedent}</span>
                    <Play size={10} className="text-primary flex-shrink-0" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Custom Scenario Builder */}
          <div className="card p-5">
            <button onClick={() => setShowCustom(!showCustom)}
              className="w-full flex items-center justify-between text-sm font-bold text-text-primary"
            >
              <span className="flex items-center gap-2"><Sliders size={14} className="text-primary" /> Custom Scenario Builder</span>
              <span className="text-text-secondary">{showCustom ? "▲" : "▼"}</span>
            </button>
            <AnimatePresence>
              {showCustom && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4 pt-4 border-t border-border">
                    {[
                      { key: "oilChange", label: "🛢️ Oil Price Change", min: -30, max: 50, step: 5, suffix: "%", renderValue: (v: number) => `${v >= 0 ? "+" : ""}${v}%` },
                      { key: "gasChange", label: "⚡ Gas Price Change", min: -30, max: 100, step: 5, suffix: "%", renderValue: (v: number) => `${v >= 0 ? "+" : ""}${v}%` },
                      { key: "eurUsdChange", label: "💶 EUR/USD Change", min: -15, max: 10, step: 1, suffix: "%", renderValue: (v: number) => `${v >= 0 ? "+" : ""}${v}%` },
                      { key: "ecbRateChange", label: "📈 ECB Rate Change", min: -100, max: 150, step: 10, suffix: "bp", renderValue: (v: number) => `${v >= 0 ? "+" : ""}${v}bp` },
                    ].map(({ key, label, min, max, step, renderValue }) => {
                      const sliderVal = customParams[key as keyof typeof customParams];
                      return (
                        <div key={key}>
                          <label className="text-[10px] text-text-secondary font-medium uppercase tracking-wider flex items-center justify-between">
                            <span>{label}</span>
                            <span className="text-primary text-xs tabular-nums">{renderValue(sliderVal)}</span>
                          </label>
                          <input type="range" min={min} max={max} step={step} value={sliderVal}
                            onChange={(e) => setCustomParams({ ...customParams, [key]: parseInt(e.target.value) })}
                            className="w-full h-1.5 rounded-full appearance-none cursor-pointer mt-2 bg-gray-200 accent-primary
                              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer"
                          />
                          <div className="flex justify-between text-[8px] text-text-secondary mt-0.5">
                            <span>{min}{key === "ecbRateChange" ? "bp" : "%"}</span>
                            <span>{Math.round((min + max) / 2)}{key === "ecbRateChange" ? "bp" : "%"}</span>
                            <span>{max}{key === "ecbRateChange" ? "bp" : "%"}</span>
                          </div>
                        </div>
                      );
                    })}
                    <div className="md:col-span-2">
                      <label className="text-[10px] text-text-secondary font-medium uppercase tracking-wider flex items-center justify-between">
                        <span>🌍 Geopolitical Intensity</span>
                        <span className="text-primary text-xs tabular-nums">{customParams.geopoliticalIntensity}/10</span>
                      </label>
                      <input type="range" min="0" max="10" step="1" value={customParams.geopoliticalIntensity}
                        onChange={(e) => setCustomParams({ ...customParams, geopoliticalIntensity: parseInt(e.target.value) })}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer mt-2 bg-gray-200 accent-primary
                          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer"
                      />
                      <div className="flex justify-between text-[8px] text-text-secondary mt-0.5">
                        <span>Stable</span><span>Tensions</span><span>Conflict</span>
                      </div>
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={runCustom}
                    className="w-full mt-5 py-2.5 rounded-lg bg-primary text-white text-xs font-semibold hover:brightness-110 transition-all shadow-sm"
                  >🎯 Run Custom Simulation</motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Info banner */}
          <div className="card p-4 border-primary/10 bg-primary/[0.02]">
            <div className="flex items-center gap-3 text-xs text-text-secondary">
              <Sparkles size={14} className="text-primary flex-shrink-0" />
              <p>Select a preset scenario or build your own. Watch cascading effects propagate through markets, economies, and Deutsche Bank&apos;s portfolio in real-time.</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          RESULTS VIEW — New Premium Design
      ════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {result && (
          <motion.div key={selectedId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Result header */}
            <div className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{result.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-text-primary">{result.scenario}</p>
                    <p className="text-[10px] text-text-secondary">Intensity: {result.intensity.toFixed(1)}x · Horizon: {result.timeHorizon} · Total P&L: €{Math.abs(result.totalDBPnL).toFixed(0)}M</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-border">
                    <Sliders size={11} className="text-text-secondary" />
                    <input type="range" min="0.5" max="2.0" step="0.1" value={intensity}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        setIntensity(v);
                        if (selectedId && selectedId !== "custom") runPreset(selectedId);
                        else if (selectedId === "custom") runCustom();
                      }}
                      className="w-20 h-1 rounded-full appearance-none cursor-pointer bg-gray-200 accent-primary
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                    />
                    <span className="text-[10px] font-bold text-primary tabular-nums w-8 text-right">{intensity.toFixed(1)}x</span>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-gray-50 border border-border p-0.5">
                    {(["immediate", "3M", "6M", "12M"] as const).map((opt) => (
                      <button key={opt} onClick={() => { setTimeHorizon(opt); if (selectedId && selectedId !== "custom") runPreset(selectedId); }}
                        className={`text-[9px] px-2 py-1 rounded-md font-medium transition-all ${timeHorizon === opt ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary"}`}
                      >{opt === "immediate" ? "Now" : opt}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main grid: 2/3 left + 1/3 right */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              {/* Left: 3 columns — Premium design sections */}
              <div className="lg:col-span-3 space-y-5">
                {/* Section 1: Choose a Shock */}
                <ShockSelector
                  selected={shockType}
                  onSelect={setShockType}
                  intensity={shockIntensity}
                  onIntensityChange={setShockIntensity}
                  intensityLabel={shockIntensityLabel}
                  intensityCaption={shockIntensityCaption}
                />

                {/* Section 2: Shock Transmission Flow */}
                <ShockTransmissionFlow delay={0.15} />

                {/* Section 3: DB Impact KPIs */}
                <DBImpactKPIs delay={0.25} />
              </div>

              {/* Right: 2 columns — Action Sidebar */}
              <div className="lg:col-span-2">
                <div className="sticky top-20 space-y-3">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-[#EEF2FB] rounded-xl border border-primary/5 overflow-hidden"
                  >
                    {/* Sidebar Header */}
                    <div className="flex items-center gap-2.5 px-4 h-12 border-b border-gray-200/60 bg-white/40">
                      <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/10">
                        <Brain size={12} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-text-primary">If This Shock Happens</p>
                        <p className="text-[8px] text-[#4A5568]/60">DB should take these actions</p>
                      </div>
                    </div>

                    <div className="p-3 space-y-3">
                      {/* Summary */}
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="rounded-xl border border-primary/10 bg-white p-3.5 shadow-sm"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-4 h-4 rounded-md bg-primary/5 flex items-center justify-center">
                            <Sparkles size={8} className="text-primary" />
                          </div>
                          <span className="text-[9px] font-semibold text-text-secondary uppercase tracking-wider">Summary</span>
                        </div>
                        <p className="text-[11px] text-text-primary leading-relaxed">
                          {isAnimating ? "Running simulation..." : narrative.slice(0, 180) + "..."}
                        </p>
                      </motion.div>

                      {/* Action Checklist */}
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className="flex items-center gap-2 mb-2 px-0.5">
                          <Bell size={11} className="text-[#E5484D]" />
                          <span className="text-[9px] font-semibold text-[#4A5568]/70 uppercase tracking-widest">
                            Action Checklist
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {isAnimating ? (
                            [1, 2, 3].map((i) => (
                              <div key={i} className="h-9 bg-gray-100 rounded-lg animate-pulse" />
                            ))
                          ) : (
                            <>
                              {/* Immediate actions */}
                              {actionsByCategory.IMMEDIATE.slice(0, 2).map((action, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.45 + i * 0.05 }}
                                  className="rounded-lg border border-[#E5484D]/20 bg-white p-2.5 border-l-2"
                                  style={{ borderLeftColor: "#E5484D" }}
                                >
                                  <div className="flex items-start gap-1.5">
                                    <div className="w-4 h-4 rounded bg-[#E5484D]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                      <span className="text-[7px] font-bold text-[#E5484D]">!</span>
                                    </div>
                                    <div>
                                      <span className="text-[8px] font-bold text-[#E5484D] uppercase tracking-wider">IMMEDIATE</span>
                                      <p className="text-[10px] text-text-primary leading-snug mt-0.5">{action.action}</p>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                              {/* Short-term actions */}
                              {actionsByCategory.SHORT_TERM.slice(0, 1).map((action, i) => (
                                <motion.div
                                  key={`st-${i}`}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.55 }}
                                  className="rounded-lg border border-[#F5A623]/20 bg-white p-2.5 border-l-2"
                                  style={{ borderLeftColor: "#F5A623" }}
                                >
                                  <div className="flex items-start gap-1.5">
                                    <div className="w-4 h-4 rounded bg-[#F5A623]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                      <span className="text-[7px] font-bold text-[#F5A623]">→</span>
                                    </div>
                                    <div>
                                      <span className="text-[8px] font-bold text-[#F5A623] uppercase tracking-wider">SHORT TERM</span>
                                      <p className="text-[10px] text-text-primary leading-snug mt-0.5">{action.action}</p>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </>
                          )}
                        </div>
                      </motion.div>

                      {/* Recommended Action */}
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="rounded-xl bg-white border border-green-100 p-3 shadow-sm"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-4 h-4 rounded-md bg-green-50 flex items-center justify-center">
                            <ShieldCheck size={9} className="text-green-600" />
                          </div>
                          <span className="text-[9px] font-semibold text-green-700 uppercase tracking-wider">Recommended Action</span>
                        </div>
                        <div className="space-y-1.5">
                          {isAnimating ? (
                            <div className="h-8 bg-gray-100 rounded animate-pulse" />
                          ) : (
                            actions.slice(0, 2).map((action, i) => (
                              <div key={i} className="flex items-start gap-1.5">
                                <CheckCircle2 size={10} className="text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-[10px] text-text-primary leading-snug">{action.action}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════
          INFO MODAL
      ════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showInfoModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="card p-6 max-w-lg w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2"><Info size={14} className="text-primary" /> How the Simulator Works</h3>
                <button onClick={() => setShowInfoModal(false)} className="text-text-secondary hover:text-text-primary"><X size={16} /></button>
              </div>
              <div className="space-y-3 text-xs text-text-secondary">
                <div className="p-3 rounded-lg bg-gray-50 border border-border">
                  <p className="font-semibold text-text-primary mb-1">🎯 Factor-Based Simulation</p>
                  <p>Uses factor-based rules combining historical relationships with current market data to estimate cascading impacts.</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border border-border">
                  <p className="font-semibold text-text-primary mb-1">📊 Country Sensitivity</p>
                  <p>Each country has a sensitivity factor that amplifies or dampens impacts based on energy dependence and economic structure.</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border border-border">
                  <p className="font-semibold text-text-primary mb-1">🏦 DB Portfolio Impact</p>
                  <p>Business line impacts estimated based on disclosed exposure by country and sector. Directional, validate against internal models.</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex justify-end">
                <button onClick={() => setShowInfoModal(false)}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:brightness-110 transition-all"
                >Got it</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
