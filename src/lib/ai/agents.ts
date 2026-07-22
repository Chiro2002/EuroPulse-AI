/**
 * AI Agent Prompts and Functions
 * 
 * Each "agent" is an AI-powered analysis function that uses Gemini
 * to provide insights on different aspects of the platform.
 */

import { generateStructuredResponse, isAIAvailable } from "./gemini";
import {
  NewsItem,
  RiskScore,
  SidebarInsight,
  Forecast,
  Scenario,
} from "../types";

// ==============================
// Default/mock responses for fallback when AI is not available
// ==============================

const DEFAULT_SIDEBAR_INSIGHT: SidebarInsight = {
  alertLevel: "orange",
  topInsight:
    "Italian sovereign debt concerns and German industrial weakness present the most immediate risks to DB's EU portfolio, with combined exposure exceeding €260B.",
  impactCards: [
    {
      department: "Corporate Banking",
      impact: "German industrial production decline (-1.2% MoM) threatens manufacturing loan portfolio performance",
      severity: "high",
    },
    {
      department: "Sovereign Trading",
      impact: "BTP-Bund spread widening to 185bps impacts bond portfolio valuation",
      severity: "critical",
    },
  ],
  actions: [
    "Reduce duration on Italian BTP holdings by 15-20%",
    "Increase provisions for German manufacturing corporate loans by 10%",
    "Activate hedging program for energy price exposure in CEE markets",
  ],
  earlyWarnings: [
    "French rating downgrade to AA- may trigger margin calls on derivatives",
    "Russian gas flow cessation threatens Austrian and Polish energy-intensive clients",
  ],
};

// ==============================
// Agent: Sidebar Insight Generator
// ==============================

export async function generateSidebarInsight(
  currentPage: string,
  news: NewsItem[],
  riskScores: RiskScore[],
  recentScenarios?: Scenario[]
): Promise<SidebarInsight> {
  if (!isAIAvailable()) {
    return generateMockSidebarInsight(currentPage);
  }

  const schema = {
    alertLevel: "string (green, yellow, orange, or red)",
    topInsight: "string",
    impactCards: "array of { department: string, impact: string, severity: string }",
    actions: "array of strings",
    earlyWarnings: "array of strings",
  };

  const result = await generateStructuredResponse<SidebarInsight>(
    `You are a senior risk analyst at Deutsche Bank. Analyze the current market data and provide concise, actionable insights for the ${currentPage} page. Focus on DB's portfolio exposure across EU countries. Be direct and quantitative.`,
    `Current news: ${JSON.stringify(news.slice(0, 5))}\nRisk scores: ${JSON.stringify(riskScores)}`,
    schema
  );

  return result ?? DEFAULT_SIDEBAR_INSIGHT;
}

