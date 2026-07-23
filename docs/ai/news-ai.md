# 📰 News — AI Intelligence

## What the Page Shows

| Component | Data Source | Purpose |
|-----------|-------------|---------|
| News Feed | `ClassifiedNews[]` | Scored, categorized news items with expand/collapse |
| Top Themes Panel | `NewsTheme[]` | Trending topics extracted from classified items |
| Search + Filters | Severity, country, topic, timeframe | User-driven filtering |
| AI Summary Modal | Generated summary text | Daily news brief |

## Data Flow

```
News items → newsClassifier.ts → ExpandedNewsCard renders
    classifyAllNews()                │
    → severity, topic, DB relevance  ├─ Collapsed: headline, severity, topic, DB badge
    → themes extraction              ├─ Expanded: what happened, why it matters,
    → DB impact analysis              │  who's affected, market reaction, DB impact,
                                      │  recommended actions
                                      └─ Simulate this button → /simulator
```

## How News Classification Works

All news classification runs client-side via `src/lib/logic/newsClassifier.ts`:

1. **Severity classification** — Maps raw `severity` to topic labels (monetary_policy, geopolitical, energy, etc.)
2. **DB relevance scoring** — Hybrid scoring: topic weight × severity multiplier × country relevance
3. **Theme extraction** — Groups classified items by topic to identify trending themes
4. **Timeline bucketing** — News items grouped by occurrence time for the timeline visualization

## AI Agents

| Agent | File | Purpose |
|-------|------|---------|
| `analyzeNewsImpact(newsItem)` | `agents.ts` | DB relevance score (0-100), affected departments, suggested actions |
| `generateDailyNewsSummary(news)` | `agents.ts` | 3-sentence summary: top event, key theme, what to watch |

## Sidebar Insight

The sidebar (`/api/sidebar?page=news`) receives:
- Top 3 news items by severity
- Current themes
- Daily summary text

Returns: Alert level, top insight on news landscape, department impact cards, early warnings on emerging themes, and recommended actions.

## API Routes

- `GET /api/news?countries=...&severity=...&topic=...` — Returns classified news items, themes
- `GET /api/sidebar?page=news` — Returns sidebar insight
