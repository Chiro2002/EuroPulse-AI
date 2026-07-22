import { NextRequest, NextResponse } from "next/server";
import { forecasts } from "@/lib/data/mockData";
import { generateForecastSummary, groupForecastsByCountry } from "@/lib/logic/forecastEngine";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const country = searchParams.get("country");
  const metric = searchParams.get("metric");

  try {
    let filtered = [...forecasts];

    if (country) {
      filtered = filtered.filter((f) => f.country === country.toUpperCase());
    }
    if (metric) {
      filtered = filtered.filter((f) => f.metric.toLowerCase() === metric.toLowerCase());
    }

    const summary = generateForecastSummary(forecasts);
    const groupedByCountry = groupForecastsByCountry(filtered);

    return NextResponse.json({
      forecasts: filtered,
      summary,
      groupedByCountry,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Forecast API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch forecasts" },
      { status: 500 }
    );
  }
}
