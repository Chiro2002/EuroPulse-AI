"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Target,
  ChevronDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { forecasts } from "@/lib/data/mockData";
import { countryNames } from "@/lib/data/countries";
import { formatForecastValue, getConfidenceConfig, generateForecastSummary, groupForecastsByCountry } from "@/lib/logic/forecastEngine";
import type { Forecast } from "@/lib/types";

export default function ForecastPage() {
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [expandedDetail, setExpandedDetail] = useState<string | null>(null);

  const summary = useMemo(() => generateForecastSummary(forecasts), []);
  const groupedByCountry = useMemo(() => groupForecastsByCountry(forecasts), []);

  const filteredForecasts = useMemo(() => {
    if (selectedCountry === "all") return forecasts;
    return forecasts.filter((f) => f.country === selectedCountry);
  }, [selectedCountry]);

  const countries = useMemo(
    () => [...new Set(forecasts.map((f) => f.country))],
    []
  );

  // Chart data for GDP growth forecasts
  const gdpChartData = useMemo(() => {
    return forecasts
      .filter((f) => f.metric === "GDP Growth")
      .map((f) => ({
        country: countryNames[f.country] || f.country,
        current: f.currentValue,
        predicted: f.predictedValue,
        flag: f.country,
      }));
  }, []);

  // Chart data for inflation
  const inflationChartData = useMemo(() => {
    return forecasts
      .filter((f) => f.metric === "Inflation")
      .map((f) => ({
        country: countryNames[f.country] || f.country,
        current: f.currentValue,
        predicted: f.predictedValue,
        flag: f.country,
      }));
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 shadow-xl">
          <p className="text-xs font-semibold text-db-text-primary mb-1">{label}</p>
          {payload.map((entry: any, i: number) => (
            <p key={i} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(1)}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-db-text-primary flex items-center gap-2">
          <TrendingUp size={22} className="text-db-success" />
          Economic Forecasts
        </h2>
        <p className="text-sm text-db-text-muted mt-1">
          AI-driven macroeconomic forecasts and trend analysis for EU markets
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Positive Outlooks", value: summary.positiveDirections, color: "#10B981" },
          { label: "Negative Outlooks", value: summary.negativeDirections, color: "#EF4444" },
          { label: "Avg Confidence", value: `${summary.averageConfidence}%`, color: "#3B82F6" },
          { label: "Total Forecasts", value: summary.totalForecasts, color: "#F59E0B" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-3 text-center"
          >
            <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs text-db-text-muted">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GDP Growth Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-4"
        >
          <h3 className="text-sm font-semibold text-db-text-primary mb-4">
            GDP Growth Forecast (%)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gdpChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2756" />
              <XAxis dataKey="country" tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="current" name="Current" fill="#64748B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="predicted" name="Predicted" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Inflation Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-4"
        >
          <h3 className="text-sm font-semibold text-db-text-primary mb-4">
            Inflation Forecast (%)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={inflationChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2756" />
              <XAxis dataKey="country" tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="current" name="Current" fill="#64748B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="predicted" name="Predicted" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Country Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCountry("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            selectedCountry === "all"
              ? "bg-db-accent text-white"
              : "text-db-text-muted hover:text-db-text-primary bg-db-surface"
          }`}
        >
          All Countries
        </button>
        {countries.map((code) => (
          <button
            key={code}
            onClick={() => setSelectedCountry(code)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedCountry === code
                ? "bg-db-accent text-white"
                : "text-db-text-muted hover:text-db-text-primary bg-db-surface"
            }`}
          >
            {countryNames[code] || code}
          </button>
        ))}
      </div>

      {/* Forecast Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredForecasts.map((forecast, i) => {
          const confidenceConfig = getConfidenceConfig(forecast.confidence);
          const isExpanded = expandedDetail === `${forecast.country}-${forecast.metric}`;

          return (
            <motion.div
              key={`${forecast.country}-${forecast.metric}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card-hover p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-db-text-primary">
                    {countryNames[forecast.country]}
                  </span>
                  <span className="text-xs text-db-text-muted">•</span>
                  <span className="text-xs font-medium text-db-accent">{forecast.metric}</span>
                </div>
                {forecast.direction === "up" && <TrendingUp size={16} className="text-db-success" />}
                {forecast.direction === "down" && <TrendingDown size={16} className="text-db-danger" />}
                {forecast.direction === "stable" && <Minus size={16} className="text-db-text-muted" />}
              </div>

              <div className="flex items-center gap-4 mb-2">
                <div>
                  <p className="text-[10px] text-db-text-muted">Current</p>
                  <p className="text-lg font-bold text-db-text-primary">
                    {formatForecastValue(forecast.currentValue, forecast.metric)}
                  </p>
                </div>
                <div className="text-db-text-muted">→</div>
                <div>
                  <p className="text-[10px] text-db-text-muted">Predicted</p>
                  <p className="text-lg font-bold" style={{ color: confidenceConfig.color }}>
                    {formatForecastValue(forecast.predictedValue, forecast.metric)}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-[10px] text-db-text-muted">Confidence</p>
                  <p className="text-xs font-bold" style={{ color: confidenceConfig.color }}>
                    {forecast.confidence}%
                  </p>
                </div>
              </div>

              {/* Confidence bar */}
              <div className="h-1 bg-db-border rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full ${confidenceConfig.barColor}`}
                  style={{ width: `${forecast.confidence}%` }}
                />
              </div>

              {/* Drivers */}
              <div className="flex flex-wrap gap-1 mb-2">
                {forecast.drivers.map((driver, di) => (
                  <span
                    key={di}
                    className="text-[9px] px-1.5 py-0.5 rounded-full bg-db-surface text-db-text-muted"
                  >
                    {driver}
                  </span>
                ))}
              </div>

              {/* Expand/collapse explanation */}
              <button
                onClick={() =>
                  setExpandedDetail(isExpanded ? null : `${forecast.country}-${forecast.metric}`)
                }
                className="flex items-center gap-1 text-[10px] text-db-text-muted hover:text-db-accent transition-colors"
              >
                {isExpanded ? "Hide analysis" : "Show analysis"}
                <ChevronDown
                  size={10}
                  className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
              </button>
              {isExpanded && (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="text-[11px] text-db-text-secondary mt-2 leading-relaxed"
                >
                  {forecast.explanation}
                </motion.p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
