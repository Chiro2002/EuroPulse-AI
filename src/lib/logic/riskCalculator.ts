/**
 * Risk Calculator
 * Formulas and functions for calculating risk scores
 */

import { RiskScore } from "../types";

// Original weight configuration for composite risk score
const RISK_WEIGHTS = {
  inflation: 0.15,
  energy: 0.15,
  debt: 0.20,
  unemployment: 0.15,
  housing: 0.10,
  geopolitical: 0.25,
};

// Updated weight configuration per the new formula
const NEW_RISK_WEIGHTS = {
  inflationStress: 0.25,
  energyStress: 0.20,
  debtStress: 0.15,
  unemploymentStress: 0.15,
  housingStress: 0.10,
  geopoliticalStress: 0.15,
};

/**
 * Calculate total risk score from components using weighted average
 */
export function calculateTotalRisk(components: Omit<RiskScore, "country" | "total" | "trend">): number {
  const total = Object.entries(RISK_WEIGHTS).reduce((sum, [key, weight]) => {
    return sum + (components[key as keyof typeof components] || 0) * weight;
  }, 0);

  return Math.round(total);
}

// ==============================
// New Risk Score Formulas
// ==============================

/**
 * Calculate inflation stress (0-100): how far from 2% target
 * inflation: current inflation rate (e.g. 2.8)
 */
export function calculateInflationStress(inflationRate: number): number {
  return Math.min(Math.abs(inflationRate - 2.0) * 25, 100);
}

/**
 * Calculate energy stress (0-100): energy import dependency
 * energyImportPct: percentage of energy imported (0-100)
 */
export function calculateEnergyStress(energyImportPct: number): number {
  return Math.min(energyImportPct, 100);
}

/**
 * Calculate debt stress (0-100): debt-to-GDP ratio
 * debtToGdp: debt as percentage of GDP (e.g. 158 for Italy)
 */
export function calculateDebtStress(debtToGdp: number): number {
  return Math.min(debtToGdp / 1.5, 100);
}

/**
 * Calculate unemployment stress (0-100)
 * unemploymentChange6M: change in unemployment over 6 months (percentage points)
 */
export function calculateUnemploymentStress(unemploymentChange6M: number): number {
  return Math.max(0, 50 + unemploymentChange6M * 20);
}

/**
 * Calculate housing stress (0-100)
 * priceToIncomeRatio: house price to income ratio
 */
export function calculateHousingStress(priceToIncomeRatio: number): number {
  return Math.min(priceToIncomeRatio * 8, 100);
}

/**
 * Calculate country risk score using the new formula
 */
export function calculateNewCountryRisk(components: {
  inflationRate: number;
  energyImportPct: number;
  debtToGdp: number;
  unemploymentChange6M: number;
  priceToIncomeRatio: number;
  russiaTradePct: number;
  borderRisk: number;
  activeEvents: number;
}): number {
  const inflationStress = calculateInflationStress(components.inflationRate);
  const energyStress = calculateEnergyStress(components.energyImportPct);
  const debtStress = calculateDebtStress(components.debtToGdp);
  const unemploymentStress = calculateUnemploymentStress(components.unemploymentChange6M);
  const housingStress = calculateHousingStress(components.priceToIncomeRatio);
  
  // Geopolitical stress: combination of Russia trade %, energy dependency, border risk, active events
  const geopoliticalStress = Math.min(
    components.russiaTradePct * 0.3 +
    components.energyImportPct * 0.2 +
    components.borderRisk * 0.3 +
    components.activeEvents * 10,
    100
  );

  const total =
    inflationStress * NEW_RISK_WEIGHTS.inflationStress +
    energyStress * NEW_RISK_WEIGHTS.energyStress +
    debtStress * NEW_RISK_WEIGHTS.debtStress +
    unemploymentStress * NEW_RISK_WEIGHTS.unemploymentStress +
    housingStress * NEW_RISK_WEIGHTS.housingStress +
    geopoliticalStress * NEW_RISK_WEIGHTS.geopoliticalStress;

  return Math.round(total);
}

/**
 * Calculate the Europe overall stress score
 */
