import { NextRequest, NextResponse } from "next/server";
import { newsItems } from "@/lib/data/mockData";
import { filterBySeverity, filterByCountry, filterBySector, sortByDate, getNewsStats } from "@/lib/logic/newsClassifier";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const severity = searchParams.get("severity");
  const country = searchParams.get("country");
  const sector = searchParams.get("sector");
  const limit = parseInt(searchParams.get("limit") || "20");

  try {
    let filtered = [...newsItems];

    if (severity) {
      filtered = filterBySeverity(filtered, severity.split(","));
    }
    if (country) {
      filtered = filterByCountry(filtered, country);
    }
    if (sector) {
      filtered = filterBySector(filtered, sector);
    }

    filtered = sortByDate(filtered);
    
    if (limit > 0) {
      filtered = filtered.slice(0, limit);
    }

    const stats = getNewsStats(newsItems);

    return NextResponse.json({
      news: filtered,
      stats,
      total: filtered.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("News API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
