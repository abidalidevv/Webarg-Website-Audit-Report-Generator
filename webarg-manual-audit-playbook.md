# Webarg — Manual Audit Playbook (2026)

## How this relates to the automated scan tool

This is a **separate document from the automated URL-scan tool spec**
(`website-audit-pro-spec.md`). The scan tool checks what's reachable
from a public URL with no login — Lighthouse, console errors, broken
links, headers, DNS, structured data, etc. Most of what's in this
playbook needs things the scan tool can never have: CMS admin logins,
GHL/Shopify account access, hosting/server access, test payment
accounts, a real phone, a screen reader, multiple real browsers.

**Do not ask an AI coding agent to "implement" the access-gated or
human-judgment sections of this playbook as automated checks.** If it
can't actually perform a check, the honest outcomes are "not tested —
no access" or a human does it manually — never a fabricated PASS/FAIL.

**Business use:** this is the checklist *you* (Abid) follow when doing
a full manual audit engagement — the higher-tier paid service that the
automated scan tool's report can upsell into ("the automated scan found
14 issues — the full manual audit covers CMS health, GHL automation,
real device testing, and 5 real customer journeys").

## Purpose

Final report should answer 5 questions:

1. Kya broken hai?
2. Evidence kya hai?
3. User par kya impact hai?
4. Business/conversion par kya impact hai?
5. Fix ki priority kya honi chahiye?

Finding format:

> **Severity → Finding → Evidence → User Impact → Business Impact → Recommendation → Verification**

Severity levels:
- **CRITICAL** — functionality, revenue, leads, security, data, or a major user journey seriously affected
- **HIGH** — major issue with meaningful user/business impact
- **MEDIUM** — important quality, SEO, accessibility, UX, or maintainability issue
- **LOW** — minor issue / polish / technical debt
- **PASS** — check completed successfully

---

# 1. One-Day Audit Schedule

| Time | Work |
|---|---|
| 30 min | Full site walkthrough |
| 60 min | DevTools + Console + Network |
| 60 min | Performance |
| 60 min | SEO |
| 45 min | Mobile / Responsive |
| 45 min | Accessibility |
| 45 min | Security |
| 30 min | Forms / Conversion |
| 30 min | Analytics / Tracking |
| 45 min | Full crawl + Broken Links |
| 45 min | Final QA + Screenshots + Report |
| Extra / parallel | CMS / GHL / Shopify / React / infrastructure checks as applicable |

For sites with 100+ pages: inspect homepage, top-traffic pages, main
service/product pages, contact/conversion pages, high-value templates,
a random sample, and error/edge-state pages — not every page.

---

# 2. Full Site Walkthrough

**Navigation:** logo click, main nav, dropdown, mega menu, mobile menu,
sticky header, breadcrumbs, footer nav, search, language selector,
account menu, CTA buttons, external links.

**Real-world interactions:** phone number, click-to-call, WhatsApp,
email, Google Maps, directions, booking, appointment, quote request,
download, social links, calendar, chat widget, live support.

**Verify actual behavior:** mobile phone number opens call UI, number
is not merely text, correct number is dialed, WhatsApp uses correct
number, email opens correct recipient, subject/body correct where
applicable, maps opens correct location, booking lands on correct
calendar, social icons point to correct profiles, no dead CTA.

---

# 3. Business Conversion Audit

**Above the fold:** business understood within seconds, offer clear,
target audience clear, primary CTA obvious, secondary CTA not
competing, trust signal visible, contact option visible.

**CTA consistency** — for every CTA (Get Started, Book Now, Request
Quote, Call, WhatsApp, Contact, Buy Now, Apply, Download, Schedule):
`Visible → Clickable → Correct destination → Correct next step → Conversion completes`

**Conversion friction:** too many fields, unnecessary steps, confusing
instructions, weak error states, broken CTA, popup blocking content,
CTA hidden on mobile, form appears broken, unexpected redirect, no
confirmation, no next step, no trust reassurance.

---

# 4. Forms — Deep Test

**Validation matrix:** empty submit, valid submit, invalid email,
invalid phone, spaces only, very long text, special characters,
copy/paste, autofill, Enter-to-submit, tab navigation, multiple rapid
clicks, repeated submission, refresh after submit, back button after
submit.

**Delivery:** frontend success, backend success, admin notification,
customer notification, CRM record, tags, pipeline stage, workflow,
webhook, autoresponder, source attribution, UTM preservation, duplicate
handling.

