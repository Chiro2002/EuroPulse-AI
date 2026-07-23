"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Beaker, Info, RotateCcw, Sparkles, Brain, Gavel,
} from "lucide-react";
import { ShockSelector, type ShockType } from "@/components/simulator/ShockSelector";
import { ShockTransmissionFlow } from "@/components/simulator/ShockTransmissionFlow";
import { DBImpactKPIs } from "@/components/simulator/DBImpactKPIs";

// ─── Mock simulation data that matches "Oil +20%" scenario ───────────
// Cleanly structured so swapping in real calc logic later is a single data-source change

const SHOCK_LABELS: Record<ShockType, { prefix: string; verb: string }> = {
  oil_spike: { prefix: "Oil", verb: "Oil prices increase by" },
  war_escalation: { prefix: "Conflict", verb: "Conflict intensity increases by" },
  ecb_rate: { prefix: "Rate", verb: "ECB rate changes by" },
  eu_recession: { prefix: "GDP", verb: "GDP contraction of" },
  currency_weakening: { prefix: "EUR", verb: "EUR/USD weakens by" },
};

// Realistic mock data for each shock type
const SHOCK_MOCK_DATA: Record<string, {
  impact: { credit: string; nii: string; ear: string; creditColor: string; niiColor: string; earColor: string };
  nodes: { title: string; change: string; severity: string; color: string }[];
}> = {
  oil_spike: {
    impact: { credit: "+18 bps", nii: "-1.2%", ear: "€8.6B", creditColor: "#E5484D", niiColor: "#E5484D", earColor: "#F97316" },
    nodes: [
      { title: "Oil Price", change: "Brent crude rises ~20%", severity: "high", color: "#E5484D" },
      { title: "Inflation", change: "Headline CPI rises +0.9 pp", severity: "high", color: "#E5484D" },
      { title: "ECB Rate", change: "Policy rate increases +50 bps", severity: "medium", color: "#F5A623" },
      { title: "Mortgage Rates", change: "Avg. mortgage rate rises +60 bps", severity: "medium", color: "#F5A623" },
      { title: "DB Lending Risk", change: "Higher PD and LGD outlook", severity: "high", color: "#E5484D" },
    ],
  },
  war_escalation: {
    impact: { credit: "+25 bps", nii: "-2.1%", ear: "€12.4B", creditColor: "#E5484D", niiColor: "#E5484D", earColor: "#E5484D" },
    nodes: [
      { title: "Oil Price", change: "Brent crude rises ~35%", severity: "high", color: "#E5484D" },
      { title: "Inflation", change: "Headline CPI rises +1.5 pp", severity: "high", color: "#E5484D" },
      { title: "ECB Rate", change: "Emergency hike +75 bps", severity: "high", color: "#E5484D" },
      { title: "EUR/USD", change: "EUR weakens -4.2%", severity: "high", color: "#E5484D" },
      { title: "DB Lending Risk", change: "Credit stress across CEE", severity: "high", color: "#E5484D" },
    ],
  },
  ecb_rate: {
    impact: { credit: "+8 bps", nii: "-0.6%", ear: "€4.2B", creditColor: "#F5A623", niiColor: "#F5A623", earColor: "#F5A623" },
    nodes: [
      { title: "ECB Rate", change: "Policy rate -25 bps", severity: "medium", color: "#F5A623" },
      { title: "EUR/USD", change: "EUR weakens -1.8%", severity: "medium", color: "#F5A623" },
      { title: "Bond Yields", change: "DE 10Y falls -15 bps", severity: "low", color: "#3B82F6" },
      { title: "Mortgage Rates", change: "Avg. rate falls -20 bps", severity: "low", color: "#3B82F6" },
      { title: "DB Lending Risk", change: "NIM compression -8 bps", severity: "medium", color: "#F5A623" },
    ],
  },
  eu_recession: {
    impact: { credit: "+32 bps", nii: "-3.5%", ear: "€18.2B", creditColor: "#E5484D", niiColor: "#E5484D", earColor: "#E5484D" },
    nodes: [
      { title: "GDP", change: "EU GDP contracts -1.8%", severity: "high", color: "#E5484D" },
      { title: "Unemployment", change: "EU unemployment +1.2 pp", severity: "high", color: "#E5484D" },
      { title: "ECB Rate", change: "Emergency cut -50 bps", severity: "high", color: "#E5484D" },
      { title: "Bond Spreads", change: "IT-DE spread widens +80 bps", severity: "high", color: "#E5484D" },
      { title: "DB Lending Risk", change: "Broad credit deterioration", severity: "high", color: "#E5484D" },
    ],
  },
  currency_weakening: {
    impact: { credit: "+12 bps", nii: "-0.9%", ear: "€5.8B", creditColor: "#F5A623", niiColor: "#E5484D", earColor: "#F5A623" },
    nodes: [
      { title: "EUR/USD", change: "EUR/USD falls -5.5%", severity: "high", color: "#E5484D" },
      { title: "Inflation", change: "Import inflation +0.6 pp", severity: "medium", color: "#F5A623" },
      { title: "ECB Rate", change: "Hold steady at 3.75%", severity: "low", color: "#3B82F6" },
      { title: "Trade Balance", change: "Export boost +2.1%", severity: "low", color: "#3B82F6" },
      { title: "DB Lending Risk", change: "FX translation impact", severity: "medium", color: "#F5A623" },
    ],
  },
};

