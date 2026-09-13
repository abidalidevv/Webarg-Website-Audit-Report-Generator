# WEBARG — Master Technical Spec, Engineering Instructions & Audit Brain (2026)
*Consolidated Master Knowledge Base: Architectural Specs, 84-Section Audit Playbook, Design System & Remediation Framework*

---

## 1. Executive Purpose & Product Scope

**Webarg** is a precision technical inspection and conversion diagnostic engine built for independent developer **Abid**. It operates as a high-trust lead generation and diagnostic instrument — not a bloated multi-tenant SaaS tool.

### The Core Business Workflow:
$$\text{Enter Prospect URL} \rightarrow \text{Deep Automated Scan} \rightarrow \text{Verifiable Shareable Report + PDF} \rightarrow \text{Client Pitch} \rightarrow \text{Paid Remediation Sprint (\$1,500–\$3,500)}$$

1. **Inspection Run:** Abid enters a prospective client's URL into Webarg.
2. **Deterministic Evidence:** The tool executes deep multi-layer diagnostics (Console, Core Web Vitals, HTML, Security, DNS, SSL, Accessibility, Conversion Journeys) and outputs verifiable evidence (DOM selectors, HTTP response codes, console logs, timestamps).
3. **Shareable Delivery:** Generates an unbranded, permanent public report link (`/report/:id`) and pixel-perfect downloadable PDF.
4. **The Client Pitch:** Abid approaches the prospect with undeniable technical proof ("Your mobile checkout is failing and your phone numbers are unclickable plain text — here is the live report").
5. **High-Ticket Upsell:** The automated report serves as the initial hook to close a comprehensive **\$1,500 to \$3,500 remediation sprint** covering internal CMS, GoHighLevel funnels, database optimization, and custom development.

### What is Explicitly OUT of Scope for v1:
- Subscription billing, Stripe consumer checkouts, user accounts, multi-tenant database isolation.
- Competing feature-for-feature with generic SEO crawlers (Ahrefs, SEMrush, Moz).
- Unofficial reverse-engineered scrapers or unreliable third-party proxies.

---

## 2. Engineering Decisions & Architectural Log

### Decision Log (2026-09-12) — Rejection of API Bloat & Fake Complexity:
Considered adding a large, unscoped set of third-party GitHub APIs and CDNs to "look like an expensive enterprise site." **Rejected.** More third-party vendor dependencies introduce catastrophic failure points during live client demos, rate-limit bottlenecks, and supply chain vulnerabilities. A premium, high-trust diagnostic feel comes from design restraint, crisp typography, copy precision, and bulletproof uptime — not API quantity.

### Decision Log (2026-09-13) — Rejection of Unofficial Proxies & Link Directories:
A batch of unrelated GitHub repositories was proposed (generic "awesome-api" lists, dictionary APIs, enterprise API gateways, and unofficial reverse-engineered ChatGPT proxy repositories). **Rejected completely:**
1. **Curated Link Lists (`public-apis`, `awesome-*`):** Directories, not integrable tools.
2. **Unrelated Utilities:** Dictionary lookups and domain registries have zero relevance to website diagnostic audits.
3. **Enterprise Gateways:** Over-engineered infrastructure unsuitable for a focused single-endpoint diagnostic engine.
4. **Reverse-Engineered ChatGPT Proxies:** Unofficial proxies violate provider Terms of Service, route confidential client audit data through uncontrolled intermediary servers, and risk abrupt IP bans. Webarg uses only official, verified APIs (Browserless hosted Chrome, Lighthouse, axe-core, Google Gemini official API).

---

## 3. Technology Stack & System Architecture

| Architecture Layer | Production Choice | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **React (Vite)** | Blazing fast single continuous scrolling page; zero dashboard bloat. |
| **Styling & Design** | **Custom CSS & Design Tokens** | Maximum control over clinical lab aesthetic; no generic Tailwind defaults. |
| **Backend Runtime** | **Node.js + Express** | Single primary endpoint (`POST /scan`), fast asynchronous I/O, lean architecture. |
| **Headless Scan Engine** | **Browserless.io / Headless Chrome** | Hosted Chrome container for console/pageerror capture, DOM rendering, and PDF export. |
| **Diagnostic Engines** | **Lighthouse, axe-core, Cheerio** | Industry-gold-standard Core Web Vitals, a11y compliance, and static DOM parsing. |
| **Network & Security** | **Node DNS, SSL Checker** | Native `dns.promises` (A, AAAA, MX, TXT, SPF, DMARC) and TLS certificate validation. |
| **PDF Generation** | **Headless Chrome Native `page.pdf()`** | Native rendering pipeline matching the live report route (`/report/:id?print=true`). |
| **Data Persistence** | **Flat JSON on Disk (`/server/data/reports`)** | Lightweight, crash-proof document store keyed by random nanoids. |
| **Administration** | **Password-Gated `/admin` Route** | Single-user access key (`admin-webarg-secret-2026`) with runtime API keys management. |

---

## 4. Security Guardrails & SSRF Blocklist

All scan requests are subjected to strict non-negotiable security controls:

1. **Protocol Validation:** Strict rejection of non-http/https URI schemes (blocks `file://`, `ftp://`, `gopher://`).
2. **SSRF Guard (Server-Side Request Forgery):** Resolves the target hostname prior to network requests and rejects private, reserved, and cloud metadata ranges:
   - `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` (RFC 1918 Private Networks)
   - `127.0.0.0/8` (Loopback / Localhost)
   - `169.254.169.254` / `169.254.0.0/16` (Cloud Instance Metadata Service)
   - `::1` (IPv6 Loopback)
3. **Hard Scan Timeouts:** 60-second ceiling for Quick Scan; 10-minute maximum for Deep Scan.
4. **Console Log Sanitization:** Captured browser console output is automatically scrubbed via regex before storage or display, redacting JWT tokens, API keys, passwords, bearer authorization headers, and cookies.
5. **Rate Limiting:** Maximum 5 scan requests per IP per hour via `express-rate-limit` to prevent open-proxy exploitation.

---

## 5. Visual Design Direction & Clinical Aesthetic

Generic AI-generated SaaS design clusters around predictable tropes: warm cream backgrounds, serif fonts, terracotta accents, identical rounded cards with fuzzy grey shadows, ALL-CAPS eyebrow labels, and arrows on every button.

