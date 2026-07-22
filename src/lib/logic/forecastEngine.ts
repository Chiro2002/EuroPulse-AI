/**
 * Forecast Engine
 * Functions for calculating and generating forecasts
 */

import { Forecast } from "../types";
import { getRiskLevel } from "./riskCalculator";

/**
 * Calculate forecast confidence based on data quality and volatility
 */
export function calculateConfidence(
  historicalAccuracy: number,
  volatility: number,
  dataCompleteness: number
): number {
  const score =
    historicalAccuracy * 0.4 +
    (100 - volatility) * 0.35 +
    dataCompleteness * 0.25;

  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Determine forecast direction
 */
export function getDirection(currentValue: number, predictedValue: number): "up" | "down" | "stable" {
  const change = ((predictedValue - currentValue) / Math.abs(currentValue || 1)) * 100;
  if (change > 1) return "up";
  if (change < -1) return "down";
  return "stable";
}

/**
 * Format forecast value with prefix/suffix based on metric type
 */
export function formatForecastValue(value: number, metric: string): string {
  switch (metric) {
    case "GDP Growth":
      return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
    case "Inflation":
      return `${value.toFixed(1)}%`;
    case "Unemployment":
      return `${value.toFixed(1)}%`;
    case "10Y Bond Yield":
      return `${value.toFixed(2)}%`;
    default:
      return `${value.toFixed(1)}`;
  }
}

/**
 * Get forecast confidence styling
 */
export function getConfidenceConfig(confidence: number): {
  label: string;
  color: string;
  barColor: string;
} {
  if (confidence >= 75) {
    return {
      label: "High",
      color: "#10B981",
      barColor: "bg-db-success",
    };
  }
  if (confidence >= 55) {
    return {
      label: "Medium",
      color: "#F59E0B",
      barColor: "bg-db-warning",
    };
  }
  return {
    label: "Low",
    color: "#EF4444",
    barColor: "bg-db-danger",
  };
}

/**
 * Group forecasts by country
 */
export function groupForecastsByCountry(forecasts: Forecast[]): Record<string, Forecast[]> {
  return forecasts.reduce((acc, f) => {
    if (!acc[f.country]) acc[f.country] = [];
    acc[f.country].push(f);
    return acc;
  }, {} as Record<string, Forecast[]>);
}

/**
 * Group forecasts by metric
 */
export function groupForecastsByMetric(forecasts: Forecast[]): Record<string, Forecast[]> {
  return forecasts.reduce((acc, f) => {
    if (!acc[f.metric]) acc[f.metric] = [];
    acc[f.metric].push(f);
    return acc;
  }, {} as Record<string, Forecast[]>);
}

/**
 * Generate summary statistics for forecasts
 */
export function generateForecastSummary(forecasts: Forecast[]): {
  totalForecasts: number;
  positiveDirections: number;
  negativeDirections: number;
  averageConfidence: number;
  mostCertain: Forecast[];
  leastCertain: Forecast[];
} {
  const positiveDirections = forecasts.filter((f) => f.direction === "up").length;
  const negativeDirections = forecasts.filter((f) => f.direction === "down").length;
  const averageConfidence = Math.round(
    forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length
  );

  const sorted = [...forecasts].sort((a, b) => b.confidence - a.confidence);

  return {
    totalForecasts: forecasts.length,
    positiveDirections,
    negativeDirections,
    averageConfidence,
    mostCertain: sorted.slice(0, 3),
    leastCertain: sorted.slice(-3).reverse(),
  };
}

/**
 * Calculate divergence from current value
 */
export function calculateForecastDivergence(currentValue: number, predictedValue: number): {
  absolute: number;
  percentage: number;
} {
  const absolute = Math.abs(predictedValue - currentValue);
  const percentage = currentValue !== 0 
    ? ((predictedValue - currentValue) / Math.abs(currentValue)) * 100 
    : 0;
  
  return {
    absolute: Math.round(absolute * 100) / 100,
    percentage: Math.round(percentage * 100) / 100,
  };
}