function generateMockSidebarInsight(currentPage: string): SidebarInsight {
  const insightsByPage: Record<string, SidebarInsight> = {
    dashboard: {
      alertLevel: "orange",
      topInsight:
        "Multiple risk factors converging: Italian debt stress, German industrial contraction, and energy supply disruption create heightened portfolio risk across DE, IT, and AT exposures.",
      impactCards: [
        {
          department: "Corporate Banking",
          impact: "German manufacturing downturn (-1.2%) impacts €72B loan portfolio",
          severity: "high",
        },
        {
          department: "Sovereign Trading",
          impact: "Italian BTP spread widening to 185bps affects €28B bond holdings",
          severity: "critical",
        },
      ],
      actions: [
        "Reduce Italian sovereign exposure by 10-15%",
        "Increase German CRE loan loss provisions by 20%",
        "Hedge Austrian energy exposure via futures",
      ],
      earlyWarnings: [
        "French fiscal deterioration may trigger further downgrades",
        "Polish zloty volatility could impact €8B trade finance portfolio",
      ],
    },
    news: {
      alertLevel: "orange",
      topInsight:
        "5 critical/high severity events detected in the last 48 hours. Italian debt crisis, French downgrade, and energy supply disruption are the most material for DB.",
      impactCards: [
        {
          department: "Risk Management",
          impact: "Multiple high-severity events require portfolio stress testing",
          severity: "high",
        },
        {
          department: "Corporate Banking",
          impact: "Energy supply disruption in Austria/Poland threatens €18B corporate loans",
          severity: "high",
        },
      ],
      actions: [
        "Escalate Italian and French exposure to risk committee",
        "Activate energy crisis contingency plan for CEE operations",
        "Review all German manufacturing credit lines",
      ],
      earlyWarnings: [
        "EU-US trade tensions may escalate further",
        "Dutch housing correction risk building — monitor mortgage portfolio",
      ],
    },
    risk: {
      alertLevel: "orange",
      topInsight:
        "Italy (74) and Spain (70) show highest composite risk scores. Italy's debt-driven risk and Spain's unemployment/housing exposure are primary concerns for DB's €130B combined exposure.",
      impactCards: [
        {
          department: "Sovereign Trading",
          impact: "Italian risk score of 74 driven by 92 debt score — €28B BTP exposure",
          severity: "critical",
        },
        {
          department: "Real Estate Finance",
          impact: "Spanish housing score of 60 with high unemployment — €5B CRE exposure",
          severity: "high",
        },
      ],
      actions: [
        "Increase Italian CDS hedging from 60% to 80% coverage",
        "Review Spanish CRE portfolio for early stress signals",
        "Implement enhanced monitoring on all countries with risk score > 60",
      ],
      earlyWarnings: [
        "Dutch housing risk score of 75 requires close mortgage monitoring",
        "Polish geopolitical score of 75 reflects Ukraine conflict proximity risk",
      ],
    },
    forecast: {
      alertLevel: "yellow",
      topInsight:
        "ECB rate cut expectations and German GDP recovery forecast offer moderate optimism, but Italian and French fiscal trajectories remain concerning for medium-term portfolio quality.",
      impactCards: [
        {
          department: "Fixed Income",
          impact: "Forecasted 25bps rate decline supports bond portfolio but compresses NIM by 15-20bps",
          severity: "medium",
        },
        {
          department: "Corporate Banking",
          impact: "German GDP recovery forecast (+0.8%) supports loan book improvement after current weakness",
          severity: "medium",
        },
      ],
      actions: [
        "Extend duration on EU government bond portfolio before rally",
        "Prepare Scenario 2 (50bp cut) contingency for NIM management",
        "Increase German corporate lending origination in anticipation of recovery",
      ],
      earlyWarnings: [
        "French GDP downgrade risk — current 0.5% forecast may be optimistic",
        "Polish inflation stickiness may force different rate trajectory vs ECB",
      ],
    },
    simulator: {
      alertLevel: "yellow",
      topInsight:
        "The EU Recession scenario (25% probability) and Oil Spike scenario (25% probability) present the highest expected loss for DB's portfolio. Combined potential impact exceeds €800M.",
      impactCards: [
        {
          department: "Corporate Banking",
          impact: "EU Recession scenario: €500-750M potential credit losses across €200B portfolio",
          severity: "critical",
        },
        {
          department: "Energy Lending",
          impact: "Oil Spike + Energy Crisis scenarios: €300-450M combined exposure in CEE energy loans",
          severity: "high",
        },
      ],
      actions: [
        "Run combined scenario stress test (Oil Spike + EU Recession)",
        "Review energy sector concentration limits for CEE operations",
        "Prepare capital contingency plan for recession scenario materialization",
      ],
      earlyWarnings: [
        "Scenario correlations suggest multiple scenarios may trigger simultaneously",
        "Dutch housing correction (30% probability) approaching recession correlation zone",
      ],
    },
  };

  return insightsByPage[currentPage] ?? DEFAULT_SIDEBAR_INSIGHT;
}

// ==============================
// Agent: Dashboard Insights Generator
// ==============================

export async function generateDashboardInsights(data: {
  topAlert: string;
  stressRadar: any;
  topEvents: string[];
}): Promise<string[]> {
  if (!isAIAvailable()) {
    return generateMockDashboardInsights(data);
  }

  const schema = {
    insights: "array of 3 strings, each max 20 words",
  };

  const result = await generateStructuredResponse<{ insights: string[] }>(
    `You are a European macro analyst. Given today's data, provide 3 concise bullet insights (max 20 words each) about the most important themes today. Focus on: 1) Biggest risk 2) Most surprising development 3) What to watch tomorrow. Return as JSON.`,
    JSON.stringify(data),
    schema
  );

  return result?.insights ?? generateMockDashboardInsights(data);
}

