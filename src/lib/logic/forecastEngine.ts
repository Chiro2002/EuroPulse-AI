/**
 * Forecast Engine
 * Factor-based rule models for macroeconomic forecasting
 */

import { Forecast, ECBMeeting, RecessionSignal, ForecastDriver, SectorOutlookItem } from "../types";

// ==============================
// Current Economic Data Snapshot
// ==============================

interface CountryData {
  inflation: number;
  oilChange3M: number;
  wageGrowth: number;
  eurChange3M: number;
  gasChange3M: number;
  ecbRateChange: number;
  demandGap: number;
  gdpGrowth: number;
  coreInflation: number;
  unemployment: number;
  unemploymentChange6M: number;
  pmi: number;
  consumerConfidence: number;
  consumerConfidenceChange: number;
  lendingStandards: string;
  yieldCurveSlope: number;
  creditGrowth: number;
}

const countryDataMap: Record<string, CountryData> = {
  DE: { inflation: 2.8, oilChange3M: 8, wageGrowth: 3.2, eurChange3M: -1.5, gasChange3M: 12, ecbRateChange: -25, demandGap: -0.8, gdpGrowth: -0.3, coreInflation: 2.5, unemployment: 5.9, unemploymentChange6M: 0.3, pmi: 44.8, consumerConfidence: -18, consumerConfidenceChange: -2, lendingStandards: "tightening", yieldCurveSlope: -0.35, creditGrowth: 1.2 },
  FR: { inflation: 3.2, oilChange3M: 8, wageGrowth: 3.0, eurChange3M: -1.5, gasChange3M: 12, ecbRateChange: -25, demandGap: -0.5, gdpGrowth: 0.6, coreInflation: 2.8, unemployment: 7.5, unemploymentChange6M: 0.5, pmi: 47.2, consumerConfidence: -22, consumerConfidenceChange: -3, lendingStandards: "tightening", yieldCurveSlope: -0.28, creditGrowth: 0.8 },
  IT: { inflation: 3.5, oilChange3M: 8, wageGrowth: 2.8, eurChange3M: -1.5, gasChange3M: 12, ecbRateChange: -25, demandGap: -1.2, gdpGrowth: 0.3, coreInflation: 3.0, unemployment: 10.2, unemploymentChange6M: -0.2, pmi: 46.5, consumerConfidence: -28, consumerConfidenceChange: 1, lendingStandards: "tightening", yieldCurveSlope: -0.45, creditGrowth: 0.5 },
  ES: { inflation: 3.3, oilChange3M: 8, wageGrowth: 3.5, eurChange3M: -1.5, gasChange3M: 12, ecbRateChange: -25, demandGap: -0.3, gdpGrowth: 2.8, coreInflation: 2.9, unemployment: 10.8, unemploymentChange6M: -0.5, pmi: 50.2, consumerConfidence: -15, consumerConfidenceChange: 3, lendingStandards: "stable", yieldCurveSlope: -0.2, creditGrowth: 2.1 },
  NL: { inflation: 2.5, oilChange3M: 8, wageGrowth: 3.8, eurChange3M: -1.5, gasChange3M: 12, ecbRateChange: -25, demandGap: 0.2, gdpGrowth: 1.2, coreInflation: 2.2, unemployment: 3.5, unemploymentChange6M: 0.1, pmi: 49.8, consumerConfidence: -12, consumerConfidenceChange: -1, lendingStandards: "stable", yieldCurveSlope: -0.15, creditGrowth: 1.8 },
};

const countryMeta: Record<string, { name: string; flag: string }> = {
  DE: { name: "Germany", flag: "🇩🇪" }, FR: { name: "France", flag: "🇫🇷" },
  IT: { name: "Italy", flag: "🇮🇹" }, ES: { name: "Spain", flag: "🇪🇸" },
  NL: { name: "Netherlands", flag: "🇳🇱" },
};

function getCurrentData(country: string): CountryData {
  return countryDataMap[country] || countryDataMap.DE;
}

// ==============================
// Legacy functions (preserved)
// ==============================

export function getDirection(currentValue: number, predictedValue: number): "up" | "down" | "stable" {
  const change = ((predictedValue - currentValue) / Math.abs(currentValue || 1)) * 100;
  if (change > 1) return "up";
  if (change < -1) return "down";
  return "stable";
}

export function formatForecastValue(value: number, metric: string): string {
  switch (metric) {
    case "GDP Growth": return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
    case "Inflation": return `${value.toFixed(1)}%`;
    case "Unemployment": return `${value.toFixed(1)}%`;
    case "10Y Bond Yield": return `${value.toFixed(2)}%`;
    default: return `${value.toFixed(1)}`;
  }
}

