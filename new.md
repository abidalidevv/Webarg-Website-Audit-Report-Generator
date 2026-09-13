# Website Audit Pro — Product & Design Spec (v1)

## 1. Purpose & Scope

A personal-use lead-generation tool, not a multi-tenant SaaS product.

Flow: Abid enters a prospect's URL → tool scans it → generates a shareable
report page + downloadable PDF → Abid pitches the prospect ("here are 23
issues on your site, I'll fix them") → sends the report link so the client
can verify it themselves.

**Explicitly not in scope for v1:** subscription billing, user accounts,
multi-tenant isolation, competing feature-for-feature with Ahrefs/GTmetrix/
SEMrush.

**Decision log (2026-09-12):** Considered adding a large, unscoped set of
third-party/GitHub APIs and CDNs to "look like a $10,000 site." Rejected —
more third-party dependencies means more failure points during a live
client demo, more vendor auth/rate-limit management, and more supply-chain
risk from unvetted packages. A $10k *feel* comes from design restraint,
typography, copy, and reliability — not API count. If a genuine gap is
found after pitching real clients with v1, add specific, named checks then
— not preemptively.

**Decision log (2026-09-13):** A batch of unrelated GitHub links was
proposed for inclusion (generic "awesome API list" repos, a dictionary
API, an enterprise API gateway, and several unofficial/reverse-engineered
ChatGPT proxy repos). Rejected all of them:
- Curated link-list repos (`public-apis`, `awesome-*`) are directories,
  not integrable tools — nothing to add.
- Anything unrelated to website auditing (dictionary APIs, domain lists)
  fails the "named real gap" test outright.
- Enterprise infrastructure (API gateways) is the wrong scale for a
  single-endpoint, low-volume personal tool.
- **Unofficial/reverse-engineered API proxies (e.g. free ChatGPT proxy
  repos) are never acceptable, regardless of cost.** They typically
  violate the underlying provider's terms of service, route requests
  (including real scanned-client data) through an uncontrolled
  third-party server, and can disappear or get blocked without notice
  since they are themselves a ToS violation. Use only official free
  tiers (Section 9 elsewhere in this doc / the LLM options already
  evaluated) instead.
- A UI/design change is never implied by an API/backend decision —
  design tokens (Section 5) are independent of what data sources power
  the scan. Don't conflate the two.

## 2. What Gets Scanned (v1) — Quick scan vs Deep scan

**Decision log (2026-09-12):** Two scan modes, not one. This is the
right way to accommodate more thorough checking without slowing down
the common case or risking a live-demo timeout.

**Quick scan (target: under ~60s)** — fast preliminary read:
- Lighthouse programmatic audit: Performance, SEO, Accessibility, Best
  Practices, Core Web Vitals (LCP, CLS, INP)
- Security header presence check (HTTPS, CSP, X-Frame-Options, HSTS)
- SSL/certificate validity check

**Deep scan (up to ~10 min, run once per prospect, not repeatedly)** —
everything in Quick scan, plus:
- Console errors + uncaught JS exceptions (via headless browser
  `console` and `pageerror` events)
- Full broken-image / broken-link crawl (HTML parse via Cheerio) — this
  naturally makes many individual requests as it checks every
  image/link found on the page; that's expected and fine, since it's
  checking the *target* site's own resources, not calling many
  third-party vendor services
- Accessibility deep pass via axe-core
- 404/external-resource error collection

The 10-minute ceiling and "runs once per prospect" framing is a
reasonable tradeoff *for the Deep scan job itself* — it's a background
report-generation task, not something a visitor waits on in real time.
It does **not** loosen the separate requirement that the report *page*
itself stays fast to load (see Section 5 — a slow report page
undermines the pitch, since it's failing the exact performance test
it's selling the fix for).

**Deferred to a later version (do not build now):** AI chat assistant,
screenshot heatmap overlay, live before/after preview, JSON export,
multi-user accounts, billing, multi-language support.

**On "how many checks/APIs":** don't target a number (100 calls, 20
integrations). A Deep scan legitimately makes many requests as a side
effect of thoroughly checking one site's own resources — that's fine.
Adding many *separate third-party vendor services* is a different
thing and stays subject to the Section 1 decision log: each one is a
new failure point and maintenance burden, even behind the admin panel,
because a vendor outage during a live client demo still breaks the
demo. Add a new vendor only when it covers a named, real gap that
Lighthouse + axe-core + Cheerio don't already cover.

## 3. Architecture

- **Scan engine:** hosted headless-browser API (Browserless.io or
  Browserbase) rather than self-managed Puppeteer/Chrome — avoids Chrome
  binary/memory management, which is outside current backend strength.
- **Backend:** Node.js + Express, one endpoint (`POST /scan`):
  1. Validate the URL — reject non-http(s) schemes.
  2. Resolve the hostname and reject private/reserved IP ranges
     (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8,
     169.254.0.0/16, ::1) — SSRF guard.
  3. Call the headless API for console/pageerror capture + DOM.
  4. Run Lighthouse programmatically against the same target.
  5. Parse HTML with Cheerio for broken images/links.
  6. Normalize everything into one JSON report shape.
  7. Persist keyed by a random report ID (MongoDB, or flat JSON on disk /
     S3 given low volume — no need for a heavier DB at this scale).
- **Frontend:** React, rendering the report from that JSON. The same
  components serve the live `/report/:id` page and the PDF.
- **PDF:** do **not** use html2canvas + jsPDF — it renders gradients,
  glass panels, and charts poorly. Instead, point the same headless
  browser at the report's own `/report/:id` URL and call `page.pdf()`.
  One rendering pipeline, not two.
- **Sharing:** `/report/:id` is a public-by-link URL for client
  verification.

## 4. Security Guardrails (non-negotiable, even at low volume)

- SSRF blocklist as above — this matters *because* clients will receive
  a link and could, in principle, submit arbitrary targets.
- Hard timeout per scan (45–60s).
- Rate limit per IP (e.g. 5 scans/hour) so the tool can't be repurposed
  as an open scanning proxy.
- Sanitize console log output before display/storage — a scanned site's
  console may leak tokens or cookies; never store or render those
  verbatim.

## 5. Design Direction — avoiding the "AI-generated" look

Generic AI-generated SaaS design clusters around a few defaults: warm
cream background + serif display + terracotta accent; near-black
background + single neon accent; identical rounded cards with the same
soft grey shadow and gradient washes; ALL-CAPS eyebrow labels above every
heading; arrows appended to every button.

**The original Stitch prompt used for this project ("dark futuristic
dashboard, glowing accents, glassmorphism, gradient washes, premium
cards") matches these defaults almost exactly.** Do not reuse it — see
the rewritten prompt in Section 9.

### Grounding concept: diagnostic instrument, not growth dashboard

The subject isn't "SaaS analytics" — it's a technical inspection, closer
to a lab report or a structural inspection report than a marketing
dashboard. That distinction is what makes a skeptical client trust the
findings enough to pay for the fixes.

### Design tokens

**Color** (functional, not decorative):
- `--ink: #14181F` — base dark surface (deliberately blue-tinted, not a
  neutral near-black)
- `--paper: #EDEEE7` — soft warm-grey surface for light sections/print
- `--signal-critical: #C1432B` — muted brick red, used only for
  critical-severity findings
- `--signal-warning: #B8863D` — muted ochre, warning-severity only
- `--signal-pass: #4C7A5E` — muted sage green, passing checks only
- `--accent: #3E6E8E` — steel-teal, used sparingly for interactive
  elements only (links, active states) — never as decoration

**Type:**
- Headline: a technical/condensed grotesk (engineering-instrument
  character, not a display serif)
- Body: a plain humanist sans, optimized for readability at report-table
  density
- Data values (scores, error codes, timestamps, file paths): monospace —
  functionally justified here because it's displaying literal data, not
  decorating a label

**Layout:**
- **Single continuous page — not a multi-page dashboard with sidebar
  navigation.** This is a one-shot scan report, not an ongoing
  monitoring tool, so a linear scroll (closer to PageSpeed Insights'
  structure) fits the actual use case better than a persistent
  dashboard-app shell.
- Hero at the top of the page: the URL input is the one "spend your
  boldness here" moment (per design principle below) — large, confident,
  unmistakably the primary action, not a small field tucked in a nav bar.
- Once a scan completes, the same page reveals results below the hero:
  a compact score-summary strip (the four sub-scores), then a long
  vertical sequence of expandable sections — one per category (Console
  Errors, SEO, Accessibility, Performance, Security). Each collapses to
  a one-line severity + count summary and expands to the full detail
  table — same spirit as PageSpeed Insights' Diagnostics/Opportunities
  accordions, but styled with the color/type system below instead of
  PSI's plain Material look.
- No sidebar, no dashboard nav tabs, no separate page per category —
  everything reachable by scrolling one page.
- Left-aligned content within each expanded section; numeric readouts
  large, with the unit as a small subscript beside the number — not as
  an all-caps eyebrow label above it.

**Principles:**
1. A real number from the actual scan is always the biggest thing on
   screen — never a decorative icon or illustration standing in for data
2. Severity color is signal only, applied consistently, never decorative
3. One choreographed motion moment — the existing scan-progress sequence
   — everything else is static (no fade-up-on-scroll, no hover animation
   on every card)
4. Plain, specific copy — no "supercharge / unlock / unleash"; every
   heading names exactly what's below it

## 6. Report Structure

1. Summary: URL, scan date, overall health score, four sub-scores
   (Performance / SEO / Accessibility / Security)
2. Console & JS errors table (severity, message, file, line)
3. SEO issues
4. Accessibility issues
5. Performance breakdown + Core Web Vitals
6. Security header checklist
7. Recommendations, in plain language, tied to Abid's own services —
   this is the pitch moment
8. Footer: prepared-by branding, contact, CTA

## 7. Build Phases

1. **Backend first, no UI.** `/scan` endpoint working end-to-end against
   Browserless, tested via curl/Postman, returning raw JSON.
2. **Report page.** React components rendering that JSON using the
   tokens in Section 5.
3. **PDF.** Wire up `page.pdf()` against the report route.
4. **Sharing.** Persist by report ID, confirm the public link works.
5. **Polish pass.** Copy pass, then Antigravity for final UI/UX polish,
   then a real test run against an actual client's site before pitching.

## 8. Tool Workflow

**Decision log (2026-09-12):** Pivoted from Cursor-builds-backend /
Antigravity-polishes-only to building the full app directly in
Antigravity, since that's where Abid is now building it. Antigravity is
capable of a full-stack build (not just polish), so this is a
reasonable tool consolidation — but it means the security requirements
in Section 4 need to be given to it explicitly up front (see the
Antigravity build prompt below), not assumed or retrofitted later.

- **Google Stitch:** optional — only if still used for an initial
  layout pass using the Section 9 prompt before moving into Antigravity.
- **Antigravity:** primary build tool — backend (`/scan` endpoint),
  frontend (report page), PDF pipeline, and admin panel, using the
  build prompt below.
- **Claude:** security review of the `/scan` endpoint (SSRF blocklist,
  rate limiting, timeout, log sanitization) before anything goes live to
  a real client; copy review of the report content.

## 8.1 Phase-wise Antigravity Build Prompts

**Decision log (2026-09-12):** Superseded the single monolithic build
prompt with 5 sequenced phase prompts, fed to Antigravity one at a
time. Each phase ends with an explicit stop-and-verify checkpoint —
don't let the agent continue past it even if it offers to. This
matches the existing Section 7 principle (backend first, verified,
before UI) and reduces the risk of the agent silently skipping a
security requirement or fabricating a check it can't actually perform
across a long unsupervised run. Reuse the existing HTML prototype
(`webarg V3 - Copy.html`) for the scan animation in Phase 2 rather than
having the agent reinvent it.

### Phase 1 — Backend Scan Engine

```
Build the backend for a website-audit tool. Node.js + Express, one
primary endpoint: POST /scan.

SETUP
- Express app with CORS, Helmet, and express-rate-limit.
- Rate limit: 5 scan requests per hour per IP.

SECURITY GUARDRAILS — implement all of these before anything else:
1. Reject any submitted URL that is not http/https.
2. Resolve the hostname and reject private/reserved IP ranges
   (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8,
   169.254.0.0/16 — this blocks cloud metadata endpoints too, ::1)
   before dispatching any scan. This is an SSRF guard — do not skip it.
3. Hard timeout: 60s for Quick scan, 10 minutes for Deep scan.
4. Sanitize captured console output before storing or returning it —
   redact anything that looks like a token, cookie, or credential.

SCAN ENGINE
- Use Browserless.io (hosted headless Chrome) for console/pageerror
  capture — do not self-manage a Puppeteer/Chrome binary.
- Lighthouse (programmatic API) for Performance, SEO, Accessibility,
  Best Practices, Core Web Vitals.
- axe-core for a deeper accessibility pass.
- Cheerio for parsing HTML: broken images/links, missing meta tags.
- Node's native dns.promises for A/AAAA/CNAME/MX/TXT lookups, plus
  SPF/DKIM/DMARC presence checks.
- A small ssl-checker library for certificate validity/expiry.

ADDITIONAL URL-ONLY CHECKS (no auth needed):
- tel:/mailto:/WhatsApp (wa.me, api.whatsapp.com) link presence and
  format validation in the DOM.
- Redirect chain/loop detection.
- 404 accuracy check: request an invalid path, confirm a real 404
  status rather than a "soft 404" returning 200.
- robots.txt / sitemap.xml presence and basic validity.
- Structured data (schema.org/JSON-LD) presence, plus a business-
  identity consistency check comparing phone/address/name in visible
  page text vs. schema vs. footer.
- Open Graph / Twitter Card presence and validity.
- Mixed-content detection (HTTP resources on an HTTPS page).
- Third-party script domain inventory.
- Cookie-consent banner presence (heuristic DOM check).
- JS-disabled content check: fetch raw HTML without executing JS and
  compare against the rendered DOM.

SCAN MODES
- Quick scan (~60s): Lighthouse + security headers + SSL validity.
- Deep scan (~10 min): everything in Quick, plus console/pageerror
  capture, full broken-link/image crawl, axe-core pass, all the
  additional checks above.

Aggregate everything into one normalized JSON report shape.

IMPORTANT: if a check would require login credentials, hosting access,
GHL/Shopify API access, or a real device — do not implement it and do
not fabricate a result. Leave it out entirely.

STOP HERE. Do not build any frontend yet. Confirm POST /scan returns a
correct, complete JSON report via curl/Postman against a real test URL
before continuing.
```

### Phase 2 — Frontend

```
Build the frontend for the website-audit tool. React (Vite), single
continuous scrolling page — no dashboard sidebar, no separate pages
per section. This calls the real POST /scan endpoint from Phase 1 —
do not use mock data.

Reuse the scan-animation implementation already prototyped in
`webarg V3 - Copy.html`: the GSAP-coordinated .scan-stage expansion,
the Three.js wireframe mesh with a teal (#3E6E8E) beam sweeping across
it over ~1450ms, and the hit-markers lighting up as the beam passes.
Port this into the real React app rather than rebuilding it from
scratch.

HERO
- Large URL input as the primary action.
- Headline: an outcome-focused line (e.g. "See exactly what's costing
  this site conversions"), not a generic tagline.
- Trust line beneath: "No account required · Read-only inspection ·
  The report shows the evidence."

RESULTS (after scan completes)
- Four-number score strip (Performance / SEO / Accessibility /
  Security), each animating from 0 to its value.
- A vertical stack of expandable sections (native <details>), one per
  category (Console errors, SEO, Accessibility, Performance + Core Web
  Vitals, Security headers), each collapsed to a one-line severity +
  count and expandable to the full detail table.
- A recommendations section in plain language.
- Footer: Download PDF, Share report link.

VISUAL DIRECTION
- Base: deep ink-navy #14181F, not neutral near-black.
- Severity color is functional only: brick red #C1432B (critical),
  ochre #B8863D (warning), sage green #4C7A5E (pass) — never
  decorative elsewhere.
- One accent, used sparingly, for interactive elements only: steel-teal
  #3E6E8E.
- Headings: Barlow Condensed. Body: Manrope. Data values (scores,
  error codes, timestamps, file paths): DM Mono or IBM Plex Mono.
- Hairline dividers between sections, not uniform rounded cards with
  matching shadows. Generous whitespace.

AVOID: glassmorphism, gradient washes, glowing neon accents, ambient 3D
backgrounds or particle fields (beyond the one scan-beam moment above),
all-caps eyebrow labels, arrows on every button, stock "unlock /
supercharge / unleash" copy.

STOP HERE. Run a live scan against 2–3 real URLs through the actual UI
— not the prototype — and confirm the results render correctly before
continuing to Phase 3.
```

### Phase 3 — PDF Generation & Sharing

```
Add PDF export and sharing to the website-audit tool.

- Create a printable route: /report/:id?print=true — same report
  component, print-optimized styles (hide the URL input/nav, clean
  page breaks).
- Generate the PDF by pointing the same headless browser (Browserless)
  at that route and calling its native page.pdf(). Do NOT use
  html2canvas or jsPDF — they break gradients, charts, web fonts, and
  page splits.
- Persist each scan's JSON keyed by a random report ID (e.g. nanoid).
- "Share Report" button: use navigator.share() on mobile with a
  fallback to navigator.clipboard.writeText() on desktop, matching the
  existing prototype's behavior.

STOP HERE. Download an actual PDF from a real scan and open it —
confirm it visually matches the live report — before continuing to
Phase 4.
```

### Phase 4 — Admin Panel

```
Add a single-admin, password-protected area to the website-audit tool.

- Route: /admin, gated by one env-stored password (hash it) or basic
  auth. No Firebase Auth, no user-accounts system, no roles — there is
  exactly one user.
- Holds: Browserless API key and any other vendor keys used, and a
  scan history table (past scans with links to their report pages).
- Nothing else — no billing, no multi-user invites.

STOP HERE. Confirm the admin route rejects access without the correct
password, and that scan history displays correctly, before continuing
to Phase 5.
```

### Phase 5 — Security Verification & Real-World Test

```
Verify the website-audit tool is safe and reliable before it's used
to pitch any real client. Do not write new features in this phase —
only test and report back what happens.

Test and report the result of each:
1. Submit http://localhost, http://127.0.0.1, and
   http://169.254.169.254 (cloud metadata) as scan targets — confirm
   all are rejected by the SSRF guard, not scanned.
2. Trigger 6 scan requests from the same IP within an hour — confirm
   the 6th is rate-limited.
3. Scan a page that intentionally logs something token-like to the
   console — confirm it's redacted in the stored/displayed report, not
   shown verbatim.
4. Run a Quick scan and a Deep scan against 3–5 real, live websites
   (not test pages) — including at least one that likely has bot
   protection (e.g. a site behind Cloudflare) — and report what
   happens on failure: does it fail gracefully with a clear message,
   or crash?
5. Confirm the downloaded PDF still matches the live report after
   Phases 2–4 changes.

Do not proceed to pitching real clients until all 5 checks pass.
```

## 9. Rewritten Stitch Prompt

```
Design a technical website-inspection report tool, closer in spirit to a
structural inspection report or a clinical lab report than a marketing
SaaS dashboard. Audience: a freelance developer's prospective clients —
non-technical business owners who need to trust a diagnosis enough to
pay for repairs.

Base surface: deep blue-ink dark (#14181F) or warm paper grey (#EDEEE7)
for print/light contexts — not neutral near-black, not cream-and-serif.
Severity color used only functionally: muted brick red for critical,
muted ochre for warning, muted sage green for passing — never as
decoration elsewhere. One steel-teal accent (#3E6E8E) for interactive
elements only.

Layout: a single continuous scrolling page, not a multi-page dashboard
with sidebar navigation. A large, confident URL input as the hero at the
top — the one bold moment on the page. Below it, once scanned, a compact
score-summary strip followed by a long vertical sequence of expandable
sections (one per issue category), each collapsing to a one-line
severity + count and expanding to full detail — think PageSpeed
Insights' structure, elevated with real typographic and color craft
instead of a plain default look. No sidebar, no dashboard tabs. Left-
aligned content, numeric readouts large with the unit as a small
subscript beside the number, never an eyebrow label above it.

Typography: a condensed technical grotesk for headings, a humanist sans
for body text, monospace reserved only for literal data values (scores,
codes, timestamps). No all-caps eyebrow labels, no arrows appended to
buttons, no gradient washes, no glassmorphism, no glowing accents.

Single motion moment: the scan-progress sequence. Everything else static.
```

## 10. Admin Panel

A single-admin, password-protected area — not a multi-tenant user
system. Purpose: hold API keys/config for whichever scan services are
wired up, and let Abid trigger/review scans and manage report links.

- Auth: a single admin login (env-stored password hash, or basic auth
  in front of `/admin`) — not Firebase Auth, not a user-accounts
  system. There is exactly one user.
- Holds: Browserless/headless-API key, any additional vendor API keys,
  a list/history of past scans and their report links.
- Does **not** need: roles/permissions, multi-user invites, billing —
  none of that applies with one user.

## 11. Appendix — Full Check List (itemized)

**Console & JavaScript:** uncaught exceptions/runtime errors,
console.error messages, console.warn messages, failed JS-triggered
network requests (4xx/5xx), deprecated API usage warnings.

**HTML / Source Code:** missing title tag, duplicate H1, missing meta
description, missing Open Graph tags, missing image alt attributes,
broken internal links, broken images, missing favicon, malformed HTML.

**SEO:** missing/duplicate title, missing meta description, missing alt
text, broken links, missing canonical tag, missing/broken
robots.txt/sitemap.xml, non-crawlable links.

**Accessibility:** low color contrast, missing form labels, invalid/
missing ARIA attributes, missing alt text, missing `lang` attribute,
keyboard-navigation issues, incorrect heading order.

**Performance & Core Web Vitals:** LCP, CLS, INP, Total Blocking Time,
Time to Interactive, unused CSS/JS, oversized images, render-blocking
resources, total page size, load time.

**Security:** HTTPS enforcement, SSL certificate validity/expiry,
missing CSP, missing X-Frame-Options, missing HSTS, missing
X-Content-Type-Options, mixed content.

**Resource errors:** 404 resources, external resource load failures,
broken CDN/script references.

## 11a. v1.1 Additions — genuinely automatable, URL-only, no auth needed

**Decision log (2026-09-12):** A much larger manual audit methodology
was proposed (see the separate `webarg-manual-audit-playbook.md`).
Most of it needs CMS/hosting/GHL/Shopify credentials, a real phone, or
human judgment — none of which this tool can do from a URL alone. The
items below are the genuinely feasible subset worth adding to the scan
engine. Everything else in that playbook stays a manual/human
deliverable, not something to ask an AI coding agent to "implement" —
an agent asked to check something it has no access to will either skip
it silently or, worse, fabricate a plausible-looking result. Never let
that happen in a report sent to a real client.

- Contact-link validation: check for the presence and correct format
  of `tel:`, `mailto:`, and WhatsApp (`wa.me`/`api.whatsapp.com`)
  links in the DOM — flag phone numbers rendered as plain text or
  inside an image instead of a real link. (Note: this confirms the
  link is *correctly formatted*, not that a human tapped it on a real
  phone — say so in the report.)
- DNS layer: A/AAAA/CNAME/MX/TXT record lookup, plus SPF/DKIM/DMARC
  presence check — all resolvable without any login.
- Redirect chain / loop detection when following the URL.
- 404 accuracy check: request a deliberately invalid path and confirm
  it actually returns a 404 status, not a "pretty" page returning 200.
- robots.txt / sitemap.xml presence and basic validity.
- Structured data (schema.org) presence + validation, and a business-
  identity consistency check: compare phone/address/business name
  found in visible page text vs. in JSON-LD schema vs. in the footer.
- Open Graph / Twitter Card presence and basic validity (social share
  preview).
- Mixed-content detection (HTTPS page loading HTTP resources).
- Third-party script inventory: list every external domain a script is
  loaded from.
- Cookie-consent banner presence (heuristic DOM check).
- JS-disabled content check: fetch the raw HTML without executing JS
  and compare against what's visible — flag if critical content or
  navigation disappears entirely without JS.

**Accessibility honesty note:** automated tools (Lighthouse + axe-core)
catch a meaningful but partial slice of real accessibility issues —
say this explicitly in the report rather than implying a clean
accessibility score means full compliance. This is also a legitimate,
honest upsell line into the manual audit service.

## 12. Explicitly Out of Scope for v1

Resist adding any of these until v1 has been used to pitch at least one
real client:
- Additional third-party APIs beyond Browserless + Lighthouse
- AI chatbot / conversational assistant
- Screenshot heatmap overlay
- Live before/after preview
- JSON export
- User accounts, login, billing
- Any "just in case" integration without a named, specific use case
