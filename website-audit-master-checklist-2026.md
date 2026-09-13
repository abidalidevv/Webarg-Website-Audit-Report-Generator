# Website Audit Master Checklist — 2026
*The Definitive Technical, Conversion & Deep Manual Audit Playbook (Sections 1 to 69)*

---

## Purpose & Philosophy

Yeh master checklist kisi client ki website, web app, CMS, funnel, e-commerce store, GHL setup, React/Next.js application, ya mobile app ka **deep manual + technical audit** karne ke liye design kiya gaya hai.

Goal sirf surface-level bugs dhoondhna nahi hai. Final report ko 5 core questions ka verifiable answer dena chahiye:

1. **Kya broken hai?** (The exact technical failure)
2. **Evidence kya hai?** (URL, DOM selector, HTTP status, console log, timestamp, screenshot)
3. **User par kya impact hai?** (User experience friction, broken interaction, confusion)
4. **Business / conversion par kya impact hai?** (Lost leads, checkout abandonment, SEO drop, security breach)
5. **Fix ki priority kya honi chahiye?** (Priority 1 immediate fix vs Priority 2 scheduled sprint)

### The Standard Finding Format
Har finding ko is structure mein document karein:

> **Severity → Finding → Evidence → User Impact → Business Impact → Recommendation → Verification**

### Severity Classification
- **🔴 CRITICAL:** Functionality completely broken, revenue loss, form/lead failure, major security vulnerability, ya core customer journey blocked.
- **🟠 HIGH / WARNING:** Conversion friction, severe performance drag (Core Web Vitals), search indexing risk, mobile layout shift, ya accessibility barrier.
- **🟡 MEDIUM / POLISH:** Quality flaws, missing metadata, unoptimized assets, minor responsive imperfections.
- **⚪ LOW:** Technical debt, minor code cleanup, deprecation warnings.
- **🟢 PASS:** Technical standard successfully verified.

---

## 1-Day Professional Audit Schedule

| Time Allocation | Inspection Surface & Scope |
| :--- | :--- |
| **30 min** | **Full site walkthrough:** Navigation, menus, CTAs, cross-page consistency |
| **60 min** | **DevTools + Console + Network:** JS errors, uncaught exceptions, failed 4xx/5xx requests, slow API calls |
| **60 min** | **Performance & Core Web Vitals:** LCP, CLS, TBT, TTFB, heavy assets, DOM size |
| **60 min** | **SEO & Crawlability:** Meta tags, canonicals, robots.txt, sitemap, headings, schema.org JSON-LD |
| **45 min** | **Mobile / Responsive QA:** 320px screen check, viewport scaling, touch targets, horizontal overflow |
| **45 min** | **Accessibility (a11y):** Keyboard navigation, visible focus states, form labels, color contrast, ARIA |
| **45 min** | **Security & Infrastructure:** SSL cert, security headers (CSP, HSTS), DNS (SPF/DMARC), exposed endpoints |
| **30 min** | **Forms & Conversion Funnels:** Validation rules, required fields, autofill UX, spam prevention |
| **30 min** | **Analytics & Tracking Tags:** GA4, GTM, Meta Pixel, Hotjar, event firing triggers |
| **45 min** | **Full Crawl & Broken Links:** 404 links, redirect loops, dead `#` anchors, reverse tabnabbing |
| **45 min** | **Final QA, Evidence Gathering & Report Formulation:** Screenshots, remediation roadmap, client pitch |
| *Extra / Parallel* | *CMS (WordPress/Elementor), GHL Funnels, Shopify, React runtime, or Database audits* |

---

# Part 1: Core Technical & Quality Baseline (Sections 1 to 40)

### 1. Basic Website / Functional Audit
- [ ] Homepage properly loads without broken assets.
- [ ] Logo links back to `/`.
- [ ] Navigation links, dropdowns, and mobile hamburger work flawlessly.
- [ ] Internal links return 200 OK (no 404s).
- [ ] Contact details match across header, footer, and contact page.

### 2. Browser Console / Technical Errors
- [ ] Zero `Uncaught TypeError`, `ReferenceError`, or `SyntaxError`.
- [ ] Failed AJAX/fetch requests captured and logged.
- [ ] Deprecated API usage warnings noted.
- [ ] Third-party script errors (Maps, Pixels, GTM, Chat) isolated.

