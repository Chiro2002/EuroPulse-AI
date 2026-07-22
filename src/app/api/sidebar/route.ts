import { NextRequest, NextResponse } from "next/server";
import { generateSidebarInsight } from "@/lib/ai/agents";
import { newsItems, riskScores, scenarios } from "@/lib/data/mockData";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get("page") || "dashboard";

  try {
    const insight = await generateSidebarInsight(
      page,
      newsItems,
      riskScores,
      scenarios
    );

    return NextResponse.json({
      insight,
      page,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating sidebar insight:", error);
    return NextResponse.json(
      { error: "Failed to generate insight" },
      { status: 500 }
    );
  }
}