export default function SimulatorPage() {
  const [shockType, setShockType] = useState<ShockType>("oil_spike");
  const [shockIntensity, setShockIntensity] = useState(20);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const shockLabel = SHOCK_LABELS[shockType];
  const mockData = SHOCK_MOCK_DATA[shockType];

  const intensityLabel = useMemo(() => {
    return `${shockLabel.prefix} ${shockIntensity >= 0 ? "+" : ""}${shockIntensity}%`;
  }, [shockLabel.prefix, shockIntensity]);

  const intensityCaption = useMemo(() => {
    return `${shockLabel.verb} ${shockIntensity}% vs. baseline`;
  }, [shockLabel.verb, shockIntensity]);

  const reset = useCallback(() => {
    setShockType("oil_spike");
    setShockIntensity(20);
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-5 animate-fade-in max-w-5xl mx-auto">
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
            className="flex items-center gap-1 px-2.5 h-8 rounded-lg border border-border text-[10px] text-text-secondary hover:border-primary/30 hover:text-primary transition-all"
          >
            <Info size={11} /> How it works
          </button>
          <button onClick={reset}
            className="flex items-center gap-1 px-2.5 h-8 rounded-lg border border-border text-[10px] text-text-secondary hover:border-[#E5484D]/30 hover:text-[#E5484D] transition-all"
          >
            <RotateCcw size={11} /> Reset
          </button>
          <a
            href={`/boardroom?topic=${encodeURIComponent(`Should DB hedge against a ${shockLabel.prefix.toLowerCase()} shock of ${shockIntensity}%?`)}`}
            className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-medium hover:bg-amber-100 transition-all border border-amber-200"
          >
            <Gavel size={11} />
            Debate This
          </a>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          THREE SECTIONS
      ════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: Sections 1 + 2 + 3 */}
        <div className="lg:col-span-3 space-y-5">
          {/* Section 1: Choose a Shock */}
          <ShockSelector
            selected={shockType}
            onSelect={setShockType}
            intensity={shockIntensity}
            onIntensityChange={setShockIntensity}
            intensityLabel={intensityLabel}
            intensityCaption={intensityCaption}
          />

          {/* Section 2: Shock Transmission Flow */}
          <ShockTransmissionFlow delay={0.1} />

          {/* Section 3: DB Impact KPIs */}
          <DBImpactKPIs delay={0.2} />
        </div>

        {/* Right: Sidebar with AI Summary + Debate */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-20 space-y-3">
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
                  <p className="text-[8px] text-[#4A5568]/60">AI-generated strategic assessment</p>
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
                    In an oil price spike scenario of +{shockIntensity}%, the transmission chain begins with higher energy costs feeding into headline inflation (+0.9 pp), forcing an ECB policy response (+50 bps). Mortgage rates follow (+60 bps), compressing household spending and corporate margins. For DB, the credit risk outlook deteriorates most sharply in energy-exposed corporate loans (€4.2B), with sovereign bond holdings (€2.8B) facing spread widening.
                  </p>
                </motion.div>

                {/* Key Numbers */}
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="rounded-xl border border-amber-200/40 bg-amber-50/60 p-3 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-md bg-amber-100 flex items-center justify-center">
                      <Info size={8} className="text-amber-600" />
                    </div>
                    <span className="text-[9px] font-semibold text-amber-700 uppercase tracking-wider">Key Numbers</span>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { label: "Credit Risk Impact", value: mockData.impact.credit, color: mockData.impact.creditColor },
                      { label: "NII Impact", value: mockData.impact.nii, color: mockData.impact.niiColor },
                      { label: "Exposure at Risk", value: mockData.impact.ear, color: mockData.impact.earColor },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between text-[10px]">
                        <span className="text-text-secondary">{item.label}</span>
                        <span className="font-bold" style={{ color: item.color }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Recommended Actions */}
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="rounded-xl bg-white border border-green-100 p-3 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-md bg-green-50 flex items-center justify-center">
                      <Sparkles size={9} className="text-green-600" />
                    </div>
                    <span className="text-[9px] font-semibold text-green-700 uppercase tracking-wider">Recommended Actions</span>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      "Increase loan loss provisions by €180M for energy sector corporate loans",
                      "Hedge 30% of oil-sensitive EUR/USD exposure using 6-month forwards",
                      "Reduce duration on Italian and Spanish bond holdings by 15-20%",
                      "Contact top 20 energy-exposed clients for covenant headroom assessment",
                    ].map((action, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <div className="w-3.5 h-3.5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[6px] font-bold text-green-600">{i + 1}</span>
                        </div>
                        <span className="text-[10px] text-text-primary leading-snug">{action}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Debate card */}
            <motion.a
              href={`/boardroom?topic=${encodeURIComponent(`Should DB hedge against a ${shockLabel.prefix.toLowerCase()} shock of ${shockIntensity}%?`)}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="card p-4 flex items-center gap-3 hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Gavel size={16} className="text-amber-700" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-text-primary">Convene the Committee</p>
                <p className="text-[9px] text-text-secondary">Let the AI Boardroom debate this scenario</p>
              </div>
              <Sparkles size={14} className="text-primary flex-shrink-0" />
            </motion.a>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          INFO MODAL
      ════════════════════════════════════════════════════════════════ */}
      {showInfoModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowInfoModal(false)}
        >
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="card p-6 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Info size={14} className="text-primary" /> How the Simulator Works
              </h3>
              <button onClick={() => setShowInfoModal(false)} className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <RotateCcw size={14} />
              </button>
            </div>
            <div className="space-y-3 text-xs text-text-secondary">
              <div className="p-3 rounded-lg bg-gray-50 border border-border">
                <p className="font-semibold text-text-primary mb-1">🎯 Shock Selection</p>
                <p>Choose from 5 macro shocks (oil, war, rate, recession, currency) and adjust intensity from -20% to +40%. The simulation models first-order, second-order, and third-order effects through the economy.</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 border border-border">
                <p className="font-semibold text-text-primary mb-1">📊 Transmission Flow</p>
                <p>Each shock propagates through 5 stages: initial trigger → inflation → policy response → lending rates → DB portfolio impact. Arrows show causal direction with AI-estimated magnitudes.</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 border border-border">
                <p className="font-semibold text-text-primary mb-1">🏦 DB Impact Metrics</p>
                <p>Credit Risk (PD/LGD change in bps), Net Interest Income impact (%), and total Exposure at Risk (€). These are directional estimates based on disclosed DB portfolio composition.</p>
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
    </div>
  );
}
