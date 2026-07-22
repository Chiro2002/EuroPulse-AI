import { ScenarioDBImpact } from "../types";

// Deutsche Bank portfolio exposure data by country and sector
export const dbExposureByCountry: Record<string, { total: number; breakdown: Record<string, number> }> = {
  DE: {
    total: 185000,
    breakdown: {
      "Corporate Banking": 72000,
      "Retail Banking": 45000,
      "Investment Banking": 38000,
      "Asset Management": 18000,
      "Trade Finance": 12000,
    },
  },
  FR: {
    total: 95000,
    breakdown: {
      "Corporate Banking": 38000,
      "Investment Banking": 25000,
      "Asset Management": 15000,
      "Trade Finance": 12000,
      "Retail Banking": 5000,
    },
  },
  IT: {
    total: 78000,
    breakdown: {
      "Sovereign Bonds": 28000,
      "Corporate Banking": 22000,
      "Investment Banking": 12000,
      "Trade Finance": 10000,
      "Asset Management": 6000,
    },
  },
  ES: {
    total: 52000,
    breakdown: {
      "Corporate Banking": 18000,
      "Retail Banking": 12000,
      "Trade Finance": 10000,
      "Investment Banking": 7000,
      "Real Estate": 5000,
    },
  },
  NL: {
    total: 68000,
    breakdown: {
      "Corporate Banking": 22000,
      "Mortgage Lending": 18000,
      "Investment Banking": 12000,
      "Trade Finance": 10000,
      "Asset Management": 6000,
    },
  },
  BE: {
    total: 32000,
    breakdown: {
      "Corporate Banking": 12000,
      "Retail Banking": 8000,
      "Investment Banking": 6000,
      "Trade Finance": 6000,
    },
  },
  PL: {
    total: 28000,
    breakdown: {
      "Corporate Banking": 10000,
      "Trade Finance": 8000,
      "Investment Banking": 5000,
      "Retail Banking": 5000,
    },
  },
  AT: {
    total: 25000,
    breakdown: {
      "Corporate Banking": 10000,
      "Trade Finance": 6000,
      "Investment Banking": 5000,
      "Asset Management": 4000,
    },
  },
  PT: {
    total: 15000,
    breakdown: {
      "Corporate Banking": 6000,
      "Sovereign Bonds": 4000,
      "Trade Finance": 3000,
      "Retail Banking": 2000,
    },
  },
  IE: {
    total: 22000,
    breakdown: {
      "Corporate Banking": 10000,
      "Investment Banking": 7000,
      "Asset Management": 3000,
      "Trade Finance": 2000,
    },
  },
};

// Total DB exposure by department (across all countries)
export const dbExposureByDepartment: Record<string, number> = {
  "Corporate Banking": 200000,
  "Investment Banking": 117000,
  "Retail Banking": 77000,
  "Trade Finance": 79000,
  "Asset Management": 52000,
  "Mortgage Lending": 18000,
  "Sovereign Bonds": 32000,
  "Real Estate": 5000,
};

// DB's total EU exposure
export const totalDBExposure = 600000; // €600B total EU exposure

// Key DB vulnerabilities by department
export const dbVulnerabilities = {
  "Corporate Banking": {
    description: "Largest exposure area with concentrated risk in German manufacturing and energy sectors",
    keyRisks: ["German industrial recession", "Energy cost escalation", "Auto sector transformation"],
    mitigationStatus: "Partial hedges in place; active monitoring",
  },
  "Investment Banking": {
    description: "Market-making and proprietary positions across EU sovereign bonds and derivatives",
    keyRisks: ["Peripheral spread widening", "Rate volatility", "EUR/USD dislocations"],
    mitigationStatus: "Dynamic hedging program active; VAR within limits",
  },
  "Retail Banking": {
    description: "Consumer lending and deposit franchises in Germany and Spain",
    keyRisks: ["Mortgage default uptick", "NIM compression", "Consumer spending slowdown"],
    mitigationStatus: "Conservative underwriting; strong capital buffers",
  },
  "Trade Finance": {
    description: "Cross-border trade credit and supply chain finance across EU supply chains",
    keyRisks: ["Trade disruption (Russia/China)", "Supply chain relocation", "Tariff escalation"],
    mitigationStatus: "Diversified portfolio; country limits in place",
  },
  "Sovereign Bonds": {
    description: "BTP (Italian) and other peripheral bond holdings in banking book",
    keyRisks: ["Italian downgrade risk", "Spread widening", "ECB QT impact"],
    mitigationStatus: "Duration managed; hedging via CDS",
  },
};

// Mock function to calculate DB impact from a scenario
export function calculateDBImpactFromScenario(
  scenarioCountrySensitivity: Record<string, number>,
  scenarioDBImpact: ScenarioDBImpact
): {
  overallExposureScore: number;
  estimatedLossRange: string;
  topAffectedCountries: string[];
  topAffectedDepartments: string[];
} {
  // Calculate weighted exposure score by country
  const countryExposure = Object.entries(scenarioCountrySensitivity)
    .map(([country, sensitivity]) => {
      const exposure = dbExposureByCountry[country]?.total ?? 0;
      return {
        country,
        score: (sensitivity / 100) * (exposure / 1000),
        exposure,
      };
    })
    .sort((a, b) => b.score - a.score);

  return {
    overallExposureScore: scenarioDBImpact.overallExposure,
    estimatedLossRange: scenarioDBImpact.estimatedImpact,
    topAffectedCountries: countryExposure.slice(0, 3).map((c) => c.country),
    topAffectedDepartments: scenarioDBImpact.departmentsAffected,
  };
}
