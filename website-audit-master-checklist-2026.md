# Website Audit Master Checklist — 2026
*The Definitive Technical, Conversion & Deep Manual Audit Playbook for Freelancers, Agencies & Technical Consultants.*

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

> **Sampling Rule for 100+ Page Sites:**
> Har page ko manually check karne ke bajaye:
> 1. Homepage
> 2. Top-traffic pages (Google Analytics / Search Console se)
> 3. Main service & product pages
> 4. Contact & conversion funnels
> 5. High-value templates (Single post, Archive, Category)
> 6. Error & edge-state pages (404, empty search)

---

## 2. Full Site Walkthrough & Real-World Interaction Audit

### Navigation Systems
- [ ] **Logo Click:** Always returns user to homepage root `/`.
- [ ] **Main Navigation:** Every link lands on an active 200 OK page.
- [ ] **Dropdown & Mega Menus:** Opens reliably on hover/click; doesn't close prematurely when moving mouse.
- [ ] **Mobile Hamburger:** Opens smoothly; scroll is locked in background; closes via backdrop click or ESC.
- [ ] **Sticky Header:** Stays fixed during scroll; doesn't overlap text or hide content behind it.
- [ ] **Breadcrumbs:** Correct hierarchy reflecting parent-child relationship.
- [ ] **Footer Navigation:** Legal, contact, and secondary links are functional.
- [ ] **External Links:** Open in new tab with `rel="noopener noreferrer"` (reverse tabnabbing protection).

### Real-World Interaction & Contact Channels
- [ ] **Click-to-Call (`tel:`):**
  - Uses proper `tel:+1...` international format.
  - Desktop: Launches default calling app or prompts pairing.
  - Mobile: Immediately opens native dialer with prefilled digits.
  - No spaces, brackets, or unclickable text masquerading as a phone number.
- [ ] **WhatsApp Direct Link:**
  - Uses official `https://wa.me/<countrycode><number>` format.
  - Opens chat in native mobile app or WhatsApp Web on desktop without corrupt parameters.
- [ ] **Email Links (`mailto:`):**
  - Opens default mail client with correct recipient address and optional prefilled subject.
- [ ] **Google Maps & Location:**
  - Embed or button lands directly on the verified business listing; mobile opens Google Maps app.
- [ ] **Booking / Appointments:**
  - Calendar opens valid, live booking slots (not dummy/sandbox schedules).
- [ ] **Social Icons:**
  - Point to verified business profiles, never to root generic platforms (`facebook.com/`).

---

## 3. Business Conversion & Above-The-Fold Audit

### The 5-Second Test
- [ ] **Instant Clarity:** Kya visitor ko 5 seconds ke andar samajh aata hai ke business kya offer karta hai aur kiske liye hai?
- [ ] **Hero Headline:** Clear value proposition, not vague marketing jargon.
- [ ] **Primary CTA:** High-contrast, immediately prominent above the fold.
- [ ] **Secondary CTA:** Subordinate visual hierarchy (outline/ghost style), not competing with primary action.
- [ ] **Trust Signals Above Fold:** Client logos, star rating, accreditations, or guarantees visible without scrolling.

### Conversion Friction Points
- [ ] Unnecessary popups or modal overlays blocking content immediately upon arrival.
- [ ] Aggressive full-screen banners on mobile devices.
- [ ] Unclear pricing or ambiguous next steps.
- [ ] Dead action buttons that jump to page top (`href="#"` or `href="javascript:void(0)"`).

---

## 4. Forms & Lead Generation Deep Test

> **Rule:** Never just submit a valid form. Test the boundaries and failure limits.

### Validation & Edge Cases
- [ ] **Empty Submit:** Displays clear, inline error messages on required fields.
- [ ] **Invalid Email:** Rejects strings like `user@`, `user@domain`, `user.com`.
- [ ] **Invalid Phone:** Enforces minimum digit count (rejects `12345` or non-numeric characters where strict).
- [ ] **Whitespace Only:** Strips leading/trailing spaces; rejects spaces-only submissions.
- [ ] **Character Limits:** Handles very long strings (300+ characters) without breaking UI layout.
- [ ] **Copy / Paste:** Allows paste into email and password fields.
- [ ] **Rapid Clicks:** Disables submit button immediately upon click to prevent duplicate submissions.
- [ ] **Enter Key:** Form submits cleanly when pressing Enter inside text inputs.
- [ ] **Tab Navigation:** Logical focus order across all inputs and submit button.

