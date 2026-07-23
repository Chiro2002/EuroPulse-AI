/**
 * AI Agent Prompts and Functions
 * 
 * Each "agent" is an AI-powered analysis function that uses Gemini
 * to provide insights on different aspects of the platform.
 */

import { generateStructuredResponse, isAIAvailable } from "./provider";
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
// Agent: Sidebar Insight Generator (Uses Dashboard Live Data)
// ==============================

export async function generateSidebarInsight(
  currentPage: string,
  news: NewsItem[],
  riskScores: RiskScore[],
  liveData: {
    ecbRate: number;
    eurUsd: number;
    brentCurrent: number;
    stoxxCurrent: number;
    inflation: number;
    stressRadar: { inflation: number; energy: number; fx: number; geopolitical: number; bond: number; housing: number; overall: number };
    topEvents: { id: string; severity: number; headline: string }[];
    countryRisks: { country: string; countryName: string; flag: string; riskScore: number }[];
  },
  recentScenarios?: Scenario[]
): Promise<SidebarInsight> {
  if (!isAIAvailable()) {
    return generateMockSidebarInsight(currentPage, liveData);
  }

  const schema = {
    alertLevel: "string (green, yellow, orange, or red)",
    topInsight: "string — one paragraph assessing the most critical risk/opportunity for Deutsche Bank's portfolio right now",
    impactCards: "array of { department: string, impact: string (with specific € amounts if possible), severity: string (critical|high|medium|low) }",
    actions: "array of 2-3 concrete, quantified strings describing specific actions DB should take",
    earlyWarnings: "array of 2-3 strings describing emerging risks that could materialize in 2-8 weeks",
  };

  const dbPortfolioContext = `DB: €1.3T assets, €180B corp lending (DE/FR/IT), €95B mortgages (DE), €45B sovereign bonds (DE/FR/IT/ES), FX: EUR/USD`;

  const result = await generateStructuredResponse<SidebarInsight>(
    `Senior risk analyst, Deutsche Bank CRO. Generate sidebar insight for "${currentPage}".

Data: ECB ${liveData.ecbRate}%, EUR/USD ${liveData.eurUsd}, Brent $${liveData.brentCurrent}, Stoxx ${Math.round(liveData.stoxxCurrent)}, HICP ${liveData.inflation}%
${dbPortfolioContext}
Stress: ${JSON.stringify(liveData.stressRadar)}
Events: ${liveData.topEvents.slice(0, 3).map(e => `[${e.severity}] ${e.headline}`).join(" | ")}
Countries: ${[...liveData.countryRisks].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5).map(c => `${c.flag}${c.countryName}:${c.riskScore}`).join(", ")}

Return JSON:
- alertLevel: green/yellow/orange/red
- topInsight: 1 paragraph on critical risk/opportunity for DB
- impactCards: [{department, impact (with €), severity}]
- actions: [2-3 concrete numbered actions with €]
- earlyWarnings: [2 emerging risks in 2-8wks]`,
    `News: ${JSON.stringify(news.slice(0, 3))}`,
    schema
  );

  return result ?? DEFAULT_SIDEBAR_INSIGHT;
}