### 3. Network / Server Audit
- [ ] HTTP responses verified (clean 200s, minimal 301s, zero 500s/502s).
- [ ] TTFB under 400ms globally.
- [ ] Asset compression verified (Brotli `br` or Gzip).
- [ ] Caching headers active (`Cache-Control: max-age=...`, `ETag`).

### 4. Performance Audit
- [ ] Largest Contentful Paint (LCP) under 2.5s.
- [ ] Interaction to Next Paint (INP) under 200ms.
- [ ] Cumulative Layout Shift (CLS) under 0.1.
- [ ] Total Blocking Time (TBT) under 200ms.

### 5. Mobile & Responsive Audit
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1.0">` present.
- [ ] Zero horizontal overflow at 320px width (iPhone SE baseline).
- [ ] Touch targets minimum 44x44px.

### 6. Technical SEO Audit
- [ ] Unique `<title>` (50–60 chars) and meta description (120–160 chars).
- [ ] Single primary `<h1>` element.
- [ ] Valid `<link rel="canonical">` matching protocol and trailing slash.
- [ ] Zero accidental `<meta name="robots" content="noindex">` on live pages.

### 7. Accessibility Audit (WCAG 2.1 AA)
- [ ] All informational images have descriptive `alt` text.
- [ ] Form controls have associated `<label>` tags.
- [ ] Full keyboard navigation (`TAB`, `SHIFT+TAB`, `ENTER`, `ESC`).
- [ ] Visible focus indicators on all interactive elements.

### 8. Security Audit
- [ ] HTTPS enforced with automatic 301 from HTTP.
- [ ] Modern TLS 1.2 / 1.3 only; certificate valid with >30 days remaining.
- [ ] Security headers: HSTS, X-Frame-Options, X-Content-Type-Options, CSP, Referrer-Policy.
- [ ] No server or technology banners leaked (`Server`, `X-Powered-By`).

### 9. UI / UX Audit
- [ ] 5-second test passed (clarity of offer and target audience).
- [ ] Clear primary CTA above the fold with proper visual hierarchy.
- [ ] Trust signals (reviews, client logos, certifications) prominently placed.

### 10. Visual / Design QA
- [ ] Typography consistency (font families, weights, line heights).
- [ ] Spacing system and grid alignment consistent.
- [ ] No clipped text, awkward whitespace, or overlapping elements.

### 11. Forms / Lead Generation Audit
- [ ] Dedicated submit button present on every form.
- [ ] Required fields, email format, and phone format validated.
- [ ] Standard `autocomplete` attributes declared (`autocomplete="name"`, `autocomplete="email"`).
- [ ] Spam protection active (Turnstile, reCAPTCHA, honeypot).

### 12. Analytics / Tracking Audit
- [ ] Google Analytics 4 (GA4) and Google Tag Manager (GTM) present.
- [ ] Meta Pixel, Microsoft Clarity, or Hotjar scripts verified.
- [ ] Custom conversion events (CTA click, Form submit, Phone tap) firing without duplicates.

### 13. E-commerce Baseline Audit
- [ ] Product Schema JSON-LD present.
- [ ] Cart drawer / page opens smoothly.
- [ ] Checkout page loads securely over HTTPS with zero mixed content.

### 14. Content / Copy Audit
- [ ] Plain HTML contains full content (not an empty shell without JS).
- [ ] Free of spelling, grammar, and outdated business info.
- [ ] Clear service benefits and value propositions.

### 15. Cross-Browser Testing
- [ ] Verified across Chromium (Chrome/Edge), Firefox, and WebKit (Safari).

### 16. Broken Link & Site Crawl
- [ ] Zero 404 links on scanned pages.
- [ ] Zero redirect chains (>2 hops) or redirect loops.
- [ ] External links protected against reverse tabnabbing (`rel="noopener noreferrer"`).

### 17. Website Architecture
- [ ] Logical URL structure (`/services/service-name`).
- [ ] Clean canonicalization without orphan pages.

### 18. Legal / Trust Checks
- [ ] Privacy Policy link in global footer.
- [ ] Terms & Conditions link in global footer.
- [ ] Copyright year is current (not outdated, e.g. "© 2021").