**Webarg deliberately rejects these defaults.** It is styled as a **precision diagnostic instrument** — closer to a clinical pathology lab report or aerospace structural inspection than a marketing dashboard.

### Design Tokens:
- **Base Dark Surface (`--ink`):** `#14181F` (Deep blue-tinted dark surface, not neutral near-black).
- **Print / Light Surface (`--paper`):** `#EDEEE7` (Soft warm paper tone for clean printing).
- **Signal Critical (`--signal-critical`):** `#C1432B` (Muted brick red, reserved strictly for critical findings).
- **Signal Warning (`--signal-warning`):** `#B8863D` (Muted ochre, warning findings only).
- **Signal Pass (`--signal-pass`):** `#4C7A5E` (Muted sage green, passing checks).
- **Interactive Accent (`--accent`):** `#3E6E8E` (Steel-teal for active states, links, and buttons).

### Typography Scale:
- **Headings:** *Barlow Condensed* (Technical, condensed engineering character).
- **Body Text:** *Manrope* (Humanist sans, optimized for reading density).
- **Data & Numbers:** *DM Mono* / *IBM Plex Mono* (Strictly reserved for metrics, error codes, and timestamps).

### Motion Philosophy:
- **Single Choreographed Moment:** The Three.js wireframe mesh scan beam during initial scan.
- All other elements are static, calm, and legible. No gratuitous fade-up-on-scroll or glowing cards.

---

## 6. Access Level Matrix & Anti-Hallucination Boundary

