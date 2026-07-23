# 🎯 EuroPulse AI — Intelligence System

Each page feeds its hero-section data into a unified AI agent that generates the right-sidebar insights.

---

## 📄 Per-Page AI Docs

| Page | File | Hero Section Feeds Sidebar With |
|------|------|---------------------------------|
| **Dashboard** | [`dashboard-ai.md`](./dashboard-ai.md) | ECB Rate, EUR/USD, Brent, Stoxx, Inflation, Stress Radar, Country Risks, Top Events |
| **News** | [`news-ai.md`](./news-ai.md) | Classified news items, top themes, daily summary |
| **Risk Radar** | [`risk-radar-ai.md`](./risk-radar-ai.md) | Country risk scores, DB exposure, sector stress |
| **Forecast** | [`forecast-ai.md`](./forecast-ai.md) | API data for mode-switch sidebar (Base/Risk/Opportunity); cards use self-contained mock data |
| **Simulator** | [`simulator-ai.md`](./simulator-ai.md) | Simulation results, cascades, shock selection, DB P&L |

---

## 🔗 Sidebar Architecture

All pages share a common right-sidebar (`DBImpactPanel`) that displays AI-generated insights:

```
Hero Section (page data) → /api/sidebar?page=<current-page>
    → generateSidebarInsight(page, news, riskScores, liveData)
    → DBImpactPanel renders:
        • Alert Level (green/yellow/orange/red)
        • "What This Means for DB" — 1-paragraph AI summary
        • Department Impact Cards (2-3 with quantified € exposure)
        • Early Warnings (2-3 emerging risks)
        • Recommended Actions (2-3 concrete steps)
```

**The sidebar receives the same live data shown in the hero section** — not mock data. This ensures insights are always relevant.

---

## 🤖 AI Provider Architecture

```
src/lib/ai/provider.ts (unified entry point)
    │
    ├─ Priority 1: Vertex AI (Gemini 1.5 Pro) — requires GCP_PROJECT_ID + GCP_LOCATION
    │
    ├─ Priority 2: Groq (Llama 3.3 70B) — requires GROQ_API_KEY
    │
    └─ Fallback: Mock AI — uses live data to generate dynamic insights locally
```

- **Temperature**: 0.1 (deterministic JSON outputs)
- **Max tokens**: 1024
- **All providers return the same schema** — components don't know which provider is active

---

## 🧠 AI Agents (`src/lib/ai/agents.ts`)

| Agent | Purpose | Mock Fallback |
|-------|---------|---------------|
| `generateSidebarInsight(page, news, riskScores, liveData)` | Right sidebar insight per page | Uses live data (ECB rate, EUR/USD, Brent) for dynamic realistic insights |
| `generateExecutiveBriefing(liveData)` | Dashboard executive briefing | Calculates inflation trend direction from real historical data |
| `analyzeNewsImpact(newsItem)` | DB relevance scoring for single news | Returns default 70/100 score |
| `generateDailyNewsSummary(news)` | AI news summary banner | Summarizes top headline |
| `generateForecastNarrative(forecastData)` | Forecast story text | Generates narrative from mock data |
| `generateScenarioNarrative(result)` | Simulation narrative | Builds narrative from actual simulation results |
| `generateDBActions(result)` | Scenario DB actions | Generates 6-8 actions based on simulation P&L |
| `analyzeScenarioImpact(scenario)` | Scenario-specific DB impact | Returns estimated loss from scenario definition |
| `explainCountryRisk(countryData)` | Country risk explanation | Identifies top 2 risk drivers from breakdown |

---

## 🎨 Prompt Optimization Strategy

Every prompt follows a strict low-token structure:

1. **System prompt** — 1-liner: `"Senior risk analyst at Deutsche Bank."`
2. **User prompt** — Single-line compressed data: `ECB 3.75%, EUR/USD 1.1408, Brent $93`
3. **Schema** — Plain-text description of JSON output shape

No verbose role descriptions. No "written for C-suite" boilerplate. No pretty-printed JSON.

---

## 📡 External API Reference

| API | Endpoint | Key Status |
|-----|----------|------------|
| **ECB SDW** | `https://data-api.ecb.europa.eu/service/data/` | Free, no key |
| **Eurostat** | `https://ec.europa.eu/eurostat/api/dissemination/` | Free, no key |
| **Frankfurter (FX)** | `https://api.frankfurter.app/` | Free, no key |
| **Yahoo Finance** | `https://query1.finance.yahoo.com/v8/finance/chart/` | Free, no key |
| **GDELT Project** | `https://api.gdeltproject.org/api/v2/doc/doc` | Free, no key |
| **EIA API** | `https://api.eia.gov/` | Free with key |
| **World Bank** | `https://api.worldbank.org/v2/` | Free, no key |
