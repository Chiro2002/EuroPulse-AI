"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper, Search, RefreshCw, Brain,
  SlidersHorizontal, SortAsc, Clock, Globe, X, Filter,
  AlertTriangle, Lightbulb, Users, TrendingUp, Building2,
  ListChecks, Beaker, Gavel,
} from "lucide-react";
import { ExpandedNewsCard } from "@/components/news/ExpandedNewsCard";
import { TopThemesPanel } from "@/components/news/TopThemesPanel";
import { AISummaryModal } from "@/components/news/AISummaryModal";
import { Skeleton, SkeletonLine } from "@/components/shared/Skeleton";
import { euCountries } from "@/lib/data/countries";
import { topicColors, filterByCountry, filterByTopic, filterByTimeframe, filterBySeverityThreshold, sortNews, extractThemes } from "@/lib/logic/newsClassifier";
import type { ClassifiedNews, NewsTheme } from "@/lib/types";

const topics = ["all", "geopolitical", "economic_policy", "energy", "trade", "financial_markets", "war", "regulatory"];
const topicLabels: Record<string, string> = {
  all: "All", geopolitical: "Geopolitics", economic_policy: "Policy", energy: "Energy",
  trade: "Trade", financial_markets: "Markets", war: "Conflict", regulatory: "Regulation",
};

const ITEMS_PER_PAGE = 5;

