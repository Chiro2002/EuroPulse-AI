/**
 * Sparkline Data Generator
 * Generates realistic-looking time series data for chart sparklines
 */

/**
 * Generate plausible sparkline data (30 days of values)
 * Uses a random walk from a starting value with some mean reversion
 */
export function generateSparklineData(
  baseValue: number,
  volatility: number = 0.02,
  trend: "up" | "down" | "stable" = "stable",
  days: number = 30
): number[] {
  const data: number[] = [];
  let current = baseValue;
  const trendFactor = trend === "up" ? 0.003 : trend === "down" ? -0.003 : 0;

  for (let i = 0; i < days; i++) {
    // Random walk with mean reversion toward trend
    const noise = (Math.random() - 0.5) * volatility * current;
    const trendPush = trendFactor * current;
    const meanReversion = (baseValue - current) * 0.01;
    
    current = current + noise + trendPush + meanReversion;
    
    // Ensure we don't go below 0
    if (current < 0) current = baseValue * 0.1;
    
    data.push(Math.round(current * 100) / 100);
  }

  return data;
}

/**
 * Generate yield curve data for bonds
 */
export function generateBondSparkline(baseYield: number): number[] {
  return generateSparklineData(baseYield, 0.015, "up", 30);
}

/**
 * Generate exchange rate data
 */
export function generateFXSparkline(baseRate: number): number[] {
  return generateSparklineData(baseRate, 0.008, "stable", 30);
}

/**
 * Generate commodity price data
 */
export function generateCommoditySparkline(basePrice: number): number[] {
  return generateSparklineData(basePrice, 0.025, "up", 30);
}

/**
 * Generate market pulse data (7 days of daily values)
 */
export function generateMarketPulseData(): {
  bonds: Record<string, { day: string; value: number }[]>;
  equities: Record<string, { day: string; value: number }[]>;
  fx: Record<string, { day: string; value: number }[]>;
  commodities: Record<string, { day: string; value: number }[]>;
} {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const generateSeries = (baseValue: number, vol: number, trend: "up" | "down" | "stable") => {
    const values = generateSparklineData(baseValue, vol, trend, 7);
    return days.map((day, i) => ({
      day,
      value: values[i],
    }));
  };

  return {
    bonds: {
      "DE 10Y": generateSeries(2.45, 0.02, "down"),
      "FR 10Y": generateSeries(3.15, 0.02, "up"),
      "IT 10Y": generateSeries(4.25, 0.025, "up"),
    },
    equities: {
      "DAX": generateSeries(18500, 0.015, "down"),
      "CAC40": generateSeries(7500, 0.015, "stable"),
      "FTSE MIB": generateSeries(32000, 0.02, "up"),
    },
    fx: {
      "EUR/USD": generateSeries(1.08, 0.01, "down"),
      "EUR/GBP": generateSeries(0.85, 0.008, "stable"),
      "EUR/CHF": generateSeries(0.96, 0.005, "up"),
    },
    commodities: {
      "Brent": generateSeries(82, 0.025, "up"),
      "Nat Gas": generateSeries(38, 0.04, "up"),
      "Gold": generateSeries(2050, 0.01, "up"),
    },
  };
}
