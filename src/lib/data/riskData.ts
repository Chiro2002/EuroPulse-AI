/**
 * Detailed risk data for each EU country
 * Used for the Risk & Stress Radar page deep dives
 */

import { CountryDetail, SectorStressData, HistoricalTrend, RiskAPIResponse } from "@/lib/types";
import { calculateCountryRisk, calculateSectorStress, getRiskLevel } from "@/lib/logic/riskCalculator";

// Raw input data for each country
const countryInputData: Record<string, {
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
}> = {
  DE: {
    inflation: 2.8, energyImportPct: 65, gasStorage: 78, oilPriceExposure: 70,
    debtToGdp: 68, unemploymentRate: 5.9, unemploymentChange6M: 0.3,
    priceToIncomeRatio: 8.2, russiaTradePct: 2.5, energyFromRussiaPct: 5,
    borderRisk: false, activeEventsCount: 2, defenseSpendingPct: 1.5,
  },
  FR: {
    inflation: 3.2, energyImportPct: 55, gasStorage: 65, oilPriceExposure: 60,
    debtToGdp: 112, unemploymentRate: 7.5, unemploymentChange6M: 0.5,
    priceToIncomeRatio: 7.5, russiaTradePct: 3.0, energyFromRussiaPct: 8,
    borderRisk: false, activeEventsCount: 1, defenseSpendingPct: 1.9,
  },
  IT: {
    inflation: 3.5, energyImportPct: 78, gasStorage: 55, oilPriceExposure: 75,
    debtToGdp: 158, unemploymentRate: 10.2, unemploymentChange6M: -0.2,
    priceToIncomeRatio: 6.8, russiaTradePct: 4.0, energyFromRussiaPct: 12,
    borderRisk: false, activeEventsCount: 1, defenseSpendingPct: 1.4,
  },
  ES: {
    inflation: 3.3, energyImportPct: 72, gasStorage: 60, oilPriceExposure: 65,
    debtToGdp: 120, unemploymentRate: 10.8, unemploymentChange6M: -0.5,
    priceToIncomeRatio: 7.0, russiaTradePct: 2.0, energyFromRussiaPct: 6,
    borderRisk: false, activeEventsCount: 0, defenseSpendingPct: 1.2,
  },
  NL: {
    inflation: 2.5, energyImportPct: 55, gasStorage: 85, oilPriceExposure: 50,
    debtToGdp: 52, unemploymentRate: 3.5, unemploymentChange6M: 0.1,
    priceToIncomeRatio: 12.5, russiaTradePct: 1.5, energyFromRussiaPct: 3,
    borderRisk: false, activeEventsCount: 0, defenseSpendingPct: 1.7,
  },
  BE: {
    inflation: 2.9, energyImportPct: 62, gasStorage: 70, oilPriceExposure: 55,
    debtToGdp: 105, unemploymentRate: 5.5, unemploymentChange6M: 0.2,
    priceToIncomeRatio: 8.0, russiaTradePct: 2.0, energyFromRussiaPct: 4,
    borderRisk: false, activeEventsCount: 1, defenseSpendingPct: 1.2,
  },
  PL: {
    inflation: 4.8, energyImportPct: 75, gasStorage: 45, oilPriceExposure: 80,
    debtToGdp: 55, unemploymentRate: 5.0, unemploymentChange6M: 0.4,
    priceToIncomeRatio: 7.2, russiaTradePct: 8.0, energyFromRussiaPct: 25,
    borderRisk: true, activeEventsCount: 3, defenseSpendingPct: 2.4,
  },
  AT: {
    inflation: 2.7, energyImportPct: 60, gasStorage: 50, oilPriceExposure: 65,
    debtToGdp: 80, unemploymentRate: 4.2, unemploymentChange6M: 0.1,
    priceToIncomeRatio: 8.5, russiaTradePct: 5.0, energyFromRussiaPct: 20,
    borderRisk: false, activeEventsCount: 2, defenseSpendingPct: 1.0,
  },
  PT: {
    inflation: 2.6, energyImportPct: 70, gasStorage: 65, oilPriceExposure: 60,
    debtToGdp: 130, unemploymentRate: 6.5, unemploymentChange6M: -0.3,
    priceToIncomeRatio: 6.5, russiaTradePct: 1.5, energyFromRussiaPct: 4,
    borderRisk: false, activeEventsCount: 0, defenseSpendingPct: 1.4,
  },
  IE: {
    inflation: 2.2, energyImportPct: 50, gasStorage: 80, oilPriceExposure: 45,
    debtToGdp: 45, unemploymentRate: 4.0, unemploymentChange6M: -0.2,
    priceToIncomeRatio: 10.5, russiaTradePct: 1.0, energyFromRussiaPct: 2,
    borderRisk: false, activeEventsCount: 0, defenseSpendingPct: 0.3,
  },
};

const countryMeta: Record<string, { name: string; flag: string }> = {
  DE: { name: "Germany", flag: "🇩🇪" },
  FR: { name: "France", flag: "🇫🇷" },
  IT: { name: "Italy", flag: "🇮🇹" },
  ES: { name: "Spain", flag: "🇪🇸" },
  NL: { name: "Netherlands", flag: "🇳🇱" },
  BE: { name: "Belgium", flag: "🇧🇪" },
  PL: { name: "Poland", flag: "🇵🇱" },
  AT: { name: "Austria", flag: "🇦🇹" },
  PT: { name: "Portugal", flag: "🇵🇹" },
  IE: { name: "Ireland", flag: "🇮🇪" },
};

