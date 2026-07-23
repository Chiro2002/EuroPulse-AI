"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, RefreshCw, Download } from "lucide-react";
import { EuropeMap } from "@/components/shared/EuropeMap";
import {
  Skeleton, SkeletonLine, SkeletonChart,
} from "@/components/shared/Skeleton";
import { RiskCountryDeepDive } from "@/components/risk/RiskCountryDeepDive";
import { CountryRiskTable } from "@/components/risk/CountryRiskTable";
import { getRiskLevel } from "@/lib/logic/riskCalculator";
import type { CountryDetail, RiskDimension, RiskAPIResponse } from "@/lib/types";

export default function RiskPage() {
  const [data, setData] = useState<RiskAPIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("IT");
  const [mapDimension, setMapDimension] = useState<RiskDimension>("total");
  const fetchCountRef = useRef(0);

  const fetchData = useCallback(async () => {
    fetchCountRef.current += 1;
    setLoading(true);
    setFetchFailed(false);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch("/api/risk", { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      console.error("Failed to fetch risk data", e);
      if (fetchCountRef.current < 2) {
        setTimeout(() => fetchData(), 1500);
      } else {
        setFetchFailed(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fallbackTimeout = setTimeout(() => {
      if (!data && fetchCountRef.current >= 2) {
        setFetchFailed(true);
        setLoading(false);
      }
    }, 6000);
    fetchData();
    return () => { controller.abort(); clearTimeout(fallbackTimeout); };
  }, [fetchData]);

  const selectedCountryData = useMemo(
    () => data?.countries.find((c) => c.code === selectedCountry) ?? null,
    [data, selectedCountry]
  );

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

  const exportCSV = () => {
    if (!data) return;
    const headers = "Country,Code,Total,Inflation,Energy,Debt,Employment,Housing,Geopolitical\n";
    const rows = data.countries.map((c) =>
      `${c.name},${c.code},${c.totalRisk},${c.breakdown.inflation},${c.breakdown.energy},${c.breakdown.debt},${c.breakdown.employment},${c.breakdown.housing},${c.breakdown.geopolitical}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "eu-risk-data.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <SkeletonLine width="w-48" height="h-5" />
            <SkeletonLine width="w-64" height="h-3" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="w-16 h-7 rounded-lg" />
            <Skeleton className="w-20 h-7 rounded-lg" />
          </div>
        </div>
        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 space-y-3">
            <SkeletonChart height="h-[380px]" />
            <div className="card p-4 space-y-1">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex items-center gap-3 py-1.5 border-b border-border/30 last:border-0">
                  <SkeletonLine width="w-6" height="h-3" /><Skeleton className="w-5 h-5 rounded-full" />
                  <SkeletonLine width="w-16" height="h-3" /><Skeleton className="flex-1 h-2 rounded-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2 space-y-3">
            <SkeletonChart height="h-[200px]" />
            <SkeletonChart height="h-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 flex flex-col items-center justify-center gap-4 min-h-[50vh]">
        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
          <ShieldAlert size={22} className="text-amber-500" />
        </div>
        <div className="text-center max-w-md">
          <p className="text-sm font-semibold text-text-primary mb-1">
            {fetchFailed ? "Unable to load risk data" : "Loading risk data..."}
          </p>
          <p className="text-xs text-text-secondary leading-relaxed">
            {fetchFailed
              ? "Risk data is taking longer than expected. The server may be processing large datasets."
              : "Fetching multi-dimensional risk analysis across European markets."}
          </p>
        </div>
        {fetchFailed && (
          <button
            onClick={() => { fetchCountRef.current = 0; fetchData(); }}
            className="flex items-center gap-1.5 px-4 h-9 rounded-lg bg-primary text-white text-xs font-semibold hover:brightness-110 transition-colors shadow-sm"
          >
            <RefreshCw size={13} />
            Retry
          </button>
        )}
      </div>
    );
  }

  const dimensions: RiskDimension[] = ["total", "inflation", "energy", "debt", "geopolitical"];

  return (
    <div className="p-6 space-y-4">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <ShieldAlert size={18} className="text-[#F5A623]" />
            Risk & Stress Radar
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">Multi-dimensional risk analysis across European markets</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1 px-2.5 h-8 rounded-lg bg-gray-50 text-text-secondary text-xs hover:text-text-primary transition-colors border border-border">
            <Download size={11} /> CSV
          </button>
          <button onClick={() => fetchData()} className="flex items-center gap-1 px-2.5 h-8 rounded-lg bg-gray-50 text-text-secondary text-xs hover:text-text-primary transition-colors border border-border">
            <RefreshCw size={11} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Main Layout: Map + Table (left) + Deep Dive (right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left Column — Map + Table together */}
        <div className="lg:col-span-3 space-y-3">
          {/* Dimension selector */}
          <div className="flex items-center justify-end">
            <div className="flex gap-1">
              {dimensions.map((dim) => (
                <button
                  key={dim}
                  onClick={() => setMapDimension(dim)}
                  className={`px-2 py-0.5 rounded text-[9px] font-medium capitalize transition-all ${
                    mapDimension === dim ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {dim === "total" ? "All" : dim.slice(0, 4)}
                </button>
              ))}
            </div>
          </div>

          {/* Map */}
          <motion.div key={mapDimension} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="card p-4">
              <EuropeMap
                countryData={mapData}
                countryDetails={data.countries.map(c => ({
                  country: c.code, countryName: c.name, flag: c.flag,
                  riskScore: (mapDimension === "total" ? c.totalRisk : c.breakdown[mapDimension]),
                  color: getRiskLevel(mapDimension === "total" ? c.totalRisk : c.breakdown[mapDimension]).color,
                  breakdown: { inflation: c.breakdown.inflation, energy: c.breakdown.energy, debt: c.breakdown.debt, geopolitical: c.breakdown.geopolitical },
                }))}
                onCountrySelect={(code) => setSelectedCountry(code)}
                height={380}
                disableModal
              />
            </div>
          </motion.div>

          {/* Table below map */}
          <CountryRiskTable countries={data.countries} selectedCountry={selectedCountry} onCountrySelect={setSelectedCountry} />
        </div>

        {/* Right Column: Country Deep Dive */}
        <div className="lg:col-span-2">
          <div className="sticky top-20">
            {selectedCountryData ? (
              <RiskCountryDeepDive country={selectedCountryData} />
            ) : (
              <div className="card p-4 text-center">
                <p className="text-sm text-text-secondary">Select a country to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
