import { NextRequest, NextResponse } from "next/server";
import { generateFullForecast } from "@/lib/logic/forecastEngine";
import { generateForecastNarrative } from "@/lib/ai/agents";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const countriesParam = searchParams.get("countries") || "DE,FR,IT,ES,NL";
  const horizon = searchParams.get("horizon") || "quarterly";
  const includeNarrative = searchParams.get("narrative") === "true";

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
    });
  } catch (error) {
    console.error("Forecast API error:", error);
    return NextResponse.json(
      { error: "Failed to generate forecasts" },
      { status: 500 }
    );
  }
}