### 19. Real User Journey Testing
- [ ] Walked through Google Search $\rightarrow$ Homepage $\rightarrow$ Contact $\rightarrow$ Submit.

### 20. Severity Classification
- [ ] Strictly categorized into Critical 🔴, Warning 🟠, and Pass 🟢.

### 21. HTML Quality & Semantics
- [ ] Valid doctype, `<html lang="...">`, charset UTF-8.
- [ ] No interactive elements nested inside interactive elements.

### 22. DOM Architecture
- [ ] Total DOM nodes under 1,200.
- [ ] No duplicate script libraries or CSS bundles loaded.

### 23. JavaScript Behaviour
- [ ] Zero memory leaks, unhandled promises, or un-cleared intervals.

### 24. CSS Problems
- [ ] Zero layout-thrashing animations; no `!important` overuse.

### 25. Image Pipeline
- [ ] Explicit `width` and `height` on images (eliminating CLS).
- [ ] Modern WebP / AVIF formats; responsive `srcset` where appropriate.

### 26. Font Audit
- [ ] `font-display: swap` on web fonts to prevent FOIT.
- [ ] Preconnect hints for external font CDNs.

### 27. Caching Architecture
- [ ] Explicit `Cache-Control` max-age headers for static files.

### 28. Compression / Transfer
- [ ] Brotli / Gzip active on all text-based assets.

### 29. DNS / Domain Layer
- [ ] Root domain 301 redirects to `www` (or vice versa).
- [ ] A, AAAA, and MX records resolve without errors.

### 30. Email Infrastructure
- [ ] SPF record configured (`v=spf1 ... -all`).
- [ ] DMARC record configured (`v=DMARC1`).

### 31 & 32. API & Third-Party Audit
- [ ] Third-party domains inventoried; zero render-blocking synchronous scripts in `<head>`.

### 33. Cookie Audit
- [ ] Cookie consent banner detected; cookies set with Secure and SameSite flags.

### 34 & 35. Privacy & Source Code Leakage
- [ ] Passive probes verify `/.env`, `/.git`, `/xmlrpc.php` are blocked.
- [ ] No internal API keys or credentials exposed in client-side bundles.

### 36. Error Handling / UX Recovery
- [ ] Soft 404 test: Non-existent URL returns real HTTP 404 status.
- [ ] 404 page provides branded navigation back to homepage.

### 37 to 40. Interactive States, Search & Filters
- [ ] Loading spinners / disabled buttons on submit.
- [ ] Empty search queries return helpful fallback UX.

---

# Part 2: Advanced Deep Audits & Special Environments (Sections 41 to 69)

### 41. E-commerce General
- [ ] **Product Pages:** Title, SKU, price, stock status, high-res images, and reviews display correctly.
- [ ] **Categories & Search:** Filtering by price, category, and attributes functions without broken pagination.
- [ ] **Variations:** Color/size variant switching updates price, SKU, and image instantly.
- [ ] **Cart & Checkout:** Add to cart drawer/page updates count; coupon codes apply; tax and shipping calculate properly.
- [ ] **Store Policies:** Dedicated Return & Refund Policy link visible in footer.

### 42. Payment Integrity *(Sandbox / Authorized Testing)*
- [ ] Successful test payment creates verified order in backend.
- [ ] Failed payment displays clear explanation (e.g. card declined) with instant retry option.
- [ ] Cancelled payment returns customer cleanly to cart without emptying it.
- [ ] Duplicate clicks on "Pay Now" do not trigger double-charging.
- [ ] Webhook reconciliation verifies order status even if customer closes browser before redirect.

### 43. Currency / Tax / Shipping
- [ ] Multi-currency switcher updates symbol, decimal precision, and exchange rate accurately.
- [ ] Shipping rates calculate according to customer destination zip/postal code.
- [ ] Tax amounts are itemized clearly before final payment authorization.

### 44. Date / Time (Booking & Scheduling Systems)
- [ ] Timezones handled correctly (browser local time converted accurately to business calendar time).
- [ ] Daylight saving adjustments do not cause 1-hour appointment discrepancies.
- [ ] Expired dates/past slots disabled automatically.
- [ ] Automated reminders trigger at correct relative intervals (24h before, 1h before).

