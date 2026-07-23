"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { scaleThreshold } from "d3-scale";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert, Zap, Plus, Minus, RotateCcw } from "lucide-react";

const EUROPE_GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// ─── Types ──────────────────────────────────────────────────────────────

export interface CountryDetailData {
  country: string;
  countryName: string;
  flag: string;
  riskScore: number;
  color: string;
  breakdown?: {
    inflation: number;
    energy: number;
    debt: number;
    geopolitical: number;
  };
}

interface EuropeMapProps {
  countryData: Record<string, { value: number; color: string }>;
  countryDetails?: CountryDetailData[];
  height?: number;
  onCountrySelect?: (code: string) => void;
  disableModal?: boolean;
}

// ─── Complete list of ALL European countries ────────────────────────────

const europeanCountries: Record<string, string> = {
  // Western Europe
  "276": "DE", "250": "FR", "380": "IT", "724": "ES", "528": "NL",
  "056": "BE", "040": "AT", "620": "PT", "372": "IE", "442": "LU",
  "756": "CH", "020": "AD", "492": "MC", "438": "LI",
  // Northern Europe
  "826": "GB", "208": "DK", "752": "SE", "246": "FI", "578": "NO",
  "352": "IS", "233": "EE", "428": "LV", "440": "LT",
  // Central Europe
  "616": "PL", "203": "CZ", "703": "SK", "348": "HU", "705": "SI",
  // Southern Europe
  "300": "GR", "470": "MT", "674": "SM", "336": "VA", "191": "HR",
  // Balkans
  "100": "BG", "642": "RO", "688": "RS", "070": "BA", "807": "MK",
  "008": "AL", "499": "ME",
  // Eastern Europe
  "112": "BY", "804": "UA", "498": "MD",
};

// ─── d3-scale color threshold (Bloomberg-style) ─────────────────────────
// 0-29: Green (low), 30-44: Lime, 45-54: Amber, 55-69: Orange, 70-84: Red, 85+: Dark Red

const colorScale = scaleThreshold<number, string>()
  .domain([30, 45, 55, 70, 85])
  .range([
    "#2FAE60", // < 30 — Low (Green)
    "#84CC16", // 30-44 — Moderate (Lime)
    "#F5A623", // 45-54 — Elevated (Amber)
    "#EA580C", // 55-69 — High (Orange)
    "#DC2626", // 70-84 — Critical (Red)
    "#991B1B", // >= 85 — Severe (Dark Red)
  ]);

const DEFAULT_FILL = "#E5E7EB";
const NON_EUROPE_FILL = "#F3F4F6";
const STROKE = "#D1D5DB";
const HOVER_COLOR = "#0018A8";

// ─── Risk level helper ──────────────────────────────────────────────────

function getRiskLevel(score: number): { label: string; color: string; bg: string } {
  if (score >= 85) return { label: "Severe", color: "#991B1B", bg: "rgba(153,27,27,0.12)" };
  if (score >= 70) return { label: "Critical", color: "#DC2626", bg: "rgba(220,38,38,0.12)" };
  if (score >= 55) return { label: "High", color: "#EA580C", bg: "rgba(234,88,12,0.12)" };
  if (score >= 45) return { label: "Elevated", color: "#F5A623", bg: "rgba(245,166,35,0.12)" };
  if (score >= 30) return { label: "Moderate", color: "#84CC16", bg: "rgba(132,204,22,0.12)" };
  return { label: "Low", color: "#2FAE60", bg: "rgba(47,174,96,0.12)" };
}

// ─── Component ──────────────────────────────────────────────────────────

