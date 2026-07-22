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