**Failure states:** network error, API error, timeout, CAPTCHA
failure, validation error, server 500, email failure, CRM failure.

**UX:** clear field labels, required indicators, inline error message,
correct field highlighted, error clears after fixing, loading state,
submit button disabled during request, success message, no accidental
double submission.

---

# 5. Click-to-Call / Contact Verification

**Phone:** `tel:` link, correct number, multiple numbers consistent,
mobile opens dialer, country code correct, number not hidden inside an
image, sticky mobile CTA works.

**Email:** `mailto:`, correct recipient, subject, body, no typo,
correct business domain.

**WhatsApp:** correct international number, correct message, mobile
app flow, desktop WhatsApp Web flow.

**Maps:** correct business, correct address, correct pin, directions
work, mobile maps handoff works.

---

# 6. Browser DevTools — Console

Check: JavaScript exceptions, TypeError, ReferenceError, SyntaxError,
unhandled promise rejection, failed API calls, CORS, CSP errors, mixed
content, deprecated APIs, third-party errors, cookie errors,
reCAPTCHA, analytics, pixel, maps, chat widget.

Record: exact error, URL, file, line number, timestamp, reproduction
step.

---

# 7. Network

Inspect status codes: 200, 301, 302, 304, 400, 401, 403, 404, 409, 429,
500, 502, 503, 504.

Check: slow requests, failed requests, redirect chains, duplicate
requests, large payloads, API latency, third-party latency, fonts, JS,
CSS, images, JSON, video, preloads, prefetches.

Headers: Cache-Control, ETag, Last-Modified, Content-Encoding,
Content-Type, Content-Length, Location, CORS headers, security
headers.

---

# 8. Performance — Beyond Lighthouse

**Core metrics:** LCP, INP, CLS, FCP, TTFB, Speed Index, long tasks.

**Resource issues:** oversized images, wrong format, wrong dimensions,
missing lazy loading, incorrect eager loading, missing `srcset`/
`sizes`, render-blocking CSS/JS, huge JS bundles, unused CSS/JS,
duplicate libraries/fonts, excessive third-party scripts.

**Runtime:** long main-thread tasks, layout thrashing, forced
synchronous layout, excessive reflows, too many/deep DOM nodes,
unnecessary re-renders, expensive event listeners, memory growth,
animation CPU usage.

**Network conditions:** test on good connection, slow 4G, 3G, offline,
high latency — check loading states, timeout, retry, fallback, partial
content.

---

# 9. Image Audit

Per important image: file size, dimensions, format, compression, crop,
quality, responsive version, CDN, lazy loading, `srcset`/`sizes`,
width/height, CLS risk, duplicate download, retina over-serving.
Formats to consider: AVIF, WebP, JPEG, PNG only when appropriate.

---

# 10. Font Audit

Number of families/weights, font file sizes, WOFF2 availability,
`font-display`, FOUT/FOIT, layout shift, preload strategy, duplicate
font requests, unused weights, fallback stack, icon fonts.

---

# 11. CSS Audit

Excessive `!important`, specificity conflicts, duplicate rules, dead/
unused CSS, fixed-width overflow, z-index bugs, stacking contexts,
sticky/fixed positioning, responsive overrides, breakpoint
inconsistency, hidden content, clipped text, unexpected overflow.

---

# 12. JavaScript Architecture / Runtime

Duplicate event listeners, listeners not removed, memory leaks, timers
not cleared, race conditions, unhandled promises, error boundaries,
state synchronization, stale state, duplicate API calls, retry/
infinite loops, initialization order, script execution before DOM
availability, global namespace pollution.

---

# 13. HTML / DOM Quality

Duplicate IDs, invalid nesting, incorrect heading hierarchy, missing
`lang`, missing viewport, empty buttons/anchors, interactive element
inside interactive element, missing labels, non-semantic clickable
divs, missing dimensions, inaccessible custom components, deprecated
markup.

---

# 14. SEO — Advanced

**Metadata:** title, description, canonical, robots, Open Graph,
Twitter/X cards.

**Crawl:** robots.txt, sitemap.xml, sitemap index, orphan pages, crawl
depth, internal links, redirect chains, soft 404, noindex, canonical
conflicts.

**Content:** thin content, duplicate content, outdated content,
cannibalization, search-intent mismatch, missing service/location
content, weak internal linking, weak topical structure.

---