export function getConfidenceConfig(confidence: number): { label: string; color: string; barColor: string } {
  if (confidence >= 75) return { label: "High", color: "#10B981", barColor: "bg-db-success" };
  if (confidence >= 55) return { label: "Medium", color: "#F59E0B", barColor: "bg-db-warning" };
  return { label: "Low", color: "#EF4444", barColor: "bg-db-danger" };
}

export function groupForecastsByCountry(forecasts: Forecast[]): Record<string, Forecast[]> {
  return forecasts.reduce((acc, f) => {
    if (!acc[f.country]) acc[f.country] = [];
    acc[f.country].push(f);
    return acc;
  }, {} as Record<string, Forecast[]>);
}

export function groupForecastsByMetric(forecasts: Forecast[]): Record<string, Forecast[]> {
  return forecasts.reduce((acc, f) => {
    if (!acc[f.metric]) acc[f.metric] = [];
    acc[f.metric].push(f);
    return acc;
  }, {} as Record<string, Forecast[]>);
}

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
  const averageConfidence = Math.round(forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length);
  const sorted = [...forecasts].sort((a, b) => b.confidence - a.confidence);
  return {
    totalForecasts: forecasts.length, positiveDirections, negativeDirections, averageConfidence,
    mostCertain: sorted.slice(0, 3), leastCertain: sorted.slice(-3).reverse(),
  };
}

export function calculateForecastDivergence(currentValue: number, predictedValue: number): { absolute: number; percentage: number } {
  const absolute = Math.abs(predictedValue - currentValue);
  const percentage = currentValue !== 0 ? ((predictedValue - currentValue) / Math.abs(currentValue)) * 100 : 0;
  return { absolute: Math.round(absolute * 100) / 100, percentage: Math.round(percentage * 100) / 100 };
}

// ==============================
// Inflation Forecast
// ==============================

export function forecastInflation(country: string): {
  predictedValue: number;
  confidence: number;
  direction: "up" | "down" | "stable";
  change: number;
  drivers: { name: string; impact: number }[];
  historicalData: { month: string; value: number }[];
  forecastData: { month: string; value: number; low: number; high: number }[];
} {
  const data = getCurrentData(country);
  const current = data.inflation;
  const inflationChange = (data.oilChange3M * 0.03) + ((data.wageGrowth - 2.0) * 0.15) + (data.eurChange3M * -0.02) + (data.gasChange3M * 0.02) + (data.ecbRateChange * -0.003) + (data.demandGap * 0.05);
  const predicted = current + inflationChange;
  const confidence = Math.max(50, Math.min(95, 80 - Math.abs(inflationChange) * 3));
  const direction = predicted > current + 0.1 ? "up" : predicted < current - 0.1 ? "down" : "stable";
  const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];
  const fMonths = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  return {
    predictedValue: Math.round(predicted * 10) / 10,
    confidence: Math.round(confidence), direction, change: Math.round((predicted - current) * 10) / 10,
    drivers: [
      { name: "Oil prices", impact: Math.round(data.oilChange3M * 3) },
      { name: "Wage growth", impact: Math.round(Math.max(0, (data.wageGrowth - 2.0) * 15)) },
      { name: "ECB policy", impact: Math.round(Math.abs(data.ecbRateChange) * 0.3) },
    ],
    historicalData: months.map((m, i) => ({ month: m, value: Math.round((current + Math.sin(i * 0.5) * 0.4) * 10) / 10 })),
    forecastData: fMonths.map((m, i) => {
      const v = Math.round((current + inflationChange * ((i + 1) / 6)) * 10) / 10;
      return { month: m, value: v, low: Math.round((v - (100 - confidence) * 0.03) * 10) / 10, high: Math.round((v + (100 - confidence) * 0.03) * 10) / 10 };
    }),
  };
}

// ==============================
// ECB Path
// ==============================

export function predictECBAction(): { cut: number; hold: number; hike: number } {
  const d = countryDataMap.DE;
  if (d.inflation > 3.0 && d.coreInflation > 2.5) return { cut: 10, hold: 50, hike: 40 };
  if (d.inflation > 2.5) return { cut: 15, hold: 60, hike: 25 };
  if (d.inflation > 2.0) return { cut: 30, hold: 55, hike: 15 };
  if (d.gdpGrowth < 0.5) return { cut: 70, hold: 25, hike: 5 };
  return { cut: 35, hold: 55, hike: 10 };
}

