# WEBARG — User Guide & Operator Manual (2026)
*A Comprehensive Guide on How to Run Audits, Read Reports, Pitch Clients, and Manage the Webarg System*

---

## Table of Contents
1. [Overview — What is Webarg?](#1-overview--what-is-webarg)
2. [How to Start & Run the Application](#2-how-to-start--run-the-application)
3. [How to Run a Website Audit (Step-by-Step)](#3-how-to-run-a-website-audit-step-by-step)
   - [Entering Target URLs](#entering-target-urls)
   - [Selecting Audit Modes (Quick vs. Deep)](#selecting-audit-modes-quick-vs-deep)
   - [The Live Inspection Animation & Progress Percentage](#the-live-inspection-animation--progress-percentage)
4. [Understanding & Interpreting the Audit Report](#4-understanding--interpreting-the-audit-report)
   - [Executive Summary Strip & Health Scores](#executive-summary-strip--health-scores)
   - [Lead & Commercial Revenue Leakage Callout](#lead--commercial-revenue-leakage-callout)
   - [CMS & Tech Stack Detection](#cms--tech-stack-detection)
   - [5 Customer Journeys (Direct Signal vs. Indirect Proxy)](#5-customer-journeys-direct-signal-vs-indirect-proxy)
   - [Prioritized Sprint Remediation Plan](#prioritized-sprint-remediation-plan)
   - [Diagnostic Findings: Table View vs. Visual Graph View](#diagnostic-findings-table-view-vs-visual-graph-view)
   - [Before & After Comparative Rescans](#before--after-comparative-rescans)
   - [Audit Boundary & Access Level Matrix](#audit-boundary--access-level-matrix)
5. [Sharing & Exporting Reports](#5-sharing--exporting-reports)
   - [GTmetrix-Style Shareable URL](#gtmetrix-style-shareable-url)
   - [Exporting PDF Reports](#exporting-pdf-reports)
   - [WhatsApp & Email Client Outreaches](#whatsapp--email-client-outreaches)
6. [Admin Console & System Diagnostics](#6-admin-console--system-diagnostics)
   - [Admin Access & Login Credentials](#admin-access--login-credentials)
   - [Report Management](#report-management)
   - [Live System Diagnostics ("Diagnose Website")](#live-system-diagnostics-diagnose-website)
7. [Security Safeguards & Rate Limits](#7-security-safeguards--rate-limits)
8. [FAQ & Troubleshooting](#8-faq--troubleshooting)

---

## 1. Overview — What is Webarg?

**Webarg** is an objective, deterministic website diagnostic and conversion inspection platform built for independent developers and agency owners. 

Instead of generating generic, inflated automated scores, Webarg provides:
- **Verifiable Technical Evidence:** Exact DOM element selectors, HTTP response status codes, console error timestamps, and security header checks.
- **Conversion & Revenue Focus:** Uncovers hidden conversion friction (unlinked phone numbers on mobile viewports, broken form channels, layout shifts).
- **Agency Pitch Weapon:** Generates a polished, shareable public report and branded PDF to show clients undeniable proof of why their website is losing leads, opening the door for high-ticket **$1,500 to $3,500 remediation sprints**.

---

## 2. How to Start & Run the Application

Webarg consists of a **Vite + React frontend** and an **Express.js backend engine**.

### 1. Start the Backend API Server:
Open a terminal in the root directory:
```bash
cd server
node src/index.js
```
*The backend starts at `http://localhost:5000`.*

### 2. Start the Frontend Client:
Open a second terminal in the root directory:
```bash
cd client
npm run dev
```
*The client starts at `http://localhost:5173`.*

---

## 3. How to Run a Website Audit (Step-by-Step)

### Entering Target URLs
1. Navigate to `http://localhost:5173/` in your web browser.
2. In the central hero input field, enter the website you want to inspect:
   - Examples: `efix.ae`, `https://example.com`, `shop.clientstore.com`.
   - Webarg automatically prefixes `https://` if omitted.

### Selecting Audit Modes (Quick vs. Deep)
In the dropdown next to the input field, choose your desired audit depth:
- **Quick (Public Checks):** (~10–15 seconds)
  - Inspects public DNS, SSL/TLS certificates, response headers, `robots.txt`, `sitemap.xml`, custom 404 error page handling, and fast DOM structure.
- **Deep (Full Diagnostic):** (~30–45 seconds)
  - Connects to hosted Browserless/Chromium to execute live JavaScript.
  - Captures runtime console errors and network request failures.
  - Runs WCAG 2.1 accessibility evaluations via `axe-core`.
  - Simulates 320px mobile viewport rendering and checks clickable `tel:` links.

### The Live Inspection Animation & Progress Percentage
When you click **Inspect website**:
1. The page automatically scrolls to the **Inspection Stage**.
2. A high-tech **oscillating wavy grid mesh** and a **sweeping laser beam** appear against a dark slate background (`#11161C`).
3. The exact target URL is displayed with real-time percentage progress (`XX% COMPLETED`) and the active diagnostic phase:
   - `0% - 20%`: *Connecting & validating DNS, SSL & security headers…*
   - `21% - 45%`: *Spinning up headless browser & executing DOM audit…*
   - `46% - 70%`: *Benchmarking Core Web Vitals & 320px mobile viewport…*
   - `71% - 88%`: *Auditing conversion paths, form funnels & revenue friction…*
   - `89% - 99%`: *Synthesizing evidence, finding priorities & executive summary…*
   - `100%`: *Inspection finalized. Preparing report presentation…*

---

## 4. Understanding & Interpreting the Audit Report

Once the audit concludes, the report smoothly loads into view. Here is how to read each section:

### Executive Summary Strip & Health Scores
- **Overall Health Score (0–100):** Weighted average calculated strictly across actually measured categories (Performance 30%, Security 25%, SEO 25%, Accessibility 20%). Displays `HEALTHY` (80+), `NEEDS ATTENTION` (55–79), or `AT RISK` (<55).
- **Conversion Health `[Derived Heuristic]`:** Distinctly labeled to indicate that conversion readiness is calculated from observed friction factors (critical findings drop the score by 15 pts, warnings by 5 pts).
- **Core Web Vitals `[Measured CWV]`:** Reflects Google PageSpeed speed metrics (or shows `—` when unmeasured; never synthetic numbers).
- **SEO & Identity `[Measured Spec]`:** Validates title tags, meta descriptions, duplicate `<h1>` elements, canonical links, and search bot readability.
- **Security & Headers `[Measured SSL/TLS]`:** Validates TLS certificates, HSTS, CSP, X-Frame-Options, and server disclosure vulnerabilities.

### Lead & Commercial Revenue Leakage Callout
Positioned right below the summary strip, this high-contrast callout isolates the **single most severe issue** hurting business revenue.
- *Example:* `CRITICAL REVENUE & LEAD LEAKAGE IDENTIFIED — Unlinked Phone Number in Body: Plain text phone numbers on mobile force users to manually copy/paste, causing immediate drop-off.`

### CMS & Tech Stack Detection
Identifies the client's underlying architecture:
- Detects WordPress, Shopify, Webflow, GoHighLevel (GHL), Wix, Next.js, Apache, Nginx, Cloudflare, etc.
- Helps tailor your pitch to their specific platform.

### 5 Customer Journeys (Direct Signal vs. Indirect Proxy)
Audits the five real user paths defined in the Webarg Playbook:
1. **Journey A — New Visitor:** Evaluates 5-second value proposition clarity (`Indirect Proxy`).
2. **Journey B — Inquiring Lead:** Detects whether contact forms or click-to-call options exist in the DOM (`Indirect Proxy`).
3. **Journey C — Mobile Customer:** Tests tap-to-call dialers and mobile layout at 320px screen width (`Direct Signal`).
4. **Journey D — Returning User:** Checks browser caching headers, compression, and reload speeds (`Direct Signal`).
5. **Journey E — Failure Recovery:** Confirms whether entering an invalid URL returns an authentic HTTP 404 status code (`Direct Signal`).

### Prioritized Sprint Remediation Plan
Groups the top findings into a 2-tier sprint roadmap:
- **Priority 1 (Fix immediately):** Critical revenue blockers, console runtime crashes, or broken mobile links.
- **Priority 2 (Scheduled sprint):** SEO discoverability optimizations, accessibility color contrast, and performance caching.

### Diagnostic Findings: Table View vs. Visual Graph View
Use the view toggle bar to switch between two presentation modes:
- **Table View:**
  - Collapsible accordions for each finding.
  - Includes **Evidence** (exact code snippet or DOM selector), **User Impact**, **Business Consequence**, and **Recommended Fix**.
- **Visual Graph View:**
  - **Score Breakdown Bars:** Visual comparison of category health.
  - **Severity Distribution Donut Chart:** Breakdown of Critical vs. Warning vs. Passing checks.
  - **Core Web Vitals Threshold Spectrum:** Visual benchmark charts for **LCP** (Largest Contentful Paint), **CLS** (Cumulative Layout Shift), and **TBT** (Total Blocking Time) mapped against Google's Good / Needs Work / Poor standards.

### Before & After Comparative Rescans
When you re-scan a previously audited URL after making client fixes, Webarg automatically recognizes the domain and renders a **Before & After Delta Banner**:
- Compares previous scan score vs. current scan score (`72 → 91 (+19 pts)`).
- Calculates the exact count and list of **Resolved Findings** (e.g. `4 Issues Resolved`).

### Audit Boundary & Access Level Matrix
A visual matrix in the report footer that reinforces trust by transparently explaining what the automated scan can inspect (**Level 1: Public Surface**) versus what requires your paid manual engagement (**Level 2: Authenticated Funnels, Internal CRM, GoHighLevel Workflows, CMS Databases**).

---

## 5. Sharing & Exporting Reports

### GTmetrix-Style Shareable URL
Every audit report is assigned a permanent unique ID:
- URL structure: `http://localhost:5173/report/:id` (e.g. `http://localhost:5173/report/dRrnnlcJT555`).
- When sending this link to a client or team member, the report opens directly in their browser without re-running the scan.

### Exporting PDF Reports
1. In the top sticky header, click **Download PDF**.
2. Webarg's backend calls headless Chromium to render an exact print-styled PDF of the report.
3. The PDF is saved with a clean filename: `webarg-audit-[domain]-[date].pdf`.
4. If running in an environment without headless Chrome, Webarg automatically triggers the system print dialog as a fail-safe.

### WhatsApp & Email Client Outreaches
At the bottom of the report, use the quick-action buttons:
- **Message on WhatsApp:** Launches WhatsApp with a pre-filled client pitch linking to the live report.
- **Email Remediation Request:** Opens the default mail client with a structured audit summary ready to send to decision-makers.

---

## 6. Admin Console & System Diagnostics

### Admin Access & Login Credentials
To access the operator administration dashboard:
- Click the **Admin** link in the top navigation or footer, or visit `http://localhost:5173/admin`.
- **Default Credentials:**
  - **Username:** `admin`
  - **Password:** `webarg2026!`

### Report Management
Inside the Admin Panel:
- View all persisted reports with timestamps, target URLs, overall scores, and issue counts.
- Search and filter through past client audits.
- Open any prior report with one click.
- Delete outdated or temporary test reports.

### Live System Diagnostics ("Diagnose Website")
At the bottom-right corner of the Admin Dashboard is the floating **Diagnose System** button:
- Clicking this button runs an end-to-end operational diagnostic of all Webarg subsystems:
  1. **Express API Server:** Verifies backend responsiveness on port 5000.
  2. **SSRF Guard & DNS:** Confirms resolution and private IP blocking defenses.
  3. **Browserless Connectivity:** Tests WebSocket connection to headless Chrome.
  4. **AI Explainer Engine:** Tests Gemini API key connectivity and deterministic fallback.
  5. **PDF Generator:** Tests Puppeteer PDF compilation.
- Outputs an instant **System Diagnostic Status Report** with green `OPERATIONAL` or red `ATTENTION` badges for every component.

---

## 7. Security Safeguards & Rate Limits

- **Rate Limiting:** Webarg limits scans to **5 audits per hour per IP** using Express proxy-aware IP detection (`req.ip`) to protect server resources and prevent abuse.
- **SSRF & DNS-Rebinding Protection:** Prevents users from scanning internal network targets (e.g., `localhost`, `127.0.0.1`, `169.254.169.254`, `192.168.x.x`). Browserless navigation pins the validated public IP using Chromium `--host-resolver-rules` to stop TOCTOU DNS-rebinding attacks.
- **Read-Only Non-Intrusive Scanning:** Webarg performs safe, read-only GET inspections and never executes destructive state changes on target websites.

---

## 8. FAQ & Troubleshooting

#### Q: The audit displays "Too many scan requests from this IP"?
*A: Webarg's rate limiter allows 5 scans per hour per IP. Wait for the window to reset, or adjust `max: 5` in `server/src/middleware/rateLimiter.js` for internal development.*

#### Q: Why does Core Web Vitals show "—" (Not Measured)?
*A: Webarg never invents fake or plausible-looking synthetic numbers. If Google's PSI API or Lighthouse field data is unavailable for that specific URL, Webarg transparently indicates that the metric was not measured.*

#### Q: Can I customize the consultant name on the report?
*A: Yes! In `server/src/utils/reportNormalizer.js` or `StickyHeader.jsx`, the consultant details ("Audit Conducted by Abid") can be personalized with your agency name, phone number, and branding.*

---
*Webarg — Website Audit Report Generator (2026)*
