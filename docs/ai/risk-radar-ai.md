# 🛡️ Risk Radar — AI Intelligence

## What the Page Shows

| Component | Data Source | Purpose |
|-----------|-------------|---------|
| Country Risk Table | `CountryDetail[]` | Ranked country risk scores by 6 dimensions |
| Sector Heatmap | `SectorStressData` | Risk by sector × country (clickable cells) |
| Stress Trend Chart | `HistoricalTrend[]` | Risk score changes for top 5 countries |
| Risk Country Deep Dive | Full `CountryDetail` | Radar chart, risk breakdown, DB exposure, AI insight |

## Data Flow

```
Country risk data → riskCalculator.ts → Frontend renders
    • calculateCountryRisk()              │
    • calculateSectorStress()            ├─ Country Risk Table (sortable)
    • getRiskLevel()                     ├─ Sector Heatmap (color-coded)
    • calculateAggregateRisk()           ├─ Stress Trend Chart (line chart)
    • determineTrend()                   └─ Country Deep Dive (radar + breakdown)
                          │
                          ▼
              /api/sidebar?page=risk
                          │
                          ▼
              generateSidebarInsight("risk", ...)
                  → Alert level from risk scores
                  → Top insight on highest-risk countries
                  → Impact cards for sovereign trading, real estate
                  → Early warnings on secondary risk factors
```

## AI Agents

| Agent | File | Purpose |
|-------|------|---------|
| `explainCountryRisk(countryData)` | `agents.ts` | Generates 3-4 sentence explanation of country risk breakdown |
| `generateSidebarInsight("risk", ...)` | `agents.ts` | Page-level insight for sidebar panel |

## Sidebar Insight (Risk Context)

Receives: Country risk scores (sorted highest first), stress radar, DB exposure per country.

Returns insights focused on: highest-risk sovereign exposures, sector concentrations that could impact loan portfolios, contagion risks, and specific hedging recommendations.

## API Routes

- `GET /api/risk?dimension=...` — Returns country risks, sector stress, historical trends
- `GET /api/sidebar?page=risk` — Returns sidebar insight using same risk data
