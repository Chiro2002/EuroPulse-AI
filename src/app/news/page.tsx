"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Newspaper,
  Search,
  RefreshCw,
  Sparkles,
  Brain,
  SlidersHorizontal,
  SortAsc,
  Clock,
  Globe,
  Filter,
  ChevronDown,
  X,
} from "lucide-react";
import { NewsTimeline } from "@/components/news/NewsTimeline";
import { ExpandedNewsCard } from "@/components/news/ExpandedNewsCard";
import { TopThemesPanel } from "@/components/news/TopThemesPanel";
import { AISummaryModal } from "@/components/news/AISummaryModal";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { euCountries } from "@/lib/data/countries";
import type { ClassifiedNews, NewsTheme } from "@/lib/types";

const topics = ["all", "geopolitical", "economic_policy", "energy", "trade", "financial_markets", "war", "regulatory"];
const topicLabels: Record<string, string> = {
  all: "All Topics",
  geopolitical: "Geopolitics",
  economic_policy: "Policy",
  energy: "Energy",
  trade: "Trade",
  financial_markets: "Markets",
  war: "Conflict",
  regulatory: "Regulation",
};

const topicColors: Record<string, string> = {
  geopolitical: "#F97316",
  economic_policy: "#3B82F6",
  energy: "#EF4444",
  trade: "#8B5CF6",
  financial_markets: "#10B981",
  war: "#DC2626",
  regulatory: "#F59E0B",
};

