import { Router } from 'express';
import { ssrfGuard } from '../middleware/ssrfGuard.js';
import { scanRateLimiter } from '../middleware/rateLimiter.js';
import { checkDns, checkSsl } from '../services/dnsSslChecker.js';
import { traceRedirects, check404Accuracy, checkRobotsAndSitemap, checkSecurityHeaders, checkExposedEndpoints } from '../services/urlChecks.js';
import { analyzeHtml } from '../services/cheerioAnalyzer.js';
import { analyzeSchemaAndIdentity } from '../services/schemaChecker.js';
import { detectPlatform } from '../services/platformDetector.js';
import { auditConversionJourneys } from '../services/conversionAuditor.js';
import { auditAssetPipeline } from '../services/assetPipelineAuditor.js';
import { runBrowserlessScan } from '../services/browserlessScanner.js';
import { runPerformanceAudit } from '../services/lighthouseRunner.js';
import { normalizeReport } from '../utils/reportNormalizer.js';
import { saveReport, findPreviousReportForUrl, calculateScoreDelta } from '../services/reportStorage.js';
import { generateClientNarrative } from '../services/llmExplainer.js';

export const scanRouter = Router();

scanRouter.post('/', scanRateLimiter, ssrfGuard, async (req, res) => {
  const targetUrl = req.targetUrl;
  const parsedUrl = req.parsedTargetUrl;
  const scanMode = (req.body.mode || 'quick').toLowerCase() === 'deep' ? 'deep' : 'quick';
  const timeoutMs = scanMode === 'deep' ? 600000 : 60000; // 10 min vs 60s

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

  try {
    const origin = parsedUrl.origin;
    const hostname = parsedUrl.hostname;

    // 1. Initial Page Fetch & Response Headers
    let initialHtml = '';
    let responseHeaders = new Headers();
    let response = null;

    try {
      response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Webarg/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        signal: abortController.signal
      });
      responseHeaders = response.headers;
      initialHtml = await response.text();
    } catch (err) {
      if (err.name === 'AbortError') {
        clearTimeout(timeoutId);
        return res.status(504).json({ error: `Scan timed out after ${timeoutMs / 1000}s.` });
      }
      clearTimeout(timeoutId);
      return res.status(502).json({ error: `Failed to fetch target URL: ${err.message}` });
    }

    // Detect Cloudflare or Bot Challenge Interstitials
    const isBotChallenge =
      response.status === 403 ||
      response.status === 503 ||
      responseHeaders.get('cf-mitigated') === 'challenge' ||
      /cf-browser-verification|cf_chl_opt|__cf_chl_tk|Just a moment\.\.\.|Attention Required!/i.test(initialHtml);

    const botProtectionIssue = isBotChallenge ? [{
      category: 'Security & Access',
      severity: 'Warning',
      title: 'Bot Protection or Challenge Detected',
      evidence: `Target returned Cloudflare / challenge interstitial signature (${responseHeaders.get('server') || 'WAF'}).`,
      userImpact: 'Automated crawlers, social share bots, and public scanners receive an interstitial challenge instead of target content.',
      businessImpact: 'Third-party integrations and search engine indexing may be impaired. Public scan cannot inspect protected post-challenge DOM without credentials.',
      recommendation: 'Configure Cloudflare WAF bypass rules for legitimate business crawlers, or use Abid\'s credentialed manual inspection service.',
      effort: 'Medium'
    }] : [];

    // 2. Parallel Network & Diagnostic Services
    const [
      dnsData,
      sslData,
      redirectData,
      check404Data,
      robotsSitemapData,
      exposedEndpointsData
    ] = await Promise.all([
      checkDns(hostname),
      parsedUrl.protocol === 'https:' ? checkSsl(hostname) : Promise.resolve({ valid: false, issues: [{ category: 'Security', severity: 'Critical', title: 'Site not using HTTPS', evidence: 'Protocol is http://', recommendation: 'Enforce HTTPS sitewide.' }] }),
      traceRedirects(targetUrl),
      check404Accuracy(origin),
      checkRobotsAndSitemap(origin),
      checkExposedEndpoints(origin)
    ]);

    // 3. Security Headers Analysis
    const secHeadersData = checkSecurityHeaders(responseHeaders);

    // 4. Cheerio HTML & DOM Analysis
    const cheerioData = analyzeHtml(initialHtml, targetUrl);

    // 5. Conversion Journey & Lead Path Audit (webarge.txt Sections 1, 3, 4, 5, 11, 18, 19)
    const conversionData = auditConversionJourneys(initialHtml, targetUrl);

    // 6. Asset Pipeline, Fonts & Caching Audit (webarge.txt Sections 21, 24, 25, 26, 27, 28)
    const assetData = auditAssetPipeline(initialHtml, responseHeaders);

    // 7. Platform & Tech Stack Detection (webarge.txt Section 79)
    const techStack = detectPlatform(initialHtml, responseHeaders, cheerioData.thirdPartyDomains);

    // 8. Schema.org JSON-LD & NAP Comparison
    const schemaData = analyzeSchemaAndIdentity(initialHtml);

    // 9. Headless Browser Live Execution (Browserless.io)
    const browserlessData = await runBrowserlessScan(targetUrl, {
      runAxe: scanMode === 'deep'
    });

    // 10. JS-Disabled Content Degradation Comparison
    let jsComparisonData = {
      staticWordCount: initialHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').length,
      dynamicWordCount: null,
      ratio: null,
      degradationDetected: false
    };

    if (browserlessData.renderedHtml) {
      const dynamicWords = browserlessData.renderedHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').length;
      jsComparisonData.dynamicWordCount = dynamicWords;
      jsComparisonData.ratio = Number((jsComparisonData.staticWordCount / Math.max(1, dynamicWords)).toFixed(2));

      if (jsComparisonData.ratio < 0.25 && dynamicWords > 200) {
        jsComparisonData.degradationDetected = true;
        cheerioData.issues.push({
          category: 'Architecture & SEO',
          severity: 'Warning',
          title: 'Critical content missing without JavaScript',
          evidence: `Static HTML contains only ${jsComparisonData.staticWordCount} words vs ${dynamicWords} words when JavaScript runs`,
          recommendation: 'Implement server-side rendering (SSR) or prerendering for search engine crawler discovery.'
        });
      }
    }

    // 11. Performance & Core Web Vitals Audit
    const perfAudit = await runPerformanceAudit(targetUrl, {
      hasTitle: Boolean(cheerioData.title),
      hasMetaDescription: Boolean(cheerioData.metaDescription),
      hasH1: cheerioData.h1Count > 0,
      duplicateH1: cheerioData.h1Count > 1,
      hasRobots: robotsSitemapData.robots.present,
      hasSitemap: robotsSitemapData.sitemap.present,
      missingAltCount: cheerioData.missingAltCount,
      hasLang: assetData.semantics.htmlLang !== null,
      isSslValid: sslData.valid,
      hasCsp: secHeadersData.headers.csp,
      hasHsts: secHeadersData.headers.hsts,
      hasXfo: secHeadersData.headers.xfo,
      mixedContentCount: cheerioData.mixedContentCount
    });

    // 12. Aggregate all issues across all 72+ domains
    const allIssues = [
      ...conversionData.issues,
      ...secHeadersData.issues,
      ...sslData.issues,
      ...dnsData.issues,
      ...redirectData.issues,
      ...check404Data.issues,
      ...robotsSitemapData.issues,
      ...assetData.issues,
      ...cheerioData.issues,
      ...schemaData.issues,
      ...browserlessData.issues,
      ...perfAudit.issues,
      ...exposedEndpointsData.issues,
      ...botProtectionIssue
    ];

    // 13. Normalize into Comprehensive Webarg JSON Report
    const normalized = normalizeReport({
      url: targetUrl,
      scanMode,
      scores: perfAudit.scores,
      metrics: perfAudit.metrics,
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
    });

    // 14. Check for previous baseline scan on same domain & compute score delta
    try {
      const previousReport = findPreviousReportForUrl(targetUrl, normalized.id);
      if (previousReport) {
        normalized.comparison = calculateScoreDelta(normalized, previousReport);
      }
    } catch (compErr) {
      console.warn('Failed to calculate comparison delta:', compErr);
    }

    // 15. Generate Client Consultation Narrative (Gemini / Groq / Fallback)
    try {
      normalized.consultation = await generateClientNarrative(normalized);
    } catch (narrativeErr) {
      console.warn('Failed to generate narrative:', narrativeErr);
    }

    // 16. Persist to disk for shareable URL & PDF rendering
    try {
      saveReport(normalized);
    } catch (saveErr) {
      console.error('Failed to save report to disk:', saveErr);
    }

    clearTimeout(timeoutId);
    return res.status(200).json(normalized);
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('Scan processing error:', err);
    return res.status(500).json({
      error: 'An internal error occurred while processing the website audit scan.',
      details: err.message
    });
  }
});