# 15. Search Engine / SERP Verification

Search brand, brand + location, main service, main product, and a
high-value keyword. Check correct title/snippet, correct vs. wrong
ranking page, sitelinks, rich results, outdated result, indexed test/
staging pages.

---

# 16. Structured Data

Validate applicable schema: Organization, LocalBusiness, Product,
Article, Breadcrumb, Event, Review, FAQ (where legitimate). Check
required properties, invalid values, fake/inaccurate markup, schema
vs. visible-content mismatch, business-details consistency.

---

# 17. Business Identity Consistency

Compare business name, phone, address, email, opening hours, and URLs
across: website, footer, contact page, schema, Google Business
Profile, social profiles. Look for contradictions.

---

# 18. Accessibility — Manual

**Keyboard:** Tab, Shift+Tab, Enter, Space, Escape, arrow keys — test
menu, dropdown, modal, form, carousel, filters, search, checkout.

**Focus:** visible focus, correct focus order, focus trap, focus
restoration, focus not lost.

**Zoom:** 125% / 150% / 175% / 200% — check overflow, clipping, hidden
buttons, broken navigation.

**Reduced motion:** test `prefers-reduced-motion` — check animation
reduction, usable transitions, no essential content tied to motion.

---

# 19. Error Handling / Recovery

For every important feature, test `Success → Failure → Recovery`: bad
input, server failure, slow request, offline, timeout, missing data,
expired session, invalid token. Check the user understands what
happened, knows what to do, retry works, state isn't lost
unnecessarily.

---

# 20. Empty States

Search no results, empty cart, empty account, no appointments, no
products, no messages, empty dashboard, filters returning zero
results.

---

# 21. 404 / 500 / Error Pages

Open a random invalid URL and a known deleted URL. Verify correct HTTP
status, a useful page, navigation, search, home link, no
redirect-to-home abuse, and that a "soft 404" isn't actually returning
200.

---

# 22. URL / Redirect Audit

Test HTTP, HTTPS, www, non-www, trailing slash, uppercase, query
strings, old/deleted URLs. Look for redirect loops, chains, incorrect
destinations, homepage redirects, duplicate URLs.

---

# 23. Security — Expanded

**Transport:** SSL validity, HTTPS, mixed content, HSTS, TLS config.

**Headers:** Content-Security-Policy, Strict-Transport-Security,
X-Content-Type-Options, Referrer-Policy, Permissions-Policy,
X-Frame-Options.

**Exposure:** server version, CMS version, source maps, debug mode,
exposed config, backup files, directory listing, test endpoints,
staging environment.

**Client-side exposure:** API keys, secrets, internal endpoints,
environment variables, sensitive IDs, source code comments. **Do not
exploit or abuse discovered secrets — report them safely.**

---

# 24. Cookies / Privacy

Cookie banner, accept/reject/preferences, consent persistence,
withdrawal, analytics/marketing tracking before consent, third-party
cookies, Secure/HttpOnly/SameSite flags, expiry, duplicate cookies.

---

# 25. Local Storage / Browser Storage

Inspect localStorage, sessionStorage, IndexedDB. Check for sensitive
data, unnecessary data, stale state, oversized storage, auth/token
handling, persistence bugs.

---

# 26. Analytics / Tracking

Verify actual events: page view, CTA click, phone/email/WhatsApp
click, form start/submit, booking, add to cart, checkout, purchase.
Check the event fires, correct parameters, no duplicate events, wrong
event names, wrong attribution, consent behavior, cross-domain
tracking, UTM persistence.

---

# 27. Third-party Dependency Audit

Inventory every third-party: fonts, maps, reCAPTCHA, YouTube, Vimeo,
Stripe, PayPal, Meta, TikTok, Google, chat, reviews, CRM, scheduling.
For each: necessary? working? slow? blocking? duplicate? privacy
implications? failure handled?

---

# 28. Cross-browser

At minimum Chrome, Edge, Firefox, Safari. Check layout, fonts, forms,
menus, sticky elements, video, checkout, popup, JS behavior.

---

# 29. Device / Responsive

Test widths 320 / 375 / 390 / 414 / 768 / laptop / desktop / large
desktop, portrait/landscape, touch/keyboard/mouse. Look for horizontal
scroll, overflow, text clipping, button/menu issues, popup overlap,
footer issues, sticky CTA overlap.

---

# 30. Device / Network State

