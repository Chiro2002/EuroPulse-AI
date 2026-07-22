import { NextRequest, NextResponse } from "next/server";
import { riskScores } from "@/lib/data/mockData";
import { calculateAggregateRisk, getSectorRiskBreakdown } from "@/lib/logic/riskCalculator";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const country = searchParams.get("country");

  try {
    if (country) {
      const score = riskScores.find((r) => r.country === country.toUpperCase());
      if (!score) {
        return NextResponse.json(
          { error: "Country not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        riskScore: score,
        breakdown: getSectorRiskBreakdown(score),
        timestamp: new Date().toISOString(),
      });
    }

    const aggregate = calculateAggregateRisk(riskScores);

    return NextResponse.json({
      riskScores,
      aggregate,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Risk API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch risk data" },
      { status: 500 }
    );
  }
}
