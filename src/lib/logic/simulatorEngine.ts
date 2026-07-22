/**
 * Scenario Simulator Engine
 * Core simulation logic for macro shock scenarios
 */

import {
  ScenarioDefinition,
  SimulationResult,
  CurrentMarketData,
  SimulatedMarketData,
  ComparisonRow,
  CountryImpactResult,
  DBBusinessLineImpactResult,
  DBBusinessLineImpact,
  CascadeStep,
} from "../types";
import { CURRENT_MARKET_DATA, COUNTRY_RISK_BASELINE, SCENARIO_DEFINITIONS } from "../data/scenarios";

/**
 * Run a full scenario simulation with intensity and time horizon
 */
export function runSimulation(
  scenarioId: string,
  intensity: number = 1.0,
  timeHorizon: "immediate" | "3M" | "6M" | "12M" = "12M"
): SimulationResult {
  const scenario = SCENARIO_DEFINITIONS.find((s) => s.id === scenarioId);
  if (!scenario) throw new Error(`Scenario '${scenarioId}' not found`);

  // Apply intensity scaling to all effects
  const direct = scaleEffects(scenario.directEffects, intensity);
  const secondary = scaleEffects(scenario.secondaryEffects, intensity);
  const dbScaled = scaleDBImpact(scenario.dbImpact, intensity);

  // Calculate simulated market values
  const before = CURRENT_MARKET_DATA;
  const after: SimulatedMarketData = {
    inflation: Math.round((before.inflation + direct.inflation) * 100) / 100,
    eur_usd: Math.round(before.eur_usd * (1 + direct.eur_usd / 100) * 100) / 100,
    oil: Math.round(before.oil * (1 + direct.brent_oil / 100)),
    ecb_rate: Math.round((before.ecb_rate + secondary.ecb_rate_response) * 100) / 100,
    equity: Math.round(before.equity * (1 + direct.equity_markets / 100)),
    bond_yield_de: Math.round((before.bond_yield_de + secondary.bond_yields) * 100) / 100,
    bond_yield_it: Math.round((before.bond_yield_it + secondary.bond_yields + secondary.italian_spread) * 100) / 100,
    gas_price: Math.round(before.gas_price * (1 + direct.gas_price / 100)),
    consumer_confidence: before.consumer_confidence + direct.consumer_confidence,
    unemployment: Math.round((before.unemployment + secondary.unemployment) * 10) / 10,
    gdp_growth: Math.round((before.gdp_growth + secondary.gdp_impact) * 10) / 10,
    recession_prob: Math.min(95, Math.max(5, Math.round(before.recession_prob + secondary.gdp_impact * 15))),
  };

  // Calculate changes for comparison
  const changes: ComparisonRow[] = [
    { metric: "Inflation (EU avg)", current: before.inflation, simulated: after.inflation, change: after.inflation - before.inflation, unit: "pp", direction: getDirection(after.inflation, before.inflation) },
    { metric: "EUR/USD", current: before.eur_usd, simulated: after.eur_usd, change: ((after.eur_usd - before.eur_usd) / before.eur_usd) * 100, unit: "%", direction: getDirection(after.eur_usd, before.eur_usd) },
    { metric: "ECB Rate", current: before.ecb_rate, simulated: after.ecb_rate, change: after.ecb_rate - before.ecb_rate, unit: "bp", direction: getDirection(after.ecb_rate, before.ecb_rate) },
    { metric: "Brent Oil ($)", current: before.oil, simulated: after.oil, change: ((after.oil - before.oil) / before.oil) * 100, unit: "%", direction: getDirection(after.oil, before.oil) },
    { metric: "Euro Stoxx 50", current: before.equity, simulated: after.equity, change: ((after.equity - before.equity) / before.equity) * 100, unit: "%", direction: getDirection(after.equity, before.equity) },
    { metric: "10Y German Bond", current: before.bond_yield_de, simulated: after.bond_yield_de, change: (after.bond_yield_de - before.bond_yield_de) * 100, unit: "bp", direction: getDirection(after.bond_yield_de, before.bond_yield_de) },
    { metric: "10Y Italian Bond", current: before.bond_yield_it, simulated: after.bond_yield_it, change: (after.bond_yield_it - before.bond_yield_it) * 100, unit: "bp", direction: getDirection(after.bond_yield_it, before.bond_yield_it) },
    { metric: "Recession Prob (EU avg)", current: before.recession_prob, simulated: after.recession_prob, change: after.recession_prob - before.recession_prob, unit: "pp", direction: getDirection(after.recession_prob, before.recession_prob) },
    { metric: "EU Unemployment", current: before.unemployment, simulated: after.unemployment, change: after.unemployment - before.unemployment, unit: "pp", direction: getDirection(after.unemployment, before.unemployment) },
    { metric: "GDP Growth", current: before.gdp_growth, simulated: after.gdp_growth, change: after.gdp_growth - before.gdp_growth, unit: "pp", direction: getDirection(after.gdp_growth, before.gdp_growth) },
  ];

  // Calculate country-specific impacts
  const countryImpacts: Record<string, CountryImpactResult> = {};
  for (const [country, sensitivity] of Object.entries(scenario.countrySensitivity)) {
    const currentRisk = COUNTRY_RISK_BASELINE[country] || 50;
    const inflationDelta = direct.inflation * sensitivity * 10;
    const energyDelta = (direct.gas_price || 0) * sensitivity * 0.5;
    const growthDelta = secondary.gdp_impact * sensitivity * -5;
    const riskChange = inflationDelta + energyDelta + growthDelta;
    const newRisk = Math.max(0, Math.min(100, Math.round(currentRisk + riskChange)));

    countryImpacts[country] = {
      riskBefore: currentRisk,
      riskAfter: newRisk,
      change: newRisk - currentRisk,
      severity: sensitivity > 1.2 ? "high" : sensitivity > 0.9 ? "medium" : "low",
      inflationNew: Math.round((CURRENT_MARKET_DATA.inflation + direct.inflation * sensitivity) * 10) / 10,
      keyImpact: identifyKeyImpact(country, scenario),
    };
  }

  // DB impact with intensity scaling
  const dbImpact: Record<string, DBBusinessLineImpactResult> = {};
  for (const [line, impact] of Object.entries(dbScaled)) {
    dbImpact[line] = {
      ...impact,
      pnl_estimate: Math.round(impact.pnl_estimate * intensity),
    };
  }

  // Total P&L impact
  const totalDBPnL = Object.values(dbImpact).reduce(
    (sum, impact) => sum + (impact.pnl_estimate || 0),
    0
  );

  // Scale cascade steps timing based on time horizon
  const cascadeSteps = scaleCascadeSteps(scenario.cascadeSteps, timeHorizon);

  return {
    scenario: scenario.name,
    scenarioId: scenario.id,
    icon: scenario.icon,
    intensity,
    timeHorizon,
    before,
    after,
    changes,
    countryImpacts,
    dbImpact,
    totalDBPnL,
    cascadeSteps,
  };
}