Good Wi-Fi, slow 4G, 3G, offline, airplane mode, reconnect after
offline. Check loading, retry, cached content, stale data, error
state, duplicate requests.

---

# 31. Search / Filter / Sort

Normal search, typo search, no results, filters, multiple filters,
reset, sorting, pagination, back button, URL state, mobile behavior.

---

# 32. Pagination

Page 2/3/last, invalid page, pagination state, canonical, duplicate
content, back button, refresh.

---

# 33. Browser History

For SPA/AJAX interfaces: back, forward, refresh, direct deep link,
modal open/close, filters, search state, tab state.

---

# 34. Deep Links

Directly open service/product/article/account/campaign URLs — check
server handling, 404, auth behavior, refresh behavior, routing,
redirects.

---

# 35. Share / Social Preview

Open Graph title/description/image, Twitter/X card, LinkedIn preview,
WhatsApp preview, favicon.

---

# 36. Print

Ctrl+P — check important content, page breaks, tables, images,
navigation hiding, readable layout.

---

# 37. Media / Video

Autoplay, mute, poster, loading, mobile behavior, captions, transcript,
broken embed, aspect ratio, lazy loading, third-party dependency.

---

# 38. File Upload / Download

**Upload:** supported file, wrong extension, oversized/empty/corrupted/
duplicate file, cancel, retry, progress, drag/drop, camera/mobile
upload.

**Download:** actual file, correct filename/MIME type/extension,
permissions, broken link.

---

# 39. Authentication

Login, logout, wrong password/email, forgot password, expired/used
reset link, resend verification, session expiry, remember me, multiple
tabs/devices.

**Session:** refresh, close/reopen, idle timeout, token expiration,
logout invalidates session, password change invalidates sessions where
expected.

---

# 40. Account / Dashboard

Profile, password, email, notifications, billing, subscription,
invoice, downloads, delete account, logout. Check permission, state
persistence, error recovery, unauthorized access.

---

# 41. E-commerce General

Product, category, search, filter, variation, inventory, price,
discount, coupon, cart, checkout, shipping, tax, payment, order,
confirmation, emails, refund.

---

# 42. Payment Integrity

Test safely with approved sandbox methods where possible: successful/
failed/cancelled payment, timeout, refresh, back button, duplicate
click/order, payment-succeeded-order-failed and vice versa, webhook
handling.

---

# 43. Currency / Tax / Shipping

Currency, symbol, rounding, taxes, shipping, discount calculation,
total calculation, region-specific rules, checkout consistency.

---

# 44. Date / Time

For booking/scheduled systems: timezone, server vs. browser time,
daylight saving, date format, expired/future slots, availability,
reminder timing.

---

# 45. CMS General

(WordPress / Joomla / Drupal / Webflow / other) — version, extensions,
inactive/duplicate/abandoned plugins, outdated dependencies, license
status, update policy, admin users, roles, 2FA, admin protection,
publishing workflow, drafts, scheduled publishing, orphan/test content.

---

# 46. WordPress Deep Audit

**Core:** WP version, PHP version, memory limit, max execution time,
cron, debug, uploads, REST API, XML-RPC, file editor.

**Theme:** parent/child, outdated theme, custom code, functions.php
bloat, hardcoded URLs, unused assets, overrides.

**Plugins:** active/inactive, duplicate, abandoned, vulnerable, heavy,
globally loaded, unnecessary.

**Elementor:** excessive nesting, giant DOM, widget bloat, duplicate
CSS, responsive overrides, global styles, unnecessary motion,
generated CSS size.

**Database:** autoload, revisions, transients, orphaned metadata,
Action Scheduler, sessions, oversized tables.

---

# 47. GoHighLevel / GHL Deep Audit

**Funnel:** all steps, URLs, redirects, CTA, forms, calendar,
confirmation, mobile layout.

**Form:** fields, custom fields, tags, pipeline, source, workflow,
duplicate contact.

**Automation** — trace `Lead → Contact → Tag → Pipeline → Workflow →
Email/SMS → Task`. Check triggers, stop conditions, loops, duplicates,
wrong stage/user/timezone, broken links, compliance requirements.

**Calendar:** availability, timezone, buffer, conflicts, confirmation,
reminder, cancellation, reschedule, no-show workflow.

**Agency setup:** snapshots, custom values, domains, integrations,
dependencies, client-specific configuration.

---

# 48. Shopify Deep Audit

**Storefront:** home, collection, search, filters, product, cart,
checkout.