export default function NewsPage() {
  // All data (fetched once)
  const [allNews, setAllNews] = useState<ClassifiedNews[]>([]);
  const [allThemes, setAllThemes] = useState<NewsTheme[]>([]);
  const [dailySummary, setDailySummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);
  const fetchCountRef = useRef(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [severityThreshold, setSeverityThreshold] = useState(1);
  const [timeframe, setTimeframe] = useState("all");
  const [sortBy, setSortBy] = useState("impact");
  const [showFilters, setShowFilters] = useState(false);

  // UI
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [dailySummaryFull, setDailySummaryFull] = useState("");

  // Fetch once on mount — all filters applied client-side
  const fetchNews = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else { setLoading(true); setFetchFailed(false); }
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch("/api/news", { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setAllNews(json.newsItems || []);
      setAllThemes(json.themes || []);
      setDailySummary(json.dailySummary || "");
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      console.error("Failed to fetch news", e);
      if (fetchCountRef.current < 1) {
        fetchCountRef.current += 1;
        setTimeout(() => fetchNews(showRefresh), 1500);
      } else {
        setFetchFailed(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      if (!allNews.length && fetchCountRef.current >= 1) {
        setFetchFailed(true);
        setLoading(false);
      }
    }, 6000);
    fetchNews();
    return () => { controller.abort(); clearTimeout(timeout); };
  }, [fetchNews]);

  // All filter/sort/search logic applied CLIENT-SIDE — instant! ⚡
  const filteredNews = useMemo(() => {
    let items = allNews;

    // Country filter
    if (selectedCountry !== "all") {
      items = filterByCountry(items, selectedCountry);
    }
    // Topic filter
    if (selectedTopic !== "all") {
      items = filterByTopic(items, selectedTopic);
    }
    // Severity
    if (severityThreshold > 1) {
      items = filterBySeverityThreshold(items, severityThreshold);
    }
    // Timeframe
    if (timeframe !== "all") {
      items = filterByTimeframe(items, timeframe);
    }
    // Sort
    items = sortNews(items, sortBy);

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.headline.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.affectedCountries.some((c) => c.toLowerCase().includes(q)) ||
          item.affectedSectors.some((s) => s.toLowerCase().includes(q))
      );
    }
    return items;
  }, [allNews, selectedCountry, selectedTopic, severityThreshold, timeframe, sortBy, searchQuery]);

  // Client-side themes (re-computed from filtered data)
  const displayedThemes = useMemo(() => {
    if (selectedTopic !== "all" || selectedCountry !== "all" || severityThreshold > 1 || timeframe !== "all") {
      return extractThemes(filteredNews);
    }
    return allThemes;
  }, [filteredNews, allThemes, selectedTopic, selectedCountry, severityThreshold, timeframe]);

  // Pagination (after filteredNews to avoid reference error)
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredNews.length / ITEMS_PER_PAGE));
  const paginatedNews = useMemo(
    () => filteredNews.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filteredNews, currentPage]
  );

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [filteredNews]);

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

  const clearFilters = () => {
    setSelectedCountry("all"); setSelectedTopic("all"); setSeverityThreshold(1);
    setTimeframe("all"); setSortBy("impact"); setSearchQuery("");
  };

  const hasActiveFilters = selectedCountry !== "all" || selectedTopic !== "all" || severityThreshold > 1 || timeframe !== "all" || searchQuery;

  // Selected event for detail modal
  const selectedEvent = selectedEventId ? allNews.find((n) => n.id === selectedEventId) ?? null : null;

  // Severity counts (from all data, not filtered)
  const criticalCount = allNews.filter((n) => n.severity === "critical").length;
  const highCount = allNews.filter((n) => n.severity === "high").length;
  const uniqueCountries = [...new Set(allNews.flatMap((n) => n.affectedCountries))].length;

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Newspaper size={20} className="text-primary" />
            News Intelligence
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">AI-classified macro events impacting EU markets</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openSummary}
            className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-all"
          >
            <Brain size={13} />
            Daily Brief
          </button>
          <button
            onClick={() => fetchNews(true)}
            disabled={refreshing}
            className="flex items-center gap-1 px-2.5 h-8 rounded-lg bg-gray-50 text-text-secondary text-xs hover:text-text-primary transition-colors disabled:opacity-50 border border-border"
          >
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* ── Filter Bar ── */}        <div className="card p-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 min-w-[140px] max-w-[260px]">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-border rounded-lg pl-8 pr-2 h-8 text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary/40 transition-colors"
              />
            </div>

            {/* Country */}
            <div className="relative">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="appearance-none bg-gray-50 border border-border rounded-lg px-2.5 h-8 pr-6 text-xs text-text-primary focus:outline-none focus:border-primary/40 transition-colors cursor-pointer"
              >
                <option value="all">All Countries</option>
                {euCountries.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                ))}
              </select>
              <Globe size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
            </div>

            {/* Topic chips - scrollable on mobile */}
            <div className="hidden sm:flex items-center gap-1 overflow-x-auto scrollbar-thin flex-1 lg:flex-none">
              {topics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => { setSelectedTopic(topic); setSelectedEventId(null); }}
                  className={`px-2 h-7 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    selectedTopic === topic
                      ? "text-white shadow-sm"
                      : "text-text-secondary hover:text-text-primary bg-gray-50"
                  }`}
                  style={selectedTopic === topic ? { backgroundColor: topicColors[topic] || "#0018A8" } : {}}
                >
                  {topicLabels[topic]}
                </button>
              ))}
            </div>

            {/* More filters toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1 px-2.5 h-8 rounded-lg text-[10px] font-medium transition-all border ${
                hasActiveFilters
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "text-text-secondary hover:text-text-primary bg-gray-50 border-border"
              }`}
            >
              <SlidersHorizontal size={11} />
              Filters
              {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
            </button>

            {/* Mobile topic scroll (sm:hidden) */}
            <div className="sm:hidden overflow-x-auto scrollbar-thin flex-1">
              <div className="flex items-center gap-1 min-w-fit">
                {topics.slice(0, 3).map((topic) => (
                  <button
                    key={topic}
                    onClick={() => { setSelectedTopic(topic); setSelectedEventId(null); }}
                    className={`px-2 h-7 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                      selectedTopic === topic
                        ? "text-white shadow-sm"
                        : "text-text-secondary hover:text-text-primary bg-gray-50"
                    }`}
                    style={selectedTopic === topic ? { backgroundColor: topicColors[topic] || "#0018A8" } : {}}
                  >
                    {topicLabels[topic]}
                  </button>
                ))}
                <span className="text-[8px] text-text-secondary px-1 flex-shrink-0">+ more</span>
              </div>
            </div>
          </div>

        {/* Expanded filters */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="mt-3 pt-3 border-t border-border"
          >
            <div className="flex flex-wrap items-center gap-4">
              {/* Severity slider */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-text-secondary whitespace-nowrap">Min Severity: {severityThreshold}</span>
                <input
                  type="range"
                  min="1" max="10"
                  value={severityThreshold}
                  onChange={(e) => setSeverityThreshold(parseInt(e.target.value))}
                  className="w-20 h-1 accent-primary"
                />
              </div>

              {/* Time */}
              <div className="flex items-center gap-1">
                <Clock size={10} className="text-text-secondary" />
                {[["all", "All"], ["24h", "24H"], ["7d", "7D"], ["30d", "30D"]].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setTimeframe(val)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                      timeframe === val ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-1">
                <SortAsc size={10} className="text-text-secondary" />
                {[["impact", "Impact"], ["recency", "Recent"], ["severity", "Severity"]].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setSortBy(val)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all capitalize ${
                      sortBy === val ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {hasActiveFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-[#E5484D] hover:bg-red-50 transition-colors">
                  <X size={10} /> Clear
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Main Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left: News Feed */}
        <div className="lg:col-span-3 space-y-3">
          {/* Loading */}
          {loading && (
            <div className="space-y-3">
              <div className="card p-4">
                <SkeletonLine width="w-32" height="h-3" />
                <div className="mt-3 flex gap-1">
                  {Array.from({ length: 20 }).map((_, j) => (
                    <div key={j} className="flex-1 max-w-[8px] bg-gray-200/60 rounded-full animate-pulse" style={{ height: `${30 + Math.random() * 40}px` }} />
                  ))}
                </div>
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-9 h-9 rounded-xl" />
                    <div className="flex-1 space-y-1.5">
                      <div className="flex gap-2">
                        <Skeleton className="w-14 h-4 rounded" />
                        <Skeleton className="w-12 h-4 rounded" />
                        <Skeleton className="w-16 h-4 rounded" />
                      </div>
                      <SkeletonLine width="w-3/4" height="h-4" />
                      <SkeletonLine width="w-full" height="h-3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* News Cards — paginated, 5 per page */}
          {!loading && paginatedNews.map((item, i) => (
            <div key={item.id} id={`news-card-${item.id}`}>
              <ExpandedNewsCard item={item} index={i} onClick={(id) => setSelectedEventId(id)} />
            </div>
          ))}

          {!loading && filteredNews.length === 0 && (
            <div className="card p-8 text-center">
              <p className="text-sm text-text-secondary">No news items match your filters.</p>
              <button onClick={clearFilters} className="mt-2 text-xs text-primary hover:underline">
                Clear all filters
              </button>
            </div>
          )}

          {/* Pagination */}            {!loading && filteredNews.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-2">
              <p className="text-[10px] text-text-secondary">
                Page {currentPage} of {totalPages} · {filteredNews.length} events
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="px-3 h-7 rounded-lg text-[10px] font-medium border border-border bg-white text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  ← Prev
                </button>
                {/* Show first, last, and nearby pages - overflow on many pages */}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                  const page = start + i;
                  if (page > totalPages) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 rounded-lg text-[10px] font-medium transition-all ${
                        page === currentPage
                          ? "bg-primary text-white shadow-sm"
                          : "bg-white border border-border text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className="text-[10px] text-text-secondary px-1">...</span>
                )}
                {totalPages > 5 && (
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`w-7 h-7 rounded-lg text-[10px] font-medium transition-all ${
                      totalPages === currentPage
                        ? "bg-primary text-white shadow-sm"
                        : "bg-white border border-border text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {totalPages}
                  </button>
                )}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="px-3 h-7 rounded-lg text-[10px] font-medium border border-border bg-white text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <div className="sticky top-24 space-y-3">
            <TopThemesPanel
              themes={displayedThemes}
              selectedTopic={selectedTopic}
              onTopicSelect={(t) => { setSelectedTopic(t); setSelectedEventId(null); }}
            />

            {/* Quick Stats */}
            <div className="card p-4">
              <h3 className="text-xs font-bold text-text-primary mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                <Filter size={11} className="text-primary" /> Quick Stats
              </h3>
              <div className="space-y-2">
                {[
                  { label: "Total Events", value: allNews.length, color: "" },
                  { label: "Critical", value: criticalCount, color: "#E5484D" },
                  { label: "High Alert", value: highCount, color: "#F5A623" },
                  { label: "Countries", value: uniqueCountries, color: "" },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary">{stat.label}</span>
                    <span className="font-semibold" style={{ color: stat.color || undefined }}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Time quick access */}
            <div className="card p-3">
              <p className="text-[10px] text-text-secondary mb-2">View Period</p>
              <div className="flex gap-1">
                {[["all", "All"], ["24h", "24H"], ["7d", "7D"]].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setTimeframe(val)}
                    className={`flex-1 py-1 rounded text-[10px] font-medium transition-all ${
                      timeframe === val ? "bg-primary text-white" : "bg-gray-50 text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Summary Modal */}
      <AISummaryModal
        open={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        summary={dailySummaryFull || dailySummary}
        loading={summaryLoading}
      />

      {/* ── News Detail Modal ── */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm overflow-y-auto p-4"
            onClick={() => setSelectedEventId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Modal Header ── */}
              <div className="flex items-start justify-between p-5 pb-3 border-b border-border">
                <div className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold"
                    style={{ backgroundColor: `rgba(${selectedEvent.severityNum >= 8 ? "229,72,77" : selectedEvent.severityNum >= 6 ? "245,166,35" : "59,130,246"},0.15)`, color: selectedEvent.severityNum >= 8 ? "#E5484D" : selectedEvent.severityNum >= 6 ? "#F5A623" : "#3B82F6" }}
                  >
                    {selectedEvent.severityNum}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: `rgba(${selectedEvent.eventType === "energy" ? "239,68,68" : selectedEvent.eventType === "economic_policy" ? "59,130,246" : "154,106,239"},0.15)`, color: selectedEvent.eventType === "energy" ? "#EF4444" : selectedEvent.eventType === "economic_policy" ? "#3B82F6" : "#9A6AEF" }}>
                        {selectedEvent.eventType.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                      <span className="text-[10px] text-text-secondary">{selectedEvent.source}</span>
                    </div>
                    <h2 className="text-sm font-bold text-text-primary leading-snug">{selectedEvent.headline}</h2>
                    <div className="flex items-center gap-2 mt-1.5">
                      {selectedEvent.affectedCountries.map((code) => {
                        const country = euCountries.find((c) => c.code === code);
                        return <span key={code} className="text-sm" title={country?.name}>{country?.flag || "🇪🇺"}</span>;
                      })}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEventId(null)}
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <X size={15} className="text-text-secondary" />
                </button>
              </div>

              {/* ── Modal Body — scrollable ── */}
              <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
                {/* WHAT HAPPENED + WHY IT MATTERS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <AlertTriangle size={11} className="text-primary" />
                      <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">What Happened</span>
                    </div>
                    <p className="text-xs text-text-primary leading-relaxed">{selectedEvent.whatHappened}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Lightbulb size={11} className="text-[#F5A623]" />
                      <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Why It Matters</span>
                    </div>
                    <p className="text-xs text-text-primary leading-relaxed">{selectedEvent.whyItMatters}</p>
                  </div>
                </div>

                {/* WHO'S AFFECTED */}
                <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Users size={11} className="text-[#2FAE60]" />
                    <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Who's Affected</span>
                  </div>
                  <p className="text-xs text-text-primary mb-2">{selectedEvent.whoIsAffected}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedEvent.affectedCountries.map((code) => {
                      const country = euCountries.find((c) => c.code === code);
                      return (
                        <span key={code} className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-gray-100 text-text-secondary">
                          {country?.flag || "🇪🇺"} {country?.name || code}
                        </span>
                      );
                    })}
                    {selectedEvent.affectedSectors.map((sector) => (
                      <span key={sector} className="text-[9px] px-2 py-0.5 rounded-full bg-primary/5 text-primary">
                        {sector}
                      </span>
                    ))}
                  </div>
                </div>

                {/* LIKELY MARKET REACTION */}
                <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                  <div className="flex items-center gap-1.5 mb-2">
                    <TrendingUp size={11} className="text-primary" />
                    <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Likely Market Reaction</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { label: "Inflation", value: selectedEvent.marketImpactDetail.inflation },
                      { label: "EUR/USD", value: selectedEvent.marketImpactDetail.eur },
                      { label: "Bonds", value: selectedEvent.marketImpactDetail.bonds },
                      { label: "Equities", value: selectedEvent.marketImpactDetail.equities },
                      { label: "Oil", value: selectedEvent.marketImpactDetail.oil },
                    ].map((m) => (
                      <div key={m.label} className="flex flex-col items-center gap-0.5 p-2 rounded-lg bg-white border border-gray-100">
                        <span className="text-[8px] font-medium text-text-secondary uppercase tracking-wider">{m.label}</span>
                        <span className="text-sm font-bold" style={{
                          color: ["up","strengthen","positive","yields_up"].includes(m.value) ? "#E5484D"
                            : ["down","weaken","negative","yields_down"].includes(m.value) ? "#2FAE60"
                            : "#94A3B8"
                        }}>
                          {{
                            up: "↑", down: "↓", neutral: "→",
                            strengthen: "↑", weaken: "↓",
                            positive: "↑", negative: "↓",
                            yields_up: "↑", yields_down: "↓",
                          }[m.value] || "→"}
                        </span>
                        <span className="text-[7px] text-text-secondary">{selectedEvent.timeHorizon}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DB IMPACT */}
                {selectedEvent.dbImpact && selectedEvent.dbImpact.length > 0 && (
                  <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Building2 size={11} className="text-primary" />
                      <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">DB Impact</span>
                    </div>
                    <div className="space-y-1.5">
                      {selectedEvent.dbImpact.map((impact, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <div
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor:
                                impact.severity === "high" ? "#E5484D"
                                : impact.severity === "medium" ? "#F5A623"
                                : "#2FAE60",
                            }}
                          />
                          <span className="font-medium text-text-primary w-24 shrink-0">{impact.department}:</span>
                          <span className="text-text-secondary">{impact.effect}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* RECOMMENDED ACTIONS */}
                <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <ListChecks size={11} className="text-[#2FAE60]" />
                    <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Recommended Actions</span>
                  </div>
                  <ul className="space-y-1">
                    {selectedEvent.recommendedActions.map((action, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs">
                        <span className="flex-shrink-0 w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                          <span className="text-[7px] font-bold text-primary">{i + 1}</span>
                        </span>
                        <span className="text-text-primary">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* ── Modal Footer ── */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-t border-border bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <a
                    href={`/simulator?scenario=${selectedEvent.eventType}&headline=${encodeURIComponent(selectedEvent.headline)}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-medium hover:bg-primary/20 transition-colors"
                  >
                    <Beaker size={11} />
                    Simulate
                  </a>
                  <a
                    href={`/boardroom?topic=${encodeURIComponent(`Should DB act on: ${selectedEvent.headline.slice(0, 80)}?`)}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-medium hover:bg-amber-100 transition-colors border border-amber-200"
                  >
                    <Gavel size={11} />
                    Convene Committee
                  </a>
                </div>
                <span className="text-[9px] text-text-secondary">Source: {selectedEvent.source}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
