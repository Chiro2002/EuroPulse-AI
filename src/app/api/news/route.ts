import { NextRequest, NextResponse } from "next/server";
import { newsItems } from "@/lib/data/mockData";
import { classifyAllNews, rankNews, extractThemes, generateDailySummary, filterByCountry, filterByTopic, filterByTimeframe, filterBySeverityThreshold, sortNews } from "@/lib/logic/newsClassifier";
import { generateDailyNewsSummary } from "@/lib/ai/agents";
import type { ClassifiedNews, NewsTheme, NewsAPIResponse } from "@/lib/types";

// Simple in-memory cache
let cache: { data: NewsAPIResponse; timestamp: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const country = searchParams.get("country");
    const topic = searchParams.get("topic");
    const severity = parseInt(searchParams.get("severity") || "1");
    const timeframe = searchParams.get("timeframe") || "all";
    const sort = searchParams.get("sort") || "impact";
    const includeSummary = searchParams.get("summary") === "true";

    // Check cache
    if (cache && Date.now() - cache.timestamp < CACHE_TTL && !includeSummary) {
      const cached = cache.data;
      let filtered = applyFilters(cached.newsItems, country, topic, severity, timeframe, sort);
      return NextResponse.json({
        ...cached,
        newsItems: filtered,
        totalCount: filtered.length,
        cached: true,
      });
    }

    // Step 1: Classify all news
    const classified = classifyAllNews(newsItems);

    // Step 2: Rank by impact
    const ranked = rankNews(classified);

    // Step 3: Extract themes
    const themes = extractThemes(ranked);

    // Step 4: Generate daily summary (if requested)
    const dailySummary = includeSummary
      ? await generateDailyNewsSummary(ranked.slice(0, 5))
      : generateDailySummary(ranked.slice(0, 3));

    const response: NewsAPIResponse = {
      newsItems: ranked,
      themes,
      dailySummary,
      totalCount: ranked.length,
    };

    // Update cache
    cache = { data: response, timestamp: Date.now() };

    // Apply filters for response
    let filtered = applyFilters(response.newsItems, country, topic, severity, timeframe, sort);

    return NextResponse.json({
      ...response,
      newsItems: filtered,
      totalCount: filtered.length,
      cached: false,
    });
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
