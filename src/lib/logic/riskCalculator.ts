/**
 * Risk Calculator
 * Formulas and functions for calculating risk scores
 */

import { RiskScore } from "../types";

// Weight configuration for composite risk score
const RISK_WEIGHTS = {
  inflation: 0.15,
  energy: 0.15,
  debt: 0.20,
  unemployment: 0.15,
  housing: 0.10,
  geopolitical: 0.25,
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
      color: "#EF4444",
      bgColor: "rgba(239, 68, 68, 0.15)",
      textColor: "text-db-danger",
    };
  }
  if (score >= 60) {
    return {
      label: "High",
      color: "#F59E0B",
      bgColor: "rgba(245, 158, 11, 0.15)",
      textColor: "text-db-warning",
    };
  }
  if (score >= 40) {
    return {
      label: "Moderate",
      color: "#3B82F6",
      bgColor: "rgba(59, 130, 246, 0.15)",
      textColor: "text-db-accent",
    };
  }
  return {
    label: "Low",
    color: "#10B981",
    bgColor: "rgba(16, 185, 129, 0.15)",
    textColor: "text-db-success",
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