function generateMockDashboardInsights(data: {
  topAlert: string;
  stressRadar: any;
  topEvents: string[];
}): string[] {
  return [
    "Italian sovereign debt stress (92/100) remains the single largest tail risk for EU financial stability this quarter.",
    "German industrial production contraction (-1.2% MoM) signals recession risk spreading from manufacturing to services.",
    "Watch ECB March meeting: markets pricing 25bps cut but sticky services inflation could force a hawkish hold.",
  ];
}

// ==============================
// Agent: News Impact Analyzer
// ==============================

export async function analyzeNewsImpact(newsItem: NewsItem): Promise<{
  dbRelevanceScore: number;
  affectedDBDepartments: string[];
  suggestedActions: string[];
} | null> {
  if (!isAIAvailable()) {
    return {
      dbRelevanceScore: 70,
      affectedDBDepartments: ["Corporate Banking", "Risk Management"],
      suggestedActions: ["Monitor exposure in affected countries", "Review sector-specific limits"],
    };
  }

  const schema = {
    dbRelevanceScore: "number (0-100)",
    affectedDBDepartments: "array of strings",
    suggestedActions: "array of strings",
  };

  return generateStructuredResponse(
    "You are a Deutsche Bank risk analyst. Assess how this news item affects DB's portfolio and suggest actions.",
    JSON.stringify(newsItem),
    schema
  );
}

// ==============================
// Agent: Daily News Summary Generator
// ==============================

export async function generateDailyNewsSummary(news: any[]): Promise<string> {
  if (!isAIAvailable()) {
    return generateMockDailySummary(news);
  }

  const schema = { summary: "string" };

  const result = await generateStructuredResponse<{ summary: string }>(
    `You are a European macro news analyst. Summarize today's key European macro developments in exactly 3 sentences. Focus on: (1) most important event, (2) key theme, (3) what to watch. Written for a bank executive.`,
    JSON.stringify(news.slice(0, 5)),
    schema
  );

  return result?.summary ?? generateMockDailySummary(news);
}

function generateMockDailySummary(news: any[]): string {
  if (news.length === 0) return "No significant developments today.";
  const top = news[0];
  return `Today's most important development: ${top.headline || "Multiple high-severity events across EU markets"}. The dominant theme is one of heightened macroeconomic uncertainty, with sovereign debt stress in Italy and energy supply disruptions in CEE creating cross-border contagion risks. Watch for ECB policy response and potential credit rating actions that could impact DB's €78B Italian and €25B Austrian exposures.`;
}

// ==============================
// Agent: Country Risk Explainer
// ==============================

export async function explainCountryRisk(countryData: {
  code: string;
  name: string;
  totalRisk: number;
  breakdown: Record<string, number>;
  details: Record<string, any>;
}): Promise<string> {
  if (!isAIAvailable()) {
    return generateMockCountryExplanation(countryData);
  }

  const schema = { explanation: "string" };
  const result = await generateStructuredResponse<{ explanation: string }>(
    `You are analyzing risk for ${countryData.name} which has a risk score of ${countryData.totalRisk}/100. Breakdown: ${JSON.stringify(countryData.breakdown)}. In 3-4 sentences, explain why this country is at this risk level. Identify the top 2 drivers. Written for a bank risk officer. Be specific and factual.`,
    JSON.stringify(countryData.details),
    schema
  );

  return result?.explanation ?? generateMockCountryExplanation(countryData);
}

function generateMockCountryExplanation(country: {
  code: string;
  name: string;
  totalRisk: number;
  breakdown: Record<string, number>;
  details: Record<string, any>;
}): string {
  const breakdown = country.breakdown as Record<string, number>;
  // Find top 2 drivers
  const sorted = Object.entries(breakdown).sort(([, a], [, b]) => b - a);
  const topDrivers = sorted.slice(0, 2).map(([k, v]) => `${k} (${v}/100)`);
  
  return `${country.name} has a composite risk score of ${country.totalRisk}/100, placing it in the ${country.totalRisk >= 60 ? "elevated" : country.totalRisk >= 40 ? "moderate" : "low"} risk category. The primary risk drivers are ${topDrivers[0] || "diversified factors"} and ${topDrivers[1] || "secondary economic pressures"}. This reflects structural vulnerabilities in ${country.code === "IT" ? "fiscal sustainability and banking sector exposure" : country.code === "PL" ? "energy security and geopolitical proximity to the Ukraine conflict" : country.code === "ES" ? "labor market rigidities and public debt levels" : country.code === "DE" ? "energy transition costs and export market slowdown" : country.code === "FR" ? "fiscal consolidation challenges and political uncertainty" : "a combination of domestic and external factors"}. Risk management focus should be on monitoring ${topDrivers[0]?.split(" ")[0] || "primary"}-related portfolio exposure and hedging against adverse scenarios.`;
}

