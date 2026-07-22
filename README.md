# 🇪🇺 EU Macro Intelligence — AI-Powered Financial Risk Advisor for Deutsche Bank

> **Deutsche Bank Hackathon 2026** | AI-Powered Macroeconomic Risk Intelligence Platform

---

## 📋 Problem Statement

Deutsche Bank's macro risk analysts spend hours each day manually monitoring macroeconomic news, reviewing country risk indicators, and assessing how geopolitical events affect the bank's €600B+ EU portfolio. Existing tools are fragmented — analysts toggle between Bloomberg terminals, internal risk dashboards, and news aggregators to piece together a coherent picture.

**The result:** Slower response times to emerging risks, missed correlations between events, and increased exposure during volatile periods.

## 💡 Solution Overview

EU Macro Intelligence is an **AI-powered risk advisory platform** that consolidates macroeconomic monitoring, risk assessment, forecasting, and scenario simulation into a single, intelligent workspace. Using Google Cloud's Gemini AI, the platform:

1. **Classifies and prioritizes** macroeconomic news in real-time
2. **Quantifies multi-factor risk scores** across 10 EU countries
3. **Generates forecasts** for GDP, inflation, unemployment, and bond yields
4. **Simulates scenarios** with cascade effect modeling
5. **Provides actionable insights** specifically for Deutsche Bank's portfolio exposure

---

## ✨ Key Features

### 1. 📊 **Dashboard** — Real-Time Risk Overview
- Overall risk index with GDP-weighted aggregation
- Interactive Europe map with color-coded country risk levels
- Country risk summaries with top concerns
- Active alerts and opportunity identification

### 2. 📰 **News Intelligence** — AI-Classified News Feed
- 15+ pre-classified macroeconomic news items
- Multi-dimensional filtering (severity, country, sector, search)
- DB relevance scoring for each news item
- Impact analysis with affected departments

### 3. 🔒 **Risk Assessment** — Multi-Factor Risk Scores
- 6-factor risk model (Inflation, Energy, Debt, Unemployment, Housing, Geopolitical)
- Country rankings with trend indicators
- Sector-level risk breakdown
- International risk level coloring

### 4. 📈 **Economic Forecasts** — AI-Driven Predictions
- GDP growth, inflation, unemployment, and bond yield forecasts
- Visual charts (bar charts comparing current vs predicted)
- Confidence scoring with visual indicators
- Driver analysis and explanations

### 5. 🧪 **Scenario Simulator** — Cascade Modeling
- 8 pre-built macroeconomic scenarios
- Direct and secondary effect analysis
- Cascade effect correlation modeling
- Portfolio impact estimation (€ damage assessment)
- Scenario risk ranking

### 6. 🧠 **"What This Means for DB" Panel** — Persistent AI Advisor
- Visible on all pages
- Alert level indicator (green/yellow/orange/red)
- Department-specific impact cards
- Action recommendations (numbered priorities)
- Early warning system
- View mode toggle (Simple/Banker/Detailed)

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS 3 / Dark Theme |
| **UI Components** | Custom + Radix UI Primitives |
| **Charts** | Recharts |
| **Maps** | react-simple-maps / D3-Geo |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **AI/ML** | Google Cloud Vertex AI (Gemini 1.5 Pro) |
| **Font** | Geist (Vercel) |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         EU Macro Intelligence                        │
├──────────────┬──────────────────────────────┬───────────────────────┤
│  Sidebar     │       Main Content Area      │  "What This Means     │
│  (240px)     │                              │  for DB" Panel (360px)│
│              │                              │                       │
│  ┌─────────┐ │  ┌────────────────────────┐  │  ┌─────────────────┐  │
│  │Dashboard │ │  │    Dashboard / News    │  │  │ Alert Level     │  │
│  ├─────────┤ │  │    Risk / Forecast /    │  │  ├─────────────────┤  │
│  │   News   │ │  │    Simulator           │  │  │ Top Insight     │  │
│  ├─────────┤ │  │                        │  │  ├─────────────────┤  │
│  │   Risk   │ │  │  ┌──────────────────┐  │  │  │ Impact Cards   │  │
│  ├─────────┤ │  │  │  AI-Powered       │  │  │  ├─────────────────┤  │
│  │Forecast  │ │  │  │  Analysis        │  │  │  │ Actions         │  │
│  ├─────────┤ │  │  └──────────────────┘  │  │  ├─────────────────┤  │
│  │Simulator │ │  │                        │  │  │ Early Warnings  │  │
│  └─────────┘ │  └────────────────────────┘  │  └─────────────────┘  │
└──────────────┴──────────────────────────────┴───────────────────────┘
         │                    │                          │
         ▼                    ▼                          ▼
   ┌──────────────────────────────────────────────────────────┐
   │                    Data Layer                              │
   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
   │  │  Mock    │  │  Vertex  │  │  Logic   │  │  Types   │  │
   │  │  Data    │  │  AI/Gemini│  │  Engine  │  │          │  │
   │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
   └──────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm 9+ or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd eu-macro-intelligence

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Google Cloud credentials
```

### Environment Variables

```bash
# Required for AI features (optional — app works with mock data)
GCP_PROJECT_ID=your-gcp-project-id
GCP_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./path/to/service-account-key.json

# Optional settings
NEXT_PUBLIC_MOCK_MODE=true   # Set to "true" to use mock data
NEXT_PUBLIC_APP_NAME=EU Macro Intelligence
```

### Development

```bash
# Start development server
npm run dev

# Open in browser
# http://localhost:3000
```

### Build & Production

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## ☁️ Deployment (GCP Cloud Run)

```bash
# 1. Build the Docker image
docker build -t eu-macro-intelligence .

# 2. Tag for Google Container Registry
docker tag eu-macro-intelligence gcr.io/${GCP_PROJECT_ID}/eu-macro-intelligence

# 3. Push to GCR
docker push gcr.io/${GCP_PROJECT_ID}/eu-macro-intelligence

# 4. Deploy to Cloud Run
gcloud run deploy eu-macro-intelligence \
  --image gcr.io/${GCP_PROJECT_ID}/eu-macro-intelligence \
  --platform managed \
  --region us-central1 \
  --set-env-vars="NEXT_PUBLIC_MOCK_MODE=true,GCP_PROJECT_ID=${GCP_PROJECT_ID},GCP_LOCATION=us-central1"
```

---

## 📸 Screenshots

> *Screenshots to be added after deployment*

| Page | Description |
|------|-------------|
| **Dashboard** | Main overview with risk map, metrics, and country summaries |
| **News** | AI-classified news feed with DB relevance scoring |
| **Risk** | Multi-factor risk assessment across EU countries |
| **Forecast** | Economic forecasts with visual charts |
| **Simulator** | Scenario modeling with cascade analysis |

---

## 👥 Team Credits

**Deutsche Bank Hackathon 2026**

- Built with ❤️ by the EU Macro Intelligence Team

---

## 📄 License

This project is created for the Deutsche Bank Hackathon 2026. All rights reserved.
