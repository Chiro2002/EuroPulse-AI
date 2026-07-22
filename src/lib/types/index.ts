// ==============================
// Country Types
// ==============================
export interface Country {
  code: string;
  name: string;
  flag: string;
  region: string;
  population: number;
  gdp: number;
}

export interface RiskScore {
  country: string;
  inflation: number;
  energy: number;
  debt: number;
  unemployment: number;
  housing: number;
  geopolitical: number;
  total: number;
  trend: "up" | "down" | "stable";
}

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

export interface Forecast {
  metric: string;
  country: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  direction: "up" | "down" | "stable";
  drivers: string[];
  explanation: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  probability: number;
  timeHorizon: string;
  directEffects: ScenarioEffect[];
  secondaryEffects: ScenarioEffect[];
  countrySensitivity: Record<string, number>;
  dbImpact: ScenarioDBImpact;
}

export interface ScenarioEffect {
  sector: string;
  impact: number;
  description: string;
}

export interface ScenarioDBImpact {
  overallExposure: number;
  departmentsAffected: string[];
  estimatedImpact: string;
  riskMitigation: string[];
}

export interface DBImpact {
  department: string;
  effect: string;
  severity: "low" | "medium" | "high" | "critical";
  magnitude: number;
}

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

export type ViewMode = "simple" | "banker" | "detailed";

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

export interface TopAlert {
  severity: "critical" | "high" | "medium" | "low";
  headline: string;
  timestamp: string;
  link: string;
}

export interface KeyMetric {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "stable";
  sparkline: number[];
  prefix?: string;
  suffix?: string;
}

export interface CountryRisk {
  country: string;
  countryName: string;
  flag: string;
  riskScore: number;
  color: string;
  breakdown: {
    inflation: number;
    energy: number;
    debt: number;
    unemployment: number;
    housing: number;
    geopolitical: number;
  };
}

export interface TopEvent {
  id: string;
  severity: number;
  headline: string;
  affectedCountries: string[];
  impactTags: string[];
  timeAgo: string;
}

export interface MarketSeries {
  name: string;
  data: { day: string; value: number }[];
  color: string;
}

export interface MarketPulse {
  bonds: MarketSeries[];
  equities: MarketSeries[];
  fx: MarketSeries[];
  commodities: MarketSeries[];
}

export interface StressRadar {
  inflation: number;
  energy: number;
  fx: number;
  geopolitical: number;
  bond: number;
  housing: number;
  overall: number;
}

export interface DashboardData {
  topAlert: TopAlert;
  keyMetrics: KeyMetric[];
  countryRisks: CountryRisk[];
  topEvents: TopEvent[];
  marketPulse: MarketPulse;
  stressRadar: StressRadar;
  quickInsights: string[];
}

export type EventType = "geopolitical" | "economic_policy" | "energy" | "trade" | "financial_markets" | "war" | "regulatory";
export type MarketDirection = "up" | "down" | "neutral";
export type TimeHorizon = "immediate" | "days" | "weeks" | "months";

export interface MarketImpactDetail {
  inflation: MarketDirection;
  eur: "strengthen" | "weaken" | "neutral";
  bonds: "yields_up" | "yields_down" | "neutral";
  equities: "positive" | "negative" | "neutral";
  oil: MarketDirection;
}

export interface DBImpactDetail {
  department: string;
  effect: string;
  severity: "low" | "medium" | "high";
}

export interface ClassifiedNews extends NewsItem {
  eventType: EventType;
  severityNum: number;
  marketImpactDetail: MarketImpactDetail;
  timeHorizon: TimeHorizon;
  whatHappened: string;
  whyItMatters: string;
  whoIsAffected: string;
  dbImpact: DBImpactDetail[];
  recommendedActions: string[];
  topics: string[];
  score: number;
}

export interface NewsTheme {
  name: string;
  rawKey: string;
  count: number;
  trend: "up" | "down" | "stable";
  color: string;
}

export interface NewsAPIResponse {
  newsItems: ClassifiedNews[];
  themes: NewsTheme[];
  dailySummary: string;
  totalCount: number;
}

export interface CountryDetail {
  code: string;
  name: string;
  flag: string;
  totalRisk: number;
  breakdown: {
    inflation: number;
    energy: number;
    debt: number;
    employment: number;
    housing: number;
    geopolitical: number;
  };
  details: {
    inflation: { current: number; target: number; trend: "up" | "down" | "stable" };
    energy: { importPct: number; gasStorage: number; oilExposure: "low" | "medium" | "high" };
    debt: { debtToGdp: number; deficit: number };
    employment: { unemployment: number; change6m: number };
    housing: { priceToIncome: number; mortgageStress: "low" | "medium" | "high" };
    geopolitical: { factors: string[] };
  };
  trend30d: number;
  trend90d: number;
}

export type RiskDimension = "total" | "inflation" | "energy" | "debt" | "employment" | "housing" | "geopolitical";

export interface SectorStressData {
  [sector: string]: {
    [country: string]: number;
  };
}

export interface HistoricalTrend {
  date: string;
  riskScore: number;
}

export interface RiskAPIResponse {
  countries: CountryDetail[];
  sectorStress: SectorStressData;
  historicalTrends: Record<string, HistoricalTrend[]>;
  topInsights: {
    mostVulnerable: string;
    risingFastest: string;
    mostStable: string;
    europeStressTrend: number;
  };
  eventHighlights: { date: string; event: string }[];
}

export interface InflationForecast {
  country: string;
  flag: string;
  current: number;
  predictedValue: number;
  confidence: number;
  direction: "up" | "down" | "stable";
  change: number;
  drivers: { name: string; impact: number }[];
  historicalData: { month: string; value: number }[];
  forecastData: { month: string; value: number; low: number; high: number }[];
}