To preserve high client trust and technical integrity, Webarg enforces the **Anti-Hallucination Rule**:
An automated scanner running against a public URL cannot access private CMS dashboards, CRM automations, or internal databases. Webarg never fabricates checks it cannot perform.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ACCESS LEVEL MATRIX & AUDIT SCOPE                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ LEVEL 1: PUBLIC URL AUTOMATED AUDIT (Webarg Automated Engine)               │
│ - DOM Structure & HTML Semantics           - Security Headers (HSTS, CSP)   │
│ - Console Runtime Errors & Exceptions      - SSL Validity & Expiry          │
│ - Network Latency & TTFB                   - DNS Records (SPF & DMARC)      │
│ - Core Web Vitals (LCP, CLS, INP)          - Click-to-Call & WhatsApp Links │
│ - Broken Images & 404 Links                - JSON-LD Structured Schema      │
├─────────────────────────────────────────────────────────────────────────────┤
│ LEVEL 2: CREDENTIALED CMS & CRM AUDIT (Abid's Manual Remediation Sprint)    │
│ - WordPress wp-admin & Plugins             - Shopify Theme Liquid & Apps    │
│ - GoHighLevel (GHL) Workflows & Triggers   - Stripe / PayPal Sandbox Orders │
│ - Elementor Container Nesting Optimization - Email Delivery & Spam Testing  │
├─────────────────────────────────────────────────────────────────────────────┤
│ LEVEL 3: SERVER INFRASTRUCTURE & PHYSICAL DEVICES (High-Tier Engagement)    │
│ - cPanel / VPS CPU, RAM & Disk I/O         - Database Transient Queries     │
│ - Physical iPhone & Android Real Dialers   - Cellular Network Handover Tests│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 7. The Master 84-Section Website Audit Playbook & Checklist

Every section below represents a verified inspection surface. Use this checklist during both automated scans and manual deep audits.

### 1. One-Day Audit Schedule & Methodology
- [ ] 30 min: Full site walkthrough (navigation, CTAs, layout integrity, cross-page consistency).
- [ ] 60 min: DevTools, Console & Network (JS errors, failed requests, slow API endpoints).
- [ ] 60 min: Performance & Core Web Vitals (LCP, CLS, INP, TTFB, heavy assets, DOM size).
- [ ] 60 min: Technical SEO & Indexability (metadata, canonicals, robots.txt, sitemap, headings, JSON-LD).
- [ ] 45 min: Mobile / Responsive QA (320px iPhone SE baseline, touch targets, horizontal overflow).
- [ ] 45 min: Accessibility / a11y (keyboard navigation, focus rings, form labels, color contrast).
- [ ] 45 min: Security & Infrastructure (SSL cert, security headers, DNS SPF/DMARC, exposed files).
- [ ] 30 min: Forms & Conversion Funnels (validation matrix, required fields, autofill, delivery).
- [ ] 30 min: Analytics & Tracking Tags (GA4, GTM, Meta Pixel, Hotjar, event firing).
- [ ] 45 min: Full Crawl & Broken Links (404 status, redirect chains, dead `#` anchors, reverse tabnabbing).
- [ ] 45 min: Final QA, Evidence Gathering & Client Pitch Formulation.
- [ ] *Sampling Rule for 100+ Page Sites:* Inspect homepage, top 5 landing pages, core service/product templates, contact/checkout funnels, and error templates.

### 2. Full Site Walkthrough & Real-World Actions
- [ ] Logo clicks navigate directly back to homepage (`/`).
- [ ] Primary navigation, dropdown menus, mega menus, and sticky headers work smoothly.
- [ ] Mobile hamburger menu opens, traps focus, and closes via backdrop click or `ESC` key.
- [ ] Real-world phone number opens native dialer on mobile (not plain non-clickable text).
- [ ] WhatsApp CTA launches correct international phone format (`wa.me/<number>`).
- [ ] Email link opens default mail client with pre-populated recipient and subject.
- [ ] Google Maps pin opens accurate business location and directions.
- [ ] Social profile icons point to verified, active business accounts.
- [ ] Zero dead CTA buttons that point to `#` or empty triggers.

### 3. Business Conversion & Above-The-Fold Audit
- [ ] **5-Second Test:** Value proposition, business offering, and target audience clearly understood within 5 seconds.
- [ ] Primary CTA is prominently placed above the fold with superior visual weight.
- [ ] Secondary CTA does not compete with or dilute the primary action.
- [ ] Trust signals (customer ratings, client logos, industry certifications) visible above the fold.
- [ ] Immediate contact option (phone, chat, booking link) clearly visible without scrolling.
- [ ] Conversion flow consistency verified: `Visible → Clickable → Destination → Next Step → Completion`.
- [ ] Popups, modal overlays, or sticky cookies do not block main CTAs on mobile viewports.

### 4. Forms — Deep Functional, Validation & Autofill Test
- [ ] **Validation Matrix:** Tested with empty submission, valid submission, invalid email format, invalid phone, spaces only, special characters (`<script>`, `'`, `&`), and very long strings.
- [ ] **Browser Autofill & Password Managers:** Form fields declared with standard `autocomplete` attributes (`name`, `email`, `tel`, `address-line1`, `current-password`).
- [ ] Chrome autofill text remains visible and legible (no white text on white background styling bugs).
- [ ] **Keyboard & Interactivity:** `Enter` key triggers submission; `Tab` moves focus in logical sequence.
- [ ] **Spam & Security:** Turnstile / reCAPTCHA / honeypot active and verified.
- [ ] **Submission UX:** Submit button shows loading spinner and disables during request (preventing duplicate clicks).
- [ ] Inline validation errors appear next to invalid fields and clear immediately when corrected.
- [ ] Success message displays cleanly; form fields clear after successful submission.
- [ ] Refreshing or pressing back button after submission does not cause duplicate submissions.
- [ ] Form inquiries deliver successfully to admin email and CRM/GHL pipeline without delay.

### 5. Click-to-Call, Contact & Channel Verification
- [ ] Phone numbers use valid `tel:` protocol format (`tel:+1...`).
- [ ] Phone numbers are NOT embedded inside raster images or flattened graphics.
- [ ] Mobile sticky call button stays visible and clickable throughout long page scrolls.
- [ ] Email addresses use clean `mailto:` links with correct business domain email.
- [ ] WhatsApp links resolve properly on both mobile WhatsApp app and desktop WhatsApp Web.
- [ ] Address in footer matches Google Business Profile address and contact page NAP exactly.

### 6. Browser DevTools — Console & Runtime Errors
- [ ] Zero unhandled JavaScript exceptions (`Uncaught TypeError`, `ReferenceError`, `SyntaxError`).
- [ ] Zero unhandled promise rejections (`UnhandledPromiseRejection`).
- [ ] Failed AJAX/fetch network calls (4xx/5xx) captured and flagged.
- [ ] CORS (Cross-Origin Resource Sharing) configuration errors identified.
- [ ] CSP (Content Security Policy) violation warnings reviewed.
- [ ] Third-party script errors (Maps, Pixels, GTM, Chat widgets) isolated and noted.
- [ ] Captured console outputs sanitized (redacting leaked tokens, passwords, or PII).

### 7. Network & Server Infrastructure
- [ ] HTTP response status codes verified (clean 200s, minimal 301s, zero 500/502/503/504 errors).
- [ ] Time to First Byte (TTFB) under 400ms globally on cold requests.
- [ ] Modern asset compression enabled across all text resources (Brotli `br` or Gzip).
- [ ] Explicit caching headers configured (`Cache-Control: max-age=...`, `ETag`).
- [ ] Zero excessive redirect hops (>2) or redirect loops.
- [ ] API latency inspected; all primary endpoints respond under 800ms.

### 8. Performance & Core Web Vitals (Beyond Lighthouse)
- [ ] **Largest Contentful Paint (LCP):** Under 2.5 seconds on mobile 4G network emulation.
- [ ] **Cumulative Layout Shift (CLS):** Under 0.1 throughout entire page lifecycle.
- [ ] **Interaction to Next Paint (INP):** Under 200 milliseconds during user interactions.
- [ ] **Total Blocking Time (TBT):** Under 200ms on simulated mobile CPU.
- [ ] DOM size maintained under 1,200 total nodes; maximum DOM depth under 32 levels.
- [ ] Zero layout thrashing, forced synchronous layouts, or long main-thread tasks (>50ms).
- [ ] Performance tested across simulated slow 4G, 3G, and high-latency conditions.

### 9. Image Audit & Optimization Pipeline
- [ ] Modern next-gen image formats utilized (WebP or AVIF).
- [ ] Explicit `width` and `height` attributes declared on all `<img>` tags (eliminates CLS).
- [ ] Off-screen images lazy-loaded (`loading="lazy"`).
- [ ] Above-the-fold hero image preloaded with `fetchpriority="high"` (never lazy loaded).
- [ ] Responsive images supply appropriate `srcset` and `sizes` attributes for mobile screens.
- [ ] Zero oversized images (e.g. 5 MB uncompressed PNGs scaled down to 300px thumbnail).

### 10. Font Audit & Web Typography
- [ ] Web fonts loaded with `font-display: swap` to prevent Flash of Invisible Text (FOIT).
- [ ] Font files delivered in lightweight WOFF2 format.
- [ ] Preconnect hints declared for external font CDNs (`<link rel="preconnect" href="...">`).
- [ ] Total web font families and weights limited to avoid bandwidth drag (max 2-3 families).
- [ ] System fallback fonts configured with matching metrics to minimize layout shift (FOUT).

### 11. CSS Audit & Layout Integrity
- [ ] Zero excessive `!important` declarations causing specificity wars.
- [ ] Dead and unused CSS extracted or pruned.
- [ ] No fixed-width container elements causing horizontal overflow on mobile viewports.
- [ ] Proper `z-index` hierarchy; no stacking context bugs where dropdowns hide behind banners.
- [ ] Sticky headers and floating CTA buttons do not overlap or obscure interactive content.
- [ ] Responsive media queries structured consistently without arbitrary breakpoint bugs.

### 12. JavaScript Architecture & Runtime Stability
- [ ] Event listeners cleanly removed on unmount; no memory leaks during long browsing sessions.
- [ ] Timers (`setInterval`, `setTimeout`) properly cleared when no longer needed.
- [ ] Zero race conditions in asynchronous data fetches.
- [ ] React/Vue error boundaries wrap major UI sections to prevent full page blanking.
- [ ] Critical business copy rendered without hard dependency on complex client-side JS.
- [ ] Global namespace free of uncontrolled variable pollution.

### 13. HTML & DOM Architecture Quality
- [ ] Valid HTML5 doctype (`<!DOCTYPE html>`) and UTF-8 charset declared.
- [ ] `<html lang="...">` attribute defined with valid language code.
- [ ] Zero duplicate `id` attributes on the same page.
- [ ] Semantic HTML tags utilized (`<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`).
- [ ] Correct heading hierarchy maintained (single `<h1>`, logical `<h2>` to `<h6>` progression).
- [ ] No interactive elements nested inside interactive elements (e.g. `<a>` inside `<button>`).

### 14. Technical SEO — Advanced Crawlability & Indexation
- [ ] Unique, descriptive `<title>` tag (50–60 characters) and meta description (120–160 characters).
- [ ] Canonical tag (`<link rel="canonical">`) present, absolute, and matches domain/slash protocol.
- [ ] Robots.txt file accessible at `/robots.txt` and free of accidental blocking rules.
- [ ] XML Sitemap accessible at `/sitemap.xml` and referenced in robots.txt.
- [ ] Zero unintended `<meta name="robots" content="noindex">` on production pages.
- [ ] No orphan pages or dead ends; all key pages reachable within 3 clicks from homepage.

### 15. Search Engine & SERP Verification
- [ ] Brand name, brand + location, and core service queries inspected in Google SERPs.
- [ ] Organic snippets display clean titles and descriptions without truncated garbled text.
- [ ] Google sitelinks point to active, high-value pages.
- [ ] Staging, dev, or preview URLs (`staging.`, `dev.`, `test.`) confirmed blocked from indexation.

### 16. Structured Data (Schema.org JSON-LD)
- [ ] Schema.org JSON-LD declared (`Organization`, `LocalBusiness`, `Product`, `Article`, `FAQPage`).
- [ ] Valid schema syntax without missing required properties.
- [ ] Structured data values match visible on-page copy exactly (price, address, telephone).
- [ ] BreadcrumbList schema implemented for complex site taxonomies.

### 17. Business Identity Consistency (NAP Verification)
- [ ] Business Name (N), Physical Address (A), and Phone Number (P) match across all pages.
- [ ] Footer NAP matches header contact information, Contact Us page, and JSON-LD schema.
- [ ] Operating hours, email addresses, and location details match Google Business Profile.

### 18. Accessibility Audit (Manual & WCAG 2.1 AA)
- [ ] Complete keyboard navigability: `Tab`, `Shift+Tab`, `Enter`, `Space`, and `Escape`.
- [ ] High-contrast visible focus rings present on all interactive elements.
- [ ] Informational images have meaningful `alt` descriptions; decorative images use `alt=""`.
- [ ] Text-to-background color contrast meets minimum 4.5:1 ratio (3:1 for large text).
- [ ] Form inputs have explicitly linked `<label for="...">` tags.
- [ ] Full functionality preserved at 200% browser zoom without horizontal scrolling.
- [ ] `prefers-reduced-motion` media query respected for users with vestibular disorders.

### 19. Error Handling & Graceful Recovery UX
- [ ] System handles network disconnects, server timeouts, and invalid user inputs gracefully.
- [ ] Inline error messages explain what went wrong and provide immediate instructions to fix.
- [ ] Form input state preserved after validation failure (user never forced to re-type everything).
- [ ] Clear retry buttons provided on failed data requests or payment submissions.

### 20. Empty States UX
- [ ] Helpful empty state rendered when site search returns zero matching results.
- [ ] Empty shopping cart displays clear product recommendations and "Continue Shopping" CTA.
- [ ] Product catalog filters that yield 0 items show clear "Reset All Filters" button.
- [ ] User account dashboard shows welcoming onboarding guidance when no prior orders exist.

### 21. 404 / 500 / Error Page Handling
- [ ] Deliberately invalid URLs return an authentic HTTP `404 Not Found` status (not fake 200 OK).
- [ ] Branded custom 404 error page provides clear search bar, popular links, and home navigation.
- [ ] No aggressive redirect-to-homepage rules that confuse users landing on expired links.
- [ ] Server 500 error pages display clean, apologetic messages without leaking internal stack traces.

### 22. URL Behaviour, Canonicalization & Redirects
- [ ] Canonical domain enforced with permanent 301 redirect between `http://` and `https://`.
- [ ] Domain consistency enforced between `www.` and non-www versions.
- [ ] Trailing slash consistency enforced (site does not serve duplicate content on `/page` vs `/page/`).
- [ ] Uppercase URLs automatically redirect to lowercase counterparts.
- [ ] Query parameters preserved cleanly during redirects.
- [ ] URL encoding and hash fragments handle special characters without routing failure.

### 23. Security — Expanded Transport & Exposure Audit
- [ ] Modern TLS 1.2 / 1.3 enforced; SSL certificate valid with >30 days remaining.
- [ ] Strict-Transport-Security (HSTS) header configured with `max-age` and `includeSubDomains`.
- [ ] X-Content-Type-Options set to `nosniff`.
- [ ] X-Frame-Options set to `DENY` or `SAMEORIGIN` (mitigates clickjacking).
- [ ] Content-Security-Policy (CSP) configured to prevent unauthorized inline script injection.
- [ ] Passive probes confirm sensitive paths are blocked (`/.env`, `/.git`, `/wp-config.php`, `/xmlrpc.php`).
- [ ] Client-side JS bundles free of private API keys, backend secrets, or staging IP addresses.

### 24. Cookies & Privacy Governance
- [ ] Functional cookie consent banner present in GDPR/CCPA jurisdictions.
- [ ] Tracking and analytics scripts blocked from executing prior to user consent.
- [ ] Cookies set with `Secure`, `HttpOnly`, and `SameSite` (Lax/Strict) flags.
- [ ] Cookie consent preferences can be reopened, adjusted, or revoked at any time.

### 25. Local Storage / Browser Storage Audit
- [ ] LocalStorage, SessionStorage, and IndexedDB inspected in DevTools Application tab.
- [ ] Zero unencrypted sensitive auth tokens, passwords, or PII stored client-side.
- [ ] No stale, obsolete data accumulating across sessions causing client app crashes.
- [ ] Storage quota usage kept minimal; clean garbage collection implemented.

### 26. Analytics, Pixels & Conversion Tracking
- [ ] Google Analytics 4 (GA4) and Google Tag Manager (GTM) installed and sending clean hits.
- [ ] Meta Pixel, Microsoft Clarity, or Hotjar tracking scripts verified.
- [ ] Custom conversion events fire reliably on CTA clicks, phone taps, form submissions, and purchases.
- [ ] Zero double-firing or duplicate transaction reporting on conversion events.
- [ ] UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`) persist across multi-page journeys.

### 27. Third-Party Dependency & CDN Audit
- [ ] Complete inventory of external third-party script domains (CDNs, analytics, chat, fonts).
- [ ] Zero render-blocking synchronous external scripts loaded in `<head>` without `defer` or `async`.
- [ ] Third-party failure resilience verified: site continues rendering if an external analytics server lags.
- [ ] Redundant, duplicate, or outdated external libraries identified for consolidation.

### 28. Cross-Browser Compatibility (Chromium, Firefox, Safari)
- [ ] Verified on Chromium engines (Google Chrome, Microsoft Edge, Brave).
- [ ] Verified on Mozilla Firefox (inspect CSS flexbox, grid, and scrollbar behavior).
- [ ] Verified on Apple WebKit (macOS Safari & iOS Safari): date pickers, form buttons, sticky position.

### 29. Device / Responsive Audit (320px to 4K)
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1.0">` declared.
- [ ] Zero horizontal overflow or scrollbar at 320px screen width (iPhone SE baseline).
- [ ] Responsive testing across 320px, 375px, 390px, 414px, 768px tablet, 1440px laptop, and 4K desktop.
- [ ] Touch targets on mobile measure at least 44x44 CSS pixels with generous spacing.
- [ ] Mobile sticky call/chat buttons do not cover important footer links or form submit buttons.

### 30. Device & Network State UX (Slow 4G, Offline)
- [ ] Graceful degradation on slow 4G and 3G connections; skeleton loaders indicate loading progress.
- [ ] Offline notification displays when internet connection drops; cached pages remain readable.
- [ ] Automatic re-sync and recovery once network connection is restored.
- [ ] Form submissions queued or clearly alerted if connection is lost mid-submission.

### 31. Search, Filter & Sort Functionality
- [ ] Search input clearly visible and accessible (`<input type="search">`).
- [ ] Handles spelling typos and partial queries gracefully with smart fallback suggestions.
- [ ] Multi-filter attribute combinations update URL query parameters cleanly.
- [ ] "Reset All Filters" button immediately restores original catalog view.
- [ ] Sorting options (Price Low-to-High, Highest Rated, Newest) function accurately without breaking pagination.

### 32. Pagination & Infinite Scroll Handling
- [ ] Numbered pagination (Page 1, 2, 3, Next, Last) functions cleanly without jumping to top unexpectedly.
- [ ] Proper SEO canonical and indexation handling on paginated series.
- [ ] Infinite scroll / "Load More" dynamically updates URL or maintains scroll position on back button navigation.
- [ ] Footer remains accessible and is not pushed indefinitely away by auto-triggering infinite scroll.

### 33. Browser History & State Preservation
- [ ] Single Page Application (SPA) routes respond accurately to browser Back and Forward buttons.
- [ ] Opening and closing modals updates or respects browser history without trapping the user.
- [ ] Filtering, search parameters, and tab selections preserve state across page reloads.

### 34. Deep Links & Route Integrity
- [ ] Direct URLs to sub-services, catalog items, and dashboard tabs load directly with 200 OK.
- [ ] Deep links do not unexpectedly redirect users to the homepage on initial load.
- [ ] Direct links to authenticated pages redirect cleanly to login and redirect back after authentication.

### 35. Share & Social Preview Audit (Open Graph / Twitter Cards)
- [ ] Open Graph title (`og:title`), description (`og:description`), and canonical URL (`og:url`) defined.
- [ ] Open Graph image (`og:image`) configured with optimal dimensions (1200x630px) and loads over HTTPS.
- [ ] Twitter Card markup declared (`twitter:card` set to `summary_large_image`).
- [ ] Social share previews verified on WhatsApp, LinkedIn, Facebook, and X/Twitter.
- [ ] Favicon, Apple Touch Icon, and Web App Manifest icons present and sharp.

### 36. Print Audit (Ctrl + P Optimization)
- [ ] Page printable with clean `@media print` CSS stylesheet.
- [ ] Unnecessary web chrome (header navigation, mobile menus, sticky chat widgets, footer social links) hidden.
- [ ] Background colors and text contrast adjusted for crisp, readable black-and-white printing.
- [ ] Images scale cleanly; data tables do not break awkwardly across page breaks (`page-break-inside: avoid`).
- [ ] Essential business details, audit report data, and contact information prominently preserved on printed sheets.

### 37. Media, Video & Audio Embeds
- [ ] Video embeds (YouTube, Vimeo, native MP4) are fully responsive and preserve 16:9 aspect ratio.
- [ ] Autoplay videos are muted by default (`autoplay muted playsinline`).
- [ ] Video elements provide high-res poster images to eliminate layout shift during video load.
- [ ] Heavy video iframes lazy-loaded to prevent blocking initial page render.
- [ ] Captions and transcripts available for audio/video materials.

### 38. File Upload / Download & Clipboard Audit
- [ ] **File Upload:** Whitelist of accepted extensions enforced (`.pdf`, `.jpg`, `.png`).
- [ ] Oversized, empty, or corrupted files rejected with helpful inline error guidance.
- [ ] Drag-and-drop file upload zone functional and visually responsive.
- [ ] Upload progress indicator displays during file transfer; cancel and retry options working.
- [ ] Mobile camera upload integration verified on mobile iOS/Android devices.
- [ ] **Clipboard & Download:** "Copy to Clipboard" buttons provide instant visual confirmation toast ("Copied!").
- [ ] Clipboard API operations fall back gracefully if browser permissions are restricted.
- [ ] Downloadable files trigger with correct file names, extensions, and MIME headers.

### 39. Authentication & Session Management
- [ ] Secure login and registration with validation feedback on password strength.
- [ ] "Forgot Password" workflow sends verified reset link with 15–30 minute expiration window.
- [ ] Invalid login attempts show generic error message (preventing username enumeration).
- [ ] Session tokens stored in `HttpOnly`, `Secure` cookies (immune to XSS theft).
- [ ] Logging out immediately invalidates session tokens on both client and server.
- [ ] Password reset immediately revokes all other active device sessions.

### 40. User Account & Dashboard Experience
- [ ] Profile details, email preferences, and passwords editable with instant confirmation.
- [ ] Order history and past invoices downloadable as PDF records.
- [ ] Inactive sessions automatically time out after prolonged inactivity.
- [ ] Server-side authorization prevents Insecure Direct Object References (IDOR) on account records.

### 41. E-commerce General & Store Operations
- [ ] **Product Pages:** Title, SKU, price, stock status, high-res images, and reviews display correctly.
- [ ] **Categories & Search:** Filtering by price, category, and attributes functions without broken pagination.
- [ ] **Variations:** Color/size variant switching updates price, SKU, and image instantly.
- [ ] **Cart & Checkout:** Add to cart drawer/page updates count; coupon codes apply; tax and shipping calculate properly.
- [ ] **Store Policies:** Dedicated Return & Refund Policy link visible in global footer.

### 42. Payment Integrity *(Sandbox / Authorized Testing)*
- [ ] Successful test payment creates verified order in backend database and sends receipt email.
- [ ] Failed payment displays clear explanation (e.g. card declined) with instant retry option.
- [ ] Cancelled payment returns customer cleanly to cart without emptying stored items.
- [ ] Duplicate clicks on "Pay Now" do not trigger double-charging.
- [ ] Webhook reconciliation verifies order status even if customer closes browser before redirect.

### 43. Multi-Currency, Tax & Shipping Calculations
- [ ] Multi-currency switcher updates symbol, decimal precision, and exchange rate accurately.
- [ ] Shipping rates calculate according to customer destination zip/postal code.
- [ ] Tax amounts are itemized clearly before final payment authorization.
- [ ] Checkout calculations match across summary drawer, order confirmation, and invoice receipt.

### 44. Date / Time & Booking Schedule Logic
- [ ] Timezones handled correctly (browser local time converted accurately to business calendar time).
- [ ] Daylight saving adjustments do not cause 1-hour appointment discrepancies.
- [ ] Expired dates and past appointment slots disabled automatically.
- [ ] Automated reminders trigger at correct relative intervals (24h before, 1h before).

### 45. CMS General (WordPress, Webflow, Shopify, Drupal)
- [ ] Core CMS and active extensions updated to latest stable, secure versions.
- [ ] Inactive plugins/themes deleted (not merely disabled).
- [ ] Admin panel protected with strong password policy and 2FA where available.
- [ ] Draft and private pages confirmed unindexed and inaccessible via public URLs.

### 46. WordPress Deep Audit
- [ ] **Core:** WP version, PHP version (8.1+ recommended), memory limit (`WP_MEMORY_LIMIT >= 256M`).
- [ ] **XML-RPC & REST API:** XML-RPC disabled if unused (mitigates DDoS and brute-force attacks).
- [ ] **Theme:** Child theme utilized; functions.php free of hardcoded URLs or bloat.
- [ ] **Elementor:** Optimized DOM Output enabled; redundant column containers removed; CSS print method set to external file.
- [ ] **Database:** Autoloaded options (`wp_options`) under 800 KB; expired transients and revisions cleaned; Action Scheduler free of stuck failed jobs.

### 47. GoHighLevel (GHL) Funnels & CRM Deep Audit
- [ ] **Funnels:** Every funnel step URL, mobile layout, and destination redirect verified.
- [ ] **Forms & Surveys:** Custom field mapping, lead tags, and pipeline stage assignments confirmed.
- [ ] **Automations:** Workflow triggers fire without loops; stop conditions configured; SMS compliance (A2P 10DLC) active.
- [ ] **Calendars:** Slot buffers, appointment confirmation, and cancellation/reschedule links working.
- [ ] **Agency Snapshots:** Custom values and domain mappings intact across client locations.

### 48. Shopify Deep Audit (Liquid, Apps & Checkout)
- [ ] **Liquid & App Bloat:** Orphaned scripts from uninstalled apps removed from `theme.liquid`.
- [ ] **Checkout:** Accelerated payment options (Shop Pay, Apple Pay, Google Pay) functioning.
- [ ] **E-commerce Tracking:** GA4 and Meta Pixel `Purchase` and `AddToCart` events verified without double-firing.

### 49. React / Next.js Deep Audit (SSR, Hydration, RSC)
- [ ] **Runtime:** Zero hydration mismatch errors (`Text content did not match server-rendered HTML`).
- [ ] **Architecture:** Server Components (RSC) used by default; `"use client"` directives minimized.
- [ ] **Bundle Size:** Code splitting with dynamic imports (`next/dynamic`) on heavy interactive widgets.
- [ ] **Next.js Features:** `next/image` with proper `sizes`, `next/font` with zero layout shift.

### 50. React Native Mobile App Audit
- [ ] **Device Context:** Verified on physical low-end Android and modern iOS devices.
- [ ] **Network Transitions:** Graceful handling of slow network, offline mode, and automatic reconnection.
- [ ] **Permissions:** Clear rationale shown before prompting for Camera, GPS, or Notifications.
- [ ] **Crash Behavior:** Crashlytics / error boundary captures uncaught runtime exceptions without freezing screen.

### 51. Localization & Multi-Language (i18n / RTL)
- [ ] Language switcher preserves current page path (doesn't dump user on homepage).
- [ ] `hreflang` tags configured with `x-default` fallback.
- [ ] Dates, numbers, and currency formatted according to selected locale.
- [ ] RTL (Right-to-Left) layouts render with correct padding/margins for Arabic/Urdu if applicable.

### 52. Content Quality & Value Proposition
- [ ] Free of grammatical errors, typos, and broken placeholder copy ("Lorem ipsum").
- [ ] Value proposition clear with verifiable business benefits.
- [ ] Contact details and operating hours accurate and consistent across all pages.

### 53. AI-Era Content & AI Search Readiness (GEO)
- [ ] **Machine-Readable Content:** Key business information present in static HTML, not hidden strictly behind JS clicks.
- [ ] **Structured Schema:** Schema.org `Organization`, `LocalBusiness`, `FAQPage`, or `Product` JSON-LD declared.
- [ ] **AI Bot Permissions:** Robots.txt reviewed for AI search crawlers (`GPTBot`, `ClaudeBot`, `PerplexityBot`).
- [ ] **AI Chatbots:** Chatbot provides verified business answers; has seamless fallback/handoff to human agent.

### 54. Privacy & Data Governance (GDPR / CCPA)
- [ ] Global Privacy Policy and Terms of Service links accessible from every page.
- [ ] Cookie consent banner blocks tracking scripts prior to explicit consent in GDPR jurisdictions.
- [ ] Clear disclosure on contact and lead forms regarding data processing.

### 55. Email Infrastructure & Domain Deliverability
- [ ] SPF (`v=spf1 ... -all`) and DMARC (`v=DMARC1`) records verified in DNS.
- [ ] Form notification emails sent from authenticated domain (not fake unverified addresses).
- [ ] Inquiries land reliably in primary inbox, not junk/spam.

### 56. DNS & Domain Health
- [ ] A, AAAA, CNAME, and MX records configured cleanly.
- [ ] Single canonical domain enforced (301 redirect between www and non-www).
- [ ] Domain expiration verified (>60 days remaining).

### 57. Server & Infrastructure Health *(Credentialed Access)*
- [ ] CPU, RAM, and disk I/O usage within safe operating thresholds (<75%).
- [ ] PHP memory limit adequate for CMS workload (256M–512M).
- [ ] Server error logs free of recurring fatal errors or memory exhaustion crashes.

### 58. Backup & Disaster Recovery Readiness
- [ ] Automated off-site backups scheduled (daily or weekly depending on traffic).
- [ ] Database and file backups stored separately from host server.
- [ ] Restoration drill tested (a backup that cannot be restored is no backup).

### 59. Deployment & Environment Contamination
- [ ] Zero references to `localhost`, `127.0.0.1`, `staging.`, or `dev.` in production HTML or JS bundles.
- [ ] Source maps (`.map`), Git repositories (`.git`), and `.env` files blocked from public access.

### 60. Dependency & Supply Chain Security (CVEs)
- [ ] No outdated JavaScript libraries with known CVEs (e.g. legacy jQuery 1.x/2.x).
- [ ] Third-party CDNs load over HTTPS with Subresource Integrity (SRI) hashes where critical.

### 61. CMS & Site Content Operations
- [ ] Publishing, scheduling, and revision histories function cleanly.
- [ ] No broken dynamic shortcodes (e.g. `[contact-form-7 404]`) appearing as raw text.

### 62. Notifications & Communication Triggers
- [ ] UI toast messages appear on action and auto-dismiss after 3–5 seconds.
- [ ] SMS and email notifications deliver with correct dynamic tags (customer name, appointment time).

### 63. Third-Party Failure Resilience
- [ ] Third-party scripts in `<head>` load asynchronously (`async` or `defer`).
- [ ] If an external tracking or widget server hangs, initial page rendering does NOT freeze.

### 64. JavaScript Disabled Baseline Test
- [ ] Primary business copy and navigation links remain accessible in plain HTML if JavaScript is disabled.

### 65. Ad Blocker & Privacy Extension Compatibility
- [ ] Core navigation, forms, and checkout operate normally when uBlock Origin or Brave Shields are active.

### 66. Edge-Case Input & Security Fuzzing
- [ ] Form inputs handle special characters (`&`, `<`, `>`, `"`, `'`), emoji, and very long text without SQL/XSS errors.

### 67. Accessibility of Dynamic Interactive Components
- [ ] Modals trap keyboard focus inside while open; return focus to trigger button upon pressing `ESC`.
- [ ] Accordions and dropdowns toggle `aria-expanded="true/false"` dynamically.

### 68. E-commerce Abandoned Cart Recovery
- [ ] Automated abandoned cart emails trigger within 1–4 hours with valid recovery link.

### 69. Subscription & Membership Lifecycle
- [ ] Signup, automated renewal, card update portal, and cancellation workflows operate smoothly.

### 70. Permissions / Roles (Multi-User Applications)
- [ ] Role hierarchy verified: Visitor, Registered User, Manager, Administrator.
- [ ] Hidden UI elements are backed by server-side authorization guards (unauthorized URLs return 401/403).
- [ ] Role privileges persist correctly during active session.
- [ ] Session tokens invalidated immediately upon logout.

### 71. Customer Journey Audit — Mandatory (5 Journeys)
Mandatory high-value journeys evaluated in every Webarg audit:
- **Journey A — New Visitor:** `Search → Homepage → 5-Second Clarity → Primary CTA`
- **Journey B — Inquiring Lead:** `Homepage → Contact Form / Phone → Submission → Notification Delivery`
- **Journey C — Mobile Customer:** `320px Mobile Screen → Touch CTA → Dial / Chat Conversion`
- **Journey D — Returning User:** `Direct URL → Cached State → Fast Route Navigation`
- **Journey E — Failure Recovery:** `Wrong Input / Payment / 404 Route → Clear Inline Guidance → Retry → Success`
*Status for each:* `PASS` 🟢 | `WARNING` 🟠 | `CRITICAL` 🔴

### 72. Evidence Collection & Proof Standards
Every reported issue must have verifiable proof:
- Screenshot / visual clip of defect
- Target URL and exact DOM selector
- Device, browser, and screen resolution
- Timestamp of inspection
- HTTP response status code / headers
- Console runtime error text and line number
- Core Web Vitals metric reading (LCP, CLS, INP)
- Step-by-step reproduction instructions

### 73. Finding Quality Rules & Documentation Standards
- ❌ **Poor Finding:** *"The website is slow."*
- ✅ **Professional Finding:**
  > **High — Homepage LCP exceeds Core Web Vitals target (4.1s)**  
  > **Evidence:** LCP measured at 4.1s on 4G mobile emulation; hero banner image `hero.png` is 3.8 MB uncompressed.  
  > **User Impact:** Mobile visitors stare at an empty viewport for over 4 seconds before reading the value proposition.  
  > **Business Impact:** High bounce rate on mobile paid traffic; organic search ranking penalties from Google.  
  > **Recommendation:** Convert hero image to WebP/AVIF, resize to 1200px max width, and add `fetchpriority="high"`.  
  > **Verification:** Re-scan mobile performance after deployment to confirm LCP drops below 2.0s.

### 74. Business Impact Classification & Commercial Risk
Every technical flaw is categorized by commercial risk:
1. **Revenue Leakage:** Checkout failure, payment gateway crash, shopping cart bugs.
2. **Lead Leakage:** Broken contact forms, unclickable phone numbers, missing SPF/DMARC.
3. **Search Visibility:** Indexation blocks (`noindex`), canonical mismatches, slow CWV metrics.
4. **Buyer Trust:** Broken SSL certificates, outdated copyright ("© 2021"), console crashes.
5. **Accessibility Risk:** Keyboard traps, missing form labels, WCAG compliance failure.

### 75. Prioritized Sprint Roadmap (Priority 1 to 4)
- **Priority 1 (Fix Immediately):** Broken forms, checkout failure, lead leakage, critical security risks, fatal JS crashes.
- **Priority 2 (Next Scheduled Sprint):** Mobile UX friction, Core Web Vitals optimizations, SEO blockers, accessibility issues.
- **Priority 3 (Optimization):** Code minification, asset cleanup, minor responsive spacing.
- **Priority 4 (Polish):** Typography micro-tuning, minor animation transitions.

### 76. Final QA Before Delivering Report
- [ ] Re-test every Critical issue to confirm reproducibility.
- [ ] Eliminate false positives and verify screenshots match the live site.
- [ ] Clearly demarcate automated URL observations from access-gated internal recommendations.

### 77. Final Client Report Architecture
```text
WEBARG — Technical Website Audit & Inspection Report
├── Executive Summary (Overall health, top risks, commercial impact)
├── 4 Core Scores (Performance, SEO, Accessibility, Security)
├── Conversion Journey Verification (Call, WhatsApp, Email, Forms, CTAs)
├── 5 Simulated Customer Journeys (A, B, C, D, E)
├── Technical Diagnostics (Console, Infrastructure, Security, Caching, Assets)
├── Live Evidence (DOM selectors, HTTP codes, console logs, timestamps)
└── Prioritized Remediation Roadmap (Priority 1, 2, 3 with effort estimations)
```

### 78. Webarg Product Recommendation & Positioning
Webarg replaces generic Lighthouse scores with a holistic diagnosis:
$$\text{Overall Health} \rightarrow \text{Business Impact} \rightarrow \text{4 Core Scores} \rightarrow \text{Technical Evidence} \rightarrow \text{Conversion Journeys} \rightarrow \text{Remediation}$$

### 79. Platform & Tech Stack Detection
Identifies underlying architecture: WordPress, WooCommerce, Elementor, Shopify, Webflow, GoHighLevel, Wix, Squarespace, React, Next.js, Vue, Nuxt, Laravel, or Native mobile apps.

### 80. Access Level Matrix & Anti-Hallucination Boundary
- **Level 1 (Audited Live):** Public URL surface (DOM, CSS, JS errors, SEO, DNS, SSL, security headers).
- **Level 2 & 3 (Manual Playbook Sprint):** CMS Admin, GHL Automations, Payment Sandbox, Physical Device Dialers, Database Internals.

### 81. The One-Day Audit Rule (Deep Sampling)
A one-day audit is deep rather than wide. Uses intelligent sampling across key templates and high-value conversion funnels rather than superficial scanning of 1,000 pages.

### 82. The Most Important Principle
Never state: *"There are 23 issues."*  
State:  
> *"Inspection identified 23 verified checks. 4 require immediate attention to prevent lead leakage, 7 affect conversion consistency or search visibility, and 12 are scheduled optimization opportunities."*

### 83. Universal Finding Template
```text
ID: [Unique ID]
Category: [SEO / Security / Conversion / Performance / Console]
Severity: [Critical / High / Medium / Low]
URL: [Exact Page URL]
Device / Browser: [Mobile / Desktop - Chrome / Safari]
Timestamp: [ISO Timestamp]

Finding: [Clear statement of the defect]
Evidence: [Verifiable proof: selector, code, log, status code]
User Impact: [What the customer experiences]
Business Impact: [Financial, lead, or trust consequence]
Recommendation: [Specific, actionable fix]
Verification: [How to retest after fix]
Effort: [Low / Medium / High]
Status: [Open / Remediation In Progress / Verified Fixed]
```

### 84. Final Audit Completion Checklist
Confirm all inspection surfaces were evaluated: Functional, Conversion, Click-to-call, WhatsApp, Email, Forms, Console, Network, CWV, Images, Fonts, CSS, JS, DOM, SEO, Schema, Accessibility, Mobile 320px, Security, Cookies, Privacy, Analytics, CMS, CRM/GHL, Shopify, E-commerce, Payments, DNS, Email Infra, Server, Database, Backups, AI Readiness, 5 Customer Journeys, Evidence, Remediation.

---

## 8. Client Pitch Script & Sales Closing Engine

```text
Hi [Client Name],

I conducted a full technical inspection of [Business Name]'s website to assess its mobile performance, lead-capture systems, and infrastructure health.

I identified [X] specific issues. Of these, [Y] are critical vulnerabilities directly causing lead leakage:

1. [Critical Issue 1 - e.g. Phone number is unclickable plain text rather than tap-to-call on mobile]
2. [Critical Issue 2 - e.g. Contact form submit button fails to render on mobile screens]
3. [Critical Issue 3 - e.g. Email authentication (SPF/DMARC) missing, causing inquiry emails to land in spam]

I have compiled the complete technical diagnosis, live evidence, and remediation priority into an inspection report here:
[Webarg Report Link / Attached PDF]

Would you like me to resolve these issues for you in a focused remediation sprint this week?

Best regards,
Abid
```

---

## 9. Admin Console Credentials & Configuration

- **Admin Access Route:** `/admin` (e.g. `http://localhost:5173/admin`)
- **Admin Authentication Method:** Master Key Token verification
- **Environment Password:** `admin-webarg-secret-2026`
  *(Defined in `/server/.env` as `ADMIN_PASSWORD`)*
- **Admin Capabilities:**
  - View full scan history and persisted reports on disk.
  - Launch live website diagnosis directly from the bottom-right floating trigger.
  - Manage live runtime API keys for Browserless.io and Gemini AI.
  - Delete obsolete reports or inspect comparative delta views (`?compare=true`).

---
*Webarg — Technical Website Audit & Inspection Engine · Built for High-Trust Client Remediation.*
