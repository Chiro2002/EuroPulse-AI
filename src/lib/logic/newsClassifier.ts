/**
 * News Classifier
 * Functions for classifying, ranking, filtering, and analyzing news items
 */

import { ClassifiedNews, NewsItem, NewsTheme, EventType, MarketImpactDetail, DBImpactDetail } from "../types";

// ==============================
// Severity & Impact Config
// ==============================

export const severityConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  critical: { color: "#EF4444", bgColor: "rgba(239, 68, 68, 0.15)", label: "Critical" },
  high: { color: "#F59E0B", bgColor: "rgba(245, 158, 11, 0.15)", label: "High" },
  medium: { color: "#3B82F6", bgColor: "rgba(59, 130, 246, 0.15)", label: "Medium" },
  low: { color: "#10B981", bgColor: "rgba(16, 185, 129, 0.15)", label: "Low" },
};

export const impactConfig: Record<string, { color: string; label: string }> = {
  positive: { color: "#10B981", label: "Positive" },
  negative: { color: "#EF4444", label: "Negative" },
  neutral: { color: "#94A3B8", label: "Neutral" },
};

export const topicColors: Record<string, string> = {
  geopolitical: "#F97316",
  economic_policy: "#3B82F6",
  energy: "#EF4444",
  trade: "#8B5CF6",
  financial_markets: "#10B981",
  war: "#DC2626",
  regulatory: "#F59E0B",
};

const topicLabels: Record<string, string> = {
  geopolitical: "Geopolitics",
  economic_policy: "Policy",
  energy: "Energy",
  trade: "Trade",
  financial_markets: "Markets",
  war: "Conflict",
  regulatory: "Regulation",
};

export function getTopicLabel(topic: string): string {
  return topicLabels[topic] || topic.charAt(0).toUpperCase() + topic.slice(1);
}

// ==============================
// Step 2: Classify a news item (mock AI)
// ==============================

export function classifyNewsItem(item: NewsItem, index: number): ClassifiedNews {
  // Deterministic classification based on item content and index
  const eventTypes: EventType[] = ["geopolitical", "economic_policy", "energy", "trade", "financial_markets", "war", "regulatory"];
  
  // Map severity string to number
  const severityMap: Record<string, number> = { critical: 9, high: 7, medium: 4, low: 2 };
  const severityNum = severityMap[item.severity] || 5;

  // Determine event type from sectors and headline keywords
  const headline = item.headline.toLowerCase();
  const sectors = item.affectedSectors.map(s => s.toLowerCase());
  
  let eventType: EventType;
  if (headline.includes("gas") || headline.includes("oil") || headline.includes("energy") || sectors.includes("energy")) {
    eventType = "energy";
  } else if (headline.includes("ecb") || headline.includes("rate") || headline.includes("inflation") || headline.includes("bond") || sectors.includes("bonds")) {
    eventType = "economic_policy";
  } else if (headline.includes("war") || headline.includes("conflict") || headline.includes("russia") || headline.includes("ukraine") || headline.includes("military")) {
    eventType = "war";
  } else if (headline.includes("trade") || headline.includes("tariff") || headline.includes("export")) {
    eventType = "trade";
  } else if (headline.includes("regulat") || headline.includes("stress test") || headline.includes("downgrade")) {
    eventType = "regulatory";
  } else if (headline.includes("market") || headline.includes("stock") || headline.includes("bank") || sectors.includes("banking")) {
    eventType = "financial_markets";
  } else {
    eventType = "geopolitical";
  }

  // Market impact detail based on marketImpact and sectors
  const marketImpactDetail: MarketImpactDetail = {
    inflation: item.marketImpact === "positive" ? "up" : item.marketImpact === "negative" ? "down" : "neutral",
    eur: item.marketImpact === "positive" ? "strengthen" : item.marketImpact === "negative" ? "weaken" : "neutral",
    bonds: sectors.includes("bonds") || sectors.includes("sovereign") ? 
      (item.marketImpact === "positive" ? "yields_down" : "yields_up") : "neutral",
    equities: item.marketImpact === "positive" ? "positive" : item.marketImpact === "negative" ? "negative" : "neutral",
    oil: sectors.includes("energy") ? (item.marketImpact === "positive" ? "down" : "up") : "neutral",
  };

  // Time horizon
  const timeHorizon = item.severity === "critical" ? "immediate" : item.severity === "high" ? "days" : item.severity === "medium" ? "weeks" : "months";

  // DB Impact
  const dbImpact: DBImpactDetail[] = [];
  if (sectors.some(s => s.includes("bank") || s.includes("finance") || s.includes("lending"))) {
    dbImpact.push({ department: "Corporate Banking", effect: "Direct credit exposure to affected sectors", severity: "high" });
  }
  if (sectors.some(s => s.includes("bond") || s.includes("sovereign") || s.includes("debt"))) {
    dbImpact.push({ department: "Sovereign Trading", effect: "Bond portfolio valuation impact", severity: "high" });
  }
  if (sectors.some(s => s.includes("energy"))) {
    dbImpact.push({ department: "Energy Lending", effect: "Energy sector loan book stress", severity: "medium" });
  }
  if (sectors.some(s => s.includes("real estate") || s.includes("mortgage"))) {
    dbImpact.push({ department: "Mortgage Lending", effect: "CRE and mortgage exposure risk", severity: "medium" });
  }
  if (dbImpact.length === 0) {
    dbImpact.push({ department: "Risk Management", effect: "General portfolio monitoring required", severity: "low" });
  }

  // Generate whatHappened (2 sentence plain English)
  const whatHappened = item.summary.length > 120 ? item.summary.substring(0, 120) + "..." : item.summary;

  // Why it matters
  const whyItMatters = item.explanation || `This ${eventType.replace("_", " ")} event affects ${item.affectedCountries.length} EU countries with material implications for Deutsche Bank's ${dbImpact.map(d => d.department).join(", ")} departments.`;

  // Who is affected
  const whoIsAffected = `Primary: ${item.affectedCountries.join(", ")}. Sectors most impacted: ${item.affectedSectors.join(", ")}.`;

  // Recommended actions
  const recommendedActions: string[] = [
    `Monitor ${item.affectedCountries.slice(0, 2).join("/")} exposure closely`,
    `Review ${item.affectedSectors[0] || "related"} portfolio limits`,
    `Alert risk committee if severity escalates`,
  ];

  // Topics
  const topics = [eventType, ...item.affectedSectors.slice(0, 2).map(s => s.toLowerCase())];

  // Ranking score
  const score = rankScore(item, severityNum);

  return {
    ...item,
    eventType,
    severityNum,
    marketImpactDetail,
    timeHorizon,
    whatHappened,
    whyItMatters,
    whoIsAffected,
    dbImpact,
    recommendedActions,
    topics,
    score,
  };
}

