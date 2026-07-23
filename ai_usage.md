# 🎯 EuroPulse AI — Intelligence System

> **This file has been split into per-page docs. See `docs/ai/` for the full breakdown.**

## Quick Reference

| Page | AI Doc | What It Covers |
|------|--------|----------------|
| **All** | [`docs/ai/README.md`](docs/ai/README.md) | Shared APIs, data fetching, decision memory, output standards |
| **Dashboard** | [`docs/ai/dashboard-ai.md`](docs/ai/dashboard-ai.md) | Executive briefing, sidebar insight from live market data |
| **News** | [`docs/ai/news-ai.md`](docs/ai/news-ai.md) | News classifier, enrichment, DB decision pipeline |
| **Risk Radar** | [`docs/ai/risk-radar-ai.md`](docs/ai/risk-radar-ai.md) | Risk narrative, correlation detection, early warning system |
| **Forecast** | [`docs/ai/forecast-ai.md`](docs/ai/forecast-ai.md) | Probabilistic forecast, narrative synthesis, conviction trades |
| **Simulator** | [`docs/ai/simulator-ai.md`](docs/ai/simulator-ai.md) | Scenario architect, DB impact quantification, board-ready reports |

## Architecture

Every page follows this pattern:

```
Hero Section (page data)
       │
       ▼
  /api/sidebar?page=<current-page>
       │ (fetches same live data as the hero section)
       ▼
  generateSidebarInsight(page, news, riskScores, liveData)
       │
       ▼
  DBImpactPanel displays:
    • Alert Level
    • "What This Means for DB" summary
    • Department Impact Cards
    • Early Warnings
    • Recommended Actions
```

The sidebar AI receives **the exact same data** that the hero section of each page displays — not mock data. This ensures insights are always relevant and data-driven.

## The Selling Point

> **"We built the world's first AI decision intelligence platform for European banks. Where others show data, we generate board-ready analysis. Where others predict, we quantify confidence with historical track records. Where others alert, we produce specific actions with expected P&L impact. This is what a bank actually needs — not a dashboard, but a decision engine that remembers, learns, and continuously improves."**
