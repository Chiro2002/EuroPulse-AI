/**
 * News Classifier
 * Functions for classifying and processing news items
 */

import { NewsItem } from "../types";

/**
 * Severity color mapping
 */
export const severityConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  critical: { color: "#EF4444", bgColor: "rgba(239, 68, 68, 0.15)", label: "Critical" },
  high: { color: "#F59E0B", bgColor: "rgba(245, 158, 11, 0.15)", label: "High" },
  medium: { color: "#3B82F6", bgColor: "rgba(59, 130, 246, 0.15)", label: "Medium" },
  low: { color: "#10B981", bgColor: "rgba(16, 185, 129, 0.15)", label: "Low" },
};

/**
 * Market impact color mapping
 */
export const impactConfig: Record<string, { color: string; label: string }> = {
  positive: { color: "#10B981", label: "Positive" },
  negative: { color: "#EF4444", label: "Negative" },
  neutral: { color: "#94A3B8", label: "Neutral" },
};

/**
 * Filter news by severity level
 */
export function filterBySeverity(news: NewsItem[], severity: string[]): NewsItem[] {
  return news.filter((item) => severity.includes(item.severity));
}

/**
 * Filter news by affected country
 */
export function filterByCountry(news: NewsItem[], countryCode: string): NewsItem[] {
  return news.filter((item) =>
    item.affectedCountries.some(
      (c) => c.toLowerCase() === countryCode.toLowerCase()
    )
  );
}

/**
 * Filter news by affected sector
 */
export function filterBySector(news: NewsItem[], sector: string): NewsItem[] {
  return news.filter((item) =>
    item.affectedSectors.some(
      (s) => s.toLowerCase() === sector.toLowerCase()
    )
  );
}

/**
 * Sort news by timestamp (most recent first)
 */
export function sortByDate(news: NewsItem[]): NewsItem[] {
  return [...news].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Get time ago string from timestamp
 */
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

/**
 * Calculate DB relevance score for a news item
 */
export function calculateDBRelevance(newsItem: NewsItem): number {
  let score = 50; // Base score

  // Severity boost
  const severityBoosts: Record<string, number> = {
    critical: 25,
    high: 15,
    medium: 5,
    low: 0,
  };
  score += severityBoosts[newsItem.severity] || 0;

  // DB core sector boost
  const dbSectors = ["Banking", "Sovereign Bonds", "Corporate Finance", "Real Estate", "Trade Finance"];
  const sectorOverlap = newsItem.affectedSectors.filter((s) =>
    dbSectors.some((db) => s.toLowerCase().includes(db.toLowerCase()))
  );
  score += sectorOverlap.length * 5;

  // DB's key country markets boost
  const dbCoreCountries = ["DE", "FR", "IT", "ES", "NL", "BE"];
  const countryOverlap = newsItem.affectedCountries.filter((c) =>
    dbCoreCountries.includes(c)
  );
  score += countryOverlap.length * 3;

  return Math.min(100, score);
}

/**
 * Aggregate news statistics
 */
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

  // Count sector occurrences
  const sectorCounts: Record<string, number> = {};
  news.forEach((n) => {
    n.affectedSectors.forEach((s) => {
      sectorCounts[s] = (sectorCounts[s] || 0) + 1;
    });
  });

  const countryCounts: Record<string, number> = {};
  news.forEach((n) => {
    n.affectedCountries.forEach((c) => {
      countryCounts[c] = (countryCounts[c] || 0) + 1;
    });
  });

  return {
    total: news.length,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    positiveImpacts,
    negativeImpacts,
    topSectors: Object.entries(sectorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([sector, count]) => ({ sector, count })),
    topCountries: Object.entries(countryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([country, count]) => ({ country, count })),
  };
}