// ==============================
// Step 3: Rank news items
// ==============================

function rankScore(item: NewsItem, severityNum: number): number {
  const recencyScore = getRecencyScore(item.timestamp);
  return (severityNum * 0.5) + (recencyScore * 0.3) + (item.affectedCountries.length * 2 * 0.2);
}

function getRecencyScore(timestamp: string): number {
  const now = new Date();
  const date = new Date(timestamp);
  const hoursAgo = (now.getTime() - date.getTime()) / (1000 * 3600);
  if (hoursAgo < 6) return 10;
  if (hoursAgo < 24) return 8;
  if (hoursAgo < 72) return 5;
  if (hoursAgo < 168) return 3;
  return 1;
}

export function rankNews(items: ClassifiedNews[]): ClassifiedNews[] {
  return [...items].sort((a, b) => b.score - a.score);
}

// ==============================
// Classify all news items at once
// ==============================

export function classifyAllNews(items: NewsItem[]): ClassifiedNews[] {
  return items.map((item, i) => classifyNewsItem(item, i));
}

// ==============================
// Step 4: Extract top themes
// ==============================

export function extractThemes(items: ClassifiedNews[]): NewsTheme[] {
  const themeMap = new Map<string, { count: number; items: ClassifiedNews[] }>();

  items.forEach((item) => {
    item.topics.forEach((topic) => {
      const existing = themeMap.get(topic) || { count: 0, items: [] };
      existing.count++;
      existing.items.push(item);
      themeMap.set(topic, existing);
    });
  });

  const themes: NewsTheme[] = [];
  themeMap.forEach((value, name) => {
    // Determine trend by checking if recent items are more severe
    const recentItems = value.items.filter((i) => getRecencyScore(i.timestamp) >= 8);
    const avgRecentSeverity = recentItems.length > 0
      ? recentItems.reduce((s, i) => s + i.severityNum, 0) / recentItems.length
      : 0;
    const avgAllSeverity = value.items.reduce((s, i) => s + i.severityNum, 0) / value.items.length;

    const trend = avgRecentSeverity > avgAllSeverity ? "up" : avgRecentSeverity < avgAllSeverity ? "down" : "stable";
    const color = topicColors[name] || "#94A3B8";

    themes.push({
      name: getTopicLabel(name),
      rawKey: name,
      count: value.count,
      trend,
      color,
    });
  });

  return themes.sort((a, b) => b.count - a.count).slice(0, 5);
}

// ==============================
// Step 5: Generate daily summary (mock)
// ==============================

