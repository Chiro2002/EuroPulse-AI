# EuroPulse AI — Project Architecture

> **EuroPulse AI** is a fintech SaaS dashboard for European macro intelligence. Built with Next.js 14 App Router + TypeScript + Tailwind CSS. Designed for Deutsche Bank's C-suite and risk analysts.

---

## 1. Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript (strict) |
| **Styling** | Tailwind CSS + CSS custom properties |
| **Animations** | Framer Motion |
| **Charts** | Recharts (line, bar, composed, area) |
| **Maps** | react-simple-maps + d3-scale |
| **Icons** | lucide-react |
| **Tooltips** | react-tooltip |
| **AI** | Vertex AI (Gemini) / Groq (Llama 3 70B) with mock fallback |

**State:** All client-side via React `useState`/`useEffect`/`useMemo`/`useCallback`. No global state library.

---

## 2. Project Structure

```
eu-macro-intelligence/
├── src/
│   ├── app/                          # Next.js App Router — pages & API
│   │   ├── page.tsx                  # Dashboard (/) — home page
│   │   ├── news/page.tsx             # News Intelligence (/news)
│   │   ├── risk/page.tsx             # Risk & Stress Radar (/risk)
│   │   ├── forecast/page.tsx         # Forecast Engine (/forecast)
│   │   ├── simulator/page.tsx        # Scenario Simulator (/simulator)
│   │   ├── layout.tsx                # Root layout: TopBar + DBImpactPanel sidebar + main content
│   │   ├── globals.css               # CSS custom properties, .card class, keyframes, animations
│   │   └── api/                      # 6 API routes (one per page + sidebar)
│   │       ├── dashboard/route.ts
│   │       ├── news/route.ts
│   │       ├── risk/route.ts
│   │       ├── forecast/route.ts
│   │       ├── simulator/route.ts
│   │       └── sidebar/route.ts
│   ├── types/                        # Module declarations
│   │   └── react-simple-maps.d.ts
│   ├── components/
│   │   ├── layout/                   # Shared shell
│   │   │   ├── TopBar.tsx            # Fixed navbar: logo, 5 tabs, notifications, panel toggle
│   │   │   └── DBImpactPanel.tsx     # Right sidebar: AI insights, alert level, actions, warnings
│   │   ├── dashboard/                # Dashboard-specific
│   │   │   ├── CountryDetailDrawer.tsx
│   │   │   └── RiskOverviewCard.tsx
│   │   ├── news/                     # News Intelligence
│   │   │   ├── ExpandedNewsCard.tsx  # Compact clickable card → opens center modal
│   │   │   ├── TopThemesPanel.tsx    # Trending themes sidebar
│   │   │   └── AISummaryModal.tsx    # Daily brief modal
│   │   ├── risk/                     # Risk Radar
│   │   │   ├── CountryRiskTable.tsx  # Sortable country risk table
│   │   │   ├── RiskCountryDeepDive.tsx # Country detail with radar, breakdown, DB exposure
│   │   │   ├── SectorHeatmap.tsx     # Sector × country heatmap
│   │   │   └── StressTrendChart.tsx  # Historical risk trends
│   │   ├── forecast/                 # Forecast Engine
│   │   │   ├── ForecastCards.tsx     # 4 self-contained cards: Inflation, EUR/USD, Bonds, Recession
│   │   │   └── AIReasoningPipeline.tsx # AI Agent Chain (Data → Analysis → Forecast → Explainer)
│   │   ├── simulator/                # Scenario Simulator
│   │   │   ├── ShockSelector.tsx     # 5 premium shock pills + intensity slider
│   │   │   ├── ShockTransmissionFlow.tsx # 5-node cascade flow with animated connectors
│   │   │   └── DBImpactKPIs.tsx      # 3 KPI stat cards (Credit Risk, NII, Exposure)
│   │   └── shared/                   # Reusable across all pages
│   │       ├── EuropeMap.tsx         # Interactive SVG map with d3-scale coloring + custom tooltip
│   │       ├── AlertCard.tsx
│   │       ├── MetricCard.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── Skeleton.tsx          # 7 skeleton variants for loading states
│   ├── lib/
│   │   ├── types/index.ts            # ALL TypeScript interfaces (700+ lines)
│   │   ├── logic/                    # Business logic — pure TypeScript, no React
│   │   │   ├── forecastEngine.ts     # Factor-based macro forecasting (inflation, ECB, FX, bonds, recession)
│   │   │   ├── simulatorEngine.ts    # Scenario simulation engine with cascade modeling
│   │   │   ├── riskCalculator.ts     # Country risk scoring, aggregation, trend detection
│   │   │   ├── newsClassifier.ts     # News classification, theme extraction, DB relevance
│   │   │   └── sparklineGenerator.ts # Sparkline data generation
│   │   ├── ai/                       # AI integration layer
│   │   │   ├── provider.ts           # Unified AI provider (Vertex AI → Groq → Mock)
│   │   │   ├── gemini.ts             # Re-exports from provider (backward compat)
│   │   │   └── agents.ts             # 9 AI agents: sidebar insight, executive briefing, news impact, daily summary, country risk, forecast narrative, scenario narrative, scenario impact, DB actions
│   │   ├── services/
│   │   │   └── dataFetcher.ts        # Live API fetchers (ECB, GDELT, Yahoo Finance, Eurostat, Frankfurter)
│   │   └── data/                     # Static data + mock fallbacks
│   │       ├── countries.ts          # 10 EU countries with flags, codes, GDP
│   │       ├── scenarios.ts          # 10 scenario definitions with cascade steps
│   │       ├── riskData.ts           # Country risk factors per dimension
│   │       ├── dbPortfolio.ts        # DB portfolio exposures by country and department
│   │       └── mockData.ts           # Mock news, risk scores, scenarios
├── docs/ai/                          # Per-page AI documentation
│   ├── README.md                     # Shared AI architecture & provider setup
│   ├── dashboard-ai.md
│   ├── news-ai.md
│   ├── risk-radar-ai.md
│   ├── forecast-ai.md
│   └── simulator-ai.md
├── ARCHITECTURE.md                   # This file
├── ai_usage.md                       # Quick reference for AI system
├── AGENTS.md                         # Agent configuration
├── tailwind.config.ts
├── postcss.config.mjs
├── next.config.mjs
├── components.json                   # UI component config
├── tsconfig.json
├── eslint.config.mjs
└── package.json
```

