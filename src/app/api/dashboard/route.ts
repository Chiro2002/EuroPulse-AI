import { NextResponse } from "next/server";
import { riskScores, newsItems } from "@/lib/data/mockData";
import { euCountries, countryNames } from "@/lib/data/countries";
import { calculateAggregateRisk, getRiskLevel } from "@/lib/logic/riskCalculator";
import { getNewsStats } from "@/lib/logic/newsClassifier";
import { generateMarketPulseData, generateSparklineData } from "@/lib/logic/sparklineGenerator";
import { generateDashboardInsights } from "@/lib/ai/agents";
import type { DashboardData, TopAlert, KeyMetric, CountryRisk, TopEvent, StressRadar } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const newsStats = getNewsStats(newsItems);
    const aggregate = calculateAggregateRisk(riskScores);
    const marketPulseData = generateMarketPulseData();

    // 1. Top Alert – pick the most critical/important event
    const criticalNews = [...newsItems].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const topAlertNews = criticalNews.find((n) => n.severity === "critical") || criticalNews[0];
    const topAlert: TopAlert = {
      severity: topAlertNews.severity,
      headline: topAlertNews.headline,
      timestamp: topAlertNews.timestamp,
      link: "/news",
    };

    // 2. Key Metrics (6 cards with sparklines)
    const keyMetrics: KeyMetric[] = [
      {
        label: "ECB Rate",
        value: "3.75%",
        change: "↑ +0.25% vs last month",
        trend: "up",
        sparkline: generateSparklineData(3.75, 0.005, "up", 30),
      },
      {
        label: "EUR/USD",
        value: "1.0825",
        change: "↓ -1.2% vs last month",
        trend: "down",
        sparkline: generateSparklineData(1.0825, 0.008, "down", 30),
      },
      {
        label: "Brent Oil",
        value: "$82.40",
        change: "↑ +5.8% vs last month",
        trend: "up",
        sparkline: generateSparklineData(82.4, 0.025, "up", 30),
      },
      {
        label: "Euro Stoxx 50",
        value: "4,892",
        change: "↓ -2.1% vs last month",
        trend: "down",
        sparkline: generateSparklineData(4892, 0.015, "down", 30),
      },
      {
        label: "EU Inflation",
        value: "2.8%",
        change: "↓ -0.3% vs last month",
        trend: "down",
        sparkline: generateSparklineData(2.8, 0.01, "down", 30),
      },
      {
        label: "Stress Score",
        value: `${aggregate.weightedByGDP}`,
        change: `↑ +${Math.round(aggregate.weightedByGDP * 0.04)} vs last month`,
        trend: aggregate.weightedByGDP >= 60 ? "up" : "down",
        sparkline: generateSparklineData(aggregate.weightedByGDP, 0.02, aggregate.weightedByGDP >= 60 ? "up" : "down", 30),
      },
    ];

    // 3. Country Risks with breakdowns
    const countryRisks: CountryRisk[] = riskScores.map((rs) => {
      const level = getRiskLevel(rs.total);
      const country = euCountries.find((c) => c.code === rs.country);
      return {
        country: rs.country,
        countryName: country?.name ?? rs.country,
        flag: country?.flag ?? "🇪🇺",
        riskScore: rs.total,
        color: level.color,
        breakdown: {
          inflation: rs.inflation,
          energy: rs.energy,
          debt: rs.debt,
          unemployment: rs.unemployment,
          housing: rs.housing,
          geopolitical: rs.geopolitical,
        },
      };
    });

    // 4. Top Events – 3 most impactful
    const topEvents: TopEvent[] = criticalNews.slice(0, 3).map((n) => ({
      id: n.id,
      severity:
        n.severity === "critical" ? 9 : n.severity === "high" ? 7 : n.severity === "medium" ? 4 : 2,
      headline: n.headline,
      affectedCountries: n.affectedCountries,
      impactTags: n.affectedSectors.slice(0, 3).map((s) => {
        // Map sectors to market-impact tags
        const tagMap: Record<string, string> = {
          Banking: "Banks ↓",
          "Sovereign Bonds": "Bonds ↑",
          "Real Estate": "RE ↓",
          Manufacturing: "Ind. ↓",
          Energy: "Energy ↑",
          Technology: "Tech ↓",
          Automotive: "Auto ↓",
          Insurance: "Ins. ↑",
          "Corporate Finance": "Corp ↓",
          "Trade Finance": "Trade ↓",
          "Currency Markets": "FX ↑",
          Consumer: "Cons. ↓",
          Tourism: "Tour. ↑",
          Pharmaceuticals: "Pharma ↑",
        };
        return tagMap[s] || `${s.substring(0, 4)} ↑`;
      }),
      timeAgo: getTimeAgo(n.timestamp),
    }));

    // 5. Market Pulse (already generated)
    const marketPulse = {
      bonds: [
        { name: "DE 10Y", data: marketPulseData.bonds["DE 10Y"], color: "#3B82F6" },
        { name: "FR 10Y", data: marketPulseData.bonds["FR 10Y"], color: "#F59E0B" },
        { name: "IT 10Y", data: marketPulseData.bonds["IT 10Y"], color: "#EF4444" },
      ],
      equities: [
        { name: "DAX", data: marketPulseData.equities["DAX"], color: "#3B82F6" },
        { name: "CAC40", data: marketPulseData.equities["CAC40"], color: "#10B981" },
        { name: "FTSE MIB", data: marketPulseData.equities["FTSE MIB"], color: "#F59E0B" },
      ],
      fx: [
        { name: "EUR/USD", data: marketPulseData.fx["EUR/USD"], color: "#3B82F6" },
        { name: "EUR/GBP", data: marketPulseData.fx["EUR/GBP"], color: "#10B981" },
        { name: "EUR/CHF", data: marketPulseData.fx["EUR/CHF"], color: "#F59E0B" },
      ],
      commodities: [
        { name: "Brent", data: marketPulseData.commodities["Brent"], color: "#EF4444" },
        { name: "Nat Gas", data: marketPulseData.commodities["Nat Gas"], color: "#F59E0B" },
        { name: "Gold", data: marketPulseData.commodities["Gold"], color: "#F59E0B" },
      ],
    };

    // 6. Stress Radar
    const stressRadar: StressRadar = {
      inflation: Math.round(riskScores.reduce((s, r) => s + r.inflation, 0) / riskScores.length),
      energy: Math.round(riskScores.reduce((s, r) => s + r.energy, 0) / riskScores.length),
      fx: Math.round(65 + Math.random() * 10), // proxy
      geopolitical: Math.round(riskScores.reduce((s, r) => s + r.geopolitical, 0) / riskScores.length),
      bond: Math.round(60 + Math.random() * 15),
      housing: Math.round(riskScores.reduce((s, r) => s + r.housing, 0) / riskScores.length),
      overall: aggregate.weightedByGDP,
    };

    // 7. Quick Insights
    const quickInsights = await generateDashboardInsights({
      topAlert: topAlert.headline,
      stressRadar,
      topEvents: topEvents.map((e) => e.headline),
    });

    const dashboardData: DashboardData = {
      topAlert,
      keyMetrics,
      countryRisks,
      topEvents,
      marketPulse,
      stressRadar,
      quickInsights,
    };

    return NextResponse.json({
      ...dashboardData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