export function EuropeMap({
  countryData,
  countryDetails = [],
  height = 380,
  onCountrySelect,
  disableModal = false,
}: EuropeMapProps) {
  const [mounted, setMounted] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [modalCountry, setModalCountry] = useState<CountryDetailData | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(2);
  const [center, setCenter] = useState<[number, number]>([12, 49]);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => { setMounted(true); }, []);

  // Dismiss modal on outside click
  useEffect(() => {
    if (!modalCountry) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setModalCountry(null);
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalCountry(null);
    };
    const timer = setTimeout(() => {
      document.addEventListener("click", handler);
      document.addEventListener("keydown", keyHandler);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, [modalCountry]);

  // ─── Color helper ─────────────────────────────────────────────────────
  const getCountryColor = useCallback((geo: any) => {
    const code = europeanCountries[geo.id];
    if (!code) return NON_EUROPE_FILL;
    const d = countryData[code];
    if (!d) return DEFAULT_FILL;
    return colorScale(d.value);
  }, [countryData]);

  const getCountryOpacity = useCallback((geo: any) => {
    const code = europeanCountries[geo.id];
    if (!code) return 0.3;
    return 0.7;
  }, []);

  // ─── Track mouse position for custom tooltip (ref-based, no re-render) ──
  // We only update React state when hoveredCountry changes to avoid re-rendering
  // the entire SVG on every pixel of mouse movement.
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    mousePosRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  // Update React state position only when a new country is hovered
  const updateMousePos = useCallback((x: number, y: number) => {
    mousePosRef.current = { x, y };
    setMousePos({ x, y });
  }, []);

  // ─── Hover info for tooltip ───────────────────────────────────────────
  const hoverInfo = hoveredCountry
    ? countryDetails.find((d) => d.country === hoveredCountry) ?? null
    : null;
  const riskLevel = hoverInfo ? getRiskLevel(hoverInfo.riskScore) : null;

  // ─── Zoom controls ────────────────────────────────────────────────────
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.5, 4));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.5, 2));
  const goHome = () => { setZoom(2); setCenter([12, 49]); };
  const goZoom3 = () => { setZoom(3); setCenter([12, 49]); };

  // ─── SSR placeholder ──────────────────────────────────────────────────
  if (!mounted) {
    return (
      <div className="flex items-center justify-center bg-gray-50 rounded-xl" style={{ height }}>
        <div className="animate-pulse text-text-secondary text-xs">Loading map...</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {/* ── Map Container ── */}
      <div
        ref={mapRef}
        className="relative overflow-hidden rounded-xl bg-gray-50/50"
        style={{ height }}
        onMouseMove={handleMouseMove}
      >
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 500, center: [12, 49] }}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup
            {...({ zoom, center, onMoveEnd: ({ coordinates, zoom: z }: { coordinates: [number, number]; zoom: number }) => { setCenter(coordinates); setZoom(z); }, maxZoom: 4, minZoom: 2 } as any)}
          >
            <Geographies geography={EUROPE_GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const code = europeanCountries[geo.id];
                  const isEuropean = !!code;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getCountryColor(geo)}
                      stroke={STROKE}
                      strokeWidth={code ? 0.6 : 0.3}
                      opacity={getCountryOpacity(geo)}
                      style={{
                        default: { outline: "none", cursor: isEuropean ? "pointer" : "default" },
                        hover: { outline: "none", fill: HOVER_COLOR, opacity: 0.9 },
                        pressed: { outline: "none" },
                      }}
                      onMouseEnter={(e) => {
                        if (code) {
                          setHoveredCountry(code);
                          updateMousePos(e.clientX, e.clientY);
                        }
                      }}
                      onMouseLeave={() => {
                        setHoveredCountry(null);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (code) {
                          onCountrySelect?.(code);
                          if (!disableModal) {
                            const detail = countryDetails.find((d) => d.country === code) ?? null;
                            if (detail) {
                              setModalCountry(detail);
                            } else {
                              const d = countryData[code];
                              if (d) {
                                setModalCountry({
                                  country: code,
                                  countryName: code,
                                  flag: "🇪🇺",
                                  riskScore: d.value,
                                  color: d.color,
                                  breakdown: { inflation: 0, energy: 0, debt: 0, geopolitical: 0 },
                                });
                              }
                            }
                          }
                        }
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* ── Custom Floating Tooltip ── */}
        <AnimatePresence>
          {hoverInfo && riskLevel && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.12 }}
              className="fixed pointer-events-none z-50"
              style={{
                left: mousePos.x + 14,
                top: mousePos.y - 10,
                transform: "translateY(-100%)",
              }}
            >
              <div className="bg-white rounded-xl shadow-xl border border-gray-200/80 px-3 py-2 text-xs min-w-[140px] max-w-[220px]">
                {/* Header: Flag + Name + Code */}
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-lg">{hoverInfo.flag}</span>
                  <span className="font-bold text-[12px] text-gray-900">{hoverInfo.countryName}</span>
                  <span className="text-[9px] text-gray-400">{hoverInfo.country}</span>
                </div>
                {/* Risk bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: riskLevel.bg }}>
                    <div className="h-full rounded-full" style={{ width: `${hoverInfo.riskScore}%`, backgroundColor: riskLevel.color }} />
                  </div>
                  <span className="text-[11px] font-bold" style={{ color: riskLevel.color }}>{hoverInfo.riskScore}</span>
                  <span className="text-[7px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ backgroundColor: riskLevel.bg, color: riskLevel.color }}>
                    {riskLevel.label}
                  </span>
                </div>
                {/* Breakdown row */}
                {hoverInfo.breakdown && (
                  <div className="flex gap-2 mt-1.5 text-[9px] text-gray-400">
                    <span>I:{hoverInfo.breakdown.inflation}</span>
                    <span>E:{hoverInfo.breakdown.energy}</span>
                    <span>D:{hoverInfo.breakdown.debt}</span>
                    <span>G:{hoverInfo.breakdown.geopolitical}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Zoom Controls ── */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm border border-gray-200 flex items-center justify-center hover:bg-white transition-colors text-text-secondary hover:text-text"
            title="Zoom in"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm border border-gray-200 flex items-center justify-center hover:bg-white transition-colors text-text-secondary hover:text-text"
            title="Zoom out"
          >
            <Minus size={14} />
          </button>
          <div className="h-px bg-gray-200 my-0.5" />
          <button
            onClick={goHome}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-[10px] font-bold ${
              zoom === 2 && center[0] === 12
                ? "bg-primary text-white shadow-sm"
                : "bg-white/90 backdrop-blur-sm shadow-sm border border-gray-200 text-text-secondary hover:bg-white hover:text-text"
            }`}
            title="Default zoom (2x)"
          >
            2x
          </button>
          <button
            onClick={goZoom3}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-[10px] font-bold ${
              zoom === 3
                ? "bg-primary text-white shadow-sm"
                : "bg-white/90 backdrop-blur-sm shadow-sm border border-gray-200 text-text-secondary hover:bg-white hover:text-text"
            }`}
            title="Zoom 3x"
          >
            3x
          </button>
          <button
            onClick={goHome}
            className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm border border-gray-200 flex items-center justify-center hover:bg-white transition-colors text-text-secondary hover:text-text"
            title="Reset view"
          >
            <RotateCcw size={12} />
          </button>
        </div>

        {/* ── Legend bottom-right ── */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-sm z-10">
          {[
            { label: "Low", color: "#2FAE60" },
            { label: "Medium", color: "#F5A623" },
            { label: "High", color: "#EA580C" },
            { label: "Critical", color: "#DC2626" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
              <span className="text-[8px] text-text-secondary">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Click Modal ── */}
      <AnimatePresence>
        {modalCountry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
            onClick={() => setModalCountry(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[360px] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 pb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{modalCountry.flag}</span>
                  <div>
                    <h3 className="text-sm font-bold text-text">{modalCountry.countryName}</h3>
                    <p className="text-[10px] text-text-secondary">{modalCountry.country}</p>
                  </div>
                </div>
                <button
                  onClick={() => setModalCountry(null)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <X size={14} className="text-text-secondary" />
                </button>
              </div>

              <div className="px-4 py-2">
                {(() => {
                  const rl = getRiskLevel(modalCountry.riskScore);
                  return (
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-semibold text-text-secondary">Risk Score</span>
                          <span className="text-[11px] font-bold" style={{ color: rl.color }}>{modalCountry.riskScore}/100</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${modalCountry.riskScore}%`, backgroundColor: rl.color }} />
                        </div>
                      </div>
                      <span className="text-[9px] font-bold uppercase px-2 py-1 rounded-lg" style={{ backgroundColor: rl.bg, color: rl.color }}>
                        {rl.label}
                      </span>
                    </div>
                  );
                })()}
              </div>

              {modalCountry.breakdown && (
                <div className="px-4 py-2 space-y-2">
                  <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1">
                    <ShieldAlert size={10} />
                    Risk Breakdown
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(modalCountry.breakdown).map(([key, val]) => {
                      const barColor = val >= 75 ? "#DC2626" : val >= 55 ? "#EA580C" : val >= 40 ? "#F5A623" : "#2FAE60";
                      return (
                        <div key={key} className="bg-gray-50 rounded-lg p-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-medium text-text-secondary capitalize">{key}</span>
                            <span className="text-[9px] font-bold" style={{ color: barColor }}>{val}</span>
                          </div>
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${val}%`, backgroundColor: barColor }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="px-4 py-3 mt-1 border-t border-gray-100">
                <div className="flex items-start gap-2">
                  <Zap size={12} className="text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] text-text-secondary leading-relaxed">
                    {modalCountry.riskScore >= 70
                      ? `Elevated risk across multiple dimensions. Primary concerns: ${
                          modalCountry.breakdown
                            ? Object.entries(modalCountry.breakdown)
                                .sort(([, a], [, b]) => b - a)
                                .slice(0, 2)
                                .map(([k]) => k)
                                .join(" and ")
                            : "macroeconomic factors"
                        }. Monitor exposure closely this quarter.`
                      : modalCountry.riskScore >= 45
                      ? `Moderate risk profile with stable outlook. Key watch areas: ${
                          modalCountry.breakdown
                            ? Object.entries(modalCountry.breakdown)
                                .filter(([, v]) => v > 50)
                                .map(([k]) => k)
                                .join(", ") || "broad economic conditions"
                            : "economic conditions"
                        }.`
                      : `Low risk environment. Favorable conditions for maintaining current exposure levels.`}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-3 text-center">
                <span className="text-[8px] text-text-secondary/60">Click outside or press Esc to close</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
