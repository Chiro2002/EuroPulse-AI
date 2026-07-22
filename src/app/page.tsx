"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Map,
  AlertTriangle,
  Target,
  BarChart3,
  Globe,
} from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { AlertCard } from "@/components/shared/AlertCard";
import { EuropeMap } from "@/components/shared/EuropeMap";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { euCountries } from "@/lib/data/countries";
import { riskScores, newsItems } from "@/lib/data/mockData";
import { getRiskLevel, calculateAggregateRisk } from "@/lib/logic/riskCalculator";
import { getNewsStats } from "@/lib/logic/newsClassifier";
import type { DashboardMetrics, CountryRiskSummary } from "@/lib/types";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [countrySummaries, setCountrySummaries] = useState<CountryRiskSummary[]>([]);

  useEffect(() => {
    // Build country summaries from mock data
    const summaries = euCountries.map((country) => {
      const riskScore = riskScores.find((r) => r.country === country.code)!;

      // Find top 2 concerns for this country
      const concerns: string[] = [];
      if (riskScore.geopolitical >= 60) concerns.push("Geopolitical tensions");
      if (riskScore.debt >= 70) concerns.push("High sovereign debt");
      if (riskScore.inflation >= 65) concerns.push("Elevated inflation");
      if (riskScore.energy >= 70) concerns.push("Energy dependency/costs");
      if (riskScore.unemployment >= 55) concerns.push("Labor market weakness");
      if (riskScore.housing >= 65) concerns.push("Housing market risks");

      return { country, riskScore, topConcerns: concerns.slice(0, 3) };
    });

    setCountrySummaries(summaries);

    // Build dashboard metrics
    const aggregate = calculateAggregateRisk(riskScores);
    const newsStats = getNewsStats(newsItems);

    setMetrics({
      overallRiskIndex: aggregate.weightedByGDP,
      riskTrend: aggregate.average >= 60 ? "up" : aggregate.average <= 50 ? "down" : "stable",
      countriesMonitored: euCountries.length,
      activeAlerts: newsStats.criticalCount + newsStats.highCount,
      criticalAlerts: newsStats.criticalCount,
      latestUpdates: "Updated 2 min ago",
      topRisks: [
        "Italian sovereign debt at 158% GDP",
        "German industrial contraction -1.2%",
        "French credit rating downgrade to AA-",
        "Gas supply disruption in CEE",
      ],
      opportunities: [
        "ECB rate cut expectations boost bonds",
        "Spanish employment at 15-year low",
        "EU green investment fund €150B",
      ],
    });

    setLoading(false);
  }, []);

  // Build map data
  const mapData: Record<string, { value: number; color: string }> = {};
  riskScores.forEach((rs) => {
    const level = getRiskLevel(rs.total);
    mapData[rs.country] = {
      value: rs.total,
      color: level.color + "99",
    };
  });

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner fullPage text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-db-text-primary">Dashboard</h2>
        <p className="text-sm text-db-text-muted mt-1">
          Real-time overview of EU macroeconomic risks and Deutsche Bank portfolio exposure
        </p>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Overall Risk Index"
          value={metrics!.overallRiskIndex}
          subtitle={metrics!.riskTrend === "up" ? "+2.3 this week" : undefined}
          trend={metrics!.riskTrend}
          icon={BarChart3}
          color="#3B82F6"
        />
        <MetricCard
          title="Countries Monitored"
          value={metrics!.countriesMonitored}
          subtitle="EU member states"
          icon={Globe}
          color="#10B981"
        />
        <MetricCard
          title="Active Alerts"
          value={metrics!.activeAlerts}
          subtitle={`${metrics!.criticalAlerts} critical`}
          trend={metrics!.activeAlerts > 3 ? "up" : "down"}
          icon={AlertTriangle}
          color="#F59E0B"
        />
        <MetricCard
          title="Top Risk Score"
          value={Math.max(...riskScores.map((r) => r.total))}
          subtitle={riskScores.find((r) => r.total === Math.max(...riskScores.map((x) => x.total)))?.country}
          trend="up"
          icon={Target}
          color="#EF4444"
        />
      </div>

      {/* Map and Top Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Europe Map */}
        <div className="lg:col-span-2">
          <EuropeMap
            countryData={mapData}
            onCountryClick={setSelectedCountry}
            selectedCountry={selectedCountry}
            height={350}
          />
        </div>

        {/* Top Risks */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-db-text-primary mb-3 flex items-center gap-2">
            <AlertTriangle size={14} className="text-db-danger" />
            Top Risks
          </h3>
          <div className="space-y-2">
            {metrics!.topRisks.map((risk, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-2 p-2 rounded-lg bg-db-danger/5 border border-db-danger/10"
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-db-danger/15 flex items-center justify-center text-[10px] font-bold text-db-danger">
                  {i + 1}
                </span>
                <span className="text-xs text-db-text-primary">{risk}</span>
              </motion.div>
            ))}
          </div>

          <h3 className="text-sm font-semibold text-db-text-primary mt-4 mb-3 flex items-center gap-2">
            <TrendingUp size={14} className="text-db-success" />
            Opportunities
          </h3>
          <div className="space-y-2">
            {metrics!.opportunities.map((opp, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-2 rounded-lg bg-db-success/5 border border-db-success/10"
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-db-success/15 flex items-center justify-center text-[10px] font-bold text-db-success">
                  {i + 1}
                </span>
                <span className="text-xs text-db-text-primary">{opp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Country Risk Summary */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold text-db-text-primary mb-3 flex items-center gap-2">
          <Map size={14} className="text-db-accent" />
          Country Risk Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {countrySummaries.map((summary) => {
            const level = getRiskLevel(summary.riskScore.total);
            return (
              <motion.button
                key={summary.country.code}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() =>
                  setSelectedCountry(
                    selectedCountry === summary.country.code ? null : summary.country.code
                  )
                }
                className={`glass-card-hover p-3 text-left transition-all ${
                  selectedCountry === summary.country.code
                    ? "ring-2 ring-db-accent"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">{summary.country.flag}</span>
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: level.bgColor,
                      color: level.color,
                    }}
                  >
                    {summary.riskScore.total}
                  </span>
                </div>
                <p className="text-sm font-semibold text-db-text-primary">
                  {summary.country.name}
                </p>
                <p className="text-[10px] text-db-text-muted mt-1">
                  {summary.country.region}
                </p>
                {summary.topConcerns.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {summary.topConcerns.slice(0, 2).map((concern, i) => (
                      <span
                        key={i}
                        className="text-[9px] px-1.5 py-0.5 rounded-full bg-db-surface text-db-text-muted"
                      >
                        {concern}
                      </span>
                    ))}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Recent Critical Alerts */}
      {newsItems
        .filter((n) => n.severity === "critical" || n.severity === "high")
        .slice(0, 3)
        .length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-db-text-primary mb-3">
            Recent Alerts
          </h3>
          <div className="space-y-2">
            {newsItems
              .filter((n) => n.severity === "critical" || n.severity === "high")
              .slice(0, 3)
              .map((news) => (
                <AlertCard
                  key={news.id}
                  title={news.headline}
                  description={news.explanation}
                  severity={news.severity}
                  timestamp={new Date(news.timestamp).toLocaleDateString()}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
