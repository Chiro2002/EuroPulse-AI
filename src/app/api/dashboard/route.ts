import { NextResponse } from "next/server";
import { riskScores, newsItems, forecasts } from "@/lib/data/mockData";
import { calculateAggregateRisk } from "@/lib/logic/riskCalculator";
import { getNewsStats } from "@/lib/logic/newsClassifier";
import type { DashboardMetrics } from "@/lib/types";

export async function GET() {
  try {
    const aggregate = calculateAggregateRisk(riskScores);
    const newsStats = getNewsStats(newsItems);

    const metrics: DashboardMetrics = {
      overallRiskIndex: aggregate.weightedByGDP,
      riskTrend: aggregate.average >= 60 ? "up" : aggregate.average <= 50 ? "down" : "stable",
      countriesMonitored: 10,
      activeAlerts: newsStats.criticalCount + newsStats.highCount,
      criticalAlerts: newsStats.criticalCount,
      latestUpdates: new Date().toISOString(),
      topRisks: [
        "Italian sovereign debt at 158% GDP",
        "German industrial contraction -1.2%",
        "French credit rating downgrade to AA-",
        "Gas supply disruption in CEE",
      ],
      opportunities: [
        "ECB rate cut expectations boost bonds",
        "Spanish employment at 15-year low",
        "EU green investment fund €150B",
      ],
    };

    return NextResponse.json({
      metrics,
      riskScores,
      forecasts,
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