### 45. CMS General (WordPress, Webflow, Shopify, Drupal)
- [ ] Core CMS and active extensions updated to secure versions.
- [ ] Inactive plugins/themes deleted (not just disabled).
- [ ] Admin panel protected with strong password policy and 2FA where available.
- [ ] Draft and private pages not accidentally indexed or accessible via public URLs.

### 46. WordPress Deep Audit
- [ ] **Core:** WP version, PHP version (8.1+ recommended), memory limit (`WP_MEMORY_LIMIT >= 256M`).
- [ ] **XML-RPC & REST API:** XML-RPC disabled if unused (DDoS/brute-force mitigation).
- [ ] **Theme:** Child theme utilized; functions.php free of hardcoded URLs or bloat.
- [ ] **Elementor:** Optimized DOM Output enabled; redundant column containers removed; CSS print method set to external file.
- [ ] **Database:** Autoloaded options (`wp_options`) under 800 KB; expired transients and revisions cleaned; Action Scheduler free of stuck failed jobs.

### 47. GoHighLevel (GHL) Deep Audit
- [ ] **Funnels:** Every funnel step URL, mobile layout, and destination redirect verified.
- [ ] **Forms & Surveys:** Custom field mapping, lead tags, and pipeline stage assignments confirmed.
- [ ] **Automations:** Workflow triggers fire without loops; stop conditions configured; SMS compliance (A2P 10DLC) active.
- [ ] **Calendars:** Slot buffers, appointment confirmation, and cancellation/reschedule links working.
- [ ] **Agency Snapshots:** Custom values and domain mappings intact across locations.

### 48. Shopify Deep Audit
- [ ] **Liquid & App Bloat:** Orphaned scripts from uninstalled apps removed from `theme.liquid`.
- [ ] **Checkout:** Accelerated payment options (Shop Pay, Apple Pay, Google Pay) functioning.
- [ ] **E-commerce Tracking:** GA4 and Meta Pixel `Purchase` and `AddToCart` events verified without double-firing.

### 49. React / Next.js Deep Audit
- [ ] **Runtime:** Zero hydration mismatch errors (`Text content did not match`).
- [ ] **Architecture:** Server Components (RSC) used by default; `"use client"` minimized.
- [ ] **Bundle Size:** Code splitting with dynamic imports (`next/dynamic`) on heavy interactive widgets.
- [ ] **Next.js Features:** `next/image` with proper `sizes`, `next/font` with zero layout shift.

### 50. React Native App Audit
- [ ] **Device Context:** Verified on low-end Android and modern iOS devices.
- [ ] **Network Transitions:** Graceful handling of slow network, offline mode, and automatic reconnection.
- [ ] **Permissions:** Clear rationale shown before prompting for Camera, GPS, or Notifications.
- [ ] **Crash Behavior:** Crashlytics / error boundary captures uncaught runtime exceptions without freezing screen.

