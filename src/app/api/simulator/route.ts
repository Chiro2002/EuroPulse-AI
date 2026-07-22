import { NextRequest, NextResponse } from "next/server";
import { scenarios } from "@/lib/data/mockData";
import { scenarioCorrelations } from "@/lib/data/scenarios";
import { simulateScenario, simulateAllScenarios, estimatePortfolioImpact } from "@/lib/logic/simulatorEngine";
import { totalDBExposure } from "@/lib/data/dbPortfolio";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const scenarioId = searchParams.get("scenario");
  const includeCascades = searchParams.get("cascades") !== "false";

  try {
    if (scenarioId) {
      const scenario = scenarios.find((s) => s.id === scenarioId);
      if (!scenario) {
        return NextResponse.json(
          { error: "Scenario not found" },
          { status: 404 }
        );
      }

      const correlations = includeCascades ? scenarioCorrelations : {};
      const outcome = simulateScenario(scenario, scenarios, correlations);
      const impact = estimatePortfolioImpact(outcome, totalDBExposure);

      return NextResponse.json({
        scenario,
        outcome,
        impact,
        timestamp: new Date().toISOString(),
      });
    }

    const allOutcomes = simulateAllScenarios(scenarios, scenarioCorrelations);
    const allImpacts = allOutcomes.map((o) => ({
      ...o,
      portfolioImpact: estimatePortfolioImpact(o, totalDBExposure),
    }));

    return NextResponse.json({
      scenarios,
      outcomes: allImpacts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Simulator API error:", error);
    return NextResponse.json(
      { error: "Failed to run simulation" },
      { status: 500 }
    );
  }
}