export function calculateEuropeStress(scores: RiskScore[], marketVolatilityFactors: {
  bondVolatility: number;
  fxVolatility: number;
  equityVolatility: number;
}): number {
  const avgCountryRisk = scores.reduce((sum, s) => sum + s.total, 0) / scores.length;
  const marketFactor = (marketVolatilityFactors.bondVolatility + marketVolatilityFactors.fxVolatility + marketVolatilityFactors.equityVolatility) / 3;
  
  return Math.round(avgCountryRisk * 0.7 + marketFactor * 0.3);
}

// ==============================
// Detailed Risk Score Formulas
// ==============================

interface CountryInputData {
  inflation: number;
  energyImportPct: number;
  gasStorage: number;
  oilPriceExposure: number;
  debtToGdp: number;
  unemploymentRate: number;
  unemploymentChange6M: number;
  priceToIncomeRatio: number;
  russiaTradePct: number;
  energyFromRussiaPct: number;
  borderRisk: boolean;
  activeEventsCount: number;
  defenseSpendingPct: number;
}

export function calculateInflationStressDetailed(data: { inflation: number }): number {
  const deviation = Math.abs(data.inflation - 2.0);
  return Math.min(deviation * 25, 100);
}

export function calculateEnergyStressDetailed(data: { energyImportPct: number; gasStorage: number; oilPriceExposure: number }): number {
  return Math.min(
    (data.energyImportPct * 0.6) +
    ((100 - data.gasStorage) * 0.3) +
    (data.oilPriceExposure * 0.1),
    100
  );
}

export function calculateDebtStressDetailed(data: { debtToGdp: number }): number {
  return Math.min(data.debtToGdp / 1.5, 100);
}

export function calculateEmploymentStressDetailed(data: { unemploymentRate: number; unemploymentChange6M: number }): number {
  return Math.max(0, Math.min(
    50 + (data.unemploymentChange6M * 20) +
    (data.unemploymentRate * 3),
    100
  ));
}

export function calculateHousingStressDetailed(data: { priceToIncomeRatio: number }): number {
  return Math.min(data.priceToIncomeRatio * 8, 100);
}

export function calculateGeopoliticalStressDetailed(data: {
  russiaTradePct: number;
  energyFromRussiaPct: number;
  borderRisk: boolean;
  activeEventsCount: number;
  defenseSpendingPct: number;
}): number {
  let score = 0;
  score += data.russiaTradePct * 2;
  score += data.energyFromRussiaPct * 1.5;
  score += data.borderRisk ? 20 : 0;
  score += data.activeEventsCount * 10;
  score += Math.max(0, (2.0 - data.defenseSpendingPct) * 20);
  return Math.min(score, 100);
}

export function calculateCountryRisk(countryData: CountryInputData): {
  total: number;
  breakdown: {
    inflation: number;
    energy: number;
    debt: number;
    employment: number;
    housing: number;
    geopolitical: number;
  };
} {
  const breakdown = {
    inflation: Math.round(calculateInflationStressDetailed(countryData)),
    energy: Math.round(calculateEnergyStressDetailed(countryData)),
    debt: Math.round(calculateDebtStressDetailed(countryData)),
    employment: Math.round(calculateEmploymentStressDetailed(countryData)),
    housing: Math.round(calculateHousingStressDetailed(countryData)),
    geopolitical: Math.round(calculateGeopoliticalStressDetailed(countryData)),
  };

  const weights = {
    inflation: 0.25,
    energy: 0.20,
    debt: 0.15,
    employment: 0.15,
    housing: 0.10,
    geopolitical: 0.15,
  };

  const total = Math.round(
    Object.keys(breakdown).reduce(
      (sum, key) => sum + breakdown[key as keyof typeof breakdown] * weights[key as keyof typeof weights],
      0
    )
  );

  return { total, breakdown };
}

/**
 * Calculate sector stress for a given sector and country
 */