**Product:** title, description, variants, price, compare-at, SKU,
stock, images, reviews, shipping, returns.

**Theme:** Liquid, sections, app blocks/scripts, duplicate apps,
unused code, hardcoded content, dynamic sources.

**Checkout:** payment, shipping, tax, discount, Shop Pay, Apple Pay,
Google Pay, failed payment, order email.

**Tracking:** GA4, Meta, TikTok, Google Ads, ViewContent, AddToCart,
BeginCheckout, Purchase, duplicate events.

---

# 49. React / Next.js Deep Audit

**React:** render behavior, unnecessary re-renders, state bugs, stale
state, race conditions, effect dependency issues, memory leaks, error
boundaries, loading states, failed requests.

**Architecture:** excessive client components, unnecessary client
rendering, duplicate dependencies, bundle size, unnecessary libraries,
prop drilling, duplicate API calls.

**Next.js:** SSR/SSG, caching, revalidation, metadata, sitemap,
robots, image/font optimization, loading/error/not-found pages,
middleware, route behavior.

---

# 50. React Native App Audit

**Devices:** Android low-end/modern, iPhone, small/large screen,
portrait/landscape.

**Network:** online, slow, offline, reconnect.

**App states:** loading, success, empty, error, timeout, retry,
permission denied.

**Navigation:** back, deep link, universal/app link, notification
routing, app resume, refresh, modal dismissal.

**Native functionality:** camera, GPS, microphone, notifications,
contacts, files, biometrics, share sheet, phone, WhatsApp, maps — test
Allow/Deny/Never-ask-again and permission revoked from OS settings.

**Performance:** startup, screen transitions, memory, image memory,
long lists, re-renders, crashes, battery usage.

---

# 51. Localization

Language switching, translations, untranslated strings, locale,
currency, dates, numbers, long strings, RTL, special characters.

---

# 52. Content Quality

Spelling, grammar, factual consistency, outdated information,
duplicate wording, weak CTA, missing benefits, fake-sounding claims,
unsupported statistics, unclear service descriptions, trust gaps.

---

# 53. AI-era Content / AI Readiness

**Machine-readable content:** important text in actual HTML, not
hidden only behind JS interaction; clear service descriptions;
organization/business data; location information; FAQ structure;
authorship/expertise signals; consistent entity information.

**AI-generated content quality** — look for generic language,
repetition, factual contradictions, unsupported claims, fake
statistics, unnatural phrasing, SEO filler. Report this as "content
credibility / originality concern," not "AI content issue."

**AI chatbot** (if present): accuracy, hallucination, current pricing/
hours/policies, human handoff, lead capture, CRM, privacy, mobile
behavior, error recovery.

---

# 54. Privacy / Data Governance

Privacy policy, terms, cookie policy, refund policy, consent,
analytics/marketing consent, data retention, account deletion,
unsubscribe.

---

# 55. Email Infrastructure

SMTP, SPF, DKIM, DMARC, sender domain, reply-to, deliverability, admin/
customer notification, autoresponder, spam risk.

---

# 56. DNS / Domain

A, AAAA, CNAME, MX, TXT, SPF, DKIM, DMARC, nameservers, www/root
domain, redirects, stale records.

---

# 57. Server / Infrastructure

Where access is authorized: CPU, RAM, storage, inode usage, PHP
workers, MySQL load, disk I/O, bandwidth, server errors, process
limits, CDN, cache, backups.

---

# 58. Backup / Recovery

Automatic backups, frequency, retention, off-site backup, database/
file backup, restore test, disaster recovery. **A backup that has
never been restored is not fully verified.**

---

# 59. Deployment / Environment

Staging indexed, localhost URLs, test API, debug mode, test analytics,
development credentials, old assets, cache mismatch, environment
variable leaks, inconsistent config.

---

# 60. Dependency / Supply Chain

Outdated packages, duplicate versions, abandoned packages, unnecessary
dependencies, CDN dependency, third-party script failures, oversized
dependency, known vulnerabilities where tooling is available.

---

# 61. CMS / Site Content Operations

Publishing, scheduling, approvals, authors, categories, tags,
revisions, expired content, draft content, unintentional public
content, orphan/duplicate content.

---

# 62. Notifications

UI toast, email, SMS, push, workflow — verify correct content/
recipient/timing, no duplicate, unsubscribe behavior, correct links/
timezone.

---