export function generateECBPath() {
  const meetings = ["Mar 2026", "Apr 2026", "Jun 2026", "Jul 2026"];
  return {
    nextMeetings: meetings.map((date) => ({ date, probabilities: predictECBAction() })),
    expectedTrajectory: [
      { month: "Jan", rate: 3.75, marketImplied: 3.75 },
      { month: "Mar", rate: 3.60, marketImplied: 3.50 },
      { month: "Apr", rate: 3.50, marketImplied: 3.35 },
      { month: "Jun", rate: 3.35, marketImplied: 3.15 },
      { month: "Jul", rate: 3.25, marketImplied: 3.00 },
      { month: "Sep", rate: 3.10, marketImplied: 2.85 },
    ],
    explanation: "Sticky services inflation above 3% and tight labor markets are constraining the ECB from cutting aggressively despite weak growth. The committee is expected to deliver a 25bp cut in March followed by gradual easing through H2 2026.",
  };
}

// ==============================
// EUR/USD Forecast
// ==============================

export function forecastEURUSD() {
  const histMonths = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];
  const fMonths = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  return {
    current: 1.0825,
    forecast3M: { value: 1.06, rangeLow: 1.04, rangeHigh: 1.09 },
    forecast12M: { value: 1.10, rangeLow: 1.05, rangeHigh: 1.14 },
    drivers: [
      { name: "Rate Differential", impact: "negative" as const, description: "Fed maintaining higher rates vs ECB cuts widens rate gap" },
      { name: "Energy Costs", impact: "negative" as const, description: "Rising energy prices increase EU import costs" },
      { name: "Growth Differential", impact: "negative" as const, description: "US economy outperforming EU" },
      { name: "Geopolitical Risk", impact: "negative" as const, description: "Ukraine conflict proximity premium" },
    ],
    volatility: 8.5,
    historicalData: histMonths.map((m, i) => ({ month: m, value: Math.round((1.12 + Math.sin(i * 0.4) * 0.04) * 10000) / 10000 })),
    forecastData: fMonths.map((m, i) => ({
      month: m,
      value: Math.round((1.08 - i * 0.01 + Math.sin(i * 0.3) * 0.02) * 10000) / 10000,
      low: Math.round((1.06 - i * 0.005) * 10000) / 10000,
      high: Math.round((1.10 - i * 0.005) * 10000) / 10000,
    })),
  };
}

// ==============================
// Bond Outlook
// ==============================

export function forecastBonds() {
  const months = ["Jul","Aug","Sep","Oct","Nov","Dec","Jan"];
  const fMonths = ["Feb","Mar","Apr","May","Jun","Jul"];
  const genData = (base: number, vol: number) => months.map((m, i) => ({ month: m, value: Math.round((base + Math.sin(i * 0.5) * vol) * 100) / 100 }));
  const genFData = (base: number, vol: number) => fMonths.map((m, i) => ({ month: m, value: Math.round((base + Math.sin(i * 0.3) * vol) * 100) / 100 }));
  return {
    yields: [
      { country: "DE", flag: "🇩🇪", currentYield: 2.45, predictedYield: 2.20, historicalData: genData(2.45, 0.2), forecastData: genFData(2.20, 0.15) },
      { country: "FR", flag: "🇫🇷", currentYield: 3.15, predictedYield: 3.05, historicalData: genData(3.15, 0.2), forecastData: genFData(3.05, 0.15) },
      { country: "IT", flag: "🇮🇹", currentYield: 4.25, predictedYield: 4.40, historicalData: genData(4.25, 0.2), forecastData: genFData(4.40, 0.15) },
    ],
    spreads: [{ name: "IT-DE Spread", current: 180, predicted: 220, data: [...months.map((m, i) => ({ month: m, value: 180 + Math.sin(i * 0.6) * 15 })), ...fMonths.map((m, i) => ({ month: m, value: 200 + Math.sin(i * 0.4) * 20 }))] }],
    yieldCurve: {
      current: [{ tenor: "3M", rate: 3.5 }, { tenor: "1Y", rate: 3.2 }, { tenor: "2Y", rate: 2.8 }, { tenor: "5Y", rate: 2.6 }, { tenor: "10Y", rate: 2.45 }, { tenor: "30Y", rate: 2.55 }],
      predicted: [{ tenor: "3M", rate: 3.2 }, { tenor: "1Y", rate: 2.9 }, { tenor: "2Y", rate: 2.5 }, { tenor: "5Y", rate: 2.35 }, { tenor: "10Y", rate: 2.2 }, { tenor: "30Y", rate: 2.4 }],
    },
    durationRisk: "medium" as const,
  };
}

// ==============================
// Recession Probability
// ==============================