const geopoliticalFactors: Record<string, string[]> = {
  DE: ["Ukraine conflict energy exposure", "Russian gas dependence legacy", "NATO spending commitment pressure", "China trade dependency risk"],
  FR: ["Political instability over pension reform", "EU fiscal rule negotiations", "Migration policy tensions", "African Sahel security exposure"],
  IT: ["High sovereign debt sustainability", "Political coalition instability", "Migration route tensions", "Banking sector NPL legacy"],
  ES: ["Regional separatist tensions", "High public debt trajectory", "North Africa migration pressure", "Latin America trade exposure"],
  NL: ["Housing bubble risk", "EU budget contribution disputes", "Nitrogen emission political crisis", "Energy transition costs"],
  BE: ["Government coalition instability", "Large public debt burden", "EU institutional complexity", "Terrorism risk monitoring"],
  PL: ["Ukraine war border proximity", "Belarus border migration crisis", "EU rule of law tensions", "Energy transition from coal"],
  AT: ["Russian gas dependency legacy", "Ukraine war economic spillover", "Banking sector CEE exposure", "Far-right political rise"],
  PT: ["High public debt vulnerability", "Tourism dependency concentration", "Climate change wildfire risk", "Productivity growth lagging"],
  IE: ["Corporate tax rate international pressure", "Pharmaceutical sector concentration", "Brexit trade disruption legacy", "Housing affordability crisis"],
};

export function buildCountryDetails(): CountryDetail[] {
  return Object.entries(countryInputData).map(([code, data]) => {
    const calculated = calculateCountryRisk(data);
    return {
      code,
      name: countryMeta[code].name,
      flag: countryMeta[code].flag,
      totalRisk: calculated.total,
      breakdown: calculated.breakdown,
      details: {
        inflation: { current: data.inflation, target: 2.0, trend: data.inflation > 2.5 ? "up" : data.inflation < 1.5 ? "down" : "stable" },
        energy: { importPct: data.energyImportPct, gasStorage: data.gasStorage, oilExposure: data.oilPriceExposure >= 70 ? "high" : data.oilPriceExposure >= 50 ? "medium" : "low" },
        debt: { debtToGdp: data.debtToGdp, deficit: -(data.debtToGdp * 0.03) },
        employment: { unemployment: data.unemploymentRate, change6m: data.unemploymentChange6M },
        housing: { priceToIncome: data.priceToIncomeRatio, mortgageStress: data.priceToIncomeRatio >= 10 ? "high" : data.priceToIncomeRatio >= 7 ? "medium" : "low" },
        geopolitical: { factors: geopoliticalFactors[code] || [] },
      },
      trend30d: data.activeEventsCount * 3 + (data.inflation > 3 ? 5 : 0),
      trend90d: data.activeEventsCount * 5 + (data.debtToGdp > 100 ? 8 : 0) + (data.inflation > 3 ? 3 : 0),
    };
  });
}

export function buildSectorStress(countries: CountryDetail[]): SectorStressData {
  const sectors = ["banking", "energy", "real_estate", "manufacturing", "retail", "tech", "utilities", "transport"];
  const result: SectorStressData = {};
  
  for (const sector of sectors) {
    result[sector] = {};
    for (const country of countries) {
      result[sector][country.code] = calculateSectorStress(sector, country);
    }
  }
  
  return result;
}

export function buildHistoricalTrends(countries: CountryDetail[]): Record<string, HistoricalTrend[]> {
  const result: Record<string, HistoricalTrend[]> = {};
  const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];
  
  for (const country of countries) {
    const baseRisk = country.totalRisk;
    const trends: HistoricalTrend[] = months.map((month, i) => {
      // Simulate some variation over 6 months
      const variation = Math.round((Math.sin(i * 0.8) * 8 + Math.cos(i * 0.3) * 4) * (country.trend90d > 0 ? 1 : -1) * 0.3);
      return {
        date: `2025-${String(i + 8).padStart(2, "0")}-01`,
        riskScore: Math.max(10, Math.min(95, baseRisk + variation)),
      };
    });
    result[country.code] = trends;
  }
  
  return result;
}

export function buildRiskData(): RiskAPIResponse {
  const countries = buildCountryDetails();
  const sorted = [...countries].sort((a, b) => b.totalRisk - a.totalRisk);
  
  // Calculate trend deltas
  const trending = [...countries]
    .map(c => ({ code: c.code, delta: c.trend30d }))
    .sort((a, b) => b.delta - a.delta);
  
  return {
    countries,
    sectorStress: buildSectorStress(countries),
    historicalTrends: buildHistoricalTrends(countries),
    topInsights: {
      mostVulnerable: sorted[0].code,
      risingFastest: trending[0].code,
      mostStable: sorted[sorted.length - 1].code,
      europeStressTrend: Math.round(countries.reduce((s, c) => s + c.totalRisk, 0) / countries.length),
    },
    eventHighlights: [
      { date: "2025-10-15", event: "ECB rate hike pause signaled" },
      { date: "2025-11-20", event: "German industrial output decline" },
      { date: "2025-12-10", event: "Italian budget concerns escalate" },
      { date: "2026-01-08", event: "Russian gas flows via Ukraine halt" },
      { date: "2026-01-13", event: "French credit rating downgrade" },
    ],
  };
}
