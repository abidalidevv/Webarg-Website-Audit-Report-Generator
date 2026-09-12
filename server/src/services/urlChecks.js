/**
 * Traces redirect hops and detects redirect loops.
 *
 * @param {string} initialUrl
 * @returns {Promise<{ hops: Array<{ url: string, status: number, location: string }>, finalUrl: string, loopDetected: boolean, issues: Array }>}
 */
export async function traceRedirects(initialUrl) {
  const hops = [];
  const visited = new Set();
  let currentUrl = initialUrl;
  let loopDetected = false;
  const issues = [];

  for (let i = 0; i < 10; i++) {
    if (visited.has(currentUrl)) {
      loopDetected = true;
      issues.push({
        category: 'SEO / Architecture',
        severity: 'Critical',
        title: 'Redirect loop detected',
        evidence: `Loop reached: ${currentUrl}`,
        recommendation: 'Fix web server redirect rules to prevent infinite redirect cycles.'
      });
      break;
    }
    visited.add(currentUrl);

    try {
      const response = await fetch(currentUrl, {
        method: 'GET',
        redirect: 'manual',
        headers: { 'User-Agent': 'WebargBot/1.0 (+https://webarg.io)' },
        signal: AbortSignal.timeout(6000)
      });

      const status = response.status;
      const location = response.headers.get('location');

      hops.push({ url: currentUrl, status, location: location || null });

      if (status >= 300 && status < 400 && location) {
        currentUrl = new URL(location, currentUrl).href;
      } else {
        break;
      }
    } catch (err) {
      hops.push({ url: currentUrl, status: 0, error: err.message });
      break;
    }
  }

  if (hops.length > 3) {
    issues.push({
      category: 'SEO / Performance',
      severity: 'Warning',
      title: 'Excessive redirect chain',
      evidence: `${hops.length} redirect hops before landing on destination`,
      recommendation: 'Shorten redirect chain to a single 301 hop to conserve crawl budget and reduce latency.'
    });
  }

  return {
    hops,
    finalUrl: currentUrl,
    loopDetected,
    issues
  };
}

/**
 * Checks whether the server returns a genuine 404 status for invalid URLs.
 *
 * @param {string} origin
 * @returns {Promise<{ status: number, isAccurate: boolean, issues: Array }>}
 */
export async function check404Accuracy(origin) {
  const testPath = `/webarg-probe-404-${Date.now()}`;
  const testUrl = new URL(testPath, origin).href;
  const issues = [];
  let status = 0;
  let isAccurate = false;

  try {
    const res = await fetch(testUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'WebargBot/1.0' },
      signal: AbortSignal.timeout(6000)
    });
    status = res.status;
    isAccurate = status === 404;

    if (status === 200) {
      issues.push({
        category: 'SEO / Architecture',
        severity: 'Warning',
        title: 'Soft 404 detected',
        evidence: `Request to non-existent route ${testPath} returned HTTP 200 OK instead of 404 Not Found`,
        recommendation: 'Configure your web server/framework to return a true HTTP 404 status code for missing resources.'
      });
    }
  } catch (err) {
    status = 0;
  }

  return {
    status,
    isAccurate,
    issues
  };
}

/**
 * Checks for the presence and basic validity of robots.txt and sitemap.xml.
 *
 * @param {string} origin
 * @returns {Promise<{ robots: object, sitemap: object, issues: Array }>}
 */