export default function NewsPage() {
  // Data state
  const [newsItems, setNewsItems] = useState<ClassifiedNews[]>([]);
  const [themes, setThemes] = useState<NewsTheme[]>([]);
  const [dailySummary, setDailySummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [severityThreshold, setSeverityThreshold] = useState(1);
  const [timeframe, setTimeframe] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("impact");
  const [showFilters, setShowFilters] = useState(false);

  // UI state
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [dailySummaryFull, setDailySummaryFull] = useState("");

  const fetchNews = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (selectedCountry !== "all") params.set("country", selectedCountry);
      if (selectedTopic !== "all") params.set("topic", selectedTopic);
      if (severityThreshold > 1) params.set("severity", severityThreshold.toString());
      if (timeframe !== "all") params.set("timeframe", timeframe);
      params.set("sort", sortBy);

      const res = await fetch(`/api/news?${params.toString()}`);
      const json = await res.json();
      setNewsItems(json.newsItems || []);
      setThemes(json.themes || []);
      setDailySummary(json.dailySummary || "");
    } catch (e) {
      console.error("Failed to fetch news", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCountry, selectedTopic, severityThreshold, timeframe, sortBy]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Client-side search filter
  const filteredNews = useMemo(() => {
    if (!searchQuery) return newsItems;
    const q = searchQuery.toLowerCase();
    return newsItems.filter(
      (item) =>
        item.headline.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.affectedCountries.some((c) => c.toLowerCase().includes(q)) ||
        item.affectedSectors.some((s) => s.toLowerCase().includes(q))
    );
  }, [newsItems, searchQuery]);

  const openSummary = async () => {
    setSummaryModalOpen(true);
    setSummaryLoading(true);
    try {
      const res = await fetch("/api/news?summary=true");
      const json = await res.json();
      setDailySummaryFull(json.dailySummary || dailySummary);
    } catch (e) {
      setDailySummaryFull(dailySummary);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
  };

  const handleEventClick = (id: string) => {
    setSelectedEventId(id === selectedEventId ? null : id);
    // Scroll to the card
    setTimeout(() => {
      document.getElementById(`news-card-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const clearFilters = () => {
    setSelectedCountry("all");
    setSelectedTopic("all");
    setSeverityThreshold(1);
    setTimeframe("all");
    setSortBy("impact");
    setSearchQuery("");
  };

  const hasActiveFilters = selectedCountry !== "all" || selectedTopic !== "all" || severityThreshold > 1 || timeframe !== "all" || searchQuery;

  return (
    <div className="p-6">
      {/* ============================== */}
      {/* PAGE HEADER */}
      {/* ============================== */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-db-text-primary flex items-center gap-2">
            <Newspaper size={22} className="text-db-accent" />
            News Explainer
          </h1>
          <p className="text-sm text-db-text-muted mt-1">
  AI-powered analysis of Europe's most important events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-db-accent/20 to-blue-500/20 text-db-accent text-xs font-medium hover:from-db-accent/30 hover:to-blue-500/30 transition-all"
          >
            <Brain size={13} />
            Summarize today
          </button>
          <button
            onClick={() => fetchNews(true)}
            disabled={refreshing}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-db-surface text-db-text-muted text-xs hover:text-db-text-primary transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Daily Summary Banner */}
      {dailySummary && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-3 mb-4 flex items-start gap-2 bg-gradient-to-r from-db-accent/5 to-transparent"
        >
          <Sparkles size={14} className="text-db-warning mt-0.5 flex-shrink-0" />
          <p className="text-xs text-db-text-primary leading-relaxed">{dailySummary}</p>
          <button
            onClick={openSummary}
            className="flex-shrink-0 text-[10px] text-db-accent font-medium hover:text-blue-300 ml-auto"
          >
            Full summary →
          </button>
        </motion.div>
      )}

      {/* ============================== */}
      {/* FILTER BAR */}
      {/* ============================== */}
      <div className="glass-card p-3 mb-4 sticky top-0 z-20">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="flex-1 min-w-[160px] relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-db-text-muted" />
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-db-surface border border-db-border rounded-lg pl-8 pr-2 py-1.5 text-xs text-db-text-primary placeholder:text-db-text-muted focus:outline-none focus:border-db-accent transition-colors"
            />
          </div>

          {/* Country filter */}
          <div className="relative">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="appearance-none bg-db-surface border border-db-border rounded-lg px-2.5 py-1.5 pr-6 text-xs text-db-text-primary focus:outline-none focus:border-db-accent transition-colors cursor-pointer"
            >
              <option value="all">All Countries</option>
              {euCountries.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
              ))}
            </select>
            <Globe size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-db-text-muted pointer-events-none" />
          </div>

          {/* Topic chips */}
          <div className="hidden md:flex items-center gap-1 flex-wrap">
            {topics.slice(0, 4).map((topic) => (
              <button
                key={topic}
                onClick={() => handleTopicSelect(topic)}
                className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap ${
                  selectedTopic === topic
                    ? "text-white"
                    : "text-db-text-muted hover:text-db-text-primary bg-db-surface"
                }`}
                style={selectedTopic === topic ? { backgroundColor: topicColors[topic] || "#3B82F6" } : {}}
              >
                {topicLabels[topic]}
              </button>
            ))}
          </div>

          {/* More filters toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
              hasActiveFilters ? "bg-db-accent/15 text-db-accent" : "text-db-text-muted hover:text-db-text-primary bg-db-surface"
            }`}
          >
            <SlidersHorizontal size={11} />
            Filters
            {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-db-accent" />}
          </button>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="mt-3 pt-3 border-t border-db-border"
          >
            <div className="flex flex-wrap items-center gap-4">
              {/* Severity slider */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-db-text-muted whitespace-nowrap">Min Severity: {severityThreshold}</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severityThreshold}
                  onChange={(e) => setSeverityThreshold(parseInt(e.target.value))}
                  className="w-20 h-1 accent-db-accent"
                />
              </div>

              {/* Time filter */}
              <div className="flex items-center gap-1">
                <Clock size={10} className="text-db-text-muted" />
                {["all", "24h", "7d", "30d"].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                      timeframe === tf
                        ? "bg-db-accent text-white"
                        : "text-db-text-muted hover:text-db-text-primary"
                    }`}
                  >
                    {tf === "all" ? "All time" : tf === "24h" ? "24H" : tf === "7d" ? "7D" : "30D"}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-1">
                <SortAsc size={10} className="text-db-text-muted" />
                {["impact", "recency", "severity"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all capitalize ${
                      sortBy === s
                        ? "bg-db-accent text-white"
                        : "text-db-text-muted hover:text-db-text-primary"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Clear filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-db-danger hover:text-red-300 transition-colors"
                >
                  <X size={10} />
                  Clear all
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* ============================== */}
      {/* MAIN CONTENT: Timeline + Feed + Themes */}
      {/* ============================== */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Left: News Feed */}
        <div className="lg:col-span-3 space-y-4">
          {/* Timeline */}
          {filteredNews.length > 0 && (
            <NewsTimeline
              items={filteredNews}
              onEventClick={handleEventClick}
              selectedId={selectedEventId}
            />
          )}

          {/* Loading state */}
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-4 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-db-border" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-db-border rounded w-1/3" />
                      <div className="h-4 bg-db-border rounded w-3/4" />
                      <div className="h-3 bg-db-border rounded w-full" />
                      <div className="flex gap-2">
                        <div className="h-5 bg-db-border rounded w-16" />
                        <div className="h-5 bg-db-border rounded w-12" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* News Cards */}
          {!loading && (
            <>
              {filteredNews.map((item, i) => (
                <div key={item.id} id={`news-card-${item.id}`}>
                  <ExpandedNewsCard item={item} index={i} />
                </div>
              ))}

              {filteredNews.length === 0 && (
                <div className="glass-card p-8 text-center">
                  <p className="text-sm text-db-text-muted">No news items match your filters.</p>
                  <button
                    onClick={clearFilters}
                    className="mt-2 text-xs text-db-accent hover:text-blue-300 transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </>
          )}

          {/* Count */}
          {!loading && filteredNews.length > 0 && (
            <p className="text-[10px] text-db-text-muted text-center">
              Showing {filteredNews.length} of {newsItems.length} events
            </p>
          )}
        </div>

        {/* Right: Themes */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-3">
            <TopThemesPanel
              themes={themes}
              selectedTopic={selectedTopic}
              onTopicSelect={handleTopicSelect}
            />

            {/* Quick Stats */}
            <div className="glass-card p-4">
              <h3 className="text-xs font-bold text-db-text-primary mb-2 uppercase tracking-wider">
                Quick Stats
              </h3>
              <div className="space-y-1.5">
                {[
                  { label: "Total Events", value: newsItems.length },
                  { label: "Critical", value: newsItems.filter((n) => n.severity === "critical").length, color: "#EF4444" },
                  { label: "High Alert", value: newsItems.filter((n) => n.severity === "high").length, color: "#F59E0B" },
                  { label: "Countries", value: [...new Set(newsItems.flatMap((n) => n.affectedCountries))].length },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between text-xs">
                    <span className="text-db-text-muted">{stat.label}</span>
                    <span className="font-semibold" style={{ color: stat.color || undefined }}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Time filter quick access */}
            <div className="glass-card p-3">
              <p className="text-[10px] text-db-text-muted mb-2">View Period</p>
              <div className="flex gap-1">
                {[
                  { value: "all", label: "All" },
                  { value: "24h", label: "24H" },
                  { value: "7d", label: "7D" },
                ].map((tf) => (
                  <button
                    key={tf.value}
                    onClick={() => setTimeframe(tf.value)}
                    className={`flex-1 py-1 rounded text-[10px] font-medium transition-all ${
                      timeframe === tf.value
                        ? "bg-db-accent text-white"
                        : "bg-db-surface text-db-text-muted hover:text-db-text-primary"
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================== */}
      {/* AI SUMMARY MODAL */}
      {/* ============================== */}
      <AISummaryModal
        open={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        summary={dailySummaryFull || dailySummary}
        loading={summaryLoading}
      />
    </div>
  );
}
