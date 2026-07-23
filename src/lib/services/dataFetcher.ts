/**
 * DataService — Enterprise Data Fetcher
 * Fetches from real free APIs with caching and fallback to mock data
 */

type CacheType = "market" | "macro" | "news";

interface CacheEntry {
  data: any;
  timestamp: number;
}

const CACHE_TTL: Record<CacheType, number> = {
  market: 5 * 60 * 1000,    // 5 minutes
  macro: 30 * 60 * 1000,     // 30 minutes
  news: 10 * 60 * 1000,      // 10 minutes
};

class DataFetcher {
  private cache = new Map<string, CacheEntry>();

  private async cachedFetch<T>(
    key: string,
    type: CacheType,
    fetcher: () => Promise<T>,
    fallback: () => T
  ): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL[type]) {
      return cached.data as T;
    }

    try {
      const data = await fetcher();
      this.cache.set(key, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.warn(`[DataFetcher] API failed for "${key}", using fallback:`, error);
      const fallbackData = fallback();
      // Cache failures for 60s to prevent repeated timeouts on slow/down APIs
      const FAILURE_CACHE_TTL = 60_000;
      this.cache.set(key, {
        data: fallbackData,
        timestamp: Date.now() - (CACHE_TTL[type] - FAILURE_CACHE_TTL),
      });
      return fallbackData;
    }
  }

  // ─── ECB Rate ───────────────────────────────────────────────────────
  async fetchECBRate(): Promise<number> {
    return this.cachedFetch(
      "ecb_rate",
      "market",
      async () => {
        const res = await fetch(
          "https://data-api.ecb.europa.eu/service/data/FM/D.U2.EUR.4F.KR.MRR_FR.LEV?format=jsondata&lastNObservations=1",
          { signal: AbortSignal.timeout(2000) }
        );
        const json = await res.json();
        // Try to find observations at any nesting level
        const ds = json?.dataSets?.[0];
        const findObs = (obj: any): number | null => {
          if (!obj || typeof obj !== "object") return null;
          if (obj.observations && typeof obj.observations === "object") {
            const keys = Object.keys(obj.observations);
            if (keys.length > 0) {
              const val = obj.observations[keys[keys.length - 1]];
              if (Array.isArray(val) && val.length > 0) return parseFloat(val[0]);
            }
          }
          return Object.values(obj).reduce((found: number | null, v: any) => found ?? findObs(v), null);
        };
        const found = findObs(ds);
        if (found !== null && !isNaN(found)) return found;
        throw new Error("Could not parse ECB rate");
      },
      () => 4.25
    );
  }

  // ─── EUR/USD from Frankfurter (ECB rates, free, no key) ─────────────
  async fetchEURUSD(): Promise<number> {
    return this.cachedFetch(
      "eur_usd",
      "market",
      async () => {
        const res = await fetch(
          "https://api.frankfurter.app/latest?from=EUR&to=USD",
          { signal: AbortSignal.timeout(2000) }
        );
        const data = await res.json();
        if (data?.rates?.USD) return data.rates.USD;
        throw new Error("Could not parse EUR/USD");
      },
      () => 1.0825
    );
  }

  // ─── EUR/USD Historical (for sparklines) ────────────────────────────
  async fetchEURUSDHistorical(days: number = 30): Promise<{ day: string; value: number }[]> {
    return this.cachedFetch(
      "eur_usd_hist",
      "market",
      async () => {
        const res = await fetch(
          `https://api.frankfurter.app/2025-06-22..2026-07-22?from=EUR&to=USD`,
          { signal: AbortSignal.timeout(2000) }
        );
        const data = await res.json();
        if (data?.rates) {
          const entries = Object.entries(data.rates).slice(-days);
          return entries.map(([day, rates]: [string, any]) => ({
            day,
            value: rates.USD,
          }));
        }
        throw new Error("Could not parse EUR/USD history");
      },
      () => generateFallbackHistorical(1.08, 0.02, days)
    );
  }

  // ─── Yahoo Finance for market data ──────────────────────────────────
  async fetchYahooChart(symbol: string, range: string = "1mo"): Promise<{ timestamps: number[]; close: number[] }> {
    return this.cachedFetch(
      `yahoo_${symbol}_${range}`,
      "market",
      async () => {
        const res = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=${range}`,
          { signal: AbortSignal.timeout(2000) }
        );
        const json = await res.json();
        const result = json?.chart?.result?.[0];
        if (result?.timestamp && result?.indicators?.quote?.[0]?.close) {
          return {
            timestamps: result.timestamp,
            close: result.indicators.quote[0].close,
          };
        }
        throw new Error(`Could not parse Yahoo chart for ${symbol}`);
      },
      () => {
        const now = Date.now();
        const timestamps = Array.from({ length: 22 }, (_, i) => now - (21 - i) * 86400000);
        const close = timestamps.map((_, i) => 100 + Math.sin(i * 0.5) * 10 + (Math.random() - 0.5) * 5);
        return { timestamps, close };
      }
    );
  }

  // ─── Eurostat Inflation (HICP) ───────────────────────────────────────
  async fetchInflation(country: string): Promise<{ value: number; historical: { month: string; value: number }[] }> {
    return this.cachedFetch(
      `inflation_${country}`,
      "macro",
      async () => {
        const res = await fetch(
          `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/prc_hicp_manr?geo=${country}&format=JSON&lastTimePeriod=12`,
          { signal: AbortSignal.timeout(3000) }
        );
        const json = await res.json();
        const values = json?.value;
        const dimensions = json?.dimension;
        if (values && dimensions) {
          const timeKeys = Object.keys(dimensions?.time?.category?.label || {});
          const valueEntries = timeKeys.map((key, i) => ({
            month: key,
            value: parseFloat(values[i] || "0"),
          })).filter(v => !isNaN(v.value));
          const latest = valueEntries[valueEntries.length - 1]?.value || 0;
          return { value: latest, historical: valueEntries };
        }
        throw new Error("Could not parse inflation");
      },
      () => generateFallbackInflation(country)
    );
  }

  // ─── GDELT News ─────────────────────────────────────────────────────
  async fetchGDELTNews(query: string, hours: number = 24): Promise<any[]> {
    return this.cachedFetch(
      `gdelt_${query}_${hours}`,
      "news",
      async () => {
        const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=artlist&format=json&timespan=${hours}h&maxrecords=5`;
        // Use AbortController with 5s timeout — GDELT can be slow but 5s is enough
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        try {
          const res = await fetch(url, { signal: controller.signal });
          if (!res.ok) throw new Error(`GDELT returned ${res.status}`);
          const json = await res.json();
          if (json?.articles) return json.articles;
          if (json?.results) return json.results;
          throw new Error("Could not parse GDELT");
        } finally {
          clearTimeout(timeout);
        }
      },
      () => getFallbackGDELTNews()
    );
  }

  // ─── World Bank Country Data ────────────────────────────────────────
  async fetchWorldBankIndicator(country: string, indicator: string): Promise<{ year: string; value: number }[]> {
    return this.cachedFetch(
      `wb_${country}_${indicator}`,
      "macro",
      async () => {
        const res = await fetch(
          `https://api.worldbank.org/v2/country/${country}/indicator/${indicator}?format=json&per_page=10`,
          { signal: AbortSignal.timeout(3000) }
        );
        const json = await res.json();
        if (Array.isArray(json) && json[1]) {
          return json[1]
            .filter((item: any) => item.value !== null)
            .map((item: any) => ({ year: item.year.toString(), value: item.value }));
        }
        throw new Error("Could not parse World Bank data");
      },
      () => []
    );
  }

  // ─── Market Data Only (no GDELT — for sidebar/lightweight use) ──────
  async fetchMarketDataOnly(): Promise<{
    ecbRate: number;
    eurUsd: number;
    eurUsdHistorical: { day: string; value: number }[];
    brentCurrent: number;
    brentHistorical: { day: string; value: number }[];
    stoxxCurrent: number;
    stoxxHistorical: { day: string; value: number }[];
    inflation: number;
    inflationHistorical: { month: string; value: number }[];
  }> {
    const settled = await Promise.allSettled([
      this.fetchECBRate(),
      this.fetchEURUSD(),
      this.fetchEURUSDHistorical(30),
      this.fetchYahooChart("BZ=F", "1mo"),
      this.fetchYahooChart("^STOXX50E", "1mo"),
      this.fetchInflation("DE"),
    ]);

    const [ecbRateResult, eurUsdResult, eurUsdHistResult, brentResult, stoxxResult, inflationResult] = settled.map(r => r.status === "fulfilled" ? r.value : undefined);

    const ecbRate: number = (ecbRateResult as number) ?? 4.25;
    const eurUsd: number = (eurUsdResult as number) ?? 1.08;
    const eurUsdHist: { day: string; value: number }[] = (eurUsdHistResult as { day: string; value: number }[]) ?? generateFallbackHistorical(1.08, 0.02, 30);
    const brentData: { timestamps: number[]; close: number[] } = (brentResult as { timestamps: number[]; close: number[] }) ?? { timestamps: [], close: [] };
    const stoxxData: { timestamps: number[]; close: number[] } = (stoxxResult as { timestamps: number[]; close: number[] }) ?? { timestamps: [], close: [] };
    const deInflation: { value: number; historical: { month: string; value: number }[] } = (inflationResult as { value: number; historical: { month: string; value: number }[] }) ?? generateFallbackInflation("DE");

    const toMarketSeries = (data: { timestamps: number[]; close: number[] }, name: string, color: string) => ({
      name,
      color,
      data: data.timestamps.map((t, i) => ({
        day: new Date(t * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        value: data.close[i] || 0,
      })).filter(d => d.value > 0),
    });

    const brentSeries = toMarketSeries(brentData, "Brent", "#EF4444");
    const stoxxSeries = toMarketSeries(stoxxData, "Stoxx 50", "#3B82F6");

    return {
      ecbRate,
      eurUsd,
      eurUsdHistorical: eurUsdHist,
      brentCurrent: brentSeries.data[brentSeries.data.length - 1]?.value || 82,
      brentHistorical: brentSeries.data,
      stoxxCurrent: stoxxSeries.data[stoxxSeries.data.length - 1]?.value || 4892,
      stoxxHistorical: stoxxSeries.data,
      inflation: deInflation.value,
      inflationHistorical: deInflation.historical,
    };
  }

  // ─── Combined Dashboard Data ────────────────────────────────────────
  async fetchDashboardData(): Promise<{
    ecbRate: number;
    eurUsd: number;
    eurUsdHistorical: { day: string; value: number }[];
    brentCurrent: number;
    brentHistorical: { day: string; value: number }[];
    stoxxCurrent: number;
    stoxxHistorical: { day: string; value: number }[];
    inflation: number;
    inflationHistorical: { month: string; value: number }[];
    gdeltNews: any[];
  }> {
    // Fetch all data in parallel — each fetcher handles its own fallback
    const settled = await Promise.allSettled([
      this.fetchECBRate(),
      this.fetchEURUSD(),
      this.fetchEURUSDHistorical(30),
      this.fetchYahooChart("BZ=F", "1mo"),
      this.fetchYahooChart("^STOXX50E", "1mo"),
      this.fetchInflation("DE"),
      this.fetchGDELTNews("europe (ECB OR inflation OR energy crisis OR bank)", 24),
    ]);

    const [ecbRateResult, eurUsdResult, eurUsdHistResult, brentResult, stoxxResult, inflationResult, gdeltResult] = settled.map(r => r.status === "fulfilled" ? r.value : undefined);

    const ecbRate: number = (ecbRateResult as number) ?? 4.25;
    const eurUsd: number = (eurUsdResult as number) ?? 1.08;
    const eurUsdHist: { day: string; value: number }[] = (eurUsdHistResult as { day: string; value: number }[]) ?? generateFallbackHistorical(1.08, 0.02, 30);
    const brentData: { timestamps: number[]; close: number[] } = (brentResult as { timestamps: number[]; close: number[] }) ?? { timestamps: [], close: [] };
    const stoxxData: { timestamps: number[]; close: number[] } = (stoxxResult as { timestamps: number[]; close: number[] }) ?? { timestamps: [], close: [] };
    const deInflation: { value: number; historical: { month: string; value: number }[] } = (inflationResult as { value: number; historical: { month: string; value: number }[] }) ?? generateFallbackInflation("DE");
    const gdeltNews: any[] = (gdeltResult as any[]) ?? [];


    // Process market data into the format the dashboard expects
    const toMarketSeries = (data: { timestamps: number[]; close: number[] }, name: string, color: string) => ({
      name,
      color,
      data: data.timestamps.map((t, i) => ({
        day: new Date(t * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        value: data.close[i] || 0,
      })).filter(d => d.value > 0),
    });

    // Process Brent data
    const brentSeries = toMarketSeries(brentData, "Brent", "#EF4444");
    const stoxxSeries = toMarketSeries(stoxxData, "Stoxx 50", "#3B82F6");

    // Build sparkline data from historical data
    const buildSparkline = (values: number[]): number[] => {
      if (values.length >= 30) return values.slice(-30);
      return values;
    };

    return {
      ecbRate,
      eurUsd,
      eurUsdHistorical: eurUsdHist,
      brentCurrent: brentSeries.data[brentSeries.data.length - 1]?.value || 82,
      brentHistorical: brentSeries.data,
      stoxxCurrent: stoxxSeries.data[stoxxSeries.data.length - 1]?.value || 4892,
      stoxxHistorical: stoxxSeries.data,
      inflation: deInflation.value,
      inflationHistorical: deInflation.historical,
      gdeltNews,
    };
  }
}

// ─── Fallback generators ───────────────────────────────────────────────
function generateFallbackHistorical(base: number, volatility: number, count: number): { day: string; value: number }[] {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (count - 1 - i));
    return {
      day: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      value: base + Math.sin(i * 0.3) * volatility + (Math.random() - 0.5) * volatility,
    };
  });
}

