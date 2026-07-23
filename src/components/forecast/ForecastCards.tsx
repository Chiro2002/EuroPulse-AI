"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, Area, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  TrendingUp, TrendingDown, Minus, DollarSign, Activity,
  Sparkles, Flame, Shield, Percent, Globe, Zap, Factory, ShoppingCart,
  Landmark, ArrowRight,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════
// MOCK DATA GENERATORS — realistic macro trend shapes
// ═══════════════════════════════════════════════════════════════════════

// Generate ~36 months history + ~12 months forecast
function genMonthLabels(histCount: number, fCount: number) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const labels: string[] = [];
  const now = new Date();
  for (let i = histCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(`${months[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`);
  }
  for (let i = 1; i <= fCount; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    labels.push(`${months[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`);
  }
  return labels;
}

function smoothTrend(values: number[], months: number): number[] {
  // Generate a smooth interpolated array
  const result: number[] = [];
  for (let i = 0; i < months; i++) {
    const progress = i / (months - 1);
    let val = values[0] + (values[values.length - 1] - values[0]) * progress;
    // Add slight noise
    val += (Math.random() - 0.5) * 0.15;
    // Add intermediate bends
    for (let k = 1; k < values.length - 1; k++) {
      const peakPos = k / (values.length - 1);
      const influence = Math.max(0, 1 - Math.abs(progress - peakPos) * 4);
      val += (values[k] - (values[0] + (values[values.length - 1] - values[0]) * peakPos)) * influence;
    }
    result.push(Math.round(val * 100) / 100);
  }
  return result;
}

function genForecastPath(recentValues: number[], fCount: number, target: number, volatility: number) {
  const last = recentValues[recentValues.length - 1];
  const result: { value: number; low: number; high: number }[] = [];
  for (let i = 1; i <= fCount; i++) {
    const progress = i / fCount;
    const central = last + (target - last) * progress;
    const noise = (Math.random() - 0.5) * volatility;
    const value = Math.round((central + noise) * 10000) / 10000;
    const band = volatility * (0.5 + progress * 0.5);
    result.push({
      value,
      low: Math.round((value - band) * 10000) / 10000,
      high: Math.round((value + band) * 10000) / 10000,
    });
  }
  return result;
}

// ── Chart Tooltip ────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white px-3 py-2.5 rounded-lg border border-border shadow-lg">
      <p className="text-[10px] font-semibold text-text-primary mb-1.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-[10px] tabular-nums leading-relaxed" style={{ color: p.color || p.stroke || "#6B7280" }}>
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: p.color || p.stroke, opacity: p.strokeDasharray ? 0.6 : 1 }} />
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  );
};

// ── Confidence Badge ─────────────────────────────────────────────────
function ConfidenceBadge({ confidence, color }: { confidence: number; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-semibold whitespace-nowrap"
      style={{ backgroundColor: `${color}12`, color }}
    >
      <span className="w-1 h-1 rounded-full" style={{ backgroundColor: color }} />
      {confidence}% confidence
    </span>
  );
}

// ── AI Badge ─────────────────────────────────────────────────────────
function AIBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[7px] font-bold text-primary bg-primary/5 border border-primary/10 uppercase tracking-wider">
      <Sparkles size={7} className="text-primary" />
      AI
    </span>
  );
}

