# 🎮 Simulator — AI Intelligence

## What the Page Shows

| Component | Data Source | Purpose |
|-----------|-------------|---------|
| Preset Scenario Cards | Scenario library (10 presets) | Selectable macro shock scenarios with severity ratings |
| Custom Scenario Builder | User-configured sliders | Oil, ECB, EUR/USD, gas, geopolitical custom params |
| **ShockSelector** | Interactive state | 5 premium pill buttons (Oil/Price Spike, War Escalation, ECB Rate, EU Recession, Currency Weakening) + intensity slider (-20% to +40%) |
| **ShockTransmissionFlow** | Hardcoded mock data | 5 connected numbered boxes (Oil → Inflation → ECB → Mortgages → DB Lending Risk) with severity colors and animated arrows |
| **DBImpactKPIs** | Hardcoded mock data | 3 KPI stat cards: Credit Risk (+18 bps), Net Interest Income (-1.2%), Exposure at Risk (€8.6B) |
| Action Sidebar | Generated from simulation | Summary + Action Checklist (IMMEDIATE/SHORT_TERM/MONITORING) + Recommended Action |

## Data Flow

```
User selects preset → simulatorEngine.ts → SimulationResult
    • runSimulation()
    • runCustomSimulation()

    ↓

Premium Results View:
    ├─ Section 1: ShockSelector (interactive pills + slider)
    │     Note: Currently visual only — swapping shock or adjusting
    │     slider does NOT re-run the simulation. Prop structure is
    │     clean for wiring in real calc logic later.
    │
    ├─ Section 2: ShockTransmissionFlow
    │     Hardcoded data matching "Oil +20%" scenario.
    │     Color-coded by severity (high=red, medium=amber).
    │
    ├─ Section 3: DBImpactKPIs
    │     Three KPI cards with colored values + impact pills.
    │
    └─ Sidebar: Actions generated from simulation P&L
          ├─ IMMEDIATE actions (red left border)
          ├─ SHORT_TERM actions (amber left border)
          └─ Recommended Action (green check)
```

## Sidebar Insight

The sidebar shows:

- **Summary** — First 180 chars of the AI narrative describing the simulated shock sequence
- **Action Checklist** — Actions grouped by category with severity-colored borders
  - IMMEDIATE (red) — up to 2 items: provisioning, hedging
  - SHORT_TERM (amber) — 1 item: stress testing, client outreach
- **Recommended Action** — 2 top-priority actions with green checkmarks

## Fallback Logic

Mock AI functions use **actual simulation result data**:
- `generateMockNarrative()` — Uses real scenario name, P&L numbers, cascade steps, country impacts
- `generateMockActions()` — Generates 6 actions with amounts proportional to actual total P&L

## API Routes

- `GET /api/simulator?scenario=...&intensity=...&timeHorizon=...` — Returns full simulation result
- `POST /api/simulator` — Custom simulation with body params
- `GET /api/sidebar?page=simulator` — Returns sidebar insight
