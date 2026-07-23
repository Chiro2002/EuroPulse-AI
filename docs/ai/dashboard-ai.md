# 📊 Dashboard — AI Intelligence

## Data Flow

```
Live APIs / Mock Data → /api/dashboard
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                  ▼
  generateExecutiveBriefing()  generateSidebarInsight()   Frontend renders
  (dashboard page)             (sidebar)                  (metrics, map, events)
```

## What the Hero Section Shows

| Component | Data | Purpose |
|-----------|------|---------|
| 4 Metric Tiles | ECB Rate, EUR/USD, Brent, Stoxx, Inflation, Stress Score | Key macro snapshot |
| Europe Heatmap | Country risk scores + live inflation boost | Country risk visualization |
| Market Pulse | Bond yields, equities, FX, commodities | Real-time market overview |
| Top Events | GDELT news + briefing intelligence | Key developments |

## AI Agent: Executive Briefing Generator

**File**: `src/lib/ai/agents.ts` → `generateExecutiveBriefing(liveData)`

Receives live market data and generates a structured `ExecutiveBriefing`:
- `briefingId`, `criticalityLevel` (routine/elevated/urgent/crisis), `headline`
- `keyIntelligence[]` — 5 prioritized insights with evidence, implication, confidence, source count
- `marketRegime` — risk_on/risk_off/uncertain/transitional with drivers
- `portfolioAlerts[]` — per-business-line alerts (risk/opportunity/monitor)
- `historicalParallel` — closest historical analog with similarity score and lesson
- `toWatch[]` — upcoming events with dates and significance
- `confidenceStatement` — what the AI is sure/unsure about

**Fallback**: `generateMockExecutiveBriefing()` uses actual live data values (inflation trend, ECB rate) to generate realistic context-aware insights.

## AI Agent: Sidebar Insight Generator

**File**: `src/lib/ai/agents.ts` → `generateSidebarInsight("dashboard", ...)`

The sidebar receives the **same live data** shown in the hero section:

| Hero Data | Passed to Sidebar AI |
|-----------|---------------------|
| ECB Rate card → `ecbRate` | Impact on bond portfolio, NIM compression |
| EUR/USD card → `eurUsd` | FX translation risk, hedge recommendations |
| Brent Oil card → `brentCurrent` | Energy sector loan exposure |
| Euro Stoxx 50 card → `stoxxCurrent` | Wealth management AUM impact |
| EU Inflation card → `inflation` | ECB path timing |
| Heatmap → `countryRisks[]` | Highest-risk sovereign exposure |
| Market Pulse → `stressRadar` | Alert level determination |
| Top Events → `topEvents[]` | Event-driven risk assessment |

**Fallback**: `generateMockSidebarInsight()` uses actual ECB rate, EUR/USD, Brent, Stoxx, and inflation values to compute alert thresholds dynamically (e.g., stress > 65 = red alert). Country-specific insights reference the actual highest-risk country from live data.

## API Routes

- `GET /api/dashboard` — Returns `DashboardData` with metrics, briefing, market pulse, events
- `GET /api/sidebar?page=dashboard` — Returns `SidebarInsight` using same live data
