import { NextRequest, NextResponse } from "next/server";
import { newsItems } from "@/lib/data/mockData";
import { classifyAllNews, rankNews, extractThemes, generateDailySummary, filterByCountry, filterByTopic, filterByTimeframe, filterBySeverityThreshold, sortNews } from "@/lib/logic/newsClassifier";
import { generateDailyNewsSummary } from "@/lib/ai/agents";
import type { ClassifiedNews, NewsTheme, NewsAPIResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Build response with caching headers for fast repeat loads
  const headers = {
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
  };
  try {
    const searchParams = request.nextUrl.searchParams;
    const country = searchParams.get("country");
    const topic = searchParams.get("topic");
    const severity = parseInt(searchParams.get("severity") || "1");
    const timeframe = searchParams.get("timeframe") || "all";
    const sort = searchParams.get("sort") || "impact";
    const includeSummary = searchParams.get("summary") === "true";

    // Step 1: Classify all news
    const classified = classifyAllNews(newsItems);

    // Step 2: Rank by impact
    const ranked = rankNews(classified);

    // Step 3: Extract themes
    const themes = extractThemes(ranked);

    // Step 4: Generate daily summary (AI when available, mock otherwise)
    const dailySummary = includeSummary
      ? await generateDailyNewsSummary(ranked.slice(0, 5))
      : generateDailySummary(ranked.slice(0, 3));

    const response: NewsAPIResponse = {
      newsItems: ranked,
      themes,
      dailySummary,
      totalCount: ranked.length,
    };

    // Apply filters for response
    let filtered = applyFilters(response.newsItems, country, topic, severity, timeframe, sort);

    return NextResponse.json({
      ...response,
      newsItems: filtered,
      totalCount: filtered.length,
    }, { headers });
  } catch (error) {
    console.error("News API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}

function applyFilters(
  items: ClassifiedNews[],
  country: string | null,
  topic: string | null,
  severity: number,
  timeframe: string,
  sort: string
): ClassifiedNews[] {
  let filtered = [...items];

  if (country && country !== "all") {
    filtered = filterByCountry(filtered, country);
  }
  if (topic && topic !== "all") {
    filtered = filterByTopic(filtered, topic);
  }
  if (severity > 1) {
    filtered = filterBySeverityThreshold(filtered, severity);
  }
  if (timeframe && timeframe !== "all") {
    filtered = filterByTimeframe(filtered, timeframe);
  }

  filtered = sortNews(filtered, sort);

  return filtered;
}