export function generateDailySummary(topItems: ClassifiedNews[]): string {
  if (topItems.length === 0) return "No significant developments today.";

  const mostSevere = topItems[0];
  const dominantTheme = extractThemes(topItems)[0];

  return `Today's most important development: ${mostSevere.headline}. The dominant theme is ${dominantTheme?.name || "economic"}, with ${topItems.length} significant events tracked. Watch for escalating impacts on ${mostSevere.affectedCountries.slice(0, 2).join(" and ")} in the coming days as market reactions unfold.`;
}

// ==============================
// Enhanced Filtering
// ==============================

export function filterByTimeframe(items: ClassifiedNews[], timeframe: string): ClassifiedNews[] {
  const now = new Date();
  const cutoff = new Date(now);
  switch (timeframe) {
    case "24h": cutoff.setHours(now.getHours() - 24); break;
    case "7d": cutoff.setDate(now.getDate() - 7); break;
    case "30d": cutoff.setDate(now.getDate() - 30); break;
    default: return items;
  }
  return items.filter((item) => new Date(item.timestamp) >= cutoff);
}

export function filterByTopic(items: ClassifiedNews[], topic: string): ClassifiedNews[] {
  if (topic === "all") return items;
  return items.filter((item) => item.eventType === topic || item.topics.includes(topic));
}

export function filterBySeverityThreshold(items: ClassifiedNews[], minSeverity: number): ClassifiedNews[] {
  return items.filter((item) => item.severityNum >= minSeverity);
}

export function sortNews(items: ClassifiedNews[], sortBy: string): ClassifiedNews[] {
  switch (sortBy) {
    case "impact": return [...items].sort((a, b) => b.score - a.score);
    case "recency": return [...items].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    case "severity": return [...items].sort((a, b) => b.severityNum - a.severityNum);
    default: return items;
  }
}

// ==============================
// Existing utilities
// ==============================

export function filterBySeverity<T extends { severity: string }>(items: T[], severity: string[]): T[] {
  return items.filter((item) => severity.includes(item.severity));
}

export function filterByCountry<T extends { affectedCountries: string[] }>(items: T[], countryCode: string): T[] {
  return items.filter((item) =>
    item.affectedCountries.some((c) => c.toLowerCase() === countryCode.toLowerCase())
  );
}

export function filterBySector<T extends { affectedSectors: string[] }>(items: T[], sector: string): T[] {
  return items.filter((item) =>
    item.affectedSectors.some((s) => s.toLowerCase() === sector.toLowerCase())
  );
}

export function sortByDate<T extends { timestamp: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export function calculateDBRelevance(newsItem: NewsItem): number {
  let score = 50;
  const severityBoosts: Record<string, number> = { critical: 25, high: 15, medium: 5, low: 0 };
  score += severityBoosts[newsItem.severity] || 0;
  const dbSectors = ["Banking", "Sovereign Bonds", "Corporate Finance", "Real Estate", "Trade Finance"];
  const sectorOverlap = newsItem.affectedSectors.filter((s) =>
    dbSectors.some((db) => s.toLowerCase().includes(db.toLowerCase()))
  );
  score += sectorOverlap.length * 5;
  const dbCoreCountries = ["DE", "FR", "IT", "ES", "NL", "BE"];
  const countryOverlap = newsItem.affectedCountries.filter((c) => dbCoreCountries.includes(c));
  score += countryOverlap.length * 3;
  return Math.min(100, score);
}

export function getNewsStats(news: NewsItem[]): {
  total: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  positiveImpacts: number;
  negativeImpacts: number;
  topSectors: { sector: string; count: number }[];
  topCountries: { country: string; count: number }[];
} {
  const criticalCount = news.filter((n) => n.severity === "critical").length;
  const highCount = news.filter((n) => n.severity === "high").length;
  const mediumCount = news.filter((n) => n.severity === "medium").length;
  const lowCount = news.filter((n) => n.severity === "low").length;
  const positiveImpacts = news.filter((n) => n.marketImpact === "positive").length;
  const negativeImpacts = news.filter((n) => n.marketImpact === "negative").length;
  const sectorCounts: Record<string, number> = {};
  news.forEach((n) => n.affectedSectors.forEach((s) => { sectorCounts[s] = (sectorCounts[s] || 0) + 1; }));
  const countryCounts: Record<string, number> = {};
  news.forEach((n) => n.affectedCountries.forEach((c) => { countryCounts[c] = (countryCounts[c] || 0) + 1; }));
  return {
    total: news.length, criticalCount, highCount, mediumCount, lowCount, positiveImpacts, negativeImpacts,
    topSectors: Object.entries(sectorCounts).sort(([, a], [, b]) => b - a).slice(0, 5).map(([sector, count]) => ({ sector, count })),
    topCountries: Object.entries(countryCounts).sort(([, a], [, b]) => b - a).slice(0, 5).map(([country, count]) => ({ country, count })),
  };
}
