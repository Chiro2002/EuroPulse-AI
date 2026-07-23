# 🔮 Forecast — AI Intelligence

## What the Page Shows

| Component | Data Source | Purpose |
|-----------|-------------|---------|
| Inflation Direction Card | **Self-contained mock data** | Line chart: 9.2% declining to 2.5%, forecast uptick to 2.8%. Confidence band, 3 key drivers |
| EUR/USD Movement Card | **Self-contained mock data** | Line chart: 1.04 rising to 1.082, forecast to 1.12. Range stats, volatility, 3 key drivers |
| Bond Yield Pressure Card | **Self-contained mock data** | Multi-line chart: DE/FR/IT yields with dotted forecasts. Current yield strip, IT-DE spread |
| Stagflation Risk Card | **Self-contained mock data** | Recession probability line chart + country bar breakdown. Recession signal indicators |
| AI Agent Chain | N/A | Visual pipeline: Data → Analysis → Forecast → Explainer agents with animated connectors |
| Mode Switch Sidebar | Live API data | Base Case / Risk View / Opportunity view with summary, key takeaway, and recommended actions |

**Important:** The 4 forecast cards use `useMemo`-based mock data generators with realistic macro trend shapes. They do NOT depend on the API response. The API fetch runs in the background solely to power the Mode Switch sidebar.

## Data Flow

```
API (forecastEngine.ts) ──┬──→ Mode Switch Sidebar
                          │       ├─ Base Case summary
                          │       ├─ Risk View summary
                          │       └─ Opportunity summary
                          │
                          └── (Card data is self-contained)
```

## AI Agent Chain

The bottom strip shows a 4-stage AI processing pipeline:

1. **Data Agent** (database icon) — "Collects real-time economic data"
2. **Analysis Agent** (brain icon) — "Detects patterns and signals"
3. **Forecast Agent** (trending-up icon) — "Generates probabilistic forecasts"
4. **Explainer Agent** (chat bubble icon) — "Explains drivers and potential outcomes"

Each node has a glowing blue-tinted circle, pulsing dot, title, and description. Animated gradient connectors with traveling dots link the stages.

## Mode Switch Sidebar

Three modes toggle the sidebar content:

| Mode | Color | Description |
|------|-------|-------------|
| **Base Case** | Blue | Most likely macro trajectory — expected ECB cuts, inflation path, EUR/USD outlook |
| **Risk View** | Red | Downside risks — recession probability, BTP spread widening, industrial contraction |
| **Opportunity** | Green | Upside potential — duration extension, relative value, loan origination |

Each mode shows: Summary, Key Takeaway, and Recommended Actions.

## API Routes

- `GET /api/forecast?countries=DE,FR,...&horizon=quarterly` — Returns forecast data (used for sidebar mode insights)
- `GET /api/sidebar?page=forecast` — Returns sidebar insight using forecast data
