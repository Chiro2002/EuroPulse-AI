"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Beaker,
  Play,
  RotateCcw,
  Save,
  ChevronDown,
  ChevronUp,
  Shield,
  Sparkles,
  History,
  Info,
  Sliders,
  X,
} from "lucide-react";
import { SCENARIO_DEFINITIONS } from "@/lib/data/scenarios";
import { runSimulation, runCustomSimulation } from "@/lib/logic/simulatorEngine";
import type { SimulationResult, DBAction } from "@/lib/types";
import CascadeVisualization from "@/components/simulator/CascadeVisualization";
import ComparisonPanel from "@/components/simulator/ComparisonPanel";
import CountryImpactPanel from "@/components/simulator/CountryImpactPanel";
import DBImpactSection from "@/components/simulator/DBImpactSection";
import SimulationControls from "@/components/simulator/SimulationControls";

export default function SimulatorPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [intensity, setIntensity] = useState(1.0);
  const [timeHorizon, setTimeHorizon] = useState<"immediate" | "3M" | "6M" | "12M">("12M");
  const [showNarrative, setShowNarrative] = useState(true);
  const [showActions, setShowActions] = useState(true);
  const [showHistorical, setShowHistorical] = useState(true);

  // Custom params
  const [customParams, setCustomParams] = useState({
    oilChange: 0,
    ecbRateChange: 0,
    eurUsdChange: 0,
    gasChange: 0,
    geopoliticalIntensity: 0,
  });

  // AI generated content (mock for now)
  const [narrative, setNarrative] = useState("");
  const [actions, setActions] = useState<DBAction[]>([]);

  const runPreset = useCallback((id: string) => {
    setSelectedId(id);
    setIsAnimating(true);
    setNarrative("");
    setActions([]);

    // Simulate with small delay for animation
    setTimeout(() => {
      const simResult = runSimulation(id, intensity, timeHorizon);
      setResult(simResult);
      setIsAnimating(false);
      // Set mock narrative/actions
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

  const [showInfoModal, setShowInfoModal] = useState(false);

  // Sort scenarios by severity
  const sortedScenarios = useMemo(() =>
    [...SCENARIO_DEFINITIONS].sort((a, b) => b.severity - a.severity),
  []);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-db-text-primary flex items-center gap-2">
            <Beaker size={22} className="text-db-accent" />
            Scenario Simulator
          </h1>
          <p className="text-sm text-db-text-muted mt-0.5">
            Simulate macro shocks and see cascading impacts in real-time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInfoModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-db-border text-[10px] text-db-text-muted hover:border-db-accent/30 hover:text-db-accent transition-all"
          >
            <Info size={12} />
            How this works
          </button>
          {result && (
            <>
              <button
                onClick={() => {}}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-db-accent/15 border border-db-accent/30 text-[10px] text-db-accent hover:bg-db-accent/20 transition-all"
              >
                <Save size={12} />
                Save
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-db-border text-[10px] text-db-text-muted hover:border-db-danger/30 hover:text-db-danger transition-all"
              >
                <RotateCcw size={12} />
                Reset
              </button>
            </>
          )}
        </div>
      </div>

      {/* Scenario Selection */}
      {!result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Preset Scenarios */}
          <div className="glass-card p-4">
            <h2 className="text-sm font-bold text-db-text-primary mb-3">
              Preset Scenarios
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {sortedScenarios.slice(0, 10).map((scenario) => (
                <motion.button
                  key={scenario.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => runPreset(scenario.id)}
                  className="glass-card-hover p-3 text-left transition-all border border-db-border hover:border-db-accent/30"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">{scenario.icon}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: scenario.severity >= 8 ? "rgba(239,68,68,0.15)" : scenario.severity >= 6 ? "rgba(245,158,11,0.15)" : "rgba(59,130,246,0.15)",
                        color: scenario.severity >= 8 ? "#EF4444" : scenario.severity >= 6 ? "#F59E0B" : "#3B82F6",
                      }}
                    >
                      Severity {scenario.severity}/10
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-db-text-primary mb-1">{scenario.name}</p>
                  <p className="text-[9px] text-db-text-muted line-clamp-2">{scenario.description}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-db-border/50">
                    <span className="text-[8px] text-db-text-muted truncate max-w-[120px]">
                      📖 {scenario.historicalPrecedent}
                    </span>
                    <Play size={10} className="text-db-accent flex-shrink-0" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Custom Scenario Builder */}
          <div className="glass-card p-4">
            <button
              onClick={() => setShowCustom(!showCustom)}
              className="w-full flex items-center justify-between text-sm font-bold text-db-text-primary"
            >
              <span className="flex items-center gap-2">
                <Sliders size={14} className="text-db-accent" />
                Custom Scenario Builder
              </span>
              {showCustom ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            <AnimatePresence>
              {showCustom && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-db-border">
                    {/* Oil Price Slider */}
                    <div>
                      <label className="text-[10px] text-db-text-muted font-medium uppercase tracking-wider flex items-center justify-between">
                        <span>🛢️ Oil Price Change</span>
                        <span className="text-db-accent text-xs tabular-nums">
                          {customParams.oilChange >= 0 ? "+" : ""}{customParams.oilChange}%
                        </span>
                      </label>
                      <input
                        type="range"
                        min="-30"
                        max="50"
                        step="5"
                        value={customParams.oilChange}
                        onChange={(e) => setCustomParams({ ...customParams, oilChange: parseInt(e.target.value) })}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer mt-2"
                        style={{
                          background: `linear-gradient(to right, #3B82F6 ${((customParams.oilChange + 30) / 80) * 100}%, #1E293B ${((customParams.oilChange + 30) / 80) * 100}%)`,
                        }}
                      />
                      <div className="flex justify-between text-[8px] text-db-text-muted mt-0.5">
                        <span>-30%</span>
                        <span>+10%</span>
                        <span>+50%</span>
                      </div>
                    </div>

                    {/* ECB Rate Slider */}
                    <div>
                      <label className="text-[10px] text-db-text-muted font-medium uppercase tracking-wider flex items-center justify-between">
                        <span>📈 ECB Rate Change</span>
                        <span className="text-db-accent text-xs tabular-nums">
                          {customParams.ecbRateChange >= 0 ? "+" : ""}{customParams.ecbRateChange}bp
                        </span>
                      </label>
                      <input
                        type="range"
                        min="-100"
                        max="150"
                        step="10"
                        value={customParams.ecbRateChange}
                        onChange={(e) => setCustomParams({ ...customParams, ecbRateChange: parseInt(e.target.value) })}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer mt-2"
                        style={{
                          background: `linear-gradient(to right, #3B82F6 ${((customParams.ecbRateChange + 100) / 250) * 100}%, #1E293B ${((customParams.ecbRateChange + 100) / 250) * 100}%)`,
                        }}
                      />
                      <div className="flex justify-between text-[8px] text-db-text-muted mt-0.5">
                        <span>-100bp</span>
                        <span>+25bp</span>
                        <span>+150bp</span>
                      </div>
                    </div>

                    {/* EUR/USD Slider */}
                    <div>
                      <label className="text-[10px] text-db-text-muted font-medium uppercase tracking-wider flex items-center justify-between">
                        <span>💶 EUR/USD Change</span>
                        <span className="text-db-accent text-xs tabular-nums">
                          {customParams.eurUsdChange >= 0 ? "+" : ""}{customParams.eurUsdChange}%
                        </span>
                      </label>
                      <input
                        type="range"
                        min="-15"
                        max="10"
                        step="1"
                        value={customParams.eurUsdChange}
                        onChange={(e) => setCustomParams({ ...customParams, eurUsdChange: parseInt(e.target.value) })}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer mt-2"
                        style={{
                          background: `linear-gradient(to right, #3B82F6 ${((customParams.eurUsdChange + 15) / 25) * 100}%, #1E293B ${((customParams.eurUsdChange + 15) / 25) * 100}%)`,
                        }}
                      />
                      <div className="flex justify-between text-[8px] text-db-text-muted mt-0.5">
                        <span>-15%</span>
                        <span>-2%</span>
                        <span>+10%</span>
                      </div>
                    </div>

                    {/* Gas Price Slider */}
                    <div>
                      <label className="text-[10px] text-db-text-muted font-medium uppercase tracking-wider flex items-center justify-between">
                        <span>⚡ Gas Price Change</span>
                        <span className="text-db-accent text-xs tabular-nums">
                          {customParams.gasChange >= 0 ? "+" : ""}{customParams.gasChange}%
                        </span>
                      </label>
                      <input
                        type="range"
                        min="-30"
                        max="100"
                        step="5"
                        value={customParams.gasChange}
                        onChange={(e) => setCustomParams({ ...customParams, gasChange: parseInt(e.target.value) })}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer mt-2"
                        style={{
                          background: `linear-gradient(to right, #3B82F6 ${((customParams.gasChange + 30) / 130) * 100}%, #1E293B ${((customParams.gasChange + 30) / 130) * 100}%)`,
                        }}
                      />
                      <div className="flex justify-between text-[8px] text-db-text-muted mt-0.5">
                        <span>-30%</span>
                        <span>+35%</span>
                        <span>+100%</span>
                      </div>
                    </div>

                    {/* Geopolitical Intensity */}
                    <div className="md:col-span-2">
                      <label className="text-[10px] text-db-text-muted font-medium uppercase tracking-wider flex items-center justify-between">
                        <span>🌍 Geopolitical Intensity (0-10)</span>
                        <span className="text-db-accent text-xs tabular-nums">{customParams.geopoliticalIntensity}/10</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={customParams.geopoliticalIntensity}
                        onChange={(e) => setCustomParams({ ...customParams, geopoliticalIntensity: parseInt(e.target.value) })}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer mt-2"
                        style={{
                          background: `linear-gradient(to right, #3B82F6 ${(customParams.geopoliticalIntensity / 10) * 100}%, #1E293B ${(customParams.geopoliticalIntensity / 10) * 100}%)`,
                        }}
                      />
                      <div className="flex justify-between text-[8px] text-db-text-muted mt-0.5">
                        <span>Stable</span>
                        <span>Tensions</span>
                        <span>Conflict</span>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={runCustom}
                    className="w-full mt-4 py-2.5 rounded-lg bg-gradient-to-r from-db-accent to-blue-600 text-white text-xs font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-db-accent/20"
                  >
                    🎯 Run Custom Simulation
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick info about the simulator */}
          <div className="glass-card p-4 border-db-accent/10">
            <div className="flex items-center gap-3 text-xs text-db-text-muted">
              <Sparkles size={14} className="text-db-accent flex-shrink-0" />
              <p>Select a preset scenario or build your own custom simulation. Watch the cascading effects propagate through markets, economies, and Deutsche Bank's portfolio in real-time.</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Simulation Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            key={selectedId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Top Bar — Scenario name + KPIs */}
            <div className="flex flex-wrap items-center gap-3 glass-card p-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{result.icon}</span>
                <div>
                  <p className="text-sm font-bold text-db-text-primary">{result.scenario}</p>
                  <p className="text-[9px] text-db-text-muted">
                    Intensity: {result.intensity.toFixed(1)}x · Horizon: {result.timeHorizon} · Total P&L: €{Math.abs(result.totalDBPnL).toFixed(0)}M
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <SimulationControls
                  intensity={intensity}
                  timeHorizon={timeHorizon}
                  showAddSecond={false}
                  onIntensityChange={(v) => {
                    setIntensity(v);
                    if (selectedId && selectedId !== "custom") {
                      runPreset(selectedId);
                    } else if (selectedId === "custom") {
                      runCustom();
                    }
                  }}
                  onTimeHorizonChange={(v) => {
                    setTimeHorizon(v);
                    if (selectedId && selectedId !== "custom") {
                      runPreset(selectedId);
                    }
                  }}
                  onAddSecondScenario={() => {}}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Left column (2/3) */}
              <div className="lg:col-span-2 space-y-5">
                {/* Cascade Visualization */}
                <CascadeVisualization steps={result.cascadeSteps} isAnimating={isAnimating} />

                {/* Comparison Panel */}
                <ComparisonPanel changes={result.changes} isAnimating={isAnimating} />

                {/* Country Impact Panel */}
                <CountryImpactPanel countryImpacts={result.countryImpacts} isAnimating={isAnimating} />

                {/* AI Analysis Section */}
                <div className="space-y-4">
                  {/* AI Narrative */}
                  <div className="glass-card p-4">
                    <button
                      onClick={() => setShowNarrative(!showNarrative)}
                      className="w-full flex items-center justify-between"
                    >
                      <h3 className="text-sm font-bold text-db-text-primary flex items-center gap-2">
                        <Sparkles size={14} className="text-db-warning" />
                        AI Scenario Analysis
                      </h3>
                      {showNarrative ? <ChevronUp size={14} className="text-db-text-muted" /> : <ChevronDown size={14} className="text-db-text-muted" />}
                    </button>

                    <AnimatePresence>
                      {showNarrative && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 pt-3 border-t border-db-border space-y-3">
                            {isAnimating ? (
                              <div className="space-y-2">
                                <div className="h-3 bg-db-surface rounded animate-pulse w-full" />
                                <div className="h-3 bg-db-surface rounded animate-pulse w-5/6" />
                                <div className="h-3 bg-db-surface rounded animate-pulse w-4/6" />
                              </div>
                            ) : (
                              <p className="text-xs text-db-text-secondary leading-relaxed">
                                {narrative}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Recommended Actions */}
                  <div className="glass-card p-4">
                    <button
                      onClick={() => setShowActions(!showActions)}
                      className="w-full flex items-center justify-between"
                    >
                      <h3 className="text-sm font-bold text-db-text-primary flex items-center gap-2">
                        <Shield size={14} className="text-db-success" />
                        Recommended DB Actions
                      </h3>
                      {showActions ? <ChevronUp size={14} className="text-db-text-muted" /> : <ChevronDown size={14} className="text-db-text-muted" />}
                    </button>

                    <AnimatePresence>
                      {showActions && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 pt-3 border-t border-db-border space-y-2">
                            {isAnimating ? (
                              [1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-10 bg-db-surface rounded animate-pulse" />
                              ))
                            ) : (
                              actions.map((action, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.08 }}
                                  className={`p-3 rounded-lg border ${
                                    action.category === "IMMEDIATE"
                                      ? "border-db-danger/20 bg-db-danger/5"
                                      : action.category === "SHORT_TERM"
                                      ? "border-db-warning/20 bg-db-warning/5"
                                      : "border-db-accent/20 bg-db-accent/5"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                                      action.category === "IMMEDIATE"
                                        ? "text-db-danger bg-db-danger/10"
                                        : action.category === "SHORT_TERM"
                                        ? "text-db-warning bg-db-warning/10"
                                        : "text-db-accent bg-db-accent/10"
                                    }`}>
                                      {action.category.replace("_", " ")}
                                    </span>
                                    <span className="text-[9px] text-db-text-muted">
                                      — {action.department}
                                    </span>
                                  </div>
                                  <p className="text-xs text-db-text-primary">{action.action}</p>
                                  <p className="text-[10px] text-db-text-muted mt-0.5 italic">
                                    Why: {action.reason}
                                  </p>
                                </motion.div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Historical Parallel */}
                  <div className="glass-card p-4">
                    <button
                      onClick={() => setShowHistorical(!showHistorical)}
                      className="w-full flex items-center justify-between"
                    >
                      <h3 className="text-sm font-bold text-db-text-primary flex items-center gap-2">
                        <History size={14} className="text-db-accent" />
                        Historical Parallel
                      </h3>
                      {showHistorical ? <ChevronUp size={14} className="text-db-text-muted" /> : <ChevronDown size={14} className="text-db-text-muted" />}
                    </button>

                    <AnimatePresence>
                      {showHistorical && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 pt-3 border-t border-db-border">
                            {selectedId && (
                              <div className="p-3 rounded-lg border border-db-accent/20 bg-db-accent/5">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs">📖</span>
                                  <span className="text-xs font-semibold text-db-text-primary">Similar historical events</span>
                                </div>
                                <p className="text-[10px] text-db-text-secondary leading-relaxed">
                                  This scenario is similar to {SCENARIO_DEFINITIONS.find(s => s.id === selectedId)?.historicalPrecedent || "past events"}.
                                  During that period, the primary impacts were felt in energy costs and inflation, with central banks responding
                                  with {selectedId?.includes("hike") ? "aggressive tightening" : selectedId?.includes("cut") ? "emergency easing" : "policy adjustments"}.
                                  The key lesson for DB is to maintain adequate liquidity buffers and hedge energy exposure in advance.
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Right column (1/3) */}
              <div className="space-y-5">
                {/* DB Impact Section */}
                <DBImpactSection
                  dbImpact={result.dbImpact}
                  totalPnL={result.totalDBPnL}
                  isAnimating={isAnimating}
                />

                {/* Loaded state info */}
                <div className="glass-card p-3 text-center">
                  <p className="text-[9px] text-db-text-muted uppercase tracking-wider mb-1">Scenario Status</p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-db-success animate-pulse" />
                    <span className="text-xs text-db-success font-medium">Simulation Complete</span>
                  </div>
                  <p className="text-[9px] text-db-text-muted mt-1">
                    {result.intensity}x intensity · {result.timeHorizon} horizon
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 max-w-lg w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-db-text-primary flex items-center gap-2">
                  <Info size={14} className="text-db-accent" />
                  How the Scenario Simulator Works
                </h3>
                <button onClick={() => setShowInfoModal(false)} className="text-db-text-muted hover:text-db-text-primary">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 text-xs text-db-text-secondary">
                <div className="p-3 rounded-lg bg-db-surface border border-db-border">
                  <p className="font-semibold text-db-text-primary mb-1">🎯 Factor-Based Simulation</p>
                  <p>Our model uses factor-based rules combining historical relationships with current market data to estimate cascading impacts. Each scenario defines direct effects (immediate market moves), secondary effects (policy responses), and tertiary effects (real economy impacts).</p>
                </div>

                <div className="p-3 rounded-lg bg-db-surface border border-db-border">
                  <p className="font-semibold text-db-text-primary mb-1">📊 Country Sensitivity</p>
                  <p>Each country has a sensitivity factor that amplifies or dampens scenario impacts based on economic structure, energy dependence, trade exposure, and fiscal space. Higher sensitivity = more severe impact.</p>
                </div>

                <div className="p-3 rounded-lg bg-db-surface border border-db-border">
                  <p className="font-semibold text-db-text-primary mb-1">🏦 DB Portfolio Impact</p>
                  <p>Business line impacts are estimated based on Deutsche Bank's disclosed exposure by country and sector. P&L estimates are directional and should be validated against internal models.</p>
                </div>

                <div className="p-3 rounded-lg bg-db-accent/10 border border-db-accent/20">
                  <p className="font-semibold text-db-text-primary mb-1">⚠️ Limitations</p>
                  <p className="text-[10px]">This is a simplified model for demonstration purposes. Real-world impacts depend on correlations, hedging, and dynamic responses not captured here. Always validate with your risk team.</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-db-border flex justify-end">
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="px-4 py-2 rounded-lg bg-db-accent text-white text-xs font-semibold hover:bg-blue-600 transition-all"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Mock AI functions for the hackathon
function generateMockNarrative(result: SimulationResult): string {
  const totalPnL = result.totalDBPnL;
  const pnlDir = totalPnL >= 0 ? "positive" : "negative";
  const topCountries = Object.entries(result.countryImpacts)
    .sort(([, a], [, b]) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 3)
    .map(([c]) => c);

  return `In the "${result.scenario}" scenario, the sequence of events would unfold rapidly. The initial trigger — ${result.cascadeSteps[0]?.event || "the shock event"} — would immediately impact market pricing, with ${result.changes[0]?.metric || "key metrics"} showing a change of ${result.changes[0]?.change > 0 ? "+" : ""}${result.changes[0]?.change.toFixed(1)}${result.changes[0]?.unit || ""} within the first days. Secondary effects would compound through the financial system within weeks as institutions respond to the evolving conditions.

The hardest-hit countries would be ${topCountries.join(", ")}, where economic sensitivity amplifies the scenario's impact. ${topCountries[0] || "Peripheral"} markets would experience the most severe stress, with sovereign spreads widening and credit metrics deteriorating. Energy-intensive and export-dependent sectors would face disproportionate pressure on corporate margins and employment.

For Deutsche Bank, the estimated total P&L impact is approximately €${Math.abs(totalPnL).toFixed(0)}M (${pnlDir}). The most affected business lines require immediate attention: corporate lending faces potential credit deterioration in the ${topCountries[0] || "affected"} markets, while the trading desk may benefit from increased volatility. Treasury should prepare for mark-to-market impacts on the bond portfolio, and balance sheet management needs to assess implications for capital ratios.`;
}

function generateMockActions(result: SimulationResult): DBAction[] {
  return [
    { category: "IMMEDIATE", department: "Risk", action: `Increase loan loss provisions by €${Math.round(Math.abs(result.totalDBPnL) * 0.15)}M for affected sectors`, reason: "Scenario indicates elevated credit risk in vulnerable portfolios" },
    { category: "IMMEDIATE", department: "Treasury", action: "Hedge additional 15% of EUR/USD exposure using 3-month forwards", reason: "EUR volatility expected to increase significantly in this scenario" },
    { category: "IMMEDIATE", department: "Trading", action: "Reduce duration on peripheral bond holdings by 20%", reason: "Spread widening risk could cause significant mark-to-market losses" },
    { category: "SHORT_TERM", department: "Corporate", action: "Contact top 20 most exposed clients for stress assessment", reason: "Proactive engagement needed to identify potential covenant breaches early" },
    { category: "SHORT_TERM", department: "Risk", action: "Run portfolio-wide stress test incorporating this scenario at 1.5x intensity", reason: "Severity may exceed baseline assumptions; buffer adequacy must be verified" },
    { category: "SHORT_TERM", department: "Treasury", action: "Pre-position liquidity buffer of €1.5B for potential margin calls", reason: "Volatility may trigger collateral demands across derivatives portfolio" },
    { category: "MONITORING", department: "Credit Risk", action: "Weekly review of manufacturing and energy sector NPL trends", reason: "Early warning indicators critical for timely provisioning decisions" },
    { category: "MONITORING", department: "Compliance", action: "Track regulatory capital ratio against stress-scenario minimums", reason: "Ensure capital adequacy maintained under adverse conditions" },
  ];
}