// ==============================
// Agent: Forecast Narrative Generator
// ==============================

export async function generateForecastNarrative(forecastData: any): Promise<string> {
  if (!isAIAvailable()) {
    return generateMockForecastNarrative(forecastData);
  }

  const schema = { narrative: "string" };

  const result = await generateStructuredResponse<{ narrative: string }>(
    `You are a senior European macro strategist. Based on these forecasts, write a 2-3 paragraph narrative covering: the overall macro trajectory Europe is heading toward, key inflection points and dates to watch, main risks to the base case, and what could change the outlook. Written for bank executives. Confident but acknowledges uncertainty. 200 words max.`,
    JSON.stringify(forecastData),
    schema
  );

  return result?.narrative ?? generateMockForecastNarrative(forecastData);
}

function generateMockForecastNarrative(data: any): string {
  return `Europe's macro outlook for the coming quarters reflects a tug-of-war between disinflationary momentum and structural growth headwinds. The ECB is expected to begin its easing cycle in March with a 25bp cut, but sticky services inflation and tight labor markets will limit the pace of subsequent moves — our model projects the deposit rate reaching 3.10% by September, about 25bps above current market pricing.

The most significant inflection point to watch is the March ECB meeting, where updated staff projections will reveal whether the recent energy price spike is feeding through to core inflation. Italy's debt dynamics remain the single largest tail risk: with BTP spreads forecast to widen to 220bps, any political disruption could trigger contagion to Spanish and Portuguese bonds.

Risks to the base case are tilted to the downside for growth but upside for inflation. An escalation of the Ukraine conflict or a sharper-than-expected slowdown in Germany could tip the Eurozone into recession (Italy at 52% probability). Conversely, a rapid resolution of EU-US trade tensions and stronger Chinese demand could drive a GDP growth surprise, delaying ECB easing but boosting export-oriented sectors.`;
}

// ==============================
// Agent: Scenario Narrative Generator
// ==============================

export async function generateScenarioNarrative(simulationResult: any): Promise<string> {
  if (!isAIAvailable()) {
    return generateMockScenarioNarrative(simulationResult);
  }

  const schema = { narrative: "string" };

  const result = await generateStructuredResponse<{ narrative: string }>(
    `You are analyzing a scenario simulation for Deutsche Bank.

Scenario: ${simulationResult.scenario}
Intensity: ${simulationResult.intensity}x
Time horizon: ${simulationResult.timeHorizon}

Results:
- Market impacts: ${JSON.stringify(simulationResult.changes?.slice(0, 5))}
- Most affected countries: ${Object.entries(simulationResult.countryImpacts || {}).sort(([, a]: any, [, b]: any) => b.change - a.change).slice(0, 3).map(([c]) => c).join(", ")}
- DB business line impacts: ${JSON.stringify(simulationResult.dbImpact)}
- Total DB P&L impact: €${simulationResult.totalDBPnL}M

Write a 3-paragraph executive analysis:
Paragraph 1: What would happen — describe the sequence of events chronologically
Paragraph 2: Which entities suffer most — countries, sectors, and why
Paragraph 3: Deutsche Bank specific impact — which business lines, magnitude, and time horizon

Written for the Chief Risk Officer. Confident, specific, actionable. 250 words.`,
    JSON.stringify(simulationResult),
    schema
  );

  return result?.narrative ?? generateMockScenarioNarrative(simulationResult);
}

function generateMockScenarioNarrative(result: any): string {
  const scenarioName = result.scenario || "this scenario";
  const totalPnL = result.totalDBPnL || 0;
  const pnlDirection = totalPnL >= 0 ? "positive" : "negative";
  
  return `In ${scenarioName}, the sequence of events would unfold rapidly. The initial trigger would immediately impact market pricing, with direct effects materializing within days. Within weeks, secondary effects would compound through the financial system as the ECB and other institutions respond. The cascading impacts would continue to propagate through the real economy over subsequent months, affecting corporate earnings, consumer spending, and ultimately credit quality.

The hardest-hit countries would be those with the highest sensitivity to this scenario, particularly economies with concentrated exposure to the affected sectors. Peripheral EU economies with higher debt levels and less fiscal space would experience more severe stress, reflected in widening sovereign spreads and deteriorating credit metrics. Energy-intensive manufacturing economies would also face disproportionate pressure on corporate margins and employment.

For Deutsche Bank, the estimated total P&L impact is approximately €${Math.abs(totalPnL).toFixed(0)}M (${pnlDirection}). The most affected business lines would require immediate attention: corporate lending faces potential credit deterioration, while the trading desk may benefit from increased volatility. Treasury should prepare for mark-to-market impacts on the bond portfolio, and balance sheet management needs to assess the implications for capital ratios and risk-weighted assets.`;
}