### Autofill & Password Manager Compatibility
- [ ] Inputs define standard `autocomplete` attributes (`autocomplete="name"`, `autocomplete="email"`, `autocomplete="tel"`, `autocomplete="street-address"`).
- [ ] Chrome / Safari autofill styles do not cause invisible text (e.g. yellow background with white text bug).
- [ ] Password managers (1Password, Bitwarden, LastPass) detect fields properly without UI overlap.

### Delivery & Automation Integrity *(Credentialed Sprint)*
- [ ] Lead reaches business email inbox (check spam folder).
- [ ] Lead record created in CRM (HubSpot, GoHighLevel, ActiveCampaign).
- [ ] Webhook triggers fire successfully (Zapier / Make / custom endpoint).
- [ ] SMS / Email instant autoresponder sent to customer.
- [ ] UTM parameters (`utm_source`, `utm_campaign`, `utm_medium`) preserved in lead payload.
- [ ] Spam protection active (Cloudflare Turnstile, reCAPTCHA v3, or hidden honeypot field).

---

## 5. Technical Infrastructure & DevTools QA

### Console & JavaScript Runtime
- [ ] **Zero Uncaught Exceptions:** No `Uncaught TypeError`, `ReferenceError`, or `SyntaxError`.
- [ ] **No Console Errors:** No unhandled promise rejections or third-party script crashes.
- [ ] **No Mixed Content:** On HTTPS pages, zero assets loaded via insecure `http://`.
- [ ] **No Deprecated APIs:** No warnings regarding deprecated browser features.

### Network & Server Responses
- [ ] **Clean HTTP Status Codes:** Core pages return `200 OK`.
- [ ] **Redirect Chains:** Clean single redirect (`301`); zero multi-hop chains (>2 hops) or loops.
- [ ] **Payload Sizes:** HTML document under 150 KB; total page weight under 3 MB.
- [ ] **Server Latency (TTFB):** Time to First Byte under 400ms globally.
- [ ] **Asset Compression:** HTML, CSS, JS, and JSON served with Brotli (`br`) or Gzip.
- [ ] **Caching Headers:** Static assets have explicit `Cache-Control: public, max-age=31536000, immutable` and `ETag`.

### Security Headers & DNS Verification
- [ ] **HTTPS Enforced:** Automatic redirect from `http://` to `https://`.
- [ ] **Domain Consistency:** Strict 301 redirect between `www` and `non-www`.
- [ ] **HSTS:** `Strict-Transport-Security` header present with `max-age=31536000`.
- [ ] **Clickjacking Protection:** `X-Frame-Options: SAMEORIGIN` or `Content-Security-Policy: frame-ancestors`.
- [ ] **MIME Sniffing:** `X-Content-Type-Options: nosniff`.
- [ ] **Referrer Policy:** `Referrer-Policy: strict-origin-when-cross-origin`.
- [ ] **Email DNS Records:**
  - **SPF:** Valid TXT record (`v=spf1 ... -all`).
  - **DMARC:** Valid DMARC record (`v=DMARC1; p=quarantine` or `reject`).
  - **MX:** Correct mail exchanger records configured.
- [ ] **Exposed Endpoints Probe:** `/.env`, `/.git`, `/xmlrpc.php`, or debug logs are blocked with 403/404.

---

## 6. Performance & Core Web Vitals (CWV)

### Metrics Baseline
- [ ] **Largest Contentful Paint (LCP):** Under 2.5 seconds (Good).
- [ ] **Interaction to Next Paint (INP):** Under 200 milliseconds.
- [ ] **Cumulative Layout Shift (CLS):** Under 0.1 (Zero unexpected visual jumps).
- [ ] **Total Blocking Time (TBT):** Under 200 milliseconds.

### Asset Pipeline Optimizations
- [ ] **Modern Image Formats:** WebP or AVIF utilized instead of legacy heavy PNG/JPG.
- [ ] **Explicit Dimensions:** All `<img>` tags include explicit `width` and `height` attributes to eliminate CLS.
- [ ] **Lazy Loading:** Below-the-fold images specify `loading="lazy"`.
- [ ] **Font Display:** Google Fonts or web fonts use `font-display: swap` to prevent Flash of Invisible Text (FOIT).
- [ ] **Preconnect Hints:** Document head preconnects to critical origins (`<link rel="preconnect" href="https://fonts.googleapis.com">`).
- [ ] **DOM Complexity:** Total DOM elements under 1,200 nodes; max DOM depth under 15 levels.