---

## 3. Architecture Overview

### 3.1 Data Flow Pattern

```
User Action (click, load)
    │
    ▼
Page Component (client component)
    │
    ├─→ fetch("/api/{page}?params")
    │       │
    │       ▼
    │   API Route (route.ts)
    │       │
    │       ├─→ Data Layer: dataFetcher.ts (live APIs) → fallback to mockData.ts
    │       │       └─→ Real APIs: ECB SDW, GDELT News, Yahoo Finance, Eurostat, Frankfurter
    │       │
    │       ├─→ Logic Layer: forecastEngine.ts / simulatorEngine.ts / riskCalculator.ts
    │       │
    │       └─→ AI Layer (optional): agents.ts → provider.ts → Vertex AI / Groq / Mock
    │               └─→ Generates narrative, insights, actions
    │
    ▼
Render Component Tree (with Framer Motion animations)
    │
    └─→ Right Sidebar: DBImpactPanel (fetches /api/sidebar separately)
        ├─ Alert Level (green/yellow/orange/red)
        ├─ "What This Means for DB" — AI summary
        ├─ Department Impact Cards (2-3)
        ├─ Early Warnings (2-3)
        └─ Recommended Actions (2-3)
```

### 3.2 Page Layout Structure

```
┌──────────────────────────────────────────────────────┐
│  TopBar (fixed, z-40, h-14)                          │
│  Logo | [Dashboard][News][Risk][Forecast][Simulator]  │
│  Search | Notifications | Alert badge | Panel toggle │
├───────────────────────────────────────┬──────────────┤
│                                       │              │
│   MAIN CONTENT AREA (scrollable)      │ Right        │
│                                       │ Sidebar      │
│   • Each page has its own layout      │ (320px,      │
│   • Framer Motion entry animations    │  slide in/   │
│   • Cards / Charts / Tables / Maps    │  out)         │
│   • Loading skeletons + retry states  │              │
│                                       │ DBImpactPanel│
│                                       │              │
└───────────────────────────────────────┴──────────────┘
```