# 63. Third-party Failure Testing

Where safely possible, observe behavior when analytics/maps/CAPTCHA/
API/chat/YouTube/CDN is unavailable or slow. Question: does the core
website still work?

---

# 64. JavaScript Disabled

Disable JS temporarily where relevant. Check core content, navigation,
important links, forms, SEO content don't become an empty shell when
server-rendering is expected.

---

# 65. Ad Blocker / Privacy Extension

Test with common privacy/ad-blocking environments where practical.
Check navigation, forms, checkout, essential widgets, cookie system,
page content.

---

# 66. Edge-case Input Testing

Within safe, authorized scope: empty, whitespace, normal, very long,
special characters, emoji, non-Latin characters, copied rich text,
HTML-looking input, unexpected numeric values.

---

# 67. Accessibility of Dynamic Components

Modal, drawer, dropdown, tabs, accordion, carousel, filters, date
picker, search suggestions — check keyboard, focus, labels, state
announcement, Escape, screen-reader behavior.

---

# 68. E-commerce Abandoned / Recovery Flow

Abandoned cart email, abandoned checkout, reminder timing, recovery
link, coupon, duplicate cart, expired recovery link, unsubscribe.

---

# 69. Subscription / Membership

Signup, upgrade, downgrade, cancellation, renewal, failed renewal,
grace period, invoice, access after cancellation, access restoration,
billing portal.

---

# 70. Permissions / Roles

For multi-user apps (visitor/user/manager/admin): correct access,
hidden UI is not the only protection, unauthorized URL access, role
persistence, permission after logout, session expiry.

---

# 71. Customer Journey Audit — Mandatory

**Journey A — New visitor:** `Search → Homepage → Understand offer → CTA`

**Journey B — Lead:** `Homepage → Contact → Form → Confirmation → Actual delivery`

**Journey C — Mobile:** `Mobile → Service/Product → Call/WhatsApp → Conversion`

**Journey D — Returning user:** `Direct URL → Login → Action → Logout`

**Journey E — Failure recovery:** `Wrong input/payment/network error → Retry → Success`

Score each: PASS / WARNING / CRITICAL.

---

# 72. Evidence Collection

Capture screenshot, screen recording where useful, URL, device,
browser, timestamp, selector, HTTP status, console error, network
request, Lighthouse metric, source code line, reproduction steps.
Don't overload the report with screenshots — capture what proves the
issue.

---

# 73. Finding Quality Rules

Bad finding: *"Website is slow."*

Good finding:

> **High — Homepage LCP exceeds target**
>
> Evidence: LCP measured at 4.1s on mobile test.
> Impact: Primary content takes longer to become visible.
> Recommendation: Optimize hero image delivery and reduce
> render-blocking resources.
> Verification: Re-run mobile performance test after deployment.

---

# 74. Business Impact Classification

- **Revenue:** checkout failure, payment failure, product bug
- **Leads:** form failure, phone failure, booking failure, CRM failure
- **Search visibility:** indexability, metadata, canonical, performance
- **Trust:** broken links, inaccurate business details, visible errors, outdated content
- **Accessibility:** users unable to complete a task
- **Security:** exposure, insecure transport, missing controls

---

# 75. Recommended Report Priority

**Priority 1 — Fix immediately:** broken forms, broken checkout,
critical security, major JS crash, lead loss, payment issue.

**Priority 2 — Fix next:** poor mobile UX, meaningful performance
problems, SEO blockers, accessibility issues, broken automation.

**Priority 3 — Optimize:** technical debt, unused assets, UI
inconsistencies, small SEO improvements, code cleanup.

**Priority 4 — Polish:** micro UX, typography, minor spacing, content
polish.

---

# 76. Final QA Before Delivering Report

Re-check every Critical issue, reproduce important findings, remove
false positives, check screenshots/URLs/browser/device/timestamps,
ensure recommendations are realistic, separate observed facts from
assumptions, mark items requiring authenticated access, mark items not
tested due to missing access, review severity.

---

# 77. Final Report Structure

```text
WEBARG
Website Audit Report

Website
Date
Browser / Device
Audit scope


Executive Summary
────────────────────
Overall health
Top 3 risks
Top 3 opportunities
Business impact


Conversion Journey
────────────────────
Call
WhatsApp
Email
Form
Booking
Checkout


Score Summary
────────────────────
Performance
SEO
Accessibility
Security


Critical Findings
────────────────────
01
02
03


Detailed Findings
────────────────────
Console
SEO
Accessibility
Performance
Security
CMS
Integrations
Analytics
Infrastructure


Evidence
────────────────────
Screenshots
URLs
Console
Network
Metrics


Recommended Fix Plan
────────────────────
Priority 1
Priority 2
Priority 3


Retest Plan
────────────────────
What should be verified after fixes
```