---

## 7. Responsive & Mobile QA

### 320px Stress Test
- [ ] **Viewport Meta:** `<meta name="viewport" content="width=device-width, initial-scale=1.0">` declared.
- [ ] **Zero Horizontal Overflow:** Page does not scroll horizontally at 320px width (iPhone SE baseline).
- [ ] **No Text Clipping:** Headings wrap cleanly without overflowing cards or screen edges.
- [ ] **Touch Target Sizing:** Interactive buttons and links have at least 44x44px clickable area with adequate spacing.
- [ ] **Fixed / Sticky Elements:** Sticky mobile CTAs or chat widgets do not obscure form inputs or key buttons.
- [ ] **Browser Zoom (200%):** When zoomed to 200% in desktop browser, layout adapts gracefully without overlapping text or inaccessible modals.

---

## 8. Real-World Accessibility (Beyond Automated Scanners)

### Keyboard-Only Navigation
- [ ] Complete site usable without touching a mouse:
  - `TAB` advances focus forward.
  - `SHIFT + TAB` moves focus backward.
  - `ENTER` / `SPACE` triggers buttons and links.
  - `ESC` closes modals, menus, and dropdowns.
- [ ] **Visible Focus Indicator:** Clear, high-contrast outline on all focused interactive elements.
- [ ] **Skip Navigation Link:** First tab press reveals "Skip to main content" link.
- [ ] **No Keyboard Traps:** Focus never gets permanently stuck inside modals or widgets.

### Screen Reader & Semantics
- [ ] Proper heading hierarchy (single `<h1>`, logical `<h2>`, `<h3>` order; no skipped levels).
- [ ] All informational images have descriptive `alt` text; decorative images use `alt=""`.
- [ ] Form fields have programmatic labels (`<label for="id">`).
- [ ] Dynamic error messages use `aria-live="polite"` or `role="alert"` so assistive technology announces them.
- [ ] Icon-only buttons (search, hamburger, cart) have `aria-label` declarations.

---

## 9. Advanced SEO, Crawling & Social Previews

### Metadata & Indexing Directives
- [ ] Unique `<title>` tag on every page (50–60 characters).
- [ ] Compelling meta description (120–160 characters).
- [ ] Clean `<link rel="canonical">` pointing to the canonical version (matches scheme and trailing slash).
- [ ] No accidental `<meta name="robots" content="noindex">` on live production pages.
- [ ] Multilingual pages define `<link rel="alternate" hreflang="...">` with an `x-default` fallback.

### Social Preview & Open Graph
- [ ] `og:title`, `og:description`, and `og:image` declared.
- [ ] `og:image` uses absolute HTTPS URL, minimum 1200x630px resolution.
- [ ] Twitter Card markup declared (`twitter:card`, `twitter:image`).
- [ ] Verified preview rendering in WhatsApp, LinkedIn, and Twitter/X debuggers.

### Crawl Architecture & Soft 404
- [ ] `/robots.txt` exists, is publicly accessible, and references `/sitemap.xml`.
- [ ] `/sitemap.xml` returns 200 OK and contains only canonical, indexable URLs.
- [ ] **Soft 404 Test:** Visiting a non-existent URL (e.g. `/test-404-random-slug`) returns an authentic HTTP `404 Not Found` status, never a fake `200 OK`.

---

## 10. Modern Frontend, Storage & Deployment QA

### Client-Side Browser Storage (LocalStorage / SessionStorage)
- [ ] No plain-text passwords, sensitive JWT tokens, or private API keys stored in accessible `localStorage` or `sessionStorage`.
- [ ] Storage size reasonable; old cached data invalidated upon version updates.

### Deployment & Environment Hygiene
- [ ] No `localhost`, `127.0.0.1`, `staging.domain.com`, or `dev.` URLs referenced in production source code.
- [ ] No public `.git`, `.env`, `.bak`, or unminified source maps (`.map`) accessible in production.
- [ ] No `console.log` debug statements outputting user data or internal IDs.