---

## 4. Per-Page Details

### 4.1 Dashboard (`/`)

| Aspect | Details |
|--------|---------|
| **API** | `GET /api/dashboard` — fetches live ECB, GDELT, Yahoo Finance, Eurostat data with mock fallback |
| **Key components** | `MetricTile` (inline), `EuropeMap.tsx`, `BriefStrip` (inline) |
| **Layout** | Status bar → 4 Metric Tiles (ECB Rate, EUR/USD, EU Inflation, Stress Score) → Market Pulse (4 columns: bonds, equities, FX, commodities) → Europe Map (left) + Top Events (right) → Executive Brief strip at bottom |
| **Map** | Interactive SVG Europe map with d3-scale coloring, custom floating tooltip on hover, click-to-open modal with country details |
| **AI in sidebar** | Alert level threshold from stress score, 5 prioritized intelligence items, 3 portfolio alerts, historical parallel with lesson |

### 4.2 News (`/news`)

| Aspect | Details |
|--------|---------|
| **API** | `GET /api/news` — fetches all data once; filtering/sorting is **client-side only** |
| **Key components** | `ExpandedNewsCard.tsx` (compact card → modal), `TopThemesPanel.tsx`, `AISummaryModal.tsx` |
| **Layout** | Header → Search + filter bar (country, topic chips, severity, timeframe, sort) → 3-col news feed (paginated 5/page) + 1-col sticky sidebar (themes, quick stats, time period) |
| **Detail modal** | Clicking any card opens a centered spring-animated modal with: What Happened, Why It Matters, Who's Affected, Market Reaction (5-dimension), DB Impact, Recommended Actions + "Simulate this scenario" link |
| **Logic** | `newsClassifier.ts` — classifies by event type, severity, DB relevance; extracts themes; filters/sorts entirely client-side |

### 4.3 Risk Radar (`/risk`)

| Aspect | Details |
|--------|---------|
| **API** | `GET /api/risk` — returns country risks, sector stress, historical trends |
| **Key components** | `EuropeMap.tsx`, `CountryRiskTable.tsx`, `RiskCountryDeepDive.tsx` |
| **Layout** | Page header → Main grid (3-col left: dimension selector + map + table | 2-col right: country deep dive with radar, breakdown, DB exposure integrated in header) |
| **Map** | Dimension selector toggles map coloring (All, Infl., Ener., Debt, Geo.) |
| **Deep dive** | Sticky right panel shows: DB exposure integrated into header card with horizontal bars for top departments, radar chart, risk breakdown with progress bars |

### 4.4 Forecast (`/forecast`)

| Aspect | Details |
|--------|---------|
| **API** | `GET /api/forecast?countries=...&horizon=...` — API used for sidebar insights; cards use **self-contained mock data** |
| **Key components** | `ForecastCards.tsx` (4 cards), `AIReasoningPipeline.tsx` |
| **Layout** | Header (horizon toggles: 1Q/2Q/1Y + country toggles) → 2×2 card grid (Inflation Direction, EUR/USD Movement, Bond Yield Pressure, Stagflation Risk) → AI Agent Chain (4 connected nodes) + Right sidebar with Mode Switch (Base/Risk/Opportunity), Summary, Key Takeaway, Recommended Action |
| **Each card** | Icon in tinted circle + title + subtitle + confidence pill (with AI badge) → Recharts chart with solid actual line, dotted forecast, confidence band, legend → "Key Drivers" section with 3 bullet lines with icons + caption |
| **AI Agent Chain** | Data Agent → Analysis Agent → Forecast Agent → Explainer Agent, connected by animated gradient arrows with pulsing dots |
| **Logic** | `forecastEngine.ts` — factor-based models for inflation, ECB, EUR/USD, bonds, recession probability (6-signal weighted) |