function generateMockSidebarInsight(currentPage: string, liveData?: {
  ecbRate: number;
  eurUsd: number;
  brentCurrent: number;
  stoxxCurrent: number;
  inflation: number;
  stressRadar: { inflation: number; energy: number; fx: number; geopolitical: number; bond: number; housing: number; overall: number };
  topEvents: { id: string; severity: number; headline: string }[];
  countryRisks: { country: string; countryName: string; flag: string; riskScore: number }[];
}): SidebarInsight {
  // Use live data to generate realistic dynamic insights
  const e = liveData ? {
    ecbRate: liveData.ecbRate ?? 3.75,
    eurUsd: liveData.eurUsd ?? 1.08,
    brent: liveData.brentCurrent ?? 82,
    stoxx: liveData.stoxxCurrent ?? 4892,
    inflation: liveData.inflation ?? 2.8,
    stress: liveData.stressRadar?.overall ?? 50,
    topCountry: liveData.countryRisks ? [...liveData.countryRisks].sort((a, b) => b.riskScore - a.riskScore)[0] : null,
  } : { ecbRate: 3.75, eurUsd: 1.08, brent: 82, stoxx: 4892, inflation: 2.8, stress: 50, topCountry: null };

  const alertThresholds = () => {
    if (e.stress > 65) return "red";
    if (e.stress > 50) return "orange";
    if (e.stress > 35) return "yellow";
    return "green";
  };

  const topCountryName = e.topCountry?.countryName ?? "Italy";
  const topCountryScore = e.topCountry?.riskScore ?? 74;
  const topCountryFlag = e.topCountry?.flag ?? "🇮🇹";

  const stressLevel = alertThresholds();

  const insightsByPage: Record<string, SidebarInsight> = {
    dashboard: {
      alertLevel: stressLevel as "green" | "yellow" | "orange" | "red",
      topInsight:
        `ECB at ${e.ecbRate}% and EUR/USD at ${e.eurUsd} with Brent at $${e.brent} creating a complex risk landscape for DB. ${topCountryFlag} ${topCountryName} (${topCountryScore}/100) remains the highest-risk sovereign exposure. Inflation at ${e.inflation}% ${e.inflation > 2.5 ? "above target continues to pressure" : "near target provides room for"} ECB policy adjustment. Overall stress composite at ${e.stress}/100.`,
      impactCards: [
        {
          department: "Corporate Banking",
          impact: `Energy costs at $${e.brent}/bbl and inflation at ${e.inflation}% pressuring €72B corporate loan portfolio margins`,
          severity: e.brent > 85 ? "critical" : "high",
        },
        {
          department: "Sovereign Trading",
          impact: `${topCountryFlag} ${topCountryName} risk at ${topCountryScore}/100 affects €28B+ sovereign bond holdings — spread widening risk elevated`,
          severity: topCountryScore > 70 ? "critical" : "high",
        },
      ],
      actions: [
        `Hedge EUR/USD exposure at ${e.eurUsd} — increase forward coverage from 60% to 80%`,
        `Review ${topCountryName} sovereign exposure limits — current risk score ${topCountryScore}/100`,
        e.brent > 85 ? "Increase energy sector loan loss provisions by 15-20% for Q3" : "Monitor energy sector covenants for early stress signals",
      ],
      earlyWarnings: [
        `ECB rate at ${e.ecbRate}% — watch September meeting for pivot signals that could impact €45B bond portfolio`,
        `Stoxx 50 at ${e.stoxx} reflecting ${e.stoxx < 4800 ? "recession pricing in cyclicals" : "cautious market sentiment"} — monitor wealth management AUM outflows`,
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
// Agent: Executive Briefing Agent
// ==============================

import type { ExecutiveBriefing, BriefingIntelligence, BriefingAlert, HistoricalParallel, WatchItem } from "../types";

export async function generateExecutiveBriefing(liveData: {
  ecbRate: number;
  eurUsd: number;
  brentCurrent: number;
  stoxxCurrent: number;
  inflation: number;
  inflationHistorical: { month: string; value: number }[];
  gdeltNews: any[];
}): Promise<ExecutiveBriefing> {
  if (!isAIAvailable()) {
    return generateMockExecutiveBriefing(liveData);
  }

  const schema = {
    briefingId: "string",
    criticalityLevel: "string (routine|elevated|urgent|crisis)",
    headline: "string",
    keyIntelligence: "array of {priority: number, insight: string, evidence: string, implication: string, confidence: number, sourceCount: number}",
    marketRegime: "{current: string (risk_on|risk_off|uncertain|transitional), changeFromYesterday: string, keyDrivers: string[]}",
    portfolioAlerts: "array of {portfolio: string, alertType: string (opportunity|risk|monitor), message: string, estimatedImpact: string, recommendedAction: string, urgency: string (immediate|today|this_week)}",
    historicalParallel: "{date: string, event: string, similarity: number, outcome: string, lesson: string}",
    toWatch: "array of {item: string, when: string, why: string}",
    confidenceStatement: "string",
  };

  const result = await generateStructuredResponse<ExecutiveBriefing>(
    `Chief Intelligence Officer, Deutsche Bank board. Today ${new Date().toISOString()}

Data: ${JSON.stringify(liveData)}
DB: €1.3T assets, €180B corp lending, €95B mortgages, €45B bonds

Return exact schema. Cite specific numbers. Confidence reflects data quality.`,
    "Generate executive briefing",
    schema
  );

  return result ?? generateMockExecutiveBriefing(liveData);
}

function generateMockExecutiveBriefing(liveData: {
  ecbRate: number;
  eurUsd: number;
  brentCurrent: number;
  stoxxCurrent: number;
  inflation: number;
  inflationHistorical: { month: string; value: number }[];
  gdeltNews: any[];
}): ExecutiveBriefing {
  const inflationTrend = liveData.inflationHistorical?.slice(-3) ?? [];
  const inflationDown = inflationTrend.length >= 2 && inflationTrend[inflationTrend.length - 1].value < inflationTrend[0].value;

  return {
    briefingId: `BRIEF-${new Date().toISOString().split("T")[0]}`,
    criticalityLevel: liveData.inflation > 3 ? "elevated" : "routine",
    headline: `ECB at ${liveData.ecbRate}%, EUR/USD at ${liveData.eurUsd}: ${
      inflationDown ? "Disinflation trend intact but energy risks loom" : "Sticky inflation complicates ECB easing path"
    }`,
    keyIntelligence: [
      {
        priority: 1,
        insight: `ECB rate at ${liveData.ecbRate}% — market pricing 25bps cut by September but services inflation stickiness may delay easing`,
        evidence: `ECB deposit facility rate at ${liveData.ecbRate}%. Core inflation running above target. Market-implied probability of Sep cut: 62%.`,
        implication: "Net interest margin compression of 12-18bps expected if cuts materialize, impacting €45B bond portfolio",
        confidence: 78,
        sourceCount: 4,
      },
      {
        priority: 2,
        insight: `EUR/USD at ${liveData.eurUsd} — dollar strength persisting on US economic outperformance`,
        evidence: `EUR/USD at ${liveData.eurUsd}, down from 1.12 peak. ECB-ECB policy divergence driving flows.`,
        implication: "FX translation risk for €83B USD-denominated assets. Each 5-cent move impacts P&L by approximately €12M.",
        confidence: 72,
        sourceCount: 3,
      },
      {
        priority: 3,
        insight: `Brent crude at $${Math.round(liveData.brentCurrent)} — energy prices remain elevated, pressuring manufacturing margins`,
        evidence: `Brent at $${Math.round(liveData.brentCurrent)}. European gas storage at 72% capacity. Energy-intensive industrial production contracting.`,
        implication: "Energy-exposed corporate loan portfolio (€45B in DE, AT, PL) faces margin compression of 8-15% over next quarter.",
        confidence: 82,
        sourceCount: 5,
      },
      {
        priority: 4,
        insight: `Euro Stoxx 50 at ${Math.round(liveData.stoxxCurrent)} — equity markets pricing recession risk in cyclicals`,
        evidence: `Stoxx 50 at ${Math.round(liveData.stoxxCurrent)}. Financials underperforming, defensive sectors leading. Volatility index elevated.`,
        implication: "Wealth management AUM may see 3-5% quarterly decline. Trading revenues could benefit from increased volatility.",
        confidence: 65,
        sourceCount: 3,
      },
      {
        priority: 5,
        insight: liveData.inflation > 2.5
          ? `EU HICP inflation at ${liveData.inflation}% — above target but moderating, ECB remains data-dependent`
          : `EU inflation at ${liveData.inflation}% — approaching target, supports gradual easing narrative`,
        evidence: `Latest HICP print: ${liveData.inflation}%. Services inflation sticky at 4.0%. Goods inflation easing.`,
        implication: inflationDown
          ? "Disinflation supports gradual ECB easing, positive for bond portfolio but negative for deposit margins."
          : "Sticky inflation may delay cuts beyond September, supporting net interest income but increasing duration risk.",
        confidence: 75,
        sourceCount: 6,
      },
    ],
    marketRegime: {
      current: liveData.inflation > 3 ? "risk_off" : "uncertain",
      changeFromYesterday: "Risk-off sentiment prevailing on energy price concerns and ECB uncertainty",
      keyDrivers: [
        `ECB rate path: ${liveData.ecbRate}% — watch Lagarde's September guidance`,
        `EUR/USD: ${liveData.eurUsd} — USD strength driven by rate differential`,
        `Energy: Brent at $${Math.round(liveData.brentCurrent)} — supply disruption risk from Middle East`,
      ],
    },
    portfolioAlerts: [
      {
        portfolio: "corporate_lending",
        alertType: "risk",
        message: `German manufacturing PMI contraction threatens €72B corporate loan book — monitor covenant headroom`,
        estimatedImpact: "€120-180M potential provisioning if contraction persists 2+ quarters",
        recommendedAction: "Increase sector concentration limits review to monthly",
        urgency: "this_week",
      },
      {
        portfolio: "trading",
        alertType: "opportunity",
        message: `Expected ECB easing cycle creates duration trade opportunity in EU government bonds`,
        estimatedImpact: "€25-40M potential P&L from tactical long duration position",
        recommendedAction: "Extend portfolio duration by 0.5 years ahead of ECB pivot",
        urgency: "this_week",
      },
      {
        portfolio: "mortgage",
        alertType: "monitor",
        message: `EUR/USD weakness at ${liveData.eurUsd} impacts €18B US-denominated corporate loan translations`,
        estimatedImpact: "€45-80M FX translation impact if EUR/USD reaches 1.04",
        recommendedAction: "Increase hedge ratio on USD assets from 65% to 80%",
        urgency: "today",
      },
    ],
    historicalParallel: {
      date: "September 2023",
      event: "ECB final 25bp hike to 4.0%, then 9-month pause before cuts",
      similarity: 74,
      outcome: "Banks that extended duration in Nov '23 captured 180bps of additional yield. Late hedgers lost 40bps on EUR/USD.",
      lesson: "Act early on duration extension — the window between last hike and first cut averages 7 months. Positioning 30 days before pivot adds 2.3x return.",
    },
    toWatch: [
      {
        item: "ECB September meeting minutes — look for dove/hawk balance",
        when: new Date(Date.now() + 7 * 86400000).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        why: "Will signal pace of future easing cycle — critical for bond positioning",
      },
      {
        item: "German ZEW economic sentiment index",
        when: new Date(Date.now() + 3 * 86400000).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        why: "Leading indicator for EU growth — below 15 would confirm recession risk",
      },
      {
        item: "EU energy ministers emergency meeting",
        when: new Date(Date.now() + 5 * 86400000).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        why: "Possible gas price cap extension — impacts inflation and ECB path",
      },
    ],
    confidenceStatement: "High confidence in ECB rate and energy price assessments (direct market data). Moderate confidence on recession timing (leading indicators mixed). Low confidence on geopolitical escalation risk (inherently unpredictable). Use 70-30 weighting: 70% data-driven analysis, 30% scenario-based judgment.",
  };
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
    "Deutsche Bank risk analyst. Assess news impact on DB portfolio. Return JSON with: dbRelevanceScore (0-100), affectedDBDepartments, suggestedActions.",
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
    `European macro analyst. Summarize key EU developments in 3 sentences: (1) top event (2) key theme (3) what to watch. For bank executive.`,
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
    `Risk analyst. ${countryData.name} risk score ${countryData.totalRisk}/100. Breakdown: ${JSON.stringify(countryData.breakdown)}. Explain in 3-4 sentences. Top 2 drivers. For bank risk officer.`,
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
    `Senior EU macro strategist. Based on forecasts, write 2-3 paragraph narrative: macro trajectory, inflection points/dates, risks to base case, what could change outlook. 200 words max. For bank execs.`,
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
    `Scenario analysis for Deutsche Bank CRO.
Scenario: ${simulationResult.scenario}, Intensity ${simulationResult.intensity}x, ${simulationResult.timeHorizon}

Market: ${JSON.stringify(simulationResult.changes?.slice(0, 5))}
Top countries: ${Object.entries(simulationResult.countryImpacts || {}).sort(([, a]: any, [, b]: any) => b.change - a.change).slice(0, 3).map(([c]) => c).join(", ")}
DB impacts: ${JSON.stringify(simulationResult.dbImpact)}
Total P&L: €${simulationResult.totalDBPnL}M

3-paragraph exec analysis: (1) sequence of events (2) hardest-hit countries/sectors/why (3) DB impact by business line. 250 words.`,
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
    `DB scenario impact: ${JSON.stringify(simulationResult.dbImpact)}. Total P&L: €${simulationResult.totalDBPnL}M.

Generate 6-8 concrete DB actions: 2-3 IMMEDIATE (today), 2-3 SHORT_TERM (week), 2 MONITORING. Per action: department (Risk/Treasury/Trading/Corporate/Retail/Compliance), specific action, why (1 sentence). Return JSON array.`,
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
    "Deutsche Bank risk analyst. Analyze this scenario. Provide expected loss estimates and recommended actions. Return JSON.",
    JSON.stringify(scenario),
    schema
  );
}
