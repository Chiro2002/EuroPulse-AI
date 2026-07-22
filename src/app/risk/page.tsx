"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Map,
  BarChart3,
  RefreshCw,
  LayoutGrid,
  Table2,
  Eye,
  Download,
} from "lucide-react";
import { EuropeMap } from "@/components/shared/EuropeMap";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { RiskCountryDeepDive } from "@/components/risk/RiskCountryDeepDive";
import { SectorHeatmap } from "@/components/risk/SectorHeatmap";
import { StressTrendChart } from "@/components/risk/StressTrendChart";
import { CountryRiskTable } from "@/components/risk/CountryRiskTable";
import { getRiskLevel } from "@/lib/logic/riskCalculator";
import type { CountryDetail, SectorStressData, HistoricalTrend, RiskDimension, RiskAPIResponse } from "@/lib/types";

export default function RiskPage() {
  const [data, setData] = useState<RiskAPIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>("IT");
  const [mapDimension, setMapDimension] = useState<RiskDimension>("total");
  const [viewMode, setViewMode] = useState<"map" | "table">("map");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/risk");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("Failed to fetch risk data", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const selectedCountryData = useMemo(
    () => data?.countries.find((c) => c.code === selectedCountry) ?? null,
    [data, selectedCountry]
  );

  // Build map data based on selected dimension
  const mapData = useMemo(() => {
    if (!data) return {};
    const md: Record<string, { value: number; color: string }> = {};
    data.countries.forEach((c) => {
      const score = mapDimension === "total" ? c.totalRisk : c.breakdown[mapDimension];
      const level = getRiskLevel(score);
      md[c.code] = { value: score, color: level.color + "99" };
    });
    return md;
  }, [data, mapDimension]);

  const topInsights = data?.topInsights;

  const exportCSV = () => {
    if (!data) return;
    const headers = ["Country,Code,Total,Inflation,Energy,Debt,Employment,Housing,Geopolitical,Trend30d\n"];
    const rows = data.countries.map((c) =>
      `${c.name},${c.code},${c.totalRisk},${c.breakdown.inflation},${c.breakdown.energy},${c.breakdown.debt},${c.breakdown.employment},${c.breakdown.housing},${c.breakdown.geopolitical},${c.trend30d}`
    );
    const csv = headers + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "eu-risk-data.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="p-6"><LoadingSpinner fullPage text="Loading risk data..." /></div>;
  }

  if (!data) {
    return <div className="p-6 flex items-center justify-center min-h-[400px]"><p className="text-db-text-muted">Failed to load data.</p></div>;
  }

  const mostVulnerable = data.countries.find((c) => c.code === topInsights?.mostVulnerable);
  const risingFastest = data.countries.find((c) => c.code === topInsights?.risingFastest);
  const mostStable = data.countries.find((c) => c.code === topInsights?.mostStable);

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* ============================== */}
      {/* PAGE HEADER */}
      {/* ============================== */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-db-text-primary flex items-center gap-2">
            <ShieldAlert size={22} className="text-db-warning" />
            Risk & Stress Radar
          </h1>
          <p className="text-sm text-db-text-muted mt-1">Multi-dimensional risk analysis across Europe</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-db-surface text-db-text-muted text-xs hover:text-db-text-primary transition-colors">
            <Download size={12} /> CSV
          </button>
          <button onClick={() => fetchData()} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-db-surface text-db-text-muted text-xs hover:text-db-text-primary transition-colors">
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      {/* ============================== */}
      {/* TOP KPI ROW */}
      {/* ============================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Most Vulnerable", value: mostVulnerable?.code || "—", subtitle: `${mostVulnerable?.totalRisk || 0}/100`, color: "#EF4444", flag: mostVulnerable?.flag },
          { label: "Rising Fastest", value: risingFastest?.code || "—", subtitle: `+${risingFastest?.trend30d || 0} pts`, color: "#F59E0B", flag: risingFastest?.flag },
          { label: "Most Stable", value: mostStable?.code || "—", subtitle: `${mostStable?.totalRisk || 0}/100`, color: "#10B981", flag: mostStable?.flag },
          { label: "Europe Stress", value: `${topInsights?.europeStressTrend || 0}`, subtitle: "GDP-weighted avg", color: "#3B82F6" },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-3"
          >
            <p className="text-[10px] text-db-text-muted uppercase tracking-wider mb-1">{kpi.label}</p>
            <div className="flex items-center gap-2">
              {kpi.flag && <span className="text-base">{kpi.flag}</span>}
              <p className="text-xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
            </div>
            <p className="text-[10px] text-db-text-muted mt-0.5">{kpi.subtitle}</p>
          </motion.div>
        ))}
      </div>

      {/* ============================== */}
      {/* MAIN LAYOUT: Map/Table (left) + Country Deep Dive (right) */}
      {/* ============================== */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* LEFT COLUMN: Map + Table */}
        <div className="lg:col-span-3 space-y-4">
          {/* View Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {(["map", "table"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                    viewMode === mode ? "bg-db-accent text-white" : "bg-db-surface text-db-text-muted hover:text-db-text-primary"
                  }`}
                >
                  {mode === "map" ? <Map size={12} /> : <Table2 size={12} />}
                  {mode === "map" ? "Map View" : "Table View"}
                </button>
              ))}
            </div>
            {viewMode === "map" && (
              <div className="flex gap-1">
                {(["total", "inflation", "energy", "debt", "geopolitical"] as RiskDimension[]).map((dim) => (
                  <button
                    key={dim}
                    onClick={() => setMapDimension(dim)}
                    className={`px-2 py-0.5 rounded text-[9px] font-medium capitalize transition-all ${
                      mapDimension === dim ? "bg-db-accent text-white" : "bg-db-surface text-db-text-muted"
                    }`}
                  >
                    {dim}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Map */}
          {viewMode === "map" && (
            <motion.div
              key={mapDimension}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <EuropeMap
                countryData={mapData}
                onCountryClick={(code) => setSelectedCountry(code)}
                selectedCountry={selectedCountry}
                height={400}
              />
            </motion.div>
          )}

          {/* Table */}
          {viewMode === "table" && (
            <CountryRiskTable
              countries={data.countries}
              selectedCountry={selectedCountry}
              onCountrySelect={setSelectedCountry}
            />
          )}

          {/* Country Risk Table (always visible below map) */}
          {viewMode === "map" && (
            <CountryRiskTable
              countries={data.countries}
              selectedCountry={selectedCountry}
              onCountrySelect={setSelectedCountry}
            />
          )}
        </div>

        {/* RIGHT COLUMN: Country Deep Dive */}
        <div className="lg:col-span-2">
          <div className="sticky top-20">
            {selectedCountryData ? (
              <RiskCountryDeepDive country={selectedCountryData} />
            ) : (
              <div className="glass-card p-4 text-center">
                <p className="text-sm text-db-text-muted">Select a country to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================== */}
      {/* SECTOR STRESS HEATMAP */}
      {/* ============================== */}
      <SectorHeatmap sectorStress={data.sectorStress} countries={data.countries} />

      {/* ============================== */}
      {/* STRESS TREND CHART */}
      {/* ============================== */}
      <StressTrendChart historicalTrends={data.historicalTrends} countries={data.countries} />
    </div>
  );
}
