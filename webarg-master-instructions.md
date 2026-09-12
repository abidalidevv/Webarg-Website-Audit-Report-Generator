# Webarg — Master Project Instructions

This is the single entry point for this project. Read this first, then
go to the specific file listed for whatever you're working on. Don't
duplicate content across files — update the relevant file and keep
this index accurate.

## 1. What This Is

Webarg is a **personal lead-generation tool** for freelance developer
Abid — not a multi-tenant SaaS product, not a competitor to Ahrefs/
GTmetrix/SEMrush.

**The pitch loop:** Abid enters a prospect's URL → Webarg scans it →
generates a shareable report link + downloadable PDF → Abid pitches
the prospect: "here are N verified issues on your site, here's the
evidence, I'll fix them." The report's job is to be credible enough
that a non-technical business owner trusts the diagnosis and pays for
the fix — closer in spirit to a structural inspection report than a
marketing dashboard.

## 2. Current Status — read this before doing anything else

Antigravity reported Phases 1–5 complete and fully passing, but two
things in that report don't hold up:
- It claimed to fully implement the 84-point manual playbook
  (including access-gated items like GHL automation and CMS database
  internals) into the automated scanner — this directly contradicts
  the Anti-Hallucination Rule (Section 6 below), which it also stated
  itself. This has **not** been independently verified.
- It reported the same generated PDF as both 4.8 MB and 340 KB in two
  different messages.

**A corrective work order (`webarg-phase6-verification-and-polish.md`)
has been issued but not yet confirmed complete with real evidence.**
Until Phase 6 passes with actual proof (real file sizes, real code or
honest retraction for each disputed claim, a real 320px screenshot), treat
everything Antigravity has reported as unverified, not as fact. Do not
build Phase 7 (Graph View) or anything else on top of it until then.

## 3. File Index

- **`website-audit-pro-spec.md`** — the master technical spec: full
  architecture, tech stack, security guardrails, design tokens, the
  itemized automated check list, and the phase-wise Antigravity build
  prompts (Phases 1–5).
- **`webarg-manual-audit-playbook.md`** — the separate 84-point manual
  audit methodology Abid follows by hand for paid engagements with
  credentialed access. Not for automation.
- **`webarg-phase6-verification-and-polish.md`** — current active work
  order: verify or retract the disputed claims, fix the card-width
  overflow bug, add scoped motion polish. **Must pass before anything
  else continues.**
- **`webarg-phase7-graph-view.md`** — spec for a Graph View toggle
  (minimal SVG charts). Sequenced to start only after Phase 6 passes.
- **This file** — orientation and the standing rules that apply across
  all of the above.

## 4. Architecture Snapshot

- **Frontend:** React (Vite), single continuous scrolling page — no
  dashboard sidebar, no tabs.
- **Backend:** Node.js + Express, one primary endpoint `POST /scan`.
- **Scan engine:** Browserless.io (hosted headless Chrome) — no
  self-managed Chrome binary.
- **Analysis:** Lighthouse (programmatic), axe-core, Cheerio, native
  `dns.promises`, a small ssl-checker library.
- **PDF:** the same headless browser's native `page.pdf()` against the
  report's own route — never html2canvas or jsPDF.
- **Storage:** flat JSON keyed by report ID — no database needed at
  this volume.
- **Admin:** single password-gated `/admin` route (env credential) —
  no Firebase, no multi-user, no billing.
- **Scan modes:** Quick (~60s: Lighthouse + headers + SSL) and Deep
  (~10 min: adds console/pageerror capture, full link/image crawl,
  axe-core, the v1.1 URL-only checks) — see spec Section 2 and 11a for
  the full list.

## 5. Design System Snapshot

- Colors: `--ink #14181F`, `--paper #EDEEE7`, `--signal-crit #C1432B`,
  `--signal-warn #B8863D`, `--signal-pass #4C7A5E`, `--accent #3E6E8E`
  (interactive elements only, never decorative).
- Type: Barlow Condensed (headings), Manrope (body), DM Mono (data
  values only).
- Layout: hairline dividers, not uniform rounded cards with shadows.
  Numbers are the largest element on screen. No all-caps eyebrow
  labels, no arrows on buttons.
- Motion: **one** choreographed moment — the Three.js scan-beam sweep
  (~1450ms, ported from `webarg V3 - Copy.html`). Everything else is
  static or tied directly to a real user action (accordion expand,
  button press). No ambient/looping decoration.
- Full prohibited-tells list is in the spec, Section 5.

## 6. The Anti-Hallucination Rule — never relax this

The automated scanner can only see what's reachable from a public URL
with no login. It can never truly check: CMS admin internals, GHL/
Shopify account data, hosting/server resources, payment sandbox
behavior, real device/phone behavior, or screen-reader behavior.

**If a check needs access the tool doesn't have, the correct outcomes
are: don't build it, or mark it "Manual Audit Only" in the UI.** A
fabricated PASS/FAIL for something that was never actually checked is
the single worst failure mode for this project — it's what destroys
trust in a live client pitch. This rule has already been violated
once (Section 2); do not let it happen again.

## 7. Build Sequencing Discipline

Every phase ends with a stop-and-verify checkpoint. **Do not let an
agent skip a checkpoint even if it offers to keep going, and don't ask
it to "hurry up and skip checking" — that's exactly what led to the
current unverified state.** Evidence means a real command output, a
real measured number, or real working code — not a confident written
description of what should have happened.

Phase order: 1 Backend → 2 Frontend → 3 PDF/Sharing → 4 Admin → 5
Security verification → **6 Verify/retract + bug fix (current,
blocking)** → 7 Graph View → (future, not yet spec'd) an LLM-generated
recommendations pass.

## 8. Explicitly Out of Scope (v1)

AI chatbot/conversational widget, screenshot heatmap overlay, live
before/after iframe preview, raw JSON export, user accounts/billing/
multi-tenant anything, and any third-party API or CDN added without a
named, specific gap it fills. See spec Section 12 for the full list
and reasoning.

## 9. Possible Future Addition (not yet built)

An LLM call to generate the plain-language recommendations section,
using a free-tier API (OpenCode Zen, Groq, or Gemini — in that
preference order, each as a fallback for the one before). Must degrade
to static template text if the API call fails or times out — same
third-party-failure-resilience rule as everything else in this
project. Not started; spec this properly before building if it's
picked up.

## 10. Immediate Next Step

Get real evidence for Phase 6's checklist. Nothing else proceeds until
that's done.