### 4.5 Simulator (`/simulator`)

| Aspect | Details |
|--------|---------|
| **API** | `GET /api/simulator?scenario=...` or custom POST — runs `simulatorEngine.ts` |
| **Key components** | `ShockSelector.tsx`, `ShockTransmissionFlow.tsx`, `DBImpactKPIs.tsx` |
| **Layout (initial)** | Preset scenario cards (5-column grid) + Custom Scenario Builder (collapsible sliders) |
| **Layout (results)** | Result header (intensity slider + horizon toggles) → Main grid (3-col left: ShockSelector + ShockTransmissionFlow + DBImpactKPIs | 2-col right: action sidebar) |
| **Section 1: ShockSelector** | 5 premium pill buttons (Oil Price Spike, War Escalation, ECB Rate, EU Recession, Currency Weakening) with icons + intensity slider (-20% to +40%) with tick marks, floating value label, caption |
| **Section 2: ShockTransmissionFlow** | 5 connected numbered boxes (Oil → Inflation → ECB → Mortgages → DB Lending Risk) with severity colors, animated arrows, AI badges on connectors |
| **Section 3: DBImpactKPIs** | 3 KPI stat cards: Credit Risk (+18 bps), Net Interest Income (-1.2%), Exposure at Risk (€8.6B) with colored values, trend indicators, impact pills |
| **Logic** | `simulatorEngine.ts` — runs scenario definitions through factor-based model, scaling by intensity/time, computing country sensitivity, DB business line P&L |

---

## 5. AI Layer

### 5.1 Provider Architecture

```
src/lib/ai/provider.ts (unified entry point)
    │
    ├─ Priority 1: Vertex AI (Gemini) — requires GCP_PROJECT_ID + GCP_LOCATION
    │
    ├─ Priority 2: Groq (Llama 3 70B) — requires GROQ_API_KEY
    │
    └─ Priority 3: Mock AI — uses live data to generate dynamic insights locally
```

**Key function:** `generateStructuredResponse<T>(systemPrompt, userPrompt, schema) → T`

- **Temperature:** 0.1 (deterministic)
- **Max tokens:** 1024
- All providers return the same shape

### 5.2 AI Agents (`src/lib/ai/agents.ts`)

| Agent | Purpose | Input |
|-------|---------|-------|
| `generateSidebarInsight(page, news, riskScores, liveData)` | Right sidebar insight per page | Page name + all hero section data |
| `generateExecutiveBriefing(liveData)` | Dashboard executive briefing | ECB rate, EUR/USD, Brent, Stoxx, inflation + GDELT news |
| `analyzeNewsImpact(newsItem)` | DB relevance scoring for single news | Single news item |
| `generateDailyNewsSummary(news)` | AI news summary (3 sentences) | Top 5 news items |
| `generateForecastNarrative(forecastData)` | Forecast story text | Full forecast data |
| `generateScenarioNarrative(result)` | Simulation narrative | Full simulation result |
| `generateDBActions(result)` | Scenario DB actions | Simulation result with P&L |
| `analyzeScenarioImpact(scenario)` | Scenario-specific DB impact | Scenario definition |
| `explainCountryRisk(countryData)` | Country risk explanation | Country risk breakdown |

### 5.3 Prompt Structure

Each prompt follows a strict 3-part structure optimized for low tokens:

1. **System prompt** — 1-liner role + instruction
2. **User prompt** — Compressed data as single-line JSON
3. **Schema** — Plain-text description of JSON output shape

No verbose instructions. No "written for C-suite" boilerplate.

---

## 6. Theme System

### 6.1 Color Classes

