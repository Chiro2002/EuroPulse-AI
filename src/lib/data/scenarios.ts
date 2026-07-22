import { ScenarioDefinition } from "../types";

export const SCENARIO_DEFINITIONS: ScenarioDefinition[] = [
  {
    id: "oil_spike_20pct",
    name: "Oil Price Spike (+20%)",
    icon: "🛢️",
    description: "Sudden 20% increase in Brent oil prices due to geopolitical disruption in the Middle East",
    historicalPrecedent: "Q1 2022 following Russia-Ukraine invasion",
    severity: 7,
    directEffects: {
      inflation: 0.6,
      eur_usd: -1.5,
      gas_price: 15,
      consumer_confidence: -5,
      brent_oil: 20,
      equity_markets: -3,
    },
    secondaryEffects: {
      ecb_rate_response: 0.0,
      gdp_impact: -0.3,
      unemployment: 0.2,
      mortgage_rates: 0.1,
      bond_yields: 0.15,
      italian_spread: 0.2,
    },
    tertiaryEffects: {
      housing_demand: -3,
      consumer_spending: -2,
      corporate_margins: -4,
    },
    countrySensitivity: {
      DE: 1.2, IT: 1.3, FR: 0.9, NL: 1.1, ES: 1.0, PL: 1.4,
      BE: 1.1, AT: 1.15, PT: 1.05, IE: 0.95,
    },
    dbImpact: {
      corporate_lending: {
        direction: "negative", magnitude: "moderate", pnl_estimate: -450,
        reason: "Energy-dependent corporate clients face margin pressure"
      },
      mortgage_book: {
        direction: "slightly_negative", magnitude: "mild", pnl_estimate: -80,
        reason: "Rates stay higher, prepayment slows, affordability decreases"
      },
      trading: {
        direction: "positive", magnitude: "moderate", pnl_estimate: 120,
        reason: "Increased volatility benefits trading revenue"
      },
      treasury: {
        direction: "negative", magnitude: "moderate", pnl_estimate: -180,
        reason: "Bond portfolio mark-to-market losses"
      },
      net_interest_income: {
        direction: "positive", magnitude: "mild", pnl_estimate: 90,
        reason: "Higher-for-longer rate environment supports NIM"
      },
    },
    cascadeSteps: [
      { step: 1, event: "Oil prices spike +20%", type: "trigger", delay: "immediate" },
      { step: 2, event: "Energy costs rise across EU", type: "direct", delay: "days" },
      { step: 3, event: "Inflation increases +0.6pp", type: "direct", delay: "weeks" },
      { step: 4, event: "ECB delays rate cuts", type: "secondary", delay: "weeks" },
      { step: 5, event: "Mortgage rates remain elevated", type: "secondary", delay: "months" },
      { step: 6, event: "Consumer spending weakens", type: "tertiary", delay: "months" },
      { step: 7, event: "Manufacturing margins compressed", type: "tertiary", delay: "months" },
      { step: 8, event: "DB corporate lending stress increases", type: "bank_impact", delay: "ongoing" },
    ],
  },
  {
    id: "oil_spike_40pct",
    name: "Oil Price Spike (+40%)",
    icon: "🛢️",
    description: "Severe 40% surge in Brent oil prices driven by major Middle East supply disruption",
    historicalPrecedent: "1973 oil crisis, 1990 Gulf War spike",
    severity: 9,
    directEffects: {
      inflation: 1.4,
      eur_usd: -3.0,
      gas_price: 30,
      consumer_confidence: -12,
      brent_oil: 40,
      equity_markets: -8,
    },
    secondaryEffects: {
      ecb_rate_response: 0.25,
      gdp_impact: -0.8,
      unemployment: 0.5,
      mortgage_rates: 0.3,
      bond_yields: 0.4,
      italian_spread: 0.5,
    },
    tertiaryEffects: {
      housing_demand: -8,
      consumer_spending: -5,
      corporate_margins: -10,
    },
    countrySensitivity: {
      DE: 1.3, IT: 1.4, FR: 1.0, NL: 1.2, ES: 1.1, PL: 1.5,
      BE: 1.2, AT: 1.25, PT: 1.15, IE: 1.0,
    },
    dbImpact: {
      corporate_lending: {
        direction: "negative", magnitude: "severe", pnl_estimate: -1200,
        reason: "Widespread energy sector defaults, manufacturing recession"
      },
      mortgage_book: {
        direction: "negative", magnitude: "moderate", pnl_estimate: -350,
        reason: "Sharp affordability decline, rising arrears"
      },
      trading: {
        direction: "positive", magnitude: "severe", pnl_estimate: 350,
        reason: "Extreme volatility drives significant trading revenue"
      },
      treasury: {
        direction: "negative", magnitude: "severe", pnl_estimate: -500,
        reason: "Major bond portfolio losses, spread widening"
      },
      net_interest_income: {
        direction: "positive", magnitude: "moderate", pnl_estimate: 200,
        reason: "Rates remain elevated, NIM expands"
      },
    },
    cascadeSteps: [
      { step: 1, event: "Oil prices spike +40%", type: "trigger", delay: "immediate" },
      { step: 2, event: "Energy costs surge across EU", type: "direct", delay: "days" },
      { step: 3, event: "Inflation jumps +1.4pp", type: "direct", delay: "weeks" },
      { step: 4, event: "ECB forced to hike rates 25bp", type: "secondary", delay: "weeks" },
      { step: 5, event: "Mortgage rates spike, housing demand crashes", type: "secondary", delay: "months" },
      { step: 6, event: "Consumer spending collapses", type: "tertiary", delay: "months" },
      { step: 7, event: "Industrial recession spreads across EU", type: "tertiary", delay: "months" },
      { step: 8, event: "DB faces significant credit losses across energy portfolio", type: "bank_impact", delay: "ongoing" },
    ],
  },
  {
    id: "russia_escalation",
    name: "Russia-Ukraine Escalation",
    icon: "⚔️",
    description: "Major escalation of Russia-Ukraine conflict, NATO involvement, energy infrastructure destruction",
    historicalPrecedent: "Feb 2022 full-scale invasion, energy crisis",
    severity: 10,
    directEffects: {
      inflation: 1.8,
      eur_usd: -4.0,
      gas_price: 45,
      consumer_confidence: -18,
      brent_oil: 25,
      equity_markets: -12,
    },
    secondaryEffects: {
      ecb_rate_response: 0.5,
      gdp_impact: -1.5,
      unemployment: 1.0,
      mortgage_rates: 0.5,
      bond_yields: 0.6,
      italian_spread: 0.8,
    },
    tertiaryEffects: {
      housing_demand: -10,
      consumer_spending: -8,
      corporate_margins: -12,
    },
    countrySensitivity: {
      DE: 1.5, IT: 1.3, FR: 1.1, NL: 1.2, ES: 1.0, PL: 2.0,
      BE: 1.15, AT: 1.8, PT: 0.9, IE: 0.8,
    },
    dbImpact: {
      corporate_lending: {
        direction: "negative", magnitude: "severe", pnl_estimate: -1500,
        reason: "Widespread corporate defaults in CEE and energy-exposed sectors"
      },
      mortgage_book: {
        direction: "negative", magnitude: "moderate", pnl_estimate: -400,
        reason: "Housing market freeze, rising unemployment drives defaults"
      },
      trading: {
        direction: "positive", magnitude: "severe", pnl_estimate: 500,
        reason: "Extreme volatility across all asset classes"
      },
      treasury: {
        direction: "negative", magnitude: "severe", pnl_estimate: -700,
        reason: "Major bond losses, sovereign spread blowout"
      },
      net_interest_income: {
        direction: "positive", magnitude: "moderate", pnl_estimate: 250,
        reason: "ECB forced to hike, rates significantly higher"
      },
    },
    cascadeSteps: [
      { step: 1, event: "Russia-Ukraine conflict escalates dramatically", type: "trigger", delay: "immediate" },
      { step: 2, event: "Gas supply disrupted across CEE, prices surge", type: "direct", delay: "days" },
      { step: 3, event: "Inflation spikes +1.8pp, EUR collapses", type: "direct", delay: "weeks" },
      { step: 4, event: "ECB emergency meeting, forced hike to defend EUR", type: "secondary", delay: "days" },
      { step: 5, event: "Financial markets in turmoil, spreads blow out", type: "secondary", delay: "weeks" },
      { step: 6, event: "EU enters recession, unemployment rises", type: "tertiary", delay: "months" },
      { step: 7, event: "Corporate defaults surge across energy and manufacturing", type: "tertiary", delay: "months" },
      { step: 8, event: "DB CEE and energy portfolio under severe stress", type: "bank_impact", delay: "ongoing" },
    ],
  },
  {
    id: "ecb_emergency_cut",
    name: "ECB Emergency Rate Cut (-75bp)",
    icon: "📉",
    description: "ECB delivers emergency 75bp inter-meeting rate cut as growth collapses and deflation risks emerge",
    historicalPrecedent: "March 2020 COVID emergency, 2008 GFC cuts",
    severity: 6,
    directEffects: {
      inflation: -0.3,
      eur_usd: -3.0,
      gas_price: -5,
      consumer_confidence: 8,
      brent_oil: -5,
      equity_markets: 5,
    },
    secondaryEffects: {
      ecb_rate_response: -0.75,
      gdp_impact: 0.5,
      unemployment: -0.3,
      mortgage_rates: -0.6,
      bond_yields: -0.4,
      italian_spread: 0.3,
    },
    tertiaryEffects: {
      housing_demand: 5,
      consumer_spending: 3,
      corporate_margins: 2,
    },
    countrySensitivity: {
      DE: 0.8, IT: 1.4, FR: 0.9, NL: 0.7, ES: 1.2, PL: 0.6,
      BE: 0.8, AT: 0.85, PT: 1.3, IE: 0.7,
    },
    dbImpact: {
      corporate_lending: {
        direction: "positive", magnitude: "moderate", pnl_estimate: 200,
        reason: "Lower rates reduce debt service costs, improve credit quality"
      },
      mortgage_book: {
        direction: "positive", magnitude: "moderate", pnl_estimate: 150,
        reason: "Variable rate mortgages benefit, lower arrears risk"
      },
      trading: {
        direction: "positive", magnitude: "mild", pnl_estimate: 80,
        reason: "Bond rally generates trading profits"
      },
      treasury: {
        direction: "positive", magnitude: "moderate", pnl_estimate: 300,
        reason: "Bond portfolio significant MTM gains from rate decline"
      },
      net_interest_income: {
        direction: "negative", magnitude: "severe", pnl_estimate: -650,
        reason: "NIM compression from 75bp emergency cut"
      },
    },
    cascadeSteps: [
      { step: 1, event: "ECB emergency 75bp rate cut", type: "trigger", delay: "immediate" },
      { step: 2, event: "EUR/USD drops 3%, bond yields collapse", type: "direct", delay: "hours" },
      { step: 3, event: "Equities rally 5% on stimulus hopes", type: "direct", delay: "days" },
      { step: 4, event: "Mortgage rates decline, housing market stabilizes", type: "secondary", delay: "weeks" },
      { step: 5, event: "Consumer confidence improves, spending recovers", type: "secondary", delay: "weeks" },
      { step: 6, event: "Banks' NIM compressed, profitability concerns", type: "tertiary", delay: "months" },
      { step: 7, event: "Savings depositors penalized, capital flight risk", type: "tertiary", delay: "months" },
      { step: 8, event: "DB faces significant NIM compression; bond portfolio rallies", type: "bank_impact", delay: "ongoing" },
    ],
  },
  {
    id: "ecb_aggressive_hike",
    name: "ECB Aggressive Hike (+100bp)",
    icon: "📈",
    description: "ECB delivers 100bp emergency rate hike to combat persistent inflation and EUR weakness",
    historicalPrecedent: "July 2022 50bp hike, Volcker-style tightening",
    severity: 8,
    directEffects: {
      inflation: -0.5,
      eur_usd: 3.0,
      gas_price: -3,
      consumer_confidence: -10,
      brent_oil: -8,
      equity_markets: -8,
    },
    secondaryEffects: {
      ecb_rate_response: 1.0,
      gdp_impact: -0.7,
      unemployment: 0.6,
      mortgage_rates: 0.9,
      bond_yields: 0.5,
      italian_spread: 0.7,
    },
    tertiaryEffects: {
      housing_demand: -10,
      consumer_spending: -4,
      corporate_margins: -6,
    },
    countrySensitivity: {
      DE: 0.9, IT: 1.6, FR: 1.0, NL: 0.8, ES: 1.3, PL: 0.7,
      BE: 0.9, AT: 0.95, PT: 1.4, IE: 0.8,
    },
    dbImpact: {
      corporate_lending: {
        direction: "negative", magnitude: "moderate", pnl_estimate: -500,
        reason: "Higher rates increase corporate debt service costs, defaults rise"
      },
      mortgage_book: {
        direction: "negative", magnitude: "severe", pnl_estimate: -600,
        reason: "Variable rate mortgages reset sharply higher, arrears spike"
      },
      trading: {
        direction: "positive", magnitude: "moderate", pnl_estimate: 150,
        reason: "Rate volatility benefits fixed income trading"
      },
      treasury: {
        direction: "negative", magnitude: "severe", pnl_estimate: -450,
        reason: "Bond portfolio significant mark-to-market losses"
      },
      net_interest_income: {
        direction: "positive", magnitude: "severe", pnl_estimate: 800,
        reason: "NIM expands significantly from 100bp hike"
      },
    },
    cascadeSteps: [
      { step: 1, event: "ECB delivers shock 100bp rate hike", type: "trigger", delay: "immediate" },
      { step: 2, event: "EUR/USD surges 3%, bonds sell off sharply", type: "direct", delay: "hours" },
      { step: 3, event: "Italian BTP spread blows out to 250bps+", type: "direct", delay: "days" },
      { step: 4, event: "Mortgage rates spike, housing market freezes", type: "secondary", delay: "weeks" },
      { step: 5, event: "Consumer confidence crashes, spending pulls back", type: "secondary", delay: "weeks" },
      { step: 6, event: "Corporate defaults rise, especially in periphery", type: "tertiary", delay: "months" },
      { step: 7, event: "EU growth stalls, recession fears mount", type: "tertiary", delay: "months" },
      { step: 8, event: "DB mortgage portfolio under severe stress; NIM expands significantly", type: "bank_impact", delay: "ongoing" },
    ],
  },
  {
    id: "eu_recession",
    name: "EU Recession",
    icon: "🌍",
    description: "Eurozone enters technical recession with two consecutive quarters of negative GDP growth",
    historicalPrecedent: "2012 Eurozone crisis, 2020 COVID recession",
    severity: 8,
    directEffects: {
      inflation: -0.4,
      eur_usd: -2.0,
      gas_price: -8,
      consumer_confidence: -15,
      brent_oil: -12,
      equity_markets: -15,
    },
    secondaryEffects: {
      ecb_rate_response: -0.5,
      gdp_impact: -1.2,
      unemployment: 1.5,
      mortgage_rates: -0.3,
      bond_yields: -0.2,
      italian_spread: 0.6,
    },
    tertiaryEffects: {
      housing_demand: -8,
      consumer_spending: -6,
      corporate_margins: -8,
    },
    countrySensitivity: {
      DE: 1.3, IT: 1.4, FR: 1.1, NL: 1.0, ES: 1.5, PL: 1.2,
      BE: 1.1, AT: 1.2, PT: 1.4, IE: 1.3,
    },
    dbImpact: {
      corporate_lending: {
        direction: "negative", magnitude: "severe", pnl_estimate: -1800,
        reason: "Widespread corporate defaults across all sectors"
      },
      mortgage_book: {
        direction: "negative", magnitude: "severe", pnl_estimate: -700,
        reason: "Rising unemployment drives mortgage defaults"
      },
      trading: {
        direction: "positive", magnitude: "moderate", pnl_estimate: 200,
        reason: "Increased volatility and client hedging activity"
      },
      treasury: {
        direction: "negative", magnitude: "moderate", pnl_estimate: -300,
        reason: "Bond rally partially offsets credit losses"
      },
      net_interest_income: {
        direction: "negative", magnitude: "moderate", pnl_estimate: -400,
        reason: "ECB cuts rates to combat recession, NIM compresses"
      },
    },
    cascadeSteps: [
      { step: 1, event: "Eurozone GDP contracts two consecutive quarters", type: "trigger", delay: "immediate" },
      { step: 2, event: "Equities crash 15%, bond yields decline", type: "direct", delay: "days" },
      { step: 3, event: "Unemployment rises sharply across EU", type: "direct", delay: "weeks" },
      { step: 4, event: "ECB cuts rates 50bp, announces stimulus", type: "secondary", delay: "weeks" },
      { step: 5, event: "Corporate defaults surge, credit markets freeze", type: "secondary", delay: "months" },
      { step: 6, event: "Consumer spending collapses, housing market crashes", type: "tertiary", delay: "months" },
      { step: 7, event: "Banking sector faces severe credit losses", type: "tertiary", delay: "months" },
      { step: 8, event: "DB loan loss provisions spike to multi-billion EUR", type: "bank_impact", delay: "ongoing" },
    ],
  },
  {
    id: "eur_crash",
    name: "EUR/USD Crash (-10%)",
    icon: "💶",
    description: "EUR/USD drops 10% to parity or below driven by capital flight, US exceptionalism, and EU political crisis",
    historicalPrecedent: "2015 EUR crisis, 2022 energy crisis (EUR at $0.95)",
    severity: 7,
    directEffects: {
      inflation: 0.8,
      eur_usd: -10.0,
      gas_price: 5,
      consumer_confidence: -8,
      brent_oil: 5,
      equity_markets: -6,
    },
    secondaryEffects: {
      ecb_rate_response: 0.25,
      gdp_impact: 0.2,
      unemployment: 0.1,
      mortgage_rates: 0.2,
      bond_yields: 0.3,
      italian_spread: 0.4,
    },
    tertiaryEffects: {
      housing_demand: -4,
      consumer_spending: -3,
      corporate_margins: -2,
    },
    countrySensitivity: {
      DE: 1.2, IT: 1.2, FR: 1.1, NL: 1.3, ES: 1.1, PL: 0.8,
      BE: 1.1, AT: 1.05, PT: 1.15, IE: 1.4,
    },
    dbImpact: {
      corporate_lending: {
        direction: "slightly_negative", magnitude: "mild", pnl_estimate: -150,
        reason: "Import-heavy corporates face cost pressures"
      },
      mortgage_book: {
        direction: "neutral", magnitude: "mild", pnl_estimate: -30,
        reason: "Limited direct FX exposure to retail mortgages"
      },
      trading: {
        direction: "positive", magnitude: "severe", pnl_estimate: 400,
        reason: "Significant FX trading revenue from EUR volatility"
      },
      treasury: {
        direction: "negative", magnitude: "moderate", pnl_estimate: -250,
        reason: "FX translation losses on non-EUR holdings"
      },
      net_interest_income: {
        direction: "positive", magnitude: "mild", pnl_estimate: 100,
        reason: "Import inflation may delay ECB cuts"
      },
    },
    cascadeSteps: [
      { step: 1, event: "EUR/USD crashes 10%", type: "trigger", delay: "immediate" },
      { step: 2, event: "Import prices surge, inflation pressures build", type: "direct", delay: "days" },
      { step: 3, event: "ECB signals rate hike to defend currency", type: "direct", delay: "days" },
      { step: 4, event: "Exporters benefit, importers suffer", type: "secondary", delay: "weeks" },
      { step: 5, event: "Tourism rebounds, manufacturing exports boost", type: "secondary", delay: "weeks" },
      { step: 6, event: "Inflation imported, consumer purchasing power declines", type: "tertiary", delay: "months" },
      { step: 7, event: "Foreign investors repatriate, bond yields rise", type: "tertiary", delay: "months" },
      { step: 8, event: "DB FX trading revenue surges; treasury faces translation losses", type: "bank_impact", delay: "ongoing" },
    ],
  },
  {
    id: "energy_disruption",
    name: "Energy Supply Disruption",
    icon: "⚡",
    description: "Major disruption to EU energy supply from Russian gas halt and nuclear plant outages",
    historicalPrecedent: "2022 Nord Stream sabotage, 2009 gas crisis",
    severity: 9,
    directEffects: {
      inflation: 1.5,
      eur_usd: -3.5,
      gas_price: 50,
      consumer_confidence: -15,
      brent_oil: 18,
      equity_markets: -10,
    },
    secondaryEffects: {
      ecb_rate_response: 0.25,
      gdp_impact: -1.2,
      unemployment: 0.8,
      mortgage_rates: 0.4,
      bond_yields: 0.5,
      italian_spread: 0.6,
    },
    tertiaryEffects: {
      housing_demand: -8,
      consumer_spending: -6,
      corporate_margins: -12,
    },
    countrySensitivity: {
      DE: 1.6, IT: 1.2, FR: 1.0, NL: 1.3, ES: 0.9, PL: 1.8,
      BE: 1.2, AT: 1.7, PT: 0.9, IE: 0.7,
    },
    dbImpact: {
      corporate_lending: {
        direction: "negative", magnitude: "severe", pnl_estimate: -1200,
        reason: "Energy-intensive manufacturing clients face existential crisis"
      },
      mortgage_book: {
        direction: "negative", magnitude: "moderate", pnl_estimate: -300,
        reason: "Energy costs squeeze household budgets, mortgage stress rises"
      },
      trading: {
        direction: "positive", magnitude: "moderate", pnl_estimate: 250,
        reason: "Energy derivatives and volatility trading revenue surge"
      },
      treasury: {
        direction: "negative", magnitude: "moderate", pnl_estimate: -350,
        reason: "Bond losses from stagflation fears"
      },
      net_interest_income: {
        direction: "positive", magnitude: "mild", pnl_estimate: 120,
        reason: "Persistent inflation keeps rates elevated"
      },
    },
    cascadeSteps: [
      { step: 1, event: "Major energy supply disruption hits EU", type: "trigger", delay: "immediate" },
      { step: 2, event: "Gas prices surge 50%, energy rationing begins", type: "direct", delay: "days" },
      { step: 3, event: "Inflation spikes +1.5pp, industrial production halts", type: "direct", delay: "weeks" },
      { step: 4, event: "Governments implement emergency energy measures", type: "secondary", delay: "days" },
      { step: 5, event: "Manufacturing recession deepens across CEE", type: "secondary", delay: "weeks" },
      { step: 6, event: "Household energy bills surge, consumer spending crashes", type: "tertiary", delay: "months" },
      { step: 7, event: "Chemical and metal industries shut down production", type: "tertiary", delay: "months" },
      { step: 8, event: "DB energy loan portfolio faces severe impairment losses", type: "bank_impact", delay: "ongoing" },
    ],
  },
  {
    id: "housing_correction",
    name: "Housing Market Correction (-15%)",
    icon: "🏘️",
    description: "EU housing prices correct 15% on average, with sharper declines in overvalued markets",
    historicalPrecedent: "2008 US housing crisis, 2011 Spanish housing crash",
    severity: 7,
    directEffects: {
      inflation: -0.3,
      eur_usd: -1.0,
      gas_price: -3,
      consumer_confidence: -10,
      brent_oil: -5,
      equity_markets: -8,
    },
    secondaryEffects: {
      ecb_rate_response: -0.25,
      gdp_impact: -0.5,
      unemployment: 0.4,
      mortgage_rates: -0.2,
      bond_yields: -0.1,
      italian_spread: 0.2,
    },
    tertiaryEffects: {
      housing_demand: -15,
      consumer_spending: -4,
      corporate_margins: -3,
    },
    countrySensitivity: {
      DE: 1.1, IT: 0.9, FR: 1.0, NL: 1.6, ES: 1.5, PL: 1.0,
      BE: 1.3, AT: 1.2, PT: 1.3, IE: 1.7,
    },
    dbImpact: {
      corporate_lending: {
        direction: "negative", magnitude: "moderate", pnl_estimate: -350,
        reason: "CRE loans face significant losses, construction sector defaults"
      },
      mortgage_book: {
        direction: "negative", magnitude: "severe", pnl_estimate: -800,
        reason: "Residential mortgage defaults rise with negative equity"
      },
      trading: {
        direction: "neutral", magnitude: "mild", pnl_estimate: 30,
        reason: "Limited direct trading impact"
      },
      treasury: {
        direction: "slightly_negative", magnitude: "mild", pnl_estimate: -100,
        reason: "MBS and covered bond portfolio losses"
      },
      net_interest_income: {
        direction: "negative", magnitude: "mild", pnl_estimate: -80,
        reason: "ECB may cut rates to support housing market"
      },
    },
    cascadeSteps: [
      { step: 1, event: "EU housing prices correct 15%", type: "trigger", delay: "immediate" },
      { step: 2, event: "Home equity evaporates, negative equity emerges", type: "direct", delay: "weeks" },
      { step: 3, event: "Mortgage defaults rise, especially in overvalued markets", type: "direct", delay: "months" },
      { step: 4, event: "Construction sector collapses, CRE vacancy spikes", type: "secondary", delay: "months" },
      { step: 5, event: "ECB cuts rates to stabilize housing market", type: "secondary", delay: "months" },
      { step: 6, event: "Consumer wealth effect negative, spending declines", type: "tertiary", delay: "months" },
      { step: 7, event: "Banking sector faces significant mortgage losses", type: "tertiary", delay: "months" },
      { step: 8, event: "DB mortgage portfolio in NL, IE, ES under severe stress", type: "bank_impact", delay: "ongoing" },
    ],
  },
  {
    id: "china_slowdown",
    name: "China Slowdown Spillover",
    icon: "🐉",
    description: "China GDP growth falls below 3%, triggering global trade contraction and EU export collapse",
    historicalPrecedent: "2015 China slowdown, 2020 trade disruption",
    severity: 6,
    directEffects: {
      inflation: -0.2,
      eur_usd: -1.5,
      gas_price: -5,
      consumer_confidence: -4,
      brent_oil: -8,
      equity_markets: -5,
    },
    secondaryEffects: {
      ecb_rate_response: -0.15,
      gdp_impact: -0.6,
      unemployment: 0.3,
      mortgage_rates: -0.1,
      bond_yields: -0.15,
      italian_spread: 0.15,
    },
    tertiaryEffects: {
      housing_demand: -2,
      consumer_spending: -2,
      corporate_margins: -5,
    },
    countrySensitivity: {
      DE: 1.6, IT: 0.8, FR: 1.1, NL: 1.4, ES: 0.8, PL: 1.1,
      BE: 1.2, AT: 1.3, PT: 0.7, IE: 1.5,
    },
    dbImpact: {
      corporate_lending: {
        direction: "negative", magnitude: "moderate", pnl_estimate: -500,
        reason: "Export-dependent German and Dutch manufacturers hit hard"
      },
      mortgage_book: {
        direction: "slightly_negative", magnitude: "mild", pnl_estimate: -60,
        reason: "Secondary effects from rising unemployment"
      },
      trading: {
        direction: "positive", magnitude: "mild", pnl_estimate: 50,
        reason: "Moderate volatility benefits"
      },
      treasury: {
        direction: "positive", magnitude: "mild", pnl_estimate: 80,
        reason: "Safe-haven bid for EU bonds"
      },
      net_interest_income: {
        direction: "slightly_negative", magnitude: "mild", pnl_estimate: -40,
        reason: "Mild ECB easing response"
      },
    },
    cascadeSteps: [
      { step: 1, event: "China GDP growth collapses below 3%", type: "trigger", delay: "immediate" },
      { step: 2, event: "Global trade volumes contract sharply", type: "direct", delay: "days" },
      { step: 3, event: "German exports to China plummet 20%+", type: "direct", delay: "weeks" },
      { step: 4, event: "EU manufacturing PMI drops below 45", type: "secondary", delay: "weeks" },
      { step: 5, event: "Commodity prices decline, disinflationary pressure", type: "secondary", delay: "weeks" },
      { step: 6, event: "German GDP contracts, spreading to EU neighbors", type: "tertiary", delay: "months" },
      { step: 7, event: "Trade finance volumes shrink, supply chains strain", type: "tertiary", delay: "months" },
      { step: 8, event: "DB German corporate loan portfolio under significant pressure", type: "bank_impact", delay: "ongoing" },
    ],
  },
  {
    id: "sovereign_debt_crisis",
    name: "Sovereign Debt Crisis (Italy)",
    icon: "💳",
    description: "Italian sovereign debt crisis triggers BTP spread widening beyond 400bps, contagion to periphery",
    historicalPrecedent: "2011-2012 Eurozone debt crisis, 2018 Italy crisis",
    severity: 9,
    directEffects: {
      inflation: 0.2,
      eur_usd: -4.0,
      gas_price: 3,
      consumer_confidence: -12,
      brent_oil: -3,
      equity_markets: -12,
    },
    secondaryEffects: {
      ecb_rate_response: 0.0,
      gdp_impact: -0.9,
      unemployment: 0.7,
      mortgage_rates: 0.3,
      bond_yields: 0.8,
      italian_spread: 2.0,
    },
    tertiaryEffects: {
      housing_demand: -6,
      consumer_spending: -5,
      corporate_margins: -6,
    },
    countrySensitivity: {
      DE: 0.8, IT: 2.0, FR: 1.3, NL: 0.8, ES: 1.7, PL: 0.7,
      BE: 1.1, AT: 1.0, PT: 1.6, IE: 0.9,
    },
    dbImpact: {
      corporate_lending: {
        direction: "negative", magnitude: "moderate", pnl_estimate: -400,
        reason: "Italian corporate credit conditions tighten severely"
      },
      mortgage_book: {
        direction: "negative", magnitude: "moderate", pnl_estimate: -200,
        reason: "Italian mortgage defaults rise with economic contraction"
      },
      trading: {
        direction: "positive", magnitude: "severe", pnl_estimate: 350,
        reason: "Significant volatility in rates and credit trading"
      },
      treasury: {
        direction: "negative", magnitude: "severe", pnl_estimate: -800,
        reason: "Major BTP portfolio mark-to-market losses, CDS costs surge"
      },
      net_interest_income: {
        direction: "neutral", magnitude: "mild", pnl_estimate: 0,
        reason: "Mixed effects: higher rates on new lending, but credit contraction"
      },
    },
    cascadeSteps: [
      { step: 1, event: "Italian BTP spread blows out past 400bps", type: "trigger", delay: "immediate" },
      { step: 2, event: "Italian bond yields surge, debt sustainability questioned", type: "direct", delay: "days" },
      { step: 3, event: "Contagion spreads to Spain, Portugal, and Greece", type: "direct", delay: "days" },
      { step: 4, event: "ECB announces emergency bond purchase program (TPI)", type: "secondary", delay: "weeks" },
      { step: 5, event: "EUR/USD collapses 4%, equity markets crash", type: "secondary", delay: "weeks" },
      { step: 6, event: "Italian banks face funding crisis, credit freeze", type: "tertiary", delay: "months" },
      { step: 7, event: "EU economic recovery stalls, recession risk rises", type: "tertiary", delay: "months" },
      { step: 8, event: "DB BTP portfolio suffers major losses; Italian corporate lending stressed", type: "bank_impact", delay: "ongoing" },
    ],
  },
];

export const CURRENT_MARKET_DATA = {
  inflation: 2.6,
  eur_usd: 1.08,
  oil: 82,
  ecb_rate: 3.75,
  equity: 4892,
  bond_yield_de: 2.4,
  bond_yield_it: 4.1,
  gas_price: 32,
  consumer_confidence: -8,
  unemployment: 6.5,
  gdp_growth: 0.8,
  recession_prob: 32,
};

export const COUNTRY_RISK_BASELINE: Record<string, number> = {
  DE: 58, FR: 64, IT: 74, ES: 70, NL: 50,
  BE: 55, PL: 68, AT: 50, PT: 65, IE: 44,
};