// ─── GDELT Fallback — returns mock articles in GDELT format ───────────
function getFallbackGDELTNews(): any[] {
  return [
    {
      title: "ECB Signals 25bps Rate Cut in March Amid Stalling Growth",
      url: "https://www.ft.com/content/ecb-march-2026",
      seendate: new Date(Date.now() - 2 * 3600000).toISOString().slice(0, 10).replace(/-/g, ""),
      tone: "-1.5",
    },
    {
      title: "Italian Debt-to-GDP Hits 158% — BTP-Bund Spread Widens to 185bps",
      url: "https://www.bloomberg.com/news/italian-debt-2026",
      seendate: new Date(Date.now() - 4 * 3600000).toISOString().slice(0, 10).replace(/-/g, ""),
      tone: "-4.2",
    },
    {
      title: "German Industrial Production Falls 1.2% MoM — Manufacturing Contraction Deepens",
      url: "https://www.reuters.com/german-industrial-2026",
      seendate: new Date(Date.now() - 6 * 3600000).toISOString().slice(0, 10).replace(/-/g, ""),
      tone: "-2.8",
    },
    {
      title: "EUR/USD Tests 1.0750 as ECB-Fed Policy Divergence Widens",
      url: "https://www.reuters.com/eur-usd-2026",
      seendate: new Date(Date.now() - 8 * 3600000).toISOString().slice(0, 10).replace(/-/g, ""),
      tone: "-0.5",
    },
    {
      title: "EU Announces €150B Clean Technology Investment Fund",
      url: "https://ec.europa.eu/clean-tech-fund-2026",
      seendate: new Date(Date.now() - 12 * 3600000).toISOString().slice(0, 10).replace(/-/g, ""),
      tone: "2.1",
    },
  ];
}

function generateFallbackInflation(country: string): { value: number; historical: { month: string; value: number }[] } {
  const baseValues: Record<string, number> = { DE: 2.8, FR: 3.2, IT: 3.5, ES: 3.3, NL: 2.5 };
  const base = baseValues[country] || 2.8;
  const months = ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun"];
  return {
    value: base,
    historical: months.map((m, i) => ({
      month: m,
      value: base + Math.sin(i * 0.5) * 0.4,
    })),
  };
}

export const dataFetcher = new DataFetcher();
export default dataFetcher;
