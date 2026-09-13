import { nanoid } from 'nanoid';

/**
 * Universal Report Normalizer implementing Sections 78, 79, 80, 82, 83 of webarge.txt
 *
 * @param {object} params
 * @returns {object} Comprehensive normalized Webarg report
 */
export function normalizeReport({
  url,
  scanMode = 'quick',
  scores,
  metrics,
  cheerioData,
  conversionData,
  assetData,
  techStack,
  schemaData,
  dnsData,
  sslData,
  redirectData,
  check404Data,
  robotsSitemapData,
  secHeadersData,
  browserlessData,
  jsComparisonData,
  allIssues
}) {
  const reportId = nanoid(12);
  const scanDate = new Date().toISOString();

  // Deduplicate issues by title + evidence
  const uniqueFindings = [];
  const seen = new Set();

  for (const issue of allIssues) {
    const key = `${issue.category}:${issue.title}:${issue.evidence}`;
    if (!seen.has(key)) {
      seen.add(key);
      const rawSev = String(issue.severity || 'warning').toLowerCase();
      const canonicalSeverity = rawSev === 'critical' ? 'critical' : (rawSev === 'pass' || rawSev === 'healthy') ? 'pass' : 'warning';
      uniqueFindings.push({
        id: nanoid(6),
        category: issue.category || 'General Quality',
        severity: canonicalSeverity,
        headline: issue.title || 'Audit Finding',
        evidence: String(issue.evidence || ''),
        userImpact: issue.userImpact || 'Impacts user experience and interaction reliability.',
        businessImpact: issue.businessImpact || 'Causes customer friction and potential bounce.',
        recommendation: issue.recommendation || 'Review configuration and implement standard practices.',
        effort: issue.effort || 'Low',
        status: 'Open'
      });
    }
  }

  // Count severities (using canonical lowercase)
  const criticalFindings = uniqueFindings.filter((i) => i.severity === 'critical');
  const warningFindings = uniqueFindings.filter((i) => i.severity === 'warning');
  const passFindings = uniqueFindings.filter((i) => i.severity === 'pass');

  // Overall health score: weighted average of actually measured scores
  // If scores are missing, calculate only across available measured scores, or null if none available.
  const measuredScoreEntries = [
    { val: scores?.performance, weight: 0.3 },
    { val: scores?.security, weight: 0.25 },
    { val: scores?.seo, weight: 0.25 },
    { val: scores?.accessibility, weight: 0.2 }
  ].filter((e) => typeof e.val === 'number' && !isNaN(e.val));

  let overallScore = null;
  if (measuredScoreEntries.length > 0) {
    const totalWeight = measuredScoreEntries.reduce((acc, e) => acc + e.weight, 0);
    const weightedSum = measuredScoreEntries.reduce((acc, e) => acc + (e.val * e.weight), 0);
    overallScore = Math.round(weightedSum / totalWeight);
  }

  const statusText = overallScore !== null
    ? (overallScore >= 80 ? 'HEALTHY' : overallScore >= 55 ? 'NEEDS ATTENTION' : 'AT RISK')
    : 'NOT MEASURED';

  // Section 82: The Most Important Principle
  // "We found X issues. Y require immediate attention, Z can affect leads/search visibility, and W are optimization opportunities."
  const summaryNarrative = `Inspection identified ${uniqueFindings.length} verified checks. ${criticalFindings.length} require immediate remediation to prevent lead leakage, ${warningFindings.length} affect conversion consistency or search visibility, and ${passFindings.length} passed technical standards.`;

  // Revenue Impact callout (Section 78)
  let revenueImpact = {
    title: 'TECHNICAL INTEGRITY AUDIT',
    description: summaryNarrative
  };

  if (criticalFindings.length > 0) {
    revenueImpact = {
      title: 'LEAD & REVENUE LEAKAGE DETECTED',
      description: `${criticalFindings[0].headline}: ${criticalFindings[0].businessImpact}`
    };
  } else if (warningFindings.length > 0) {
    revenueImpact = {
      title: 'CONVERSION FRICTION IDENTIFIED',
      description: `${warningFindings[0].headline}: ${warningFindings[0].businessImpact}`
    };
  }

  // Access Level Matrix (Section 80 of webarge.txt)
  const accessLevelMatrix = [
    {
      surface: 'Public Website & DOM',
      accessRequired: 'None (Public URL)',
      status: 'Audited Live',
      coverage: 'Frontend performance, mobile layout shifts, click-to-call, SEO crawlability, public DNS/SSL, security headers, tracking scripts.'
    },
    {
      surface: 'CMS Admin & Plugins',
      accessRequired: 'WordPress / Shopify / Webflow Login',
      status: 'Requires Manual Playbook',
      coverage: 'Plugin vulnerabilities, theme bloat, database overhead, auto-update health, user privilege audit.'
    },
    {
      surface: 'CRM & GoHighLevel Automations',
      accessRequired: 'GHL / ActiveCampaign Account Access',
      status: 'Requires Manual Playbook',
      coverage: 'Workflow triggers, SMS/Email autoresponders, webhook delivery, pipeline tag integrity, UTM attribution.'
    },
    {
      surface: 'Physical Mobile Devices & Carriers',
      accessRequired: 'Real iPhone / Android Hardware',
      status: 'Requires Manual Playbook',
      coverage: 'Real carrier click-to-call dialers, Safari iOS keyboard viewport clipping, WhatsApp native handoff, mobile touch gesture conflicts.'
    },
    {
      surface: 'Payment Gateways & Checkout Sandboxes',
      accessRequired: 'Stripe / PayPal / E-commerce Admin',
      status: 'Requires Manual Playbook',
      coverage: 'End-to-end sandbox purchase, webhook reconciliation, 3D Secure triggers, cart abandonment sequences.'
    },
    {
      surface: 'Screen Readers & Assistive Accessibility',
      accessRequired: 'NVDA / VoiceOver Assistive Software',
      status: 'Requires Manual Playbook',
      coverage: 'Full manual keyboard focus traps, screen reader audio fidelity, cognitive readability, aria-live dynamic region announcements.'
    },
    {
      surface: 'Server, Hosting & PHP Logs',
      accessRequired: 'Hosting / cPanel / Cloud Console Access',
      status: 'Requires Manual Playbook',
      coverage: 'PHP error logs, slow database queries, disk I/O bottlenecks, off-site backup restoration drills.'
    }
  ];

  // Extract business identity from Schema.org NAP, OpenGraph, or Title (Section 11a)
  let businessName = null;
  if (schemaData?.napConsistency?.schemaName) {
    businessName = String(schemaData.napConsistency.schemaName).trim();
  } else if (cheerioData?.socialGraph?.ogSiteName) {
    businessName = String(cheerioData.socialGraph.ogSiteName).trim();
  } else if (cheerioData?.title) {
    const rawTitle = cheerioData.title.trim();
    const segments = rawTitle.split(/[|\-–—:•]/);
    if (segments.length > 1) {
      const first = segments[0].trim();
      const last = segments[segments.length - 1].trim();
      businessName = (first.length >= 3 && first.length <= 35) ? first : ((last.length >= 3 && last.length <= 35) ? last : first);
    } else {
      businessName = rawTitle.slice(0, 40);
    }
  }

  if (!businessName) {
    try {
      const host = new URL(url).hostname.replace(/^www\./, '');
      businessName = host.charAt(0).toUpperCase() + host.slice(1);
    } catch {
      businessName = 'Client Website';
    }
  }

  // 5 Customer Journeys (Section 71 of Webarg Playbook)
  // Reconciled: Journeys A & B rely on indirect heuristics (confidence: 'inferred'),
  // while C, D, & E reflect directly verified technical/DOM signals (confidence: 'measured').
  const customerJourneys = [
    {
      id: 'journey-a',
      name: 'Journey A — New Visitor',
      flow: 'Search → Homepage → 5-Second Clarity → Primary CTA',
      status: criticalFindings.some(f => f.category.includes('SEO') || f.headline.includes('Hero')) ? 'warning' : 'pass',
      confidence: 'inferred',
      notes: 'Indirect proxy: Evaluates value proposition clarity and whether visitor finds primary CTA without friction.'
    },
    {
      id: 'journey-b',
      name: 'Journey B — Inquiring Lead',
      flow: 'Homepage → Contact Form / Phone → Submission → Notification',
      status: (conversionData?.contactChannels?.forms?.count === 0 && !conversionData?.contactChannels?.phone?.count) ? 'critical' : (criticalFindings.some(f => f.category.includes('Conversion')) ? 'critical' : (warningFindings.some(f => f.category.includes('Conversion')) ? 'warning' : 'pass')),
      confidence: 'inferred',
      notes: 'Indirect proxy: Tests whether contact channel elements exist in the DOM (actual message receipt requires manual audit).'
    },
    {
      id: 'journey-c',
      name: 'Journey C — Mobile Customer',
      flow: '320px Mobile Screen → Touch CTA → Dial / Chat Conversion',
      status: (conversionData?.contactChannels?.phone?.unlinkedInBody || criticalFindings.some(f => f.category.includes('Mobile'))) ? 'critical' : 'pass',
      confidence: 'measured',
      notes: 'Directly measured: Verifies tap-to-call tel: links and mobile viewport layout at compact 320px.'
    },
    {
      id: 'journey-d',
      name: 'Journey D — Returning User',
      flow: 'Direct URL → Cached State → Fast Navigation',
      status: (scores?.performance !== null && scores?.performance < 60) ? 'warning' : 'pass',
      confidence: 'measured',
      notes: 'Directly measured: Validates browser caching headers, compression, and Lighthouse performance scores.'
    },
    {
      id: 'journey-e',
      name: 'Journey E — Failure Recovery',
      flow: 'Input Error / Non-existent Route → Helpful Guidance → Retry',
      status: check404Data?.isReal404 === false ? 'warning' : 'pass',
      confidence: 'measured',
      notes: 'Directly measured: Checks authentic HTTP 404 status response on non-existent test routes.'
    }
  ];

  return {
    id: reportId,
    targetUrl: url,
    businessName,
    mode: scanMode,
    timestamp: scanDate,
    overallScore,
    overallStatus: statusText,
    scores: {
      overall: overallScore,
      performance: typeof scores?.performance === 'number' ? scores.performance : null,
      seo: typeof scores?.seo === 'number' ? scores.seo : null,
      accessibility: typeof scores?.accessibility === 'number' ? scores.accessibility : null,
      conversion: Math.max(20, Math.round(100 - (criticalFindings.length * 15 + warningFindings.length * 5))),
      security: typeof scores?.security === 'number' ? scores.security : null
    },
    scoreTypes: {
      overall: 'aggregate',
      performance: 'measured',
      seo: 'measured',
      accessibility: 'measured',
      security: 'measured',
      conversion: 'derived_heuristic'
    },
    summary: {
      total: uniqueFindings.length,
      critical: criticalFindings.length,
      warning: warningFindings.length,
      pass: passFindings.length,
      narrative: summaryNarrative
    },
    // Only return metrics if actually measured from Lighthouse; never substitute plausible invented numbers
    metrics: metrics ? {
      ttfb: metrics.ttfb ?? null,
      lcp: metrics.lcp ?? null,
      cls: metrics.cls ?? null,
      tbt: metrics.tbt ?? null,
      pageSize: metrics.pageSize ?? null
    } : null,
    revenueImpact,
    techStack: techStack || [],
    conversionJourney: conversionData?.contactChannels || {},
    customerJourneys,
    trustSignals: conversionData?.trustSignals || {},
    assetPipeline: assetData || {},
    findings: uniqueFindings,
    accessLevelMatrix,
    details: {
      dns: dnsData,
      ssl: sslData,
      redirects: redirectData,
      accuracy404: check404Data,
      robotsAndSitemap: robotsSitemapData,
      structuredData: schemaData,
      socialGraph: cheerioData?.socialGraph,
      thirdPartyScripts: cheerioData?.thirdPartyDomains || [],
      cookieConsent: cheerioData?.cookieBannerDetected,
      mixedContentCount: cheerioData?.mixedContentCount || 0,
      consoleErrors: browserlessData?.consoleErrors || [],
      pageErrors: browserlessData?.pageErrors || [],
      failedRequests: browserlessData?.failedRequests || []
    },
    remediationPriorities: uniqueFindings
      .filter((f) => f.severity === 'critical' || f.severity === 'warning')
      .slice(0, 6)
      .map((f, idx) => ({
        rank: idx + 1,
        title: f.headline,
        action: f.recommendation,
        effort: f.effort,
        priority: f.severity === 'critical' ? 'Priority 1 (Fix immediately)' : 'Priority 2 (Scheduled sprint)'
      }))
  };
}
