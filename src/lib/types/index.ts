// ==============================
// Country Types
// ==============================
export interface Country {
  code: string;
  name: string;
  flag: string;
  region: string;
  population: number;
  gdp: number; // in billions EUR
}

// ==============================
// Risk Score Types
// ==============================
export interface RiskScore {
  country: string;
  inflation: number; // 0-100
  energy: number; // 0-100
  debt: number; // 0-100
  unemployment: number; // 0-100
  housing: number; // 0-100
  geopolitical: number; // 0-100
  total: number; // 0-100 (weighted average)
  trend: "up" | "down" | "stable";
}

// ==============================
// News Types
// ==============================
export interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  timestamp: string;
  severity: "critical" | "high" | "medium" | "low";
  affectedCountries: string[];
  affectedSectors: string[];
  marketImpact: "positive" | "negative" | "neutral";
  explanation: string;
}

// ==============================
// Forecast Types
// ==============================
export interface Forecast {
  metric: string;
  country: string;
  currentValue: number;
  predictedValue: number;
  confidence: number; // 0-100
  direction: "up" | "down" | "stable";
  drivers: string[];
  explanation: string;
}

// ==============================
// Scenario Types
// ==============================
export interface Scenario {
  id: string;
  name: string;
  description: string;
  probability: number; // 0-100
  timeHorizon: string;
  directEffects: ScenarioEffect[];
  secondaryEffects: ScenarioEffect[];
  countrySensitivity: Record<string, number>; // country code -> impact level 0-100
  dbImpact: ScenarioDBImpact;
}

export interface ScenarioEffect {
  sector: string;
  impact: number; // -100 to 100 (negative = adverse)
  description: string;
}

export interface ScenarioDBImpact {
  overallExposure: number; // 0-100
  departmentsAffected: string[];
  estimatedImpact: string;
  riskMitigation: string[];
}

// ==============================
// DB Impact Types
// ==============================
export interface DBImpact {
  department: string;
  effect: string;
  severity: "low" | "medium" | "high" | "critical";
  magnitude: number; // 0-100
}

// ==============================
// Sidebar / Panel Types
// ==============================
export interface SidebarInsight {
  alertLevel: "green" | "yellow" | "orange" | "red";
  topInsight: string;
  impactCards: ImpactCard[];
  actions: string[];
  earlyWarnings: string[];
}

export interface ImpactCard {
  department: string;
  impact: string;
  severity: "low" | "medium" | "high" | "critical";
}

// ==============================
// Mode Types
// ==============================
export type ViewMode = "simple" | "banker" | "detailed";

// ==============================
// Dashboard Types
// ==============================
export interface DashboardMetrics {
  overallRiskIndex: number;
  riskTrend: "up" | "down" | "stable";
  countriesMonitored: number;
  activeAlerts: number;
  criticalAlerts: number;
  latestUpdates: string;
  topRisks: string[];
  opportunities: string[];
}

export interface CountryRiskSummary {
  country: Country;
  riskScore: RiskScore;
  topConcerns: string[];
}