export function calculateSectorStress(
  sector: string,
  countryRisk: { breakdown: { inflation: number; energy: number; debt: number; employment: number; housing: number; geopolitical: number } }
): number {
  const { breakdown } = countryRisk;
  switch (sector) {
    case "banking":
      return Math.round(breakdown.debt * 0.4 + breakdown.inflation * 0.3 + breakdown.geopolitical * 0.3);
    case "energy":
      return Math.round(breakdown.energy * 0.5 + breakdown.geopolitical * 0.3 + breakdown.inflation * 0.2);
    case "real_estate":
      return Math.round(breakdown.housing * 0.5 + breakdown.employment * 0.3 + breakdown.debt * 0.2);
    case "manufacturing":
      return Math.round(breakdown.energy * 0.35 + breakdown.employment * 0.25 + breakdown.inflation * 0.25 + breakdown.geopolitical * 0.15);
    case "retail":
      return Math.round(breakdown.employment * 0.4 + breakdown.inflation * 0.4 + breakdown.housing * 0.2);
    case "tech":
      return Math.round(breakdown.inflation * 0.3 + breakdown.employment * 0.3 + breakdown.geopolitical * 0.4);
    case "utilities":
      return Math.round(breakdown.energy * 0.5 + breakdown.debt * 0.3 + breakdown.inflation * 0.2);
    case "transport":
      return Math.round(breakdown.energy * 0.4 + breakdown.inflation * 0.3 + breakdown.employment * 0.3);
    default:
      return 50;
  }
}

/**
 * Determine risk trend based on historical comparison
 */
export function determineTrend(
  current: number,
  previous: number,
  threshold: number = 2
): "up" | "down" | "stable" {
  if (current > previous + threshold) return "up";
  if (current < previous - threshold) return "down";
  return "stable";
}

/**
 * Get risk level label and color
 */
export function getRiskLevel(score: number): {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
} {
  if (score >= 75) {
    return {
      label: "Critical",
      color: "#E5484D",
      bgColor: "rgba(229, 72, 77, 0.15)",
      textColor: "text-[#E5484D]",
    };
  }
  if (score >= 60) {
    return {
      label: "High",
      color: "#F5A623",
      bgColor: "rgba(245, 162, 35, 0.15)",
      textColor: "text-[#F5A623]",
    };
  }
  if (score >= 40) {
    return {
      label: "Moderate",
      color: "#3B82F6",
      bgColor: "rgba(59, 130, 246, 0.15)",
      textColor: "text-primary",
    };
  }
  return {
    label: "Low",
    color: "#2FAE60",
    bgColor: "rgba(47, 174, 96, 0.15)",
    textColor: "text-[#2FAE60]",
  };
}

/**
 * Calculate aggregate risk across multiple countries
 */
export function calculateAggregateRisk(scores: RiskScore[]): {
  average: number;
  weightedByGDP: number;
  highest: RiskScore | null;
  lowest: RiskScore | null;
} {
  if (scores.length === 0) {
    return { average: 0, weightedByGDP: 0, highest: null, lowest: null };
  }

  const average = Math.round(
    scores.reduce((sum, s) => sum + s.total, 0) / scores.length
  );

  // Simplified GDP weights (using mock data)
  const gdpWeights: Record<string, number> = {
    DE: 3860, FR: 2780, IT: 2010, ES: 1400, NL: 1010,
    BE: 580, PL: 690, AT: 480, PT: 250, IE: 500,
  };

  const totalGDP = Object.values(gdpWeights).reduce((a, b) => a + b, 0);

  const weightedByGDP = Math.round(
    scores.reduce((sum, s) => {
      const weight = (gdpWeights[s.country] || 1) / totalGDP;
      return sum + s.total * weight;
    }, 0)
  );

  const sorted = [...scores].sort((a, b) => b.total - a.total);

  return {
    average,
    weightedByGDP,
    highest: sorted[0],
    lowest: sorted[sorted.length - 1],
  };
}

/**
 * Sector risk based on country risk composition
 */
export function getSectorRiskBreakdown(score: RiskScore): {
  sector: string;
  score: number;
  weight: number;
}[] {
  const sectors = [
    { sector: "Inflation", score: score.inflation, weight: RISK_WEIGHTS.inflation },
    { sector: "Energy", score: score.energy, weight: RISK_WEIGHTS.energy },
    { sector: "Debt", score: score.debt, weight: RISK_WEIGHTS.debt },
    { sector: "Unemployment", score: score.unemployment, weight: RISK_WEIGHTS.unemployment },
    { sector: "Housing", score: score.housing, weight: RISK_WEIGHTS.housing },
    { sector: "Geopolitical", score: score.geopolitical, weight: RISK_WEIGHTS.geopolitical },
  ];

  return sectors.sort((a, b) => b.score - a.score);
}
