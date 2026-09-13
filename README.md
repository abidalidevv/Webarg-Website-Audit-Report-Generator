# Webarg — Technical & Conversion Website Audit Engine (2026)

> **Precision Website Inspection, Core Web Vitals Diagnostic & Conversion Engine**  
> Built for developer **Abid** to inspect websites, output verifiable deterministic evidence, generate GTmetrix-style shareable reports and PDFs, and close high-ticket remediation sprints ($1,500–$3,500).

---

## 📁 Project Architecture & File Map

```text
Webarg-Website-Audit-Report-Generator/
├── Docs/                               # Project Knowledge Base & Specs
│   ├── instructions-and-brain.md       # Master Specification & 84-Section Playbook
│   └── prototypes/                     # Design & Animation Prototypes
│       ├── webarg V3 - Copy.html       # Three.js Scan-Stage Prototype
│       ├── webarg-audit.html           # Initial HTML Layout Prototype
│       └── webarg-awwwards-premium.html# Visual Design Concept Prototype
│
├── client/                             # React (Vite) Frontend Application
│   ├── public/                         # Static Assets (favicon, icons)
│   ├── src/                            # React Component Architecture
│   │   ├── assets/                     # SVGs and static brand assets
│   │   ├── components/                 # Reusable Diagnostic UI Components
│   │   │   ├── AccessLevelMatrix.jsx   # 3-Tier Scope Matrix (Level 1 vs Level 2/3)
│   │   │   ├── AdminPanel.jsx          # Developer Admin Console & Floating Action
│   │   │   ├── BeforeAfterComparison.jsx# Delta Mode (+34 LCP Post-Fix Projection)
│   │   │   ├── ConversionJourneyGrid.jsx# 5 Simulated Customer Journeys (A to E)
│   │   │   ├── ExecutiveSummary.jsx    # Health Score, Tech Stack, Key Findings
│   │   │   ├── FindingsList.jsx        # Expandable <details> Issue Accordions
│   │   │   ├── GraphView.jsx           # Interactive Radar Charts & CWV Gauges
│   │   │   ├── HeroInput.jsx           # Large URL Input & Mode Selector
│   │   │   ├── RemediationPlan.jsx     # Prioritized Action Roadmap (P1, P2, P3)
│   │   │   ├── RevenueImpact.jsx       # Financial & Lead Leakage Calculations
│   │   │   ├── ScanCanvas.jsx          # Three.js Wireframe Mesh Scan Animation
│   │   │   ├── StickyFooter.jsx        # Sticky CTA Bar & Admin Console Portal
│   │   │   ├── StickyHeader.jsx        # Compact Top Navigation & Status Bar
│   │   │   └── TechStackBadges.jsx     # Detected CMS / Framework Badges
│   │   ├── App.jsx                     # Main Application Controller & Router
│   │   ├── index.css                   # Custom Design Tokens & Clinical Styles
│   │   └── main.jsx                    # React Application Entry Point
│   ├── index.html                      # HTML5 Shell
│   ├── package.json                    # Frontend Dependencies
│   └── vite.config.js                  # Vite Build Configuration
│
├── server/                             # Node.js + Express Backend Scan Engine
│   ├── data/                           # Persisted Report Storage
│   │   └── reports/                    # Individual Audit JSON Files (:id.json)
│   ├── scripts/                        # Automation & Verification Scripts
│   │   └── phase5-verify.js            # Security & SSRF Test Script
│   ├── src/                            # Express Server Architecture
│   │   ├── middleware/                 # Security & Guardrail Middlewares
│   │   │   ├── rateLimiter.js          # Rate Limiting (5 scans/hr per IP)
│   │   │   └── ssrfGuard.js            # SSRF Protection & Private IP Blocking
│   │   ├── routes/                     # API Endpoint Handlers
│   │   │   ├── admin.js                # /admin-api (Auth, Config, Report Mgmt)
│   │   │   ├── report.js               # /report (JSON Fetch & Headless PDF)
│   │   │   └── scan.js                 # POST /scan (Primary Scan Orchestrator)
│   │   ├── services/                   # Diagnostic & Inspection Services
│   │   │   ├── assetPipelineAuditor.js # Images, WebP, Fonts, CSS Bloat
│   │   │   ├── browserlessScanner.js   # Headless Chrome Console & Storage Leaks
│   │   │   ├── cheerioAnalyzer.js      # DOM, Canonical, Hreflang, Staging Leaks
│   │   │   ├── conversionAuditor.js    # Click-to-Call, WhatsApp, Autocomplete
│   │   │   ├── dnsSslChecker.js        # A, AAAA, MX, SPF, DMARC, SSL Expiry
│   │   │   ├── lighthouseRunner.js     # Programmatic Core Web Vitals Runner
│   │   │   ├── llmExplainer.js         # AI Diagnostic Narrative Engine
│   │   │   ├── logSanitizer.js         # Regex Token & Credential Redaction
│   │   │   ├── pdfGenerator.js         # Headless Chrome page.pdf() Generator
│   │   │   ├── platformDetector.js     # CMS & Framework Detection
│   │   │   ├── reportStorage.js        # Disk-based Flat JSON CRUD Operations
│   │   │   ├── schemaChecker.js        # Schema.org JSON-LD Verification
│   │   │   └── urlChecks.js            # Real 404 vs Soft 404 Accuracy
│   │   ├── utils/                      # Data Transformation Utilities
│   │   │   └── reportNormalizer.js     # Unified Schema & Customer Journeys
│   │   └── index.js                    # Express App Entry & Global Error Traps
│   ├── tests/                          # Test Fixtures, Payloads & Output Samples
│   ├── .env                            # Environment Variables & API Secrets
│   ├── .env.example                    # Environment Template
│   └── package.json                    # Server Dependencies
│
├── .gitignore                          # Git Ignored Files
└── README.md                           # Master Project Readme & Overview
```

---

## ⚡ Quickstart Guide

### 1. Start Backend Scan Engine:
```powershell
cd server
npm install
npm start
# Runs on http://localhost:5000
# Health check: http://localhost:5000/health
```

### 2. Start Frontend Dev Server:
```powershell
cd client
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## 🔒 Developer Admin Console

- **URL:** `http://localhost:5173/admin`  
  *(or click "🔒 Admin Console" in the public website footer)*
- **Master Password:** `admin-webarg-secret-2026`
- **Features:**
  - View all generated reports stored on disk.
  - Delete obsolete reports.
  - Live runtime update of Browserless.io and Gemini AI API keys.
  - **⚡ Diagnose Website** floating button at the bottom right for instant target scanning.

---

## 🔗 Shareable Reports (GTmetrix Style Permalinks)

Every scan generates a permanent unique report ID (e.g. `gEY0tH939WAE`):
- **Direct Link:** `http://localhost:5173/report/<reportId>`  
  *(In production: `https://your-domain.com/report/<reportId>`)*
- **Storage Location:** `server/data/reports/<reportId>.json`
- Anyone opening the link loads the exact diagnostic report directly from disk without re-scanning or logging in.
- Includes a native **Download PDF** button that renders via headless Chrome's native PDF print engine.

---

## 📖 Master Documentation
For the complete technical specification, design system tokens, decision logs, and the definitive 84-section audit playbook, refer to:
👉 **[Docs/instructions-and-brain.md](file:///c:/Users/Ali/Desktop/Web/Docs/instructions-and-brain.md)**
