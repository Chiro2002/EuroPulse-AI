"use client";

import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, XCircle, HelpCircle,
  DollarSign, BarChart3, Activity, Building2, Zap, Home, Factory, Smartphone, Sun,
} from "lucide-react";
import { getConfidenceConfig } from "@/lib/logic/forecastEngine";
import type { InflationForecast, ECBPath, FXForecast, BondOutlook, RecessionForecast, SectorOutlookItem } from "@/lib/types";

// Shared tooltip
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 shadow-xl">
      <p className="text-[10px] font-semibold text-db-text-primary mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-[10px]" style={{ color: p.color || p.stroke || "#94A3B8" }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  );
};

// Card 1: Inflation Forecast
export function InflationForecastCard({ inflation, delay = 0 }: { inflation: InflationForecast[]; delay?: number }) {
  const data = inflation[0];
  if (!data) return null;
  const conf = getConfidenceConfig(data.confidence);
  const combined = [
    ...(data.historicalData || []).map((d) => ({ ...d, actual: d.value, forecast: null, low: null, high: null })),
    ...(data.forecastData || []).map((d) => ({ month: d.month, actual: null, forecast: d.value, low: d.low, high: d.high })),
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="glass-card p-4">
      <h3 className="text-xs font-bold text-db-text-primary mb-3 flex items-center gap-1.5">
        <TrendingUp size={13} className="text-db-accent" /> Inflation Forecast
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={combined}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2756" />
            <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 9 }} />
            <YAxis domain={[0, "auto"]} tick={{ fill: "#94A3B8", fontSize: 9 }} />
            <Tooltip content={<ChartTooltip />} />
            <defs>
              <linearGradient id="confBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="high" fill="transparent" stroke="transparent" />
            <Area type="monotone" dataKey="low" fill="url(#confBand)" stroke="transparent" />
            <Line type="monotone" dataKey="actual" stroke="#3B82F6" strokeWidth={2} dot={false} name="Actual" />
            <Line type="monotone" dataKey="forecast" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Forecast" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between text-[10px] text-db-text-muted mt-2">
        <span>Current: {data.current ?? "—"}%</span>
        <span>Predicted: <span className="font-bold" style={{ color: conf.color }}>{data.predictedValue ?? "—"}%</span></span>
        <span>Conf: {data.confidence ?? 0}%</span>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {(data.drivers || []).slice(0, 3).map((d, i) => (
          <span key={i} className="text-[8px] px-1.5 py-0.5 rounded-full bg-db-surface text-db-text-muted">{d.name}</span>
        ))}
      </div>
    </motion.div>
  );
}

// Card 2: ECB Rate Path
export function ECBCard({ ecbPath, delay = 0.1 }: { ecbPath: ECBPath; delay?: number }) {
  const barData = ecbPath.nextMeetings.map((m) => ({
    name: m.date.split(" ")[0],
    Cut: m.probabilities.cut,
    Hold: m.probabilities.hold,
    Hike: m.probabilities.hike,
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="glass-card p-4">
      <h3 className="text-xs font-bold text-db-text-primary mb-3 flex items-center gap-1.5">
        <BarChart3 size={13} className="text-db-accent" /> ECB Rate Path
      </h3>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2756" />
            <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 9 }} />
            <YAxis tick={{ fill: "#94A3B8", fontSize: 9 }} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="Cut" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Hold" stackId="a" fill="#64748B" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Hike" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-3 text-[9px] text-db-text-muted mt-1">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-db-success" />Cut</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-gray-400" />Hold</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-db-danger" />Hike</span>
      </div>
      <p className="text-[9px] text-db-text-muted mt-2 leading-relaxed line-clamp-2">{ecbPath.explanation}</p>
    </motion.div>
  );
}

// Card 3: EUR/USD
export function FXCard({ fx, delay = 0.2 }: { fx: FXForecast; delay?: number }) {
  const combined = [
    ...(fx.historicalData || []).map((d) => ({ ...d, actual: d.value, forecast: null })),
    ...(fx.forecastData || []).map((d) => ({ ...d, actual: null, forecast: d.value })),
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="glass-card p-4">
      <h3 className="text-xs font-bold text-db-text-primary mb-3 flex items-center gap-1.5">
        <DollarSign size={13} className="text-db-accent" /> EUR/USD Forecast
      </h3>
      <div className="flex items-center gap-3 mb-2">
        <div><span className="text-[9px] text-db-text-muted">Current</span><p className="text-base font-bold text-db-text-primary">{fx.current.toFixed(4)}</p></div>
        <div><span className="text-[9px] text-db-text-muted">3M</span><p className="text-sm font-bold text-db-warning">{fx.forecast3M.value.toFixed(4)}</p></div>
        <div><span className="text-[9px] text-db-text-muted">12M</span><p className="text-sm font-bold text-db-success">{fx.forecast12M.value.toFixed(4)}</p></div>
        <div><span className="text-[9px] text-db-text-muted">Vol</span><p className="text-sm font-bold text-db-text-primary">{fx.volatility}%</p></div>
      </div>
      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={combined}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2756" />
            <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 8 }} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="actual" stroke="#3B82F6" strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="forecast" stroke="#3B82F6" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