// ── Chart Legend ─────────────────────────────────────────────────────
function ChartLegend({ color, dashed }: { color: string; dashed?: boolean }) {
  return (
    <div className="flex items-center gap-3 text-[8px] text-text-secondary">
      <span className="flex items-center gap-1">
        <span className="w-3 h-0.5 rounded-full" style={{ backgroundColor: color }} />
        Actual
      </span>
      <span className="flex items-center gap-1">
        <span className="w-3 h-0.5 rounded-full" style={{ backgroundColor: color, opacity: 0.6 }} />
        <span style={{ borderBottom: `1px dashed ${color}`, opacity: 0.6, width: 6, height: 0 }} />
        Forecast
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// CARD 1: Inflation Direction
// ═══════════════════════════════════════════════════════════════════════
export function InflationDirectionCard({ delay = 0 }: { delay?: number }) {
  const chartData = useMemo(() => {
    // Realistic shape: high inflation (9.2%) declining to 2.5%, then forecast uptick to 2.8%
    const histCount = 30;
    const fCount = 12;
    const labels = genMonthLabels(histCount, fCount);
    const histValues = smoothTrend([9.2, 7.8, 5.5, 4.1, 3.5, 2.8, 2.5], histCount);
    const forecast = genForecastPath(histValues, fCount, 2.8, 0.3);

    return labels.map((label, i) => ({
      label,
      actual: i < histCount ? histValues[i] : null,
      forecast: i >= histCount ? forecast[i - histCount].value : null,
      low: i >= histCount ? forecast[i - histCount].low : null,
      high: i >= histCount ? forecast[i - histCount].high : null,
    }));
  }, []);

  const currentVal = chartData.find(d => d.actual !== null)?.actual ?? 0;
  const predictedVal = chartData[chartData.length - 1]?.forecast ?? 0;
  const direction = predictedVal > currentVal ? "up" as const : "down" as const;
  const color = "#EF4444";
  const confidence = 78;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card p-4 overflow-hidden"
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
            <Flame size={15} style={{ color }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-text-primary">Inflation Direction</h3>
              <AIBadge />
            </div>
            <p className="text-[8px] text-text-secondary mt-0.5">Euro Area Headline CPI (YoY)</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <ConfidenceBadge confidence={confidence} color={color} />
        </div>
      </div>

      {/* Chart */}
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="infBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.15} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#9CA3AF", fontSize: 7 }} axisLine={false} tickLine={false} interval={5} />
            <YAxis domain={[0, 10]} tick={{ fill: "#9CA3AF", fontSize: 7 }} axisLine={false} tickLine={false} width={24} tickFormatter={(v: number) => `${v}%`} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="high" fill="transparent" stroke="transparent" />
            <Area type="monotone" dataKey="low" fill="url(#infBand)" stroke="transparent" />
            <Line type="monotone" dataKey="actual" stroke={color} strokeWidth={2} dot={false} name="Actual" />
            <Line type="monotone" dataKey="forecast" stroke={color} strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Forecast" opacity={0.7} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-1.5 mb-2">
        <ChartLegend color={color} dashed />
      </div>

      {/* Key Drivers */}
      <div className="border-t border-gray-100 pt-2.5 mt-1">
        <p className="text-[8px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Key Drivers</p>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Zap size={10} className="text-[#E5484D] flex-shrink-0" />
            <span className="text-[9px] text-text-primary leading-tight">Energy prices elevated — natural gas +15% in Q4</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Percent size={10} className="text-[#F5A623] flex-shrink-0" />
            <span className="text-[9px] text-text-primary leading-tight">Wage growth sticky at 3.5% — services inflation lagging</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe size={10} className="text-[#3B82F6] flex-shrink-0" />
            <span className="text-[9px] text-text-primary leading-tight">Supply chain normalization offset by rising demand</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// CARD 2: EUR/USD Movement
// ═══════════════════════════════════════════════════════════════════════
export function EURUSDMovementCard({ delay = 0.1 }: { delay?: number }) {
  const chartData = useMemo(() => {
    const histCount = 30;
    const fCount = 12;
    const labels = genMonthLabels(histCount, fCount);
    const histValues = smoothTrend([1.04, 1.05, 1.06, 1.07, 1.075, 1.078, 1.082], histCount);
    const forecast = genForecastPath(histValues, fCount, 1.12, 0.025);

    return labels.map((label, i) => ({
      label,
      actual: i < histCount ? histValues[i] : null,
      forecast: i >= histCount ? forecast[i - histCount].value : null,
      low: i >= histCount ? forecast[i - histCount].low : null,
      high: i >= histCount ? forecast[i - histCount].high : null,
    }));
  }, []);

  const currentVal = chartData.find(d => d.actual !== null)?.actual ?? 0;
  const predictedVal = chartData[chartData.length - 1]?.forecast ?? 0;
  const color = "#8B5CF6";
  const confidence = 72;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card p-4 overflow-hidden"
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
            <DollarSign size={15} style={{ color }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-text-primary">EUR/USD Movement</h3>
              <AIBadge />
            </div>
            <p className="text-[8px] text-text-secondary mt-0.5">Spot Exchange Rate</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <ConfidenceBadge confidence={confidence} color={color} />
        </div>
      </div>

      {/* Current + Forecast mini stats */}
      <div className="flex items-center gap-3 mb-2.5">
        <div className="bg-gray-50/60 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
          <span className="text-[8px] text-text-secondary">Spot</span>
          <span className="text-xs font-bold text-text-primary tabular-nums">{currentVal.toFixed(4)}</span>
        </div>
        <ArrowRight size={12} className="text-text-secondary" />
        <div className="bg-gray-50/60 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
          <span className="text-[8px] text-text-secondary">3M</span>
          <span className="text-xs font-bold tabular-nums" style={{ color }}>{predictedVal.toFixed(4)}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="fxBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.1} />
                <stop offset="100%" stopColor={color} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#9CA3AF", fontSize: 7 }} axisLine={false} tickLine={false} interval={5} />
            <YAxis domain={[1.00, 1.15]} tick={{ fill: "#9CA3AF", fontSize: 7 }} axisLine={false} tickLine={false} width={28} tickFormatter={(v: number) => v.toFixed(2)} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="high" fill="transparent" stroke="transparent" />
            <Area type="monotone" dataKey="low" fill="url(#fxBand)" stroke="transparent" />
            <Line type="monotone" dataKey="actual" stroke={color} strokeWidth={2} dot={false} name="Actual" />
            <Line type="monotone" dataKey="forecast" stroke={color} strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Forecast" opacity={0.7} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-1 mb-2">
        <ChartLegend color={color} dashed />
      </div>

      {/* Key Drivers */}
      <div className="border-t border-gray-100 pt-2.5 mt-1">
        <p className="text-[8px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Key Drivers</p>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={10} className="text-[#8B5CF6] flex-shrink-0" />
            <span className="text-[9px] text-text-primary leading-tight">Fed-ECB rate differential widening — USD support</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe size={10} className="text-[#E5484D] flex-shrink-0" />
            <span className="text-[9px] text-text-primary leading-tight">EU energy import costs pressuring current account</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Factory size={10} className="text-[#F5A623] flex-shrink-0" />
            <span className="text-[9px] text-text-primary leading-tight">Growth differential — US outperformance vs EU</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// CARD 3: Bond Yield Pressure
// ═══════════════════════════════════════════════════════════════════════
export function BondYieldPressureCard({ delay = 0.2 }: { delay?: number }) {
  const chartData = useMemo(() => {
    const histCount = 30;
    const fCount = 12;
    const labels = genMonthLabels(histCount, fCount);

    // DE: 1.2 → 2.4, FR: 2.0 → 3.1, IT: 3.2 → 4.0
    const deHist = smoothTrend([1.2, 1.5, 1.8, 2.0, 2.2, 2.3, 2.4], histCount);
    const frHist = smoothTrend([2.0, 2.2, 2.5, 2.8, 2.9, 3.0, 3.1], histCount);
    const itHist = smoothTrend([3.2, 3.4, 3.6, 3.8, 3.9, 3.95, 4.0], histCount);

    const deFcast = genForecastPath(deHist, fCount, 2.8, 0.15);
    const frFcast = genForecastPath(frHist, fCount, 3.4, 0.2);
    const itFcast = genForecastPath(itHist, fCount, 4.5, 0.3);

    return labels.map((label, i) => ({
      label,
      DE: i < histCount ? deHist[i] : null,
      FR: i < histCount ? frHist[i] : null,
      IT: i < histCount ? itHist[i] : null,
      DE_f: i >= histCount ? deFcast[i - histCount].value : null,
      FR_f: i >= histCount ? frFcast[i - histCount].value : null,
      IT_f: i >= histCount ? itFcast[i - histCount].value : null,
    }));
  }, []);

  const currentDE = chartData.find(d => d.DE !== null)?.DE ?? 0;
  const predictedIT = chartData[chartData.length - 1]?.IT_f ?? 0;
  const color = "#06B6D4";
  const confidence = 74;
  const itDeSpread = Math.round((4.0 - 2.4) * 100); // ~160bps

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card p-4 overflow-hidden"
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
            <Landmark size={15} style={{ color }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-text-primary">Bond Yield Pressure</h3>
              <AIBadge />
            </div>
            <p className="text-[8px] text-text-secondary mt-0.5">10Y Government Bond Yields</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <ConfidenceBadge confidence={confidence} color={color} />
        </div>
      </div>

      {/* Current yields strip */}
      <div className="flex gap-2 mb-2.5">
        {[
          { code: "DE", val: currentDE, flag: "🇩🇪", c: "#3B82F6" },
          { code: "FR", val: 3.1, flag: "🇫🇷", c: "#2FAE60" },
          { code: "IT", val: 4.0, flag: "🇮🇹", c: "#E5484D" },
        ].map((y) => (
          <div key={y.code} className="flex-1 bg-gray-50/60 rounded-lg px-2 py-1.5 flex items-center gap-1.5">
            <span className="text-sm">{y.flag}</span>
            <div>
              <p className="text-[7px] text-text-secondary">{y.code}</p>
              <p className="text-[10px] font-bold tabular-nums" style={{ color: y.c }}>{y.val.toFixed(2)}%</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#9CA3AF", fontSize: 7 }} axisLine={false} tickLine={false} interval={5} />
            <YAxis domain={[0, 5.5]} tick={{ fill: "#9CA3AF", fontSize: 7 }} axisLine={false} tickLine={false} width={24} tickFormatter={(v: number) => `${v.toFixed(1)}%`} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="DE" stroke="#3B82F6" strokeWidth={1.5} dot={false} name="DE" />
            <Line type="monotone" dataKey="FR" stroke="#2FAE60" strokeWidth={1.5} dot={false} name="FR" />
            <Line type="monotone" dataKey="IT" stroke="#E5484D" strokeWidth={1.5} dot={false} name="IT" />
            <Line type="monotone" dataKey="DE_f" stroke="#3B82F6" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="DE (f)" opacity={0.6} />
            <Line type="monotone" dataKey="FR_f" stroke="#2FAE60" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="FR (f)" opacity={0.6} />
            <Line type="monotone" dataKey="IT_f" stroke="#E5484D" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="IT (f)" opacity={0.6} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-1 mb-2 flex items-center gap-3 text-[8px] text-text-secondary">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#3B82F6]" /> DE</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#2FAE60]" /> FR</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#E5484D]" /> IT</span>
        <span className="text-[8px] text-text-secondary ml-auto">IT-DE spread: <strong className="text-[#F5A623]">{itDeSpread}bps</strong></span>
      </div>

      {/* Key Drivers */}
      <div className="border-t border-gray-100 pt-2.5 mt-1">
        <p className="text-[8px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Key Drivers</p>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <TrendingDown size={10} className="text-[#3B82F6] flex-shrink-0" />
            <span className="text-[9px] text-text-primary leading-tight">ECB rate cut expectations — core yields declining</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe size={10} className="text-[#E5484D] flex-shrink-0" />
            <span className="text-[9px] text-text-primary leading-tight">Italian fiscal concerns — BTP risk premium elevated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity size={10} className="text-[#F5A623] flex-shrink-0" />
            <span className="text-[9px] text-text-primary leading-tight">Inflation expectations anchoring above target</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// CARD 4: Recession / Stagflation Risk
// ═══════════════════════════════════════════════════════════════════════
export function RecessionStagflationCard({ delay = 0.3 }: { delay?: number }) {
  const chartData = useMemo(() => {
    const histCount = 30;
    const fCount = 12;
    const labels = genMonthLabels(histCount, fCount);
    // Rising from 8% to 35%, forecast to 48%
    const histValues = smoothTrend([8, 12, 15, 18, 22, 28, 35], histCount);
    const forecast = genForecastPath(histValues, fCount, 48, 5);

    return labels.map((label, i) => ({
      label,
      actual: i < histCount ? histValues[i] : null,
      forecast: i >= histCount ? forecast[i - histCount].value : null,
      low: i >= histCount ? forecast[i - histCount].low : null,
      high: i >= histCount ? forecast[i - histCount].high : null,
    }));
  }, []);

  const currentVal = chartData.find(d => d.actual !== null)?.actual ?? 0;
  const predictedVal = chartData[chartData.length - 1]?.forecast ?? 0;
  const color = "#F5A623";
  const confidence = 68;

  // Country probabilities (static mock data)
  const countryProbs = [
    { flag: "🇮🇹", name: "Italy", prob: 52 },
    { flag: "🇩🇪", name: "Germany", prob: 42 },
    { flag: "🇫🇷", name: "France", prob: 35 },
    { flag: "🇪🇸", name: "Spain", prob: 28 },
    { flag: "🇳🇱", name: "Netherlands", prob: 18 },
  ];

  const getColor = (p: number) => p >= 50 ? "#E5484D" : p >= 35 ? "#F5A623" : p >= 20 ? "#3B82F6" : "#2FAE60";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card p-4 overflow-hidden"
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
            <Shield size={15} style={{ color }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-text-primary">Stagflation Risk</h3>
              <AIBadge />
            </div>
            <p className="text-[8px] text-text-secondary mt-0.5">Recession Probability by Country</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <ConfidenceBadge confidence={confidence} color={color} />
        </div>
      </div>

      {/* Chart: recession probability over time */}
      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="recBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.15} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#9CA3AF", fontSize: 7 }} axisLine={false} tickLine={false} interval={5} />
            <YAxis domain={[0, 60]} tick={{ fill: "#9CA3AF", fontSize: 7 }} axisLine={false} tickLine={false} width={24} tickFormatter={(v: number) => `${v}%`} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="high" fill="transparent" stroke="transparent" />
            <Area type="monotone" dataKey="low" fill="url(#recBand)" stroke="transparent" />
            <Line type="monotone" dataKey="actual" stroke={color} strokeWidth={2} dot={false} name="Actual" />
            <Line type="monotone" dataKey="forecast" stroke={color} strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Forecast" opacity={0.7} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-1 mb-2.5">
        <ChartLegend color={color} dashed />
      </div>

      {/* Country probability bars */}
      <div className="space-y-1.5 mb-2">
        {countryProbs.map((r) => (
          <div key={r.name} className="flex items-center gap-2">
            <span className="text-xs w-4 text-center flex-shrink-0">{r.flag}</span>
            <span className="text-[8px] text-text-secondary w-14 flex-shrink-0">{r.name}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${r.prob}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay }}
                className="h-full rounded-full"
                style={{ backgroundColor: getColor(r.prob) }}
              />
            </div>
            <span className="text-[9px] font-bold w-7 text-right tabular-nums flex-shrink-0" style={{ color: getColor(r.prob) }}>
              {r.prob}%
            </span>
          </div>
        ))}
      </div>

      {/* Key Drivers */}
      <div className="border-t border-gray-100 pt-2.5">
        <p className="text-[8px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Key Drivers</p>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Minus size={10} className="text-[#E5484D] flex-shrink-0" />
            <span className="text-[9px] text-text-primary leading-tight">Yield curve inverted — 10Y-2Y at -35bps, 18mo streak</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Factory size={10} className="text-[#F5A623] flex-shrink-0" />
            <span className="text-[9px] text-text-primary leading-tight">German PMI at 44.8 — manufacturing contraction deepening</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShoppingCart size={10} className="text-[#3B82F6] flex-shrink-0" />
            <span className="text-[9px] text-text-primary leading-tight">Consumer confidence falling — retail sales -0.3% MoM</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