### 51. Localization & Multi-language
- [ ] Language switcher preserves current page path (doesn't dump user on homepage).
- [ ] `hreflang` tags configured with `x-default` fallback.
- [ ] Dates, numbers, and currency formatted according to selected locale.
- [ ] RTL (Right-to-Left) layouts render with correct padding/margins for Arabic/Urdu if applicable.

### 52. Content Quality
- [ ] Free of grammatical errors, typos, and broken placeholder copy ("Lorem ipsum").
- [ ] Value proposition clear with verifiable business benefits.
- [ ] Contact details and operating hours accurate and consistent across all pages.

### 53. AI-Era Content & AI Search Readiness
- [ ] **Machine-Readable Content:** Key business information present in static HTML, not hidden strictly behind JS clicks.
- [ ] **Structured Schema:** Schema.org `Organization`, `LocalBusiness`, `FAQPage`, or `Product` JSON-LD declared.
- [ ] **AI Bot Permissions:** Robots.txt reviewed for AI search crawlers (`GPTBot`, `ClaudeBot`, `PerplexityBot`).
- [ ] **AI Chatbots:** Chatbot provides verified business answers; has seamless fallback/handoff to human agent.

### 54. Privacy & Data Governance
- [ ] Global Privacy Policy and Terms of Service links accessible from every page.
- [ ] Cookie consent banner blocks tracking scripts prior to explicit consent in GDPR jurisdictions.
- [ ] Clear disclosure on contact and lead forms regarding data processing.

### 55. Email Infrastructure & Deliverability
- [ ] SPF (`v=spf1 ... -all`) and DMARC (`v=DMARC1`) records verified in DNS.
- [ ] Form notification emails sent from authenticated domain (not fake unverified addresses).
- [ ] Inquiries land reliably in primary inbox, not junk/spam.

### 56. DNS & Domain Health
- [ ] A, AAAA, CNAME, and MX records configured cleanly.
- [ ] Single canonical domain enforced (301 redirect between www and non-www).
- [ ] Domain expiration verified (>60 days remaining).

### 57. Server & Infrastructure *(Credentialed Access)*
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

### 60. Dependency & Supply Chain Security
- [ ] No outdated JavaScript libraries with known CVEs (e.g. legacy jQuery 1.x/2.x).
- [ ] Third-party CDNs load over HTTPS with Subresource Integrity (SRI) hashes where critical.

### 61. CMS & Site Content Operations
- [ ] Publishing, scheduling, and revision histories function cleanly.
- [ ] No broken dynamic shortcodes (e.g. `[contact-form-7 404]`) appearing as raw text.

### 62. Notifications (Email, SMS, UI Toasts)
- [ ] UI toast messages appear on action and auto-dismiss after 3–5 seconds.
- [ ] SMS and email notifications deliver with correct dynamic tags (customer name, appointment time).

### 63. Third-Party Failure Resilience
- [ ] Third-party scripts in `<head>` load asynchronously (`async` or `defer`).
- [ ] If an external tracking or widget server hangs, initial page rendering does NOT freeze.

### 64. JavaScript Disabled Test
- [ ] Primary business copy and navigation links remain accessible in plain HTML if JavaScript is disabled.

### 65. Ad Blocker / Privacy Extension Compatibility
- [ ] Core navigation, forms, and checkout operate normally when uBlock Origin or Brave Shields are active.

### 66. Edge-Case Input Testing
- [ ] Form inputs handle special characters (`&`, `<`, `>`, `"`, `'`), emoji, and very long text without SQL/XSS errors.

### 67. Accessibility of Dynamic Components
- [ ] Modals trap keyboard focus inside while open; return focus to trigger button upon pressing `ESC`.
- [ ] Accordions and dropdowns toggle `aria-expanded="true/false"` dynamically.

### 68. E-commerce Abandoned Cart Recovery
- [ ] Automated abandoned cart emails trigger within 1–4 hours with valid recovery link.

### 69. Subscription & Membership Lifecycle
- [ ] Signup, automated renewal, card update portal, and cancellation workflows operate smoothly.

---

## The 5 Real Customer Journeys (Sales Closing Engine)

Har audit engagement mein client ko convince karne ke liye yeh 5 journeys test karke report karein:

1. **Journey 1 (The First-Time Visitor):**
   `Google / Ad → Homepage → 5-Second Clarity → Click Primary CTA`
2. **Journey 2 (The Inquiring Lead):**
   `Service Page → Contact Option (Call / WhatsApp / Form) → Form Submit → Lead Reaches CRM`
3. **Journey 3 (The Mobile Customer):**
   `320px Mobile Screen → Sticky CTA Tap → Instant Mobile Dialer / Booking`
4. **Journey 4 (The Returning User):**
   `Direct Link → State Preservation → Resource Access → Fast Cached Experience`
5. **Journey 5 (The Failure Recovery):**
   `Input Error / Payment Interruption → Helpful Inline Message → Retry → Conversion`

---

# Part 3: Framework, Evidence & High-Ticket Delivery (Sections 70 to 84)

### 70. Permissions / Roles (Multi-User Applications)
- [ ] Role hierarchy verified: Visitor, Registered User, Manager, Administrator.
- [ ] Hidden UI elements are backed by server-side authorization guards (unauthorized URLs return 401/403).
- [ ] Role privileges persist correctly during active session.
- [ ] Session tokens invalidated immediately upon logout.

### 71. Customer Journey Audit
Mandatory high-value journeys evaluated in every Webarg audit:
- **Journey A — New Visitor:** `Search → Homepage → 5-Second Clarity → Primary CTA`
- **Journey B — Inquiring Lead:** `Homepage → Contact Form / Phone → Submission → Notification Delivery`
- **Journey C — Mobile Customer:** `320px Mobile Screen → Touch CTA → Dial / Chat Conversion`
- **Journey D — Returning User:** `Direct URL → Cached State → Fast Route Navigation`
- **Journey E — Failure Recovery:** `Wrong Input / Payment / 404 Route → Clear Inline Guidance → Retry → Success`
*Status for each:* `PASS` 🟢 | `WARNING` 🟠 | `CRITICAL` 🔴

### 72. Evidence Collection
Every reported issue must have verifiable proof:
- Screenshot / visual clip of defect
- Target URL and exact DOM selector
- Device, browser, and screen resolution
- Timestamp of inspection
- HTTP response status code / headers
- Console runtime error text and line number
- Core Web Vitals metric reading (LCP, CLS, INP)
- Step-by-step reproduction instructions

### 73. Finding Quality Rules
- ❌ **Poor Finding:** *"The website is slow."*
- ✅ **Professional Finding:**
  > **High — Homepage LCP exceeds Core Web Vitals target (4.1s)**  
  > **Evidence:** LCP measured at 4.1s on 4G mobile emulation; hero banner image `hero.png` is 3.8 MB uncompressed.  
  > **User Impact:** Mobile visitors stare at an empty viewport for over 4 seconds before reading the value proposition.  
  > **Business Impact:** High bounce rate on mobile paid traffic; organic search ranking penalties from Google.  
  > **Recommendation:** Convert hero image to WebP/AVIF, resize to 1200px max width, and add `fetchpriority="high"`.  
  > **Verification:** Re-scan mobile performance after deployment to confirm LCP drops below 2.0s.

### 74. Business Impact Classification
Every technical flaw is categorized by commercial risk:
1. **Revenue Leakage:** Checkout failure, payment gateway crash, shopping cart bugs.
2. **Lead Leakage:** Broken contact forms, unclickable phone numbers, missing SPF/DMARC.
3. **Search Visibility:** Indexation blocks (`noindex`), canonical mismatches, slow CWV metrics.
4. **Buyer Trust:** Broken SSL certificates, outdated copyright ("© 2021"), console crashes.
5. **Accessibility Risk:** Keyboard traps, missing form labels, WCAG compliance failure.

### 75. Prioritized Sprint Roadmap
- **Priority 1 (Fix Immediately):** Broken forms, checkout failure, lead leakage, critical security risks, fatal JS crashes.
- **Priority 2 (Next Scheduled Sprint):** Mobile UX friction, Core Web Vitals optimizations, SEO blockers, accessibility issues.
- **Priority 3 (Optimization):** Code minification, asset cleanup, minor responsive spacing.
- **Priority 4 (Polish):** Typography micro-tuning, minor animation transitions.

### 76. Final QA Before Report Delivery
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

### 78. Webarg Product Recommendation
Webarg replaces generic Lighthouse scores with a holistic diagnosis:
$$\text{Overall Health} \rightarrow \text{Business Impact} \rightarrow \text{4 Core Scores} \rightarrow \text{Technical Evidence} \rightarrow \text{Conversion Journeys} \rightarrow \text{Remediation}$$

### 79. Platform & Tech Stack Detection
Identifies underlying architecture: WordPress, WooCommerce, Elementor, Shopify, Webflow, GoHighLevel, Wix, Squarespace, React, Next.js, Vue, Nuxt, Laravel, or Native mobile apps.

### 80. Access Level Matrix & Anti-Hallucination Boundary
- **Level 1 (Audited Live):** Public URL surface (DOM, CSS, JS errors, SEO, DNS, SSL, security headers).
- **Level 2 & 3 (Manual Playbook Sprint):** CMS Admin, GHL Automations, Payment Sandbox, Physical Device Dialers, Database Internals.

### 81. The One-Day Audit Rule
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

## Bottom Line

A genuinely valuable 2026 website audit is not a generic Lighthouse score plus a list of broken links. It is:

$$\text{Real User Journeys} + \text{Technical Evidence} + \text{Commercial Impact} + \text{Platform-Specific Inspection} + \text{Prioritized Remediation}$$

That is the level at which an audit report commands high trust and naturally closes a **$1,500 – $3,500 development and remediation sprint**.

---

## Client Pitch Script

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
*Webarg — Technical Website Audit & Inspection Engine · Built for High-Trust Client Remediation.*
