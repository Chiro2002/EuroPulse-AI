"use client";

import { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { motion } from "framer-motion";

// Simplified European countries topojson (inline to avoid external dependency)
const EUROPE_GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface EuropeMapProps {
  countryData: Record<string, { value: number; color: string }>;
  onCountryClick?: (countryCode: string) => void;
  selectedCountry?: string | null;
  height?: number;
}

// ISO 3166-1 numeric to alpha-2 mapping for European countries
const europeanCountries: Record<string, string> = {
  "276": "DE", "250": "FR", "380": "IT", "724": "ES", "528": "NL",
  "056": "BE", "616": "PL", "040": "AT", "620": "PT", "372": "IE",
  "208": "DK", "752": "SE", "246": "FI", "300": "GR", "348": "HU",
  "203": "CZ", "703": "SK", "705": "SI", "191": "HR", "642": "RO",
  "100": "BG", "233": "EE", "428": "LV", "440": "LT", "152": "CL",
  "442": "LU", "470": "MT", "158": "TW",
};

export function EuropeMap({
  countryData,
  onCountryClick,
  selectedCountry,
  height = 400,
}: EuropeMapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="glass-card p-4 flex items-center justify-center" style={{ height }}>
        <div className="animate-pulse text-db-text-muted">Loading map...</div>
      </div>
    );
  }

  const getCountryColor = (geo: any) => {
    const countryCode = europeanCountries[geo.id];
    if (!countryCode) return "#1C2555";
    
    const data = countryData[countryCode];
    if (!data) return "#1C2555";
    
    if (selectedCountry === countryCode) return data.color;
    if (hoveredCountry === countryCode) return "#3B82F6";
    
    return data.color;
  };

  const getCountryOpacity = (geo: any) => {
    const countryCode = europeanCountries[geo.id];
    if (!countryCode) return 0.3;
    
    if (selectedCountry && selectedCountry !== countryCode) return 0.2;
    if (hoveredCountry === countryCode) return 0.9;
    
    return 0.6;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card p-4 overflow-hidden"
    >
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 600,
          center: [15, 54],
        }}
        style={{ width: "100%", height }}
      >
        <Geographies geography={EUROPE_GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const countryCode = europeanCountries[geo.id];
              const isEuropean = !!countryCode;
              
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getCountryColor(geo)}
                  stroke="#0A0E27"
                  strokeWidth={0.5}
                  opacity={getCountryOpacity(geo)}
                  style={{
                    default: {
                      outline: "none",
                      cursor: isEuropean ? "pointer" : "default",
                    },
                    hover: {
                      outline: "none",
                      fill: isEuropean ? "#3B82F6" : "#1C2555",
                    },
                    pressed: {
                      outline: "none",
                    },
                  }}
                  onMouseEnter={() => {
                    if (countryCode) setHoveredCountry(countryCode);
                  }}
                  onMouseLeave={() => setHoveredCountry(null)}
                  onClick={() => {
                    if (countryCode && onCountryClick) {
                      onCountryClick(countryCode);
                    }
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-db-success/60" />
          <span className="text-xs text-db-text-muted">Low Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-db-warning/60" />
          <span className="text-xs text-db-text-muted">Medium Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-db-danger/60" />
          <span className="text-xs text-db-text-muted">High Risk</span>
        </div>
      </div>
    </motion.div>
  );
}