export interface ECBMeeting {
  date: string;
  probabilities: { cut: number; hold: number; hike: number };
}

export interface ECBPath {
  nextMeetings: ECBMeeting[];
  expectedTrajectory: { month: string; rate: number; marketImplied: number }[];
  explanation: string;
}

export interface FXForecast {
  current: number;
  forecast3M: { value: number; rangeLow: number; rangeHigh: number };
  forecast12M: { value: number; rangeLow: number; rangeHigh: number };
  drivers: { name: string; impact: "positive" | "negative" | "neutral"; description: string }[];
  volatility: number;
  historicalData: { month: string; value: number }[];
  forecastData: { month: string; value: number; low: number; high: number }[];
}

export interface BondForecast {
  country: string;
  flag: string;
  currentYield: number;
  predictedYield: number;
  historicalData: { month: string; value: number }[];
  forecastData: { month: string; value: number }[];
}

export interface SpreadForecast {
  name: string;
  current: number;
  predicted: number;
  data: { month: string; value: number }[];
}

export interface BondOutlook {
  yields: BondForecast[];
  spreads: SpreadForecast[];
  yieldCurve: { current: { tenor: string; rate: number }[]; predicted: { tenor: string; rate: number }[] };
  durationRisk: "low" | "medium" | "high";
}

export interface RecessionSignal {
  name: string;
  active: boolean;
  description: string;
}

export interface RecessionForecast {
  probabilities: { country: string; flag: string; probability: number }[];
  signals: Record<string, RecessionSignal[]>;
}

export interface SectorOutlookItem {
  sector: string;
  outlook: "bullish" | "neutral" | "bearish";
  catalyst: string;
  confidence: number;
}

export interface ForecastDriver {
  direction: "up" | "down";
  label: string;
  magnitude: string;
  description: string;
}

export interface ForecastAPIResponse {
  inflation: InflationForecast[];
  ecbPath: ECBPath;
  fx: FXForecast;
  bonds: BondOutlook;
  recession: RecessionForecast;
  sectors: SectorOutlookItem[];
  drivers: { positive: ForecastDriver[]; negative: ForecastDriver[] };
  narrative: string;
  topInsights: {
    likelyECBMove: string;
    highestRecessionRisk: string;
    biggestForecastChange: string;
  };
}

// ==============================
// Scenario Simulator Types
// ==============================

export interface CascadeStep {
  step: number;
  event: string;
  type: "trigger" | "direct" | "secondary" | "tertiary" | "bank_impact";
  delay: "immediate" | "hours" | "days" | "weeks" | "months" | "ongoing";
}

export interface DirectEffects {
  [key: string]: number;
  inflation: number;
  eur_usd: number;
  gas_price: number;
  consumer_confidence: number;
  brent_oil: number;
  equity_markets: number;
}

export interface SecondaryEffects {
  [key: string]: number;
  ecb_rate_response: number;
  gdp_impact: number;
  unemployment: number;
  mortgage_rates: number;
  bond_yields: number;
  italian_spread: number;
}

export interface TertiaryEffects {
  [key: string]: number;
  housing_demand: number;
  consumer_spending: number;
  corporate_margins: number;
}

export interface DBBusinessLineImpact {
  direction: "positive" | "negative" | "slightly_negative" | "neutral";
  magnitude: "mild" | "moderate" | "severe";
  pnl_estimate: number;
  reason: string;
}

export interface ScenarioDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  historicalPrecedent: string;
  severity: number;
  directEffects: DirectEffects;
  secondaryEffects: SecondaryEffects;
  tertiaryEffects: TertiaryEffects;
  countrySensitivity: Record<string, number>;
  dbImpact: Record<string, DBBusinessLineImpact>;
  cascadeSteps: CascadeStep[];
}

export interface CurrentMarketData {
  inflation: number;
  eur_usd: number;
  oil: number;
  ecb_rate: number;
  equity: number;
  bond_yield_de: number;
  bond_yield_it: number;
  gas_price: number;
  consumer_confidence: number;
  unemployment: number;
  gdp_growth: number;
  recession_prob: number;
}

export interface SimulatedMarketData {
  inflation: number;
  eur_usd: number;
  oil: number;
  ecb_rate: number;
  equity: number;
  bond_yield_de: number;
  bond_yield_it: number;
  gas_price: number;
  consumer_confidence: number;
  unemployment: number;
  gdp_growth: number;
  recession_prob: number;
}

export interface ComparisonRow {
  metric: string;
  current: number;
  simulated: number;
  change: number;
  unit: string;
  direction: "up" | "down" | "neutral";
}

export interface CountryImpactResult {
  riskBefore: number;
  riskAfter: number;
  change: number;
  severity: "low" | "medium" | "high";
  inflationNew: number;
  keyImpact: string;
}

export interface DBBusinessLineImpactResult {
  direction: "positive" | "negative" | "slightly_negative" | "neutral";
  magnitude: "mild" | "moderate" | "severe";
  pnl_estimate: number;
  reason: string;
}

export interface SimulationResult {
  scenario: string;
  scenarioId: string;
  icon: string;
  intensity: number;
  timeHorizon: string;
  before: CurrentMarketData;
  after: SimulatedMarketData;
  changes: ComparisonRow[];
  countryImpacts: Record<string, CountryImpactResult>;
  dbImpact: Record<string, DBBusinessLineImpactResult>;
  totalDBPnL: number;
  cascadeSteps: CascadeStep[];
}

export interface DBAction {
  category: "IMMEDIATE" | "SHORT_TERM" | "MONITORING";
  department: string;
  action: string;
  reason: string;
}

export interface SimulatorAPIResponse {
  result: SimulationResult;
  narrative: string;
  actions: DBAction[];
}