---

# 78. Webarg Product Recommendation

Don't limit Webarg to 4 scores. Best model:

```
OVERALL HEALTH
     ↓
BUSINESS IMPACT
     ↓
4 CORE SCORES (Performance / SEO / Accessibility / Security)
     ↓
TECHNICAL FINDINGS (Console / CMS / Infrastructure / Integrations / Analytics)
     ↓
CONVERSION JOURNEY (Call / WhatsApp / Email / Form / Booking / Checkout)
     ↓
EVIDENCE (Screenshot / URL / Code / HTTP / Timestamp / Device)
     ↓
REMEDIATION (Critical / High / Medium / Low)
```

This makes the report useful to both the business owner and the
developer.

---

# 79. Platform Detection

Before auditing, identify the platform: WordPress, WooCommerce,
Shopify, Webflow, Wix, Squarespace, GHL, Drupal, Joomla, Laravel,
React, Next.js, Vue, Nuxt, Angular, React Native, native mobile app —
then activate the matching platform-specific checklist above.

---

# 80. Access Level Matrix

| Access | What can be verified |
|---|---|
| Public website only | UX, frontend, SEO, performance, public security signals |
| CMS admin | content, plugins, settings, users |
| Hosting | server, PHP, logs, database, backups |
| Analytics | events, traffic, conversions |
| Search Console | indexing, search, CWV |
| GHL | workflows, CRM, calendar, automation |
| Shopify admin | products, apps, checkout, orders |
| Source repository | code, dependencies, architecture |
| Staging | deeper functional testing |
| Mobile build | device/app testing |

**Never claim something was audited when the required access was
unavailable.**

---

# 81. One-Day Audit Rule

A one-day audit should be deep rather than wide. Prioritize revenue/
lead paths, broken functionality, security, performance, mobile, SEO
blockers, accessibility, tracking/attribution, platform-specific
configuration, and evidence + remediation. For 100+ page sites, don't
pretend every page got identical manual inspection — use full crawl,
template sampling, key-page manual testing, random sampling, and
high-value journey testing instead.

---

# 82. The Most Important Principle

Don't write: *"There are 23 issues."*

Write: *"We found 23 issues. 4 require immediate attention, 7 can
affect leads/search visibility, and 12 are optimization
opportunities."*

The report should answer: **what should the client pay to fix first?**

---

# 83. Universal Finding Template

```
ID:
Category:
Severity:
URL:
Device:
Browser:
Timestamp:

Finding:
[What is wrong]

Evidence:
[What proves it]

Reproduction:
[Exact steps]

User Impact:
[What the visitor experiences]

Business Impact:
[Lead/revenue/trust/search/etc.]

Root Cause:
[When known]

Recommendation:
[How to fix]

Verification:
[How to confirm fixed]

Estimated Effort:
[Low / Medium / High]

Status:
[Open / Fixed / Retest / Passed]
```

---

# 84. Final Audit Completion Checklist

Before marking an audit complete, confirm you considered: functional
behavior, conversion, contacts (call/WhatsApp/email/forms/booking),
console, network, performance, images, fonts, CSS, JS, DOM, SEO, SERP,
schema, accessibility, keyboard, zoom, mobile, browser compatibility,
security, cookies, privacy, analytics, third parties, CMS, WordPress,
GHL, Shopify, React/Next, React Native, authentication, e-commerce,
payment, APIs, DNS, email infrastructure, server, database, backup,
deployment, dependencies, AI readiness, content quality, error
recovery, empty states, 404/500, search/filter/sort, history/deep
links, upload/download, localization, notifications, real user
journeys, evidence, business impact, remediation, retesting.

---

## Bottom Line

A genuinely valuable 2026 website audit is not:

> Lighthouse score + broken links

It is:

> Real user journeys + technical evidence + business impact +
> platform-specific inspection + prioritized remediation

That's the level at which an audit can justify a real development/
repair order — but it requires the access and manual work this
document describes. The automated tool (separate spec) is the fast,
no-access-needed first pass that opens the door to selling this.