// Card 4: Bond Yield Outlook
export function BondsCard({ bonds, delay = 0.3 }: { bonds: BondOutlook; delay?: number }) {
  const combined = bonds.yields.length > 0 ? [
    ...(bonds.yields[0]?.historicalData || []).map((d, i) => ({
      month: d.month,
      DE: d.value,
      FR: bonds.yields[1]?.historicalData?.[i]?.value || 0,
      IT: bonds.yields[2]?.historicalData?.[i]?.value || 0,
      DE_f: null, FR_f: null, IT_f: null,
    })),
    ...(bonds.yields[0]?.forecastData || []).map((d, i) => ({
      month: d.month,
      DE: null, FR: null, IT: null,
      DE_f: d.value,
      FR_f: bonds.yields[1]?.forecastData?.[i]?.value || 0,
      IT_f: bonds.yields[2]?.forecastData?.[i]?.value || 0,
    })),
  ] : [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="glass-card p-4">
      <h3 className="text-xs font-bold text-db-text-primary mb-3 flex items-center gap-1.5">
        <Activity size={13} className="text-db-accent" /> Bond Yield Outlook
      </h3>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={combined}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2756" />
            <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 8 }} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="DE" stroke="#3B82F6" strokeWidth={1.5} dot={false} name="DE" />
            <Line type="monotone" dataKey="FR" stroke="#10B981" strokeWidth={1.5} dot={false} name="FR" />
            <Line type="monotone" dataKey="IT" stroke="#EF4444" strokeWidth={1.5} dot={false} name="IT" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {bonds.spreads[0] && (
        <p className="text-[9px] text-db-text-muted mt-1">IT-DE spread: {bonds.spreads[0].current}bps → <span className="text-db-warning font-bold">{bonds.spreads[0].predicted}bps</span></p>
      )}
    </motion.div>
  );
}

// Card 5: Recession Probability
export function RecessionCard({ recession, delay = 0.4 }: { recession: RecessionForecast; delay?: number }) {
  const getColor = (p: number) => p >= 60 ? "#EF4444" : p >= 40 ? "#F59E0B" : p >= 20 ? "#3B82F6" : "#10B981";
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="glass-card p-4">
      <h3 className="text-xs font-bold text-db-text-primary mb-3 flex items-center gap-1.5">
        <AlertTriangle size={13} className="text-db-warning" /> Recession Probability
      </h3>
      <div className="space-y-2">
        {recession.probabilities.map((r) => (
          <div key={r.country} className="flex items-center gap-2">
            <span className="text-sm">{r.flag}</span>
            <span className="text-[10px] text-db-text-muted w-16">{r.country}</span>
            <div className="flex-1 h-2 bg-db-border rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${r.probability}%`, backgroundColor: getColor(r.probability) }} />
            </div>
            <span className="text-[10px] font-bold w-8 text-right" style={{ color: getColor(r.probability) }}>{r.probability}%</span>
          </div>
        ))}
      </div>
      {recession.probabilities[0] && (
        <div className="mt-2 flex flex-wrap gap-1">
          {(recession.signals?.[recession.probabilities[0].country] || []).slice(0, 4).map((s, i) => (
            <span key={i} className={`text-[7px] px-1 py-0.5 rounded-full flex items-center gap-0.5 ${s.active ? "bg-db-danger/10 text-db-danger" : "bg-db-surface text-db-text-muted"}`}>
              {s.active ? <CheckCircle size={7} /> : <XCircle size={7} />}{s.name}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// Card 6: Sector Outlook
export function SectorsCard({ sectors, delay = 0.5 }: { sectors: SectorOutlookItem[]; delay?: number }) {
  const icons: Record<string, any> = { Banking: Building2, Energy: Zap, "Real Estate": Home, Manufacturing: Factory, Technology: Smartphone, Utilities: Sun };
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="glass-card p-4">
      <h3 className="text-xs font-bold text-db-text-primary mb-3 flex items-center gap-1.5">
        <TrendingUp size={13} className="text-db-accent" /> Sector Outlook
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {sectors.map((s) => {
          const Icon = icons[s.sector] || HelpCircle;
          const color = s.outlook === "bullish" ? "#10B981" : s.outlook === "bearish" ? "#EF4444" : "#F59E0B";
          return (
            <div key={s.sector} className="glass-card p-2 bg-db-surface/50">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={10} style={{ color }} />
                <span className="text-[10px] font-medium text-db-text-primary">{s.sector}</span>
                <span className="text-[8px] font-bold ml-auto" style={{ color }}>{s.outlook}</span>
              </div>
              <p className="text-[8px] text-db-text-muted line-clamp-2">{s.catalyst}</p>
              <div className="h-1 bg-db-border rounded-full mt-1 overflow-hidden">
                <div className="h-full rounded-full bg-db-accent" style={{ width: `${s.confidence}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