// ==============================
// Agent: DB Actions Generator
// ==============================

export async function generateDBActions(simulationResult: any): Promise<{ category: string; department: string; action: string; reason: string }[]> {
  if (!isAIAvailable()) {
    return generateMockDBActions(simulationResult);
  }

  const schema = {
    actions: "array of { category: string (IMMEDIATE/SHORT_TERM/MONITORING), department: string, action: string, reason: string }",
  };

  const result = await generateStructuredResponse<{ actions: any[] }>(
    `Given this scenario simulation showing DB impact:
${JSON.stringify(simulationResult.dbImpact)}
Total P&L impact: €${simulationResult.totalDBPnL}M

Generate 6-8 concrete actions for Deutsche Bank, categorized as:
- IMMEDIATE (must do today): 2-3 actions
- SHORT-TERM (this week): 2-3 actions
- MONITORING (ongoing): 2 actions

Each action must specify:
- Department responsible (Risk / Treasury / Trading / Corporate / Retail / Compliance)
- Specific action (concrete, measurable)
- Why (1 sentence)

Return as structured JSON array.`,
    JSON.stringify(simulationResult),
    schema
  );

  return result?.actions ?? generateMockDBActions(simulationResult);
}

function generateMockDBActions(result: any): { category: string; department: string; action: string; reason: string }[] {
  return [
    { category: "IMMEDIATE", department: "Risk", action: "Increase loan loss provisions by €50M for affected sectors", reason: "Scenario indicates elevated credit risk in energy-exposed corporate portfolio" },
    { category: "IMMEDIATE", department: "Treasury", action: "Hedge additional 15% of EUR/USD exposure using 3-month forwards", reason: "EUR volatility expected to increase significantly in scenario" },
    { category: "IMMEDIATE", department: "Trading", action: "Reduce duration on peripheral bond holdings by 20%", reason: "Spread widening risk could cause significant mark-to-market losses" },
    { category: "SHORT_TERM", department: "Corporate", action: "Contact top 20 energy-exposed clients for stress assessment", reason: "Proactive engagement needed to identify potential covenant breaches early" },
    { category: "SHORT_TERM", department: "Risk", action: "Run portfolio-wide stress test incorporating this scenario at 1.5x intensity", reason: "Severity may exceed baseline assumptions; buffer adequacy must be verified" },
    { category: "SHORT_TERM", department: "Treasury", action: "Pre-position liquidity buffer of €2B for potential margin calls", reason: "Volatility may trigger collateral demands across derivatives portfolio" },
    { category: "MONITORING", department: "Credit Risk", action: "Weekly review of manufacturing and energy sector NPL trends", reason: "Early warning indicators critical for timely provisioning" },
    { category: "MONITORING", department: "Compliance", action: "Track regulatory capital ratio against stress-scenario minimums", reason: "Ensure capital adequacy maintained under adverse conditions" },
  ];
}

// ==============================
// Agent: Scenario Impact Analyzer
// ==============================

export async function analyzeScenarioImpact(
  scenario: Scenario
): Promise<{
  combinedProbability: number;
  expectedLoss: string;
  recommendedActions: string[];
} | null> {
  if (!isAIAvailable()) {
    return {
      combinedProbability: scenario.probability,
      expectedLoss: scenario.dbImpact.estimatedImpact,
      recommendedActions: scenario.dbImpact.riskMitigation.slice(0, 3),
    };
  }

  const schema = {
    combinedProbability: "number (0-100)",
    expectedLoss: "string",
    recommendedActions: "array of strings",
  };

  return generateStructuredResponse(
    "You are a Deutsche Bank risk analyst. Analyze this scenario and provide expected loss estimates and recommended actions.",
    JSON.stringify(scenario),
    schema
  );
}