/**
 * Run a custom simulation with user-provided parameters
 */
export function runCustomSimulation(params: {
  oilChange: number;
  ecbRateChange: number;
  eurUsdChange: number;
  gasChange: number;
  geopoliticalIntensity: number;
}, intensity: number = 1.0): SimulationResult {
  const before = CURRENT_MARKET_DATA;

  // Build effects from custom parameters
  const direct = {
    inflation: params.oilChange * 0.03 + params.gasChange * 0.02 + params.eurUsdChange * -0.08,
    eur_usd: params.eurUsdChange,
    gas_price: params.gasChange,
    consumer_confidence: -(Math.abs(params.oilChange) * 0.3 + params.geopoliticalIntensity * 1.5),
    brent_oil: params.oilChange,
    equity_markets: -(Math.abs(params.eurUsdChange) * 0.5 + params.geopoliticalIntensity * 0.8),
  };

  const ecb_rate_response = direct.inflation * 0.3 - Math.abs(direct.eur_usd) * 0.05;
  const gdp_impact = -(Math.abs(params.oilChange) * 0.02 + Math.abs(params.gasChange) * 0.015 + params.geopoliticalIntensity * 0.1);
  const secondary = {
    ecb_rate_response,
    gdp_impact,
    unemployment: Math.max(0, -gdp_impact * 1.2),
    mortgage_rates: ecb_rate_response * 0.7,
    bond_yields: direct.inflation * 0.3 + params.geopoliticalIntensity * 0.05,
    italian_spread: Math.max(0, direct.inflation * 0.2 + params.geopoliticalIntensity * 0.08),
  };

  // Scale by intensity
  const directScaled = scaleEffects(direct, intensity);
  const secondaryScaled = scaleEffects(secondary, intensity);

  // Calculate simulated values
  const after: SimulatedMarketData = {
    inflation: Math.round((before.inflation + directScaled.inflation) * 100) / 100,
    eur_usd: Math.round(before.eur_usd * (1 + directScaled.eur_usd / 100) * 100) / 100,
    oil: Math.round(before.oil * (1 + directScaled.brent_oil / 100)),
    ecb_rate: Math.round((before.ecb_rate + secondaryScaled.ecb_rate_response) * 100) / 100,
    equity: Math.round(before.equity * (1 + directScaled.equity_markets / 100)),
    bond_yield_de: Math.round((before.bond_yield_de + secondaryScaled.bond_yields) * 100) / 100,
    bond_yield_it: Math.round((before.bond_yield_it + secondaryScaled.bond_yields + secondaryScaled.italian_spread) * 100) / 100,
    gas_price: Math.round(before.gas_price * (1 + directScaled.gas_price / 100)),
    consumer_confidence: before.consumer_confidence + directScaled.consumer_confidence,
    unemployment: Math.round((before.unemployment + secondaryScaled.unemployment) * 10) / 10,
    gdp_growth: Math.round((before.gdp_growth + secondaryScaled.gdp_impact) * 10) / 10,
    recession_prob: Math.min(95, Math.max(5, Math.round(before.recession_prob + secondaryScaled.gdp_impact * 15))),
  };

  // Build changes
  const changes: ComparisonRow[] = [
    { metric: "Inflation (EU avg)", current: before.inflation, simulated: after.inflation, change: after.inflation - before.inflation, unit: "pp", direction: getDirection(after.inflation, before.inflation) },
    { metric: "EUR/USD", current: before.eur_usd, simulated: after.eur_usd, change: ((after.eur_usd - before.eur_usd) / before.eur_usd) * 100, unit: "%", direction: getDirection(after.eur_usd, before.eur_usd) },
    { metric: "ECB Rate", current: before.ecb_rate, simulated: after.ecb_rate, change: after.ecb_rate - before.ecb_rate, unit: "bp", direction: getDirection(after.ecb_rate, before.ecb_rate) },
    { metric: "Brent Oil ($)", current: before.oil, simulated: after.oil, change: ((after.oil - before.oil) / before.oil) * 100, unit: "%", direction: getDirection(after.oil, before.oil) },
    { metric: "Euro Stoxx 50", current: before.equity, simulated: after.equity, change: ((after.equity - before.equity) / before.equity) * 100, unit: "%", direction: getDirection(after.equity, before.equity) },
    { metric: "10Y German Bond", current: before.bond_yield_de, simulated: after.bond_yield_de, change: (after.bond_yield_de - before.bond_yield_de) * 100, unit: "bp", direction: getDirection(after.bond_yield_de, before.bond_yield_de) },
    { metric: "10Y Italian Bond", current: before.bond_yield_it, simulated: after.bond_yield_it, change: (after.bond_yield_it - before.bond_yield_it) * 100, unit: "bp", direction: getDirection(after.bond_yield_it, before.bond_yield_it) },
    { metric: "Recession Prob (EU avg)", current: before.recession_prob, simulated: after.recession_prob, change: after.recession_prob - before.recession_prob, unit: "pp", direction: getDirection(after.recession_prob, before.recession_prob) },
  ];

  // Simplified country impacts for custom
  const countryImpacts: Record<string, CountryImpactResult> = {};
  for (const country of Object.keys(COUNTRY_RISK_BASELINE)) {
    const currentRisk = COUNTRY_RISK_BASELINE[country] || 50;
    const riskChange = directScaled.inflation * 8 + directScaled.gas_price * 0.3 + secondaryScaled.gdp_impact * -5;
    const newRisk = Math.max(0, Math.min(100, Math.round(currentRisk + riskChange)));
    countryImpacts[country] = {
      riskBefore: currentRisk,
      riskAfter: newRisk,
      change: newRisk - currentRisk,
      severity: Math.abs(riskChange) > 15 ? "high" : Math.abs(riskChange) > 8 ? "medium" : "low",
      inflationNew: Math.round((CURRENT_MARKET_DATA.inflation + directScaled.inflation) * 10) / 10,
      keyImpact: "Custom scenario effects",
    };
  }

  // Build DB impact from economic changes
  const dbImpact: Record<string, DBBusinessLineImpactResult> = {
    corporate_lending: {
      direction: directScaled.inflation > 0.5 ? "negative" : "slightly_negative",
      magnitude: Math.abs(directScaled.inflation) > 1 ? "severe" : Math.abs(directScaled.inflation) > 0.5 ? "moderate" : "mild",
      pnl_estimate: Math.round(-Math.abs(directScaled.inflation) * 500),
      reason: directScaled.inflation > 0 ? "Inflation pressure impacts corporate clients" : "Growth concerns impact loan demand",
    },
    trading: {
      direction: Math.abs(directScaled.eur_usd) > 2 ? "positive" : "neutral",
      magnitude: Math.abs(directScaled.eur_usd) > 3 ? "moderate" : "mild",
      pnl_estimate: Math.round(Math.abs(directScaled.eur_usd) * 80),
      reason: "Market volatility from custom scenario",
    },
    treasury: {
      direction: secondaryScaled.bond_yields > 0 ? "negative" : "positive",
      magnitude: Math.abs(secondaryScaled.bond_yields) > 0.5 ? "moderate" : "mild",
      pnl_estimate: Math.round(-Math.abs(secondaryScaled.bond_yields) * 500),
      reason: secondaryScaled.bond_yields > 0 ? "Bond mark-to-market losses" : "Bond rally benefits portfolio",
    },
    net_interest_income: {
      direction: secondaryScaled.ecb_rate_response > 0 ? "positive" : "negative",
      magnitude: Math.abs(secondaryScaled.ecb_rate_response) > 0.5 ? "moderate" : "mild",
      pnl_estimate: Math.round(secondaryScaled.ecb_rate_response * 700),
      reason: secondaryScaled.ecb_rate_response > 0 ? "Rate hike expands NIM" : "Rate cut compresses NIM",
    },
  };

  const totalDBPnL = Object.values(dbImpact).reduce((sum, i) => sum + (i.pnl_estimate || 0), 0);

  // Create cascade steps for custom
  const cascadeSteps: CascadeStep[] = [
    { step: 1, event: "Custom scenario parameters applied", type: "trigger", delay: "immediate" },
    { step: 2, event: `Oil ${params.oilChange >= 0 ? "+" : ""}${params.oilChange.toFixed(0)}%, Gas ${params.gasChange >= 0 ? "+" : ""}${params.gasChange.toFixed(0)}%`, type: "direct", delay: "days" },
    { step: 3, event: `EUR/USD ${params.eurUsdChange.toFixed(1)}%, ECB rate ${params.ecbRateChange.toFixed(0)}bp`, type: "direct", delay: "weeks" },
    { step: 4, event: "Market reprices risk across asset classes", type: "secondary", delay: "weeks" },
    { step: 5, event: "Economic impact materializes across sectors", type: "tertiary", delay: "months" },
    { step: 6, event: "DB portfolio impact assessed", type: "bank_impact", delay: "ongoing" },
  ];

  return {
    scenario: "Custom Scenario",
    scenarioId: "custom",
    icon: "🎛️",
    intensity,
    timeHorizon: "12M",
    before,
    after,
    changes,
    countryImpacts,
    dbImpact,
    totalDBPnL,
    cascadeSteps,
  };
}