export function recessionProbability(country: string): { probability: number; signals: RecessionSignal[]; activeSignalCount: number } {
  const data = getCurrentData(country);
  const signals: RecessionSignal[] = [
    { name: "Yield Curve Inverted", active: data.yieldCurveSlope < 0, description: `10Y-2Y: ${data.yieldCurveSlope.toFixed(2)}%` },
    { name: "PMI Below 50", active: data.pmi < 50, description: `PMI: ${data.pmi}` },
    { name: "GDP Negative", active: data.gdpGrowth < 0, description: `GDP: ${data.gdpGrowth}%` },
    { name: "Consumer Confidence Falling", active: data.consumerConfidenceChange < 0, description: `Confidence: ${data.consumerConfidence}` },
    { name: "Unemployment Rising", active: data.unemploymentChange6M > 0, description: `6m change: +${data.unemploymentChange6M}pp` },
    { name: "Credit Tightening", active: data.lendingStandards === "tightening", description: "Lending standards tightening" },
  ];
  const weights: Record<string, number> = { "Yield Curve Inverted": 25, "PMI Below 50": 20, "GDP Negative": 25, "Consumer Confidence Falling": 10, "Unemployment Rising": 10, "Credit Tightening": 10 };
  const probability = Math.min(signals.reduce((sum, s) => sum + (s.active ? weights[s.name] : 0), 0), 95);
  return { probability, signals, activeSignalCount: signals.filter((s) => s.active).length };
}

// ==============================
// Sector Outlook
// ==============================

export function forecastSectors(): SectorOutlookItem[] {
  return [
    { sector: "Banking", outlook: "neutral", catalyst: "ECB rate path — NIM compression vs loan growth", confidence: 65 },
    { sector: "Energy", outlook: "bearish", catalyst: "Regulatory pressure, transition costs, oil volatility", confidence: 60 },
    { sector: "Real Estate", outlook: "bearish", catalyst: "Higher rates, valuation adjustments, CRE stress", confidence: 70 },
    { sector: "Manufacturing", outlook: "neutral", catalyst: "Export demand recovery, energy cost headwinds", confidence: 55 },
    { sector: "Technology", outlook: "bullish", catalyst: "AI investment cycle, digital transformation demand", confidence: 65 },
    { sector: "Utilities", outlook: "bullish", catalyst: "Energy transition CAPEX, regulated returns", confidence: 60 },
  ];
}

// ==============================
// Drivers
// ==============================

export function extractDrivers(): { positive: ForecastDriver[]; negative: ForecastDriver[] } {
  return {
    positive: [
      { direction: "up", label: "Energy prices trending higher", magnitude: "+15% in 3M", description: "Oil and gas price increases pushing inflation expectations higher" },
      { direction: "up", label: "Wage growth moderating", magnitude: "-0.3pp", description: "Tight labor markets gradually easing" },
    ],
    negative: [
      { direction: "down", label: "ECB rate path uncertainty", magnitude: "±25bps", description: "Divergent views on rate trajectory" },
      { direction: "down", label: "German industrial weakness", magnitude: "-1.2% MoM", description: "Manufacturing contraction spreading" },
      { direction: "down", label: "Italian debt sustainability", magnitude: "158% GDP", description: "Fiscal concerns driving spread widening" },
    ],
  };
}

// ==============================
// Generate full forecast data
// ==============================

export function generateFullForecast(countries: string[] = ["DE", "FR", "IT", "ES", "NL"]) {
  const inflationForecasts = countries.map((c) => {
    const f = forecastInflation(c);
    return { country: c, flag: countryMeta[c]?.flag || "🇪🇺", current: countryDataMap[c]?.inflation || 0, ...f };
  });
  const ecbPath = generateECBPath();
  const fx = forecastEURUSD();
  const bonds = forecastBonds();
  const recession = {
    probabilities: countries.map((c) => ({ country: c, flag: countryMeta[c]?.flag || "🇪🇺", probability: recessionProbability(c).probability })),
    signals: Object.fromEntries(countries.map((c) => [c, recessionProbability(c).signals])),
  };
  const sectors = forecastSectors();
  const drivers = extractDrivers();
  const highestRecession = [...recession.probabilities].sort((a, b) => b.probability - a.probability)[0];
  const biggestChange = [...inflationForecasts].sort((a, b) => Math.abs(b.change) - Math.abs(a.change))[0];

  return {
    inflation: inflationForecasts, ecbPath, fx, bonds, recession, sectors, drivers,
    narrative: "",
    topInsights: {
      likelyECBMove: `Cut (${ecbPath.nextMeetings[0].probabilities.cut}% prob in ${ecbPath.nextMeetings[0].date})`,
      highestRecessionRisk: `${countryMeta[highestRecession?.country]?.name || "Italy"} — ${highestRecession?.probability}%`,
      biggestForecastChange: `${countryMeta[biggestChange?.country]?.name || "Germany"} ${biggestChange?.direction === "up" ? "↑" : "↓"} ${Math.abs(biggestChange?.change || 0).toFixed(1)}pp`,
    },
  };
}