Defined in `src/app/globals.css` as CSS custom properties:

```css
:root {
  --primary: #0018A8;       /* Deutsche Bank blue */
  --accent: #1E5FD9;        /* Lighter blue */
  --text-primary: #1F2937;  /* Slate 800 */
  --text-secondary: #6B7280; /* Slate 500 */
  --border: #E5E7EB;        /* Gray 200 */
  --bg-page: #F7F9FB;       /* Page background */
}
```

### 6.2 Status Colors

| Meaning | Hex | Usage |
|---------|-----|-------|
| Positive / Low Risk | `#2FAE60` | Green indicators, up arrows for good |
| Warning / Medium Risk | `#F5A623` | Amber badges, caution states |
| Danger / High Risk | `#E5484D` | Red badges, critical alerts, down arrows |
| Info / Blue | `#3B82F6` | Primary chart color, info elements |

### 6.3 Card Pattern

Every card uses: `bg-white rounded-xl border border-border shadow-sm p-5` (wrapped as `.card` class in globals.css).

### 6.4 Skeleton Loading

7 skeleton variants in `src/components/shared/Skeleton.tsx`:

- `Skeleton` — basic div with pulse animation
- `SkeletonLine` — text-like line
- `SkeletonChart` — chart area placeholder
- `SkeletonCard` — generic card
- `SkeletonKPIInsight` — KPI insight bar
- `SkeletonForecastCard` — forecast chart card
- `SkeletonAvatar` — avatar circle

---

## 7. API Routes

| Route | Method | Key Params | Returns |
|-------|--------|------------|---------|
| `/api/dashboard` | GET | — | Full dashboard data (metrics, risks, events, market pulse, stress radar, executive briefing) |
| `/api/news` | GET | `countries`, `severity`, `topic`, `search`, `timeframe`, `sort` | Classified news items, themes, daily summary |
| `/api/risk` | GET | `countries`, `dimension` | Country risks, sector stress, historical trends, top insights |
| `/api/forecast` | GET | `countries`, `horizon`, `narrative` | Inflation, ECB, FX, bonds, recession, sectors, drivers + optional AI narrative |
| `/api/simulator` | GET/POST | `scenario`/custom params, `intensity`, `timeHorizon` | Full simulation result with cascade, comparison, country impacts, DB P&L |
| `/api/sidebar` | GET | `page` (dashboard/news/risk/forecast/simulator) | Page-specific sidebar insight (alert level, top insight, impact cards, actions, warnings) |

All routes use `export const dynamic = "force-dynamic"` with Cache-Control headers.

---

## 8. Mock Data Fallback Strategy

**API Layer (2-tier):**

1. **Try live APIs** (ECB, GDELT, Yahoo Finance, Eurostat via `dataFetcher.ts`)
2. **Fallback to mock data** (`mockData.ts`, `scenarios.ts`, `riskData.ts`, `countries.ts`)

**AI Layer (3-tier):**

1. **Try Vertex AI** (Gemini 1.5 Pro)
2. **Try Groq** (Llama 3 70B)
3. **Fallback to mock AI** (hardcoded `generateMock*` functions using live data values)

This ensures the dashboard always works without active API keys.

**Forecast Cards:** Use self-contained `useMemo`-based mock data generators — each card renders realistic macro trends without any API dependency.

---

## 9. How to Add a New Feature

1. **Add types** in `src/lib/types/index.ts`
2. **Add business logic** in `src/lib/logic/{feature}.ts`
3. **Add mock data** in `src/lib/data/`
4. **Create API route** at `src/app/api/{feature}/route.ts`
5. **Create components** in `src/components/{feature}/`
6. **Create page** at `src/app/{feature}/page.tsx`
7. **Register in TopBar** — add tab in `src/components/layout/TopBar.tsx`
8. **Add AI agent** in `src/lib/ai/agents.ts`
9. **Document prompts** in `docs/ai/{feature}-ai.md`
10. **Wire sidebar** — the `/api/sidebar` route sends hero-section data per page
