import { NextRequest, NextResponse } from "next/server";
import { generateSidebarInsight } from "@/lib/ai/agents";
import { newsItems, riskScores, scenarios } from "@/lib/data/mockData";
import { dataFetcher } from "@/lib/services/dataFetcher";


export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get("page") || "dashboard";

  try {
    // Fetch live dashboard data so the AI sidebar insights reflect real market conditions
    let liveData = null;
    let countryRisksForAI: { country: string; countryName: string; flag: string; riskScore: number }[] = [];
    try {
      // Race market data against 3s timeout so sidebar never blocks page load
      const marketData = await Promise.race([
        dataFetcher.fetchMarketDataOnly(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Market data fetch timed out")), 3000)
        ),
      ]);
      const stressOverall = Math.round(
        40 +
        (marketData.inflation > 2.5 ? 12 : 0) +
        (marketData.brentCurrent > 85 ? 8 : 0) +
        (marketData.eurUsd < 1.07 ? 8 : 0) +
        (marketData.ecbRate > 3.5 ? 5 : 0)
      );

      liveData = {
        ecbRate: marketData.ecbRate,
        eurUsd: marketData.eurUsd,
        brentCurrent: marketData.brentCurrent,
        stoxxCurrent: marketData.stoxxCurrent,
        inflation: marketData.inflation,
        stressRadar: {
          inflation: Math.round(Math.min(100, 45 + (marketData.inflation - 2.0) * 15)),
          energy: Math.round(Math.min(100, 40 + (marketData.brentCurrent - 70) * 1.2)),
          fx: Math.round(65 + (marketData.eurUsd < 1.07 ? 15 : marketData.eurUsd < 1.09 ? 5 : 0)),
          geopolitical: Math.round(55 + Math.random() * 10),
          bond: Math.round(Math.min(100, 50 + (marketData.ecbRate - 3.0) * 8)),
          housing: Math.round(50 + Math.random() * 15),
          overall: stressOverall,
        },
        topEvents: [],
        countryRisks: countryRisksForAI, // will be filled below
      };

      // Build country risks from riskScores
      const { euCountries } = await import("@/lib/data/countries");
      countryRisksForAI = riskScores.map((rs) => {
        const country = euCountries.find((c: any) => c.code === rs.country);
        return {
          country: rs.country,
          countryName: country?.name ?? rs.country,
          flag: country?.flag ?? "🇪🇺",
          riskScore: rs.total,
        };
      });
      liveData.countryRisks = countryRisksForAI;
    } catch (e) {
      console.warn("Sidebar: Could not fetch live data, falling back to mock-only AI:", e);
    }

    const insight = await generateSidebarInsight(
      page,
      newsItems,
      riskScores,
      liveData ?? {
        ecbRate: 3.75,
        eurUsd: 1.0825,
        brentCurrent: 82,
        stoxxCurrent: 4892,
        inflation: 2.8,
        stressRadar: {
          inflation: 55, energy: 48, fx: 65, geopolitical: 60, bond: 56, housing: 58, overall: 50,
        },
        topEvents: [],
        countryRisks: riskScores.map(rs => ({
          country: rs.country,
          countryName: rs.country,
          flag: "🇪🇺",
          riskScore: rs.total,
        })),
      },
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