export async function checkRobotsAndSitemap(origin) {
  const issues = [];
  const robots = { present: false, status: 0 };
  const sitemap = { present: false, status: 0 };

  // robots.txt
  try {
    const rRes = await fetch(new URL('/robots.txt', origin).href, {
      method: 'GET',
      headers: { 'User-Agent': 'WebargBot/1.0' },
      signal: AbortSignal.timeout(5000)
    });
    robots.status = rRes.status;
    if (rRes.status === 200) {
      const text = await rRes.text();
      robots.present = /User-agent:/i.test(text);
    }
  } catch {}

  if (!robots.present) {
    issues.push({
      category: 'SEO',
      severity: 'Warning',
      title: 'Missing or invalid robots.txt',
      evidence: `/robots.txt returned status ${robots.status}`,
      recommendation: 'Add a valid robots.txt file to guide search engine crawlers.'
    });
  }

  // sitemap.xml
  try {
    const sRes = await fetch(new URL('/sitemap.xml', origin).href, {
      method: 'GET',
      headers: { 'User-Agent': 'WebargBot/1.0' },
      signal: AbortSignal.timeout(5000)
    });
    sitemap.status = sRes.status;
    if (sRes.status === 200) {
      const text = await sRes.text();
      sitemap.present = text.includes('<urlset') || text.includes('<sitemapindex');
    }
  } catch {}

  if (!sitemap.present) {
    issues.push({
      category: 'SEO',
      severity: 'Warning',
      title: 'Missing or inaccessible XML Sitemap',
      evidence: `/sitemap.xml returned status ${sitemap.status}`,
      recommendation: 'Generate an XML sitemap and reference it in robots.txt to assist discovery.'
    });
  }

  return {
    robots,
    sitemap,
    issues
  };
}

/**
 * Inspects HTTP response headers for defensive security configurations.
 *
 * @param {Headers} headers
 * @returns {{ headers: object, issues: Array }}
 */
export function checkSecurityHeaders(headers) {
  const issues = [];
  const csp = headers.get('content-security-policy');
  const hsts = headers.get('strict-transport-security');
  const xfo = headers.get('x-frame-options');
  const xcto = headers.get('x-content-type-options');
  const server = headers.get('server');
  const poweredBy = headers.get('x-powered-by');

  if (!csp) {
    issues.push({
      category: 'Security',
      severity: 'Critical',
      title: 'Content-Security-Policy absent',
      evidence: 'Content-Security-Policy response header is missing',
      recommendation: 'Implement a Content-Security-Policy to protect against cross-site scripting (XSS) and data injection.'
    });
  }

  if (!hsts) {
    issues.push({
      category: 'Security',
      severity: 'Warning',
      title: 'Missing HSTS header',
      evidence: 'Strict-Transport-Security header is not set',
      recommendation: 'Add Strict-Transport-Security with max-age=31536000 to enforce HTTPS.'
    });
  }

  if (!xfo) {
    issues.push({
      category: 'Security',
      severity: 'Warning',
      title: 'Missing X-Frame-Options',
      evidence: 'X-Frame-Options header missing (clickjacking protection)',
      recommendation: 'Set X-Frame-Options to DENY or SAMEORIGIN.'
    });
  }

  if (!xcto || !xcto.toLowerCase().includes('nosniff')) {
    issues.push({
      category: 'Security',
      severity: 'Warning',
      title: 'Missing X-Content-Type-Options',
      evidence: 'X-Content-Type-Options: nosniff header missing',
      recommendation: 'Set X-Content-Type-Options to "nosniff" to prevent MIME-confusion attacks.'
    });
  }

  if (server) {
    issues.push({
      category: 'Security',
      severity: 'Warning',
      title: 'Server version exposed',
      evidence: `Server header revealed: "${server}"`,
      recommendation: 'Disable or mask the Server header to prevent fingerprinting by automated scanners.'
    });
  }

  if (poweredBy) {
    issues.push({
      category: 'Security',
      severity: 'Warning',
      title: 'Framework banner exposed',
      evidence: `X-Powered-By header revealed: "${poweredBy}"`,
      recommendation: 'Disable X-Powered-By in framework configuration.'
    });
  }

  return {
    headers: {
      csp: Boolean(csp),
      hsts: Boolean(hsts),
      xfo: Boolean(xfo),
      xcto: Boolean(xcto),
      server: server || null,
      poweredBy: poweredBy || null
    },
    issues
  };
}
