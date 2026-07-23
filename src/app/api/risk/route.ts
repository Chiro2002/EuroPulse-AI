import { NextRequest, NextResponse } from "next/server";
import { buildRiskData } from "@/lib/data/riskData";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const headers = {
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
  };
  const searchParams = request.nextUrl.searchParams;
  const country = searchParams.get("country");
  const dimension = searchParams.get("dimension") || "total";

  try {
    const data = buildRiskData();

    // If a specific country is requested
    if (country) {
      const countryData = data.countries.find((c) => c.code === country.toUpperCase());
      if (!countryData) {
        return NextResponse.json({ error: "Country not found" }, { status: 404 });
      }
      return NextResponse.json({
        country: countryData,
        sectorStress: Object.fromEntries(
          Object.entries(data.sectorStress).map(([sector, countries]) => [
            sector,
            { [country.toUpperCase()]: countries[country.toUpperCase()] },
          ])
        ),
        historicalTrend: data.historicalTrends[country.toUpperCase()] || [],
        eventHighlights: data.eventHighlights,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      ...data,
      timestamp: new Date().toISOString(),
    }, { headers });
  } catch (error) {
    console.error("Risk API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch risk data" },
      { status: 500 }
    );
  }
}
