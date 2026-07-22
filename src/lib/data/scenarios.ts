import { Scenario } from "../types";

// Scenario impact matrix for quick reference
// Maps scenario IDs to country impact levels (Low/Medium/High/Critical)
// and sector impact levels
export interface ScenarioImpactMatrix {
  scenarioId: string;
  scenarioName: string;
  countryImpacts: Record<string, "Low" | "Medium" | "High" | "Critical">;
  sectorImpacts: Record<string, { impact: number; description: string }>;
  overallSeverity: "Low" | "Medium" | "High" | "Critical";
}

export function buildScenarioImpactMatrix(scenario: Scenario): ScenarioImpactMatrix {
  const countryImpacts: Record<string, "Low" | "Medium" | "High" | "Critical"> = {};
  
  for (const [country, sensitivity] of Object.entries(scenario.countrySensitivity)) {
    if (sensitivity >= 75) countryImpacts[country] = "Critical";
    else if (sensitivity >= 55) countryImpacts[country] = "High";
    else if (sensitivity >= 35) countryImpacts[country] = "Medium";
    else countryImpacts[country] = "Low";
  }

  const maxDirectImpact = Math.max(...scenario.directEffects.map((e) => Math.abs(e.impact)));
  const maxSecondaryImpact = Math.max(...scenario.secondaryEffects.map((e) => Math.abs(e.impact)));
  
  let overallSeverity: "Low" | "Medium" | "High" | "Critical";
  const maxImpact = Math.max(maxDirectImpact, maxSecondaryImpact, scenario.dbImpact.overallExposure);
  if (maxImpact >= 70) overallSeverity = "Critical";
  else if (maxImpact >= 50) overallSeverity = "High";
  else if (maxImpact >= 30) overallSeverity = "Medium";
  else overallSeverity = "Low";

  const sectorImpacts: Record<string, { impact: number; description: string }> = {};
  for (const effect of [...scenario.directEffects, ...scenario.secondaryEffects]) {
    sectorImpacts[effect.sector] = { impact: effect.impact, description: effect.description };
  }

  return {
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    countryImpacts,
    sectorImpacts,
    overallSeverity,
  };
}

// Pre-built matrix for all scenarios
export function getAllScenarioMatrices(scenarios: Scenario[]): ScenarioImpactMatrix[] {
  return scenarios.map(buildScenarioImpactMatrix);
}

// Correlation matrix: how scenarios affect each other (simplified)
export const scenarioCorrelations: Record<string, Record<string, number>> = {
  sc1: { sc4: 0.6, sc8: 0.7, sc5: 0.3, sc6: 0.4 },
  sc2: { sc3: -0.8, sc5: -0.3, sc7: -0.2 },
  sc3: { sc2: -0.8, sc5: 0.4, sc7: 0.3 },
  sc4: { sc1: 0.6, sc8: 0.8, sc5: 0.5, sc6: 0.3 },
  sc5: { sc4: 0.5, sc6: 0.3, sc7: 0.5, sc1: 0.3 },
  sc6: { sc1: 0.4, sc5: 0.3 },
  sc7: { sc5: 0.5, sc2: -0.2, sc3: 0.3 },
  sc8: { sc1: 0.7, sc4: 0.8, sc5: 0.4 },
};
