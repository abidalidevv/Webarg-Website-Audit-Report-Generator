import puppeteer from 'puppeteer-core';
import { sanitizeConsoleLogs } from './logSanitizer.js';

/**
 * Runs headless browser audit via hosted Browserless.io or Browserbase.
 * Captures console.error, uncaught pageerror exceptions, and rendered DOM.
 *
 * @param {string} targetUrl
 * @param {object} options
 * @returns {Promise<{ consoleErrors: Array, pageErrors: Array, failedRequests: Array, renderedHtml: string, axeResults: object, issues: Array }>}
 */
export async function runBrowserlessScan(targetUrl, options = {}) {
  const token = process.env.BROWSERLESS_API_KEY || '';
  const baseWs = process.env.BROWSERLESS_WS_ENDPOINT || 'wss://chrome.browserless.io';
  const issues = [];
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  let renderedHtml = '';
  let axeResults = null;

  if (!token) {
    // If no Browserless key is configured yet, fall back gracefully to direct fetch
    // without crashing the server.
    try {
      const res = await fetch(targetUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Webarg/1.0' },
        signal: AbortSignal.timeout(15000)
      });
      renderedHtml = await res.text();
    } catch {}

    return {
      consoleErrors: [],
      pageErrors: [],
      failedRequests: [],
      renderedHtml,
      axeResults: null,
      headlessUsed: false,
      notice: 'Browserless.io API key not configured. Add BROWSERLESS_API_KEY to server/.env to capture live browser console errors.',
      issues
    };
  }

  // Build WebSocket endpoint, optionally pinning the validated IP to prevent DNS rebinding (TOCTOU)
  let endpointUrl = `${baseWs}?token=${token}`;
  if (options.pinnedIp && options.hostname) {
    endpointUrl += `&--host-resolver-rules=MAP ${options.hostname} ${options.pinnedIp}`;
  }

  const browserWSEndpoint = endpointUrl;
  let browser = null;

  try {
    browser = await puppeteer.connect({
      browserWSEndpoint,
      defaultViewport: { width: 1280, height: 800 }
    });

    const page = await browser.newPage();

    // 1. Capture console events
    page.on('console', (msg) => {
      const type = msg.type();
      if (type === 'error' || type === 'warn') {
        const location = msg.location();
        consoleErrors.push({
          severity: type === 'error' ? 'Critical' : 'Warning',
          type,
          message: msg.text(),
          file: location ? location.url : '',
          line: location ? location.lineNumber : null,
          time: new Date().toISOString()
        });
      }
    });

    // 2. Capture uncaught JavaScript exceptions
    page.on('pageerror', (err) => {
      pageErrors.push({
        severity: 'Critical',
        title: 'Uncaught JavaScript Exception',
        message: err.message,
        stack: err.stack ? err.stack.slice(0, 300) : '',
        time: new Date().toISOString()
      });
    });

    // 3. Capture failed network requests (4xx / 5xx / failed)
    page.on('requestfailed', (req) => {
      failedRequests.push({
        url: req.url(),
        method: req.method(),
        failure: req.failure() ? req.failure().errorText : 'Network failure',
        resourceType: req.resourceType()
      });
    });

    await page.goto(targetUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    renderedHtml = await page.content();

    // 3b. Browser Storage & Sensitive Token Audit (Section 41)
    try {
      const storageAudit = await page.evaluate(() => {
        try {
          const localKeys = Object.keys(localStorage || {});
          const sessionKeys = Object.keys(sessionStorage || {});
          const sensitivePattern = /(jwt|token|apikey|api_key|password|secret|auth|bearer|credential)/i;
          const flaggedLocal = localKeys.filter((k) => sensitivePattern.test(k));
          const flaggedSession = sessionKeys.filter((k) => sensitivePattern.test(k));
          return {
            totalKeys: localKeys.length + sessionKeys.length,
            flagged: [...new Set([...flaggedLocal, ...flaggedSession])]
          };
        } catch {
          return null;
        }
      });

      if (storageAudit && storageAudit.flagged.length > 0) {
        issues.push({
          category: 'Security / Storage',
          severity: 'Warning',
          title: 'Sensitive token keys detected in client browser storage',
          evidence: `Client storage contains keys matching authentication patterns: ${storageAudit.flagged.join(', ')}`,
          userImpact: 'Client-side scripts (including compromised third-party trackers) can read these tokens.',
          businessImpact: 'Risk of credential leakage or session hijacking via Cross-Site Scripting (XSS).',
          recommendation: 'Store sensitive session tokens in HttpOnly, Secure cookies rather than accessible LocalStorage.'
        });
      }
    } catch {}

    // 4. If deep scan, run axe-core accessibility check in page context
    if (options.runAxe) {
      try {
        await page.addScriptTag({
          url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js'
        });

        axeResults = await page.evaluate(async () => {
          if (window.axe) {
            return await window.axe.run();
          }
          return null;
        });
      } catch {}
    }

    await page.close();
  } catch (err) {
    issues.push({
      category: 'Headless Browser',
      severity: 'Warning',
      title: 'Headless browser inspection notice',
      evidence: err.message,
      recommendation: 'Verify target site is publicly accessible and Browserless endpoint is valid.'
    });
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {}
    }
  }

  // Sanitize all captured logs
  const sanitizedConsole = sanitizeConsoleLogs(consoleErrors);
  const sanitizedPageErrors = sanitizeConsoleLogs(pageErrors);

  // Map critical errors to findings
  sanitizedPageErrors.forEach((pe) => {
    issues.push({
      category: 'Console / JavaScript',
      severity: 'Critical',
      title: 'Uncaught JavaScript Runtime Error',
      evidence: pe.message,
      file: pe.stack || 'Browser Runtime',
      recommendation: 'Fix uncaught exception to prevent broken interactions and UI crashes.'
    });
  });

  sanitizedConsole.filter((c) => c.severity === 'Critical').slice(0, 5).forEach((ce) => {
    issues.push({
      category: 'Console / JavaScript',
      severity: 'Critical',
      title: `Console Error: ${ce.message.slice(0, 60)}`,
      evidence: ce.message,
      file: ce.file ? `${ce.file}:${ce.line || 0}` : 'Unknown source',
      recommendation: 'Debug and resolve JavaScript console error.'
    });
  });

  return {
    consoleErrors: sanitizedConsole,
    pageErrors: sanitizedPageErrors,
    failedRequests: failedRequests.slice(0, 10),
    renderedHtml,
    axeResults,
    headlessUsed: Boolean(browser),
    issues
  };
}
