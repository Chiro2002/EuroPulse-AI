# 🇪🇺 EuroPulse AI — EU Macro Intelligence Platform

> **Deutsche Bank Hackathon 2026** | AI-Powered Macroeconomic Risk Intelligence Platform

> 📘 **Full project documentation:** [`ARCHITECTURE.md`](ARCHITECTURE.md) — Architecture, file structure, data flow, AI layer, theme system, and per-page details

---

## 📋 Problem Statement

Deutsche Bank's macro risk analysts spend hours each day manually monitoring macroeconomic news, reviewing country risk indicators, and assessing how geopolitical events affect the bank's €600B+ EU portfolio. Existing tools are fragmented — analysts toggle between Bloomberg terminals, internal risk dashboards, and news aggregators to piece together a coherent picture.

**The result:** Slower response times to emerging risks, missed correlations between events, and increased exposure during volatile periods.

## 💡 Solution Overview

EuroPulse AI is an **enterprise-grade AI-powered risk intelligence platform** that consolidates macroeconomic monitoring, risk assessment, forecasting, and scenario simulation into a single, intelligent workspace. The platform:

1. **🔍 Monitors** — Real-time macroeconomic data from ECB, Eurostat, GDELT, and market feeds
2. **📊 Analyzes** — Multi-factor risk scores across 10 EU countries with trend detection
3. **🔮 Forecasts** — AI-augmented macro predictions with confidence bands and driver analysis
4. **🧪 Simulates** — Intelligent scenario modeling with cascade effect propagation
5. **🧠 Advises** — Context-aware AI insights with quantified DB portfolio impact

---

## ✨ Key Features

| Page | Purpose | Key Components |
|------|---------|---------------|
| **Dashboard** | Real-time macro snapshot | ECB/EUR/USD/Inflation/Stress tiles, Market Pulse, Europe risk heatmap, Top Events, Executive Briefing |
| **News Intelligence** | AI-classified news feed | Filterable cards with center-detail modal, theme extraction, DB relevance scoring, daily AI brief |
| **Risk & Stress Radar** | Multi-factor country risk | Interactive Europe map (dimension toggles), sortable country table, deep dive with radar + DB exposure |
| **Forecast Engine** | AI-augmented predictions | 2×2 self-contained chart cards (Inflation, EUR/USD, Bonds, Recession), AI Agent Chain pipeline, mode-switch sidebar |
| **Scenario Simulator** | Macro shock simulation | 5 premium shock selectors, intensity slider, cascade transmission flow, DB Impact KPI cards, action checklist sidebar |

---

## 📘 Full Architecture Docs

Comprehensive documentation covering the entire project is available in **[`ARCHITECTURE.md`](ARCHITECTURE.md)**:

- **Project structure** — Every file and folder explained
- **Data flow pattern** — User → API → Logic → AI → Render
- **Page layouts** — Dashboard, News, Risk, Forecast, Simulator
- **AI layer** — Provider architecture (Vertex AI → Groq → Mock), 9 agents, prompt optimization
- **Theme system** — Colors, statuses, card patterns, skeleton components
- **API routes** — All 6 endpoints with params and return types
- **How to add a feature** — 10-step process
- **Mock data fallback** — 2-tier API + 3-tier AI fallback strategy

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS 3 + CSS custom properties |
| **Charts** | Recharts (line, bar, composed, area) |
| **Maps** | react-simple-maps + d3-geo + d3-scale |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **AI** | Google Cloud Vertex AI (Gemini 1.5 Pro) / Groq (Llama 3) with mock fallback |

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         EuroPulse AI                                  │
├───────────────────────────────────────┬──────────────────────────────┤
│                                       │                              │
│   MAIN CONTENT AREA                   │  Right Sidebar (320px)       │
│   (scrollable, per-page layout)       │                              │
│                                       │  DBImpactPanel               │
│   Dashboard: Metrics → Market Pulse   │  ├─ Alert Level              │
│     → Map + Events → Executive Brief  │  ├─ "What This Means for DB" │
│                                       │  ├─ Department Impact Cards  │
│   News: Filters → Paginated Cards     │  ├─ Early Warnings           │
│     → Detail Modal (center popup)     │  └─ Recommended Actions      │
│                                       │                              │
│   Risk: Map w/ dimension toggle       │  Fetched from /api/sidebar   │
│     → Table → Country Deep Dive       │  per current page             │
│                                       │                              │
│   Forecast: 2×2 Cards → AI Agent Chain│                              │
│     + Mode Switch Sidebar             │                              │
│                                       │                              │
│   Simulator: ShockSelect → Transmit   │                              │
│     Flow → DB Impact KPIs + Actions   │                              │
│                                       │                              │
└───────────────────────────────────────┴──────────────────────────────┘
         │                    │
         ▼                    ▼
   ┌────────────────────────────────────────────┐
   │               Data Layer                    │
   │  ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
   │  │ Live APIs│ │  Logic   │ │  AI Layer   │ │
   │  │ ECB/GDELT│ │  Engines │ │ Gemini/Groq │ │
   │  │ Yahoo/EU │ │  + Mock  │ │  + Mock AI  │ │
   │  └──────────┘ └──────────┘ └─────────────┘ │
   └────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm 9+

### Installation

```bash
git clone <repo-url>
cd EuroPulse-AI
npm install
npm run dev
# → http://localhost:3000
```

The app works out of the box with mock data. AI features require API keys (optional).

### Environment Variables

```bash
# Required for AI features (app works with mock data without these)
GCP_PROJECT_ID=your-gcp-project-id
GCP_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./path/to/service-account-key.json
GROQ_API_KEY=your-groq-api-key
```

---

## 📸 Page Previews

| Page | Description |
|------|-------------|
| **Dashboard** | ECB Rate, EUR/USD, Inflation, Stress tiles → Market Pulse (4 columns) → Europe risk heatmap + Top Events → Executive Brief |
| **News** | Search + filters → 5 cards/page with pagination → Click any card for center modal with full analysis → Daily AI Brief modal |
| **Risk** | Interactive map with dimension toggle → Sortable country risk table → Country deep dive with radar + DB exposure bars |
| **Forecast** | 2×2 chart cards (Inflation, EUR/USD, Bond Yields, Recession) → AI Agent Chain → Mode-switch sidebar (Base/Risk/Opportunity) |
| **Simulator** | Preset scenarios → Results: Shock selector + Transmission flow + DB Impact KPIs + Action checklist sidebar |

---

## 👥 Team

**Deutsche Bank Hackathon 2026** — Built with ❤️ by the EuroPulse AI Team

## 📄 License

All rights reserved. Created for the Deutsche Bank Hackathon 2026.