### Print Stylesheet QA (Ctrl + P)
- [ ] Page prints cleanly: dark background reversed to clean white, navigation menus and chat widgets hidden via `@media print`, text crisp and legible.

---

## 11. CMS & Platform-Specific Deep Audits *(Access-Gated Engagements)*

### WordPress & Elementor Deep Audit
- [ ] **Core & Theme:** WordPress core, parent/child theme, and active plugins updated to patched versions.
- [ ] **Elementor Container Bloat:** Enable Elementor Optimized DOM Output; eliminate redundant nested sections.
- [ ] **Database Health:** Clean orphaned postmeta, expired transients, and revision bloat (`wp_options` autoloaded data under 800 KB).
- [ ] **WP-Cron:** Verify Action Scheduler is not clogged with stuck failed jobs; offload to server cron if high-traffic.

### GoHighLevel (GHL) Funnel & Automation Audit
- [ ] **Funnel Steps:** URLs, mobile layouts, and step redirect logic verified.
- [ ] **Forms & Surveys:** Custom field mapping, lead tags, and pipeline stage assignments.
- [ ] **Workflows:** Automation triggers fire properly; no infinite loops or conflicting stop conditions; SMS compliance (A2P 10DLC) checked.
- [ ] **Calendars:** Correct timezones, buffer times, and confirmation/reminder workflows.

### Shopify E-commerce Audit
- [ ] **Storefront:** Product variants, inventory sold-out logic, cart drawer handoff.
- [ ] **Theme Code:** Audit Liquid bloat; remove orphaned code from uninstalled apps.
- [ ] **Checkout:** Accelerated payment buttons (Apple Pay, Google Pay, Shop Pay), tax and shipping calculations.
- [ ] **Tracking:** Verify GA4 and Meta Pixel `Purchase` events do not double-fire on order confirmation.

---

## 12. The 5 Real Customer Journeys (The Sales Closer)

Client ko $1,500 – $3,500 ke remediation package par convert karne ke liye har audit mein yeh 5 real customer journeys test karein:

### Journey 1: The First-Time Visitor
`Google Search / Ad → Homepage Landing → Understand Value Offer in 5s → Primary CTA Click`
- **Goal:** Verify immediate message match, fast page load, and zero visual friction.

### Journey 2: The Inquiring Lead
`Service Page → Contact Channel (Call / WhatsApp / Form) → Submission → Confirmation → CRM Delivery`
- **Goal:** Confirm zero lead loss across phone dialer, WhatsApp API, and form email delivery.

### Journey 3: The Mobile Buyer / Booker
`Mobile Search → Mobile Product / Service → Sticky CTA Tap → Instant Booking / Checkout`
- **Goal:** Verify flawless touch targets, no horizontal overflow, and frictionless mobile conversion.

### Journey 4: The Returning Client
`Direct URL → Navigation / Account → Resource Access → Action Complete`
- **Goal:** Check state preservation, session stability, and fast cached load speeds.

### Journey 5: The Failure Recovery
`Invalid Form Input / Network Interruption / Failed Checkout → Error Message → Retry → Success`
- **Goal:** Verify clear inline error guidance; customer is never left staring at an infinite loading spinner.

---

## 13. Client Pitch & Delivery Script

Jab aap client ko report send karein, to sirf technical jargon mat bhejein. Is proven pitch structure ko follow karein:

```text
Hi [Client Name],

I conducted an inspection of [Business Name]'s website to assess its technical integrity, mobile performance, and lead-capture systems.

I identified [X] specific issues. Of these, [Y] are critical points of lead leakage that directly affect new customer inquiries:

1. [Critical Flaw 1 - e.g. Contact form submit button missing on mobile]
2. [Critical Flaw 2 - e.g. Phone number is unclickable plain text rather than tap-to-call]
3. [Critical Flaw 3 - e.g. Domain email authentication (SPF/DMARC) missing, sending inquiries to spam]

I’ve compiled the complete technical diagnosis, evidence, and remediation priority into an inspection report here:
[Webarg Report Link / Attached PDF]

Would you like me to resolve these issues for you in a focused remediation sprint? Let me know and I can get this sorted out for you this week.

Best regards,
Abid
```

---
*Webarg — Technical Website Audit & Inspection Engine · Built for High-Trust Client Remediation.*