// ==============================
// Helper Functions
// ==============================

function getDirection(after: number, before: number): "up" | "down" | "neutral" {
  const diff = after - before;
  if (Math.abs(diff) < 0.01) return "neutral";
  return diff > 0 ? "up" : "down";
}

function identifyKeyImpact(country: string, scenario: ScenarioDefinition): string {
  const sensitivity = scenario.countrySensitivity[country] || 1.0;
  if (sensitivity > 1.4) return `High sensitivity: ${country} severely impacted by ${scenario.name.toLowerCase()}`;
  if (sensitivity > 1.1) return `Moderate sensitivity: ${country} faces material economic pressure`;
  return `${country} experiences limited direct impact from this scenario`;
}

function scaleEffects<T extends Record<string, number>>(effects: T, intensity: number): T {
  const scaled: Record<string, number> = {};
  for (const [key, value] of Object.entries(effects)) {
    scaled[key] = value * intensity;
  }
  return scaled as T;
}

function scaleDBImpact(
  dbImpact: Record<string, DBBusinessLineImpact>,
  intensity: number
): Record<string, DBBusinessLineImpact> {
  const scaled: Record<string, DBBusinessLineImpact> = {};
  for (const [key, impact] of Object.entries(dbImpact)) {
    const scaledPnl = Math.round(impact.pnl_estimate * intensity);
    let scaledMagnitude: DBBusinessLineImpact["magnitude"] = impact.magnitude;
    if (intensity >= 1.5 && impact.magnitude === "mild") scaledMagnitude = "moderate";
    if (intensity >= 1.5 && impact.magnitude === "moderate") scaledMagnitude = "severe";
    scaled[key] = { ...impact, pnl_estimate: scaledPnl, magnitude: scaledMagnitude };
  }
  return scaled;
}

function scaleCascadeSteps(
  steps: CascadeStep[],
  timeHorizon: string
): CascadeStep[] {
  const delayOrder = ["immediate", "hours", "days", "weeks", "months", "ongoing"];
  return steps.map((step, i) => {
    const delayIndex = delayOrder.indexOf(step.delay);
    if (delayIndex <= 0) return step;
    let adjustedDelay = step.delay;
    if (timeHorizon === "immediate") {
      adjustedDelay = delayIndex <= 2 ? step.delay : "weeks";
    } else if (timeHorizon === "3M") {
      adjustedDelay = delayIndex <= 3 ? step.delay : "months";
    } else if (timeHorizon === "6M") {
      adjustedDelay = step.delay;
    }
    return { ...step, delay: adjustedDelay };
  });
}

export { scaleEffects, CURRENT_MARKET_DATA, COUNTRY_RISK_BASELINE };
