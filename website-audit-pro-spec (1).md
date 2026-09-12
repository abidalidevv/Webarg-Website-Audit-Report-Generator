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

- **Google Stitch:** regenerate the layout using the Section 9 prompt —
  not the original one.
- **Cursor AI:** build the Express `/scan` endpoint and the React report
  components.
- **Claude:** security review of the `/scan` endpoint (SSRF blocklist,
  rate limiting, timeout, log sanitization) before anything goes live to
  a real client; copy review of the report content.
- **Antigravity:** final UI/UX polish pass once real scan data is
  flowing through the UI (not before — polishing against fake data
  wastes the pass).

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

## 11. Explicitly Out of Scope for v1

Resist adding any of these until v1 has been used to pitch at least one
real client:
- Additional third-party APIs beyond Browserless + Lighthouse
- AI chatbot / conversational assistant
- Screenshot heatmap overlay
- Live before/after preview
- JSON export
- User accounts, login, billing
- Any "just in case" integration without a named, specific use case
