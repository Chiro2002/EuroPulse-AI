import { NextRequest, NextResponse } from "next/server";
import { generateFullForecast } from "@/lib/logic/forecastEngine";
import { generateForecastNarrative } from "@/lib/ai/agents";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const headers = {
    "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
  };
  const searchParams = request.nextUrl.searchParams;
  const countriesParam = searchParams.get("countries") || "DE,FR,IT,ES,NL";
  const horizon = searchParams.get("horizon") || "quarterly";
  const includeNarrative = searchParams.get("narrative") !== "false"; // Always-on by default

  try {
    const countries = countriesParam.split(",").map((c: string) => c.trim().toUpperCase());
    const data = generateFullForecast(countries);

    if (includeNarrative) {
      data.narrative = await generateForecastNarrative(data);
    }

    return NextResponse.json({
      ...data,
      horizon,
      timestamp: new Date().toISOString(),
    }, { headers });
  } catch (error) {
    console.error("Forecast API error:", error);
    return NextResponse.json(
      { error: "Failed to generate forecasts" },
      { status: 500 }
    );
  }
}
