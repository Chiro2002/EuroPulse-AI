/**
 * Simulator Engine
 * Scenario cascade logic for simulating interconnected scenario impacts
 */

import { Scenario, ScenarioEffect, ScenarioDBImpact } from "../types";
import { scenarioCorrelations } from "../data/scenarios";

export interface SimulatedOutcome {
  scenarioId: string;
  scenarioName: string;
  probability: number;
  triggeredCascades: CascadeEffect[];
  totalDirectImpact: number;
  totalSecondaryImpact: number;
  combinedDBImpact: number;
  riskScore: number;
}

export interface CascadeEffect {
  fromScenario: string;
  toScenario: string;
  correlationStrength: number;
  impactMultiplier: number;
  description: string;
}

/**
 * Calculate cascade effects between scenarios
 */
export function calculateCascades(
  primaryScenario: Scenario,
  allScenarios: Scenario[],
  correlations: Record<string, Record<string, number>>
): CascadeEffect[] {
  const cascades: CascadeEffect[] = [];
  const primaryId = primaryScenario.id;
  const primaryCorrelations = correlations[primaryId];

  if (!primaryCorrelations) return cascades;

  for (const [targetId, correlation] of Object.entries(primaryCorrelations)) {
    if (correlation <= 0) continue; // Only positive correlations trigger cascades

    const targetScenario = allScenarios.find((s) => s.id === targetId);
    if (!targetScenario) continue;

    // Higher correlation = higher probability of cascade
    const impactMultiplier = correlation * 0.7;

    cascades.push({
      fromScenario: primaryScenario.name,
      toScenario: targetScenario.name,
      correlationStrength: correlation,
      impactMultiplier,
      description: `${primaryScenario.name} increases probability of ${targetScenario.name} by ${Math.round(correlation * 100)}%`,
    });
  }

  return cascades.sort((a, b) => b.correlationStrength - a.correlationStrength);
}

/**
 * Run a full scenario simulation
 */
export function simulateScenario(
  primaryScenario: Scenario,
  allScenarios: Scenario[],
  correlations: Record<string, Record<string, number>>
): SimulatedOutcome {
  const cascades = calculateCascades(primaryScenario, allScenarios, correlations);

  const totalDirectImpact = primaryScenario.directEffects.reduce(
    (sum, e) => sum + Math.abs(e.impact),
    0
  );

  const totalSecondaryImpact = primaryScenario.secondaryEffects.reduce(
    (sum, e) => sum + Math.abs(e.impact),
    0
  );

  // Combined DB impact score includes cascade effects
  const cascadeImpactBonus = cascades.reduce(
    (sum, c) => sum + c.impactMultiplier * 10,
    0
  );

  const combinedDBImpact = Math.round(
    Math.min(100, primaryScenario.dbImpact.overallExposure + cascadeImpactBonus)
  );

  // Composite risk score
  const riskScore = Math.round(
    (primaryScenario.probability * 0.3 +
      combinedDBImpact * 0.4 +
      totalDirectImpact * 0.2 +
      totalSecondaryImpact * 0.1)
  );

  return {
    scenarioId: primaryScenario.id,
    scenarioName: primaryScenario.name,
    probability: primaryScenario.probability,
    triggeredCascades: cascades,
    totalDirectImpact,
    totalSecondaryImpact,
    combinedDBImpact,
    riskScore,
  };
}

/**
 * Run multiple scenario simulations and rank them
 */
export function simulateAllScenarios(
  scenarios: Scenario[],
  correlations: Record<string, Record<string, number>>
): SimulatedOutcome[] {
  return scenarios
    .map((s) => simulateScenario(s, scenarios, correlations))
    .sort((a, b) => b.riskScore - a.riskScore);
}

/**
 * Generate a portfolio impact estimate from simulated outcome
 */
export function estimatePortfolioImpact(
  outcome: SimulatedOutcome,
  totalExposure: number
): {
  estimatedLoss: string;
  lossAmount: number;
  lossPercentage: number;
  confidenceInterval: string;
} {
  const lossPercentage = (outcome.combinedDBImpact / 100) * 0.05; // Max 5% loss in extreme scenario
  const lossAmount = totalExposure * lossPercentage;

  return {
    estimatedLoss: `€${(lossAmount / 1000).toFixed(1)}B`,
    lossAmount,
    lossPercentage: Math.round(lossPercentage * 100 * 100) / 100,
    confidenceInterval: `€${((lossAmount * 0.7) / 1000).toFixed(1)}B - €${((lossAmount * 1.3) / 1000).toFixed(1)}B`,
  };
}
