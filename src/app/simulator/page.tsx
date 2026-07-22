"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Beaker,
  Play,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Shield,
  Settings,
  Info,
  Plus,
} from "lucide-react";
import { scenarios } from "@/lib/data/mockData";
import { scenarioCorrelations } from "@/lib/data/scenarios";
import { simulateScenario, simulateAllScenarios, estimatePortfolioImpact } from "@/lib/logic/simulatorEngine";
import { totalDBExposure } from "@/lib/data/dbPortfolio";
import { getRiskLevel } from "@/lib/logic/riskCalculator";
import type { Scenario } from "@/lib/types";

export default function SimulatorPage() {
  const [selectedScenario, setSelectedScenario] = useState<string>(scenarios[0].id);
  const [showDetailed, setShowDetailed] = useState(false);
  const [includeCascades, setIncludeCascades] = useState(true);

  const allOutcomes = useMemo(
    () => simulateAllScenarios(scenarios, scenarioCorrelations),
    []
  );

  const currentScenario = useMemo(
    () => scenarios.find((s) => s.id === selectedScenario)!,
    [selectedScenario]
  );

  const currentOutcome = useMemo(
    () => allOutcomes.find((o) => o.scenarioId === selectedScenario)!,
    [selectedScenario, allOutcomes]
  );

  const currentImpact = useMemo(
    () => estimatePortfolioImpact(currentOutcome, totalDBExposure),
    [currentOutcome]
  );

  const outcomeRiskLevel = useMemo(
    () => getRiskLevel(currentOutcome.riskScore),
    [currentOutcome]
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-db-text-primary flex items-center gap-2">
          <Beaker size={22} className="text-db-accent" />
          Scenario Simulator
        </h2>
        <p className="text-sm text-db-text-muted mt-1">
          Simulate macroeconomic scenarios and analyze cascade effects on Deutsche Bank portfolio
        </p>
      </div>

      {/* Scenario Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {scenarios.map((scenario) => {
          const outcome = allOutcomes.find((o) => o.scenarioId === scenario.id)!;
          const level = getRiskLevel(outcome?.riskScore ?? 50);
          const isSelected = selectedScenario === scenario.id;

          return (
            <motion.button
              key={scenario.id}
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => setSelectedScenario(scenario.id)}
              className={`glass-card-hover p-3 text-left transition-all ${
                isSelected ? "ring-2 ring-db-accent" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-db-text-primary">
                  {scenario.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: level.bgColor, color: level.color }}>
                  {outcome?.riskScore || "—"}
                </span>
              </div>
              <p className="text-[10px] text-db-text-muted line-clamp-2">
                {scenario.description}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[9px] text-db-text-muted">
                  {scenario.probability}% prob.
                </span>
                <span className="text-[9px] text-db-text-muted">
                  {scenario.timeHorizon}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Main Simulation Result */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Detail */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScenario.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card p-4"
            >
              <h3 className="text-base font-bold text-db-text-primary mb-1">
                {currentScenario.name}
              </h3>
              <p className="text-sm text-db-text-secondary mb-4">
                {currentScenario.description}
              </p>

              {/* Direct Effects */}
              <h4 className="text-xs font-semibold text-db-text-primary mb-2 flex items-center gap-1">
                <Play size={12} className="text-db-danger" />
                Direct Effects
              </h4>
              <div className="space-y-2 mb-4">
                {currentScenario.directEffects.map((effect, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-db-surface">
                    <div className={`text-sm font-bold w-12 text-right ${
                      effect.impact < 0 ? "text-db-danger" : "text-db-success"
                    }`}>
                      {effect.impact > 0 ? "+" : ""}{effect.impact}%
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-db-text-primary">{effect.sector}</p>
                      <p className="text-[10px] text-db-text-muted">{effect.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Secondary Effects */}
              <h4 className="text-xs font-semibold text-db-text-primary mb-2 flex items-center gap-1">
                <TrendingUp size={12} className="text-db-warning" />
                Secondary Effects
              </h4>
              <div className="space-y-2">
                {currentScenario.secondaryEffects.map((effect, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-db-surface/50">
                    <div className={`text-sm font-bold w-12 text-right ${
                      effect.impact < 0 ? "text-db-danger" : "text-db-success"
                    }`}>
                      {effect.impact > 0 ? "+" : ""}{effect.impact}%
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-db-text-primary">{effect.sector}</p>
                      <p className="text-[10px] text-db-text-muted">{effect.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Cascade Effects */}
          {includeCascades && currentOutcome.triggeredCascades.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4"
            >
              <h3 className="text-sm font-semibold text-db-text-primary mb-3 flex items-center gap-2">
                <Settings size={14} className="text-db-accent" />
                Cascade Effects
              </h3>
              <div className="space-y-2">
                {currentOutcome.triggeredCascades.map((cascade, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 rounded-lg bg-db-accent/5 border border-db-accent/10"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-db-accent/15 flex items-center justify-center">
                      <span className="text-xs font-bold text-db-accent">
                        {Math.round(cascade.impactMultiplier * 100)}%
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-db-text-primary">
                        {cascade.description}
                      </p>
                      <p className="text-[10px] text-db-text-muted">
                        Correlation: {Math.round(cascade.correlationStrength * 100)}% · Multiplier: {cascade.impactMultiplier.toFixed(1)}x
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Simulation Results Panel */}
        <div className="space-y-4">
          {/* Risk Score */}
          <motion.div
            key={currentOutcome.riskScore}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-4 text-center"
          >
            <p className="text-xs text-db-text-muted mb-1">Scenario Risk Score</p>
            <p className="text-4xl font-bold" style={{ color: outcomeRiskLevel.color }}>
              {currentOutcome.riskScore}
            </p>
            <p className="text-xs font-medium mt-1" style={{ color: outcomeRiskLevel.color }}>
              {outcomeRiskLevel.label}
            </p>
          </motion.div>

          {/* Impact Stats */}
          <div className="glass-card p-4 space-y-3">
            <div>
              <p className="text-[10px] text-db-text-muted">Direct Impact</p>
              <p className="text-lg font-bold text-db-text-primary">
                -{currentOutcome.totalDirectImpact}%
              </p>
            </div>
            <div>
              <p className="text-[10px] text-db-text-muted">Secondary Impact</p>
              <p className="text-lg font-bold text-db-text-primary">
                -{currentOutcome.totalSecondaryImpact}%
              </p>
            </div>
            <div>
              <p className="text-[10px] text-db-text-muted">DB Combined Exposure</p>
              <p className="text-lg font-bold text-db-danger">
                {currentOutcome.combinedDBImpact}/100
              </p>
            </div>
            <div className="pt-2 border-t border-db-border">
              <p className="text-[10px] text-db-text-muted">Estimated Portfolio Loss</p>
              <p className="text-xl font-bold text-db-danger">{currentImpact.estimatedLoss}</p>
              <p className="text-[10px] text-db-text-muted">
                {currentImpact.lossPercentage}% of €{totalDBExposure}B portfolio
              </p>
            </div>
          </div>

          {/* DB Impact */}
          <div className="glass-card p-4">
            <h4 className="text-xs font-semibold text-db-text-primary mb-2 flex items-center gap-1">
              <Shield size={12} className="text-db-accent" />
              DB Impact Assessment
            </h4>
            <p className="text-xs text-db-text-secondary mb-2">
              {currentScenario.dbImpact.estimatedImpact}
            </p>
            <div className="space-y-1">
              {currentScenario.dbImpact.riskMitigation.map((action, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-db-accent/15 flex items-center justify-center mt-0.5">
                    <span className="text-[8px] font-bold text-db-accent">{i + 1}</span>
                  </span>
                  <span className="text-[10px] text-db-text-primary">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ranked Scenarios */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold text-db-text-primary mb-3 flex items-center gap-2">
          <BarChart3 size={14} className="text-db-accent" />
          Scenario Risk Rankings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {allOutcomes.map((outcome, i) => {
            const level = getRiskLevel(outcome.riskScore);
            const scenario = scenarios.find((s) => s.id === outcome.scenarioId)!;
            return (
              <motion.div
                key={outcome.scenarioId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-db-text-primary">{scenario.name}</span>
                  <span className="text-xs font-bold" style={{ color: level.color }}>{outcome.riskScore}</span>
                </div>
                <div className="h-1.5 bg-db-border rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${outcome.riskScore}%`,
                      backgroundColor: level.color,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[9px] text-db-text-muted">
                  <span>{scenario.probability}% prob.</span>
                  <span>Risk: {outcome.riskScore}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
