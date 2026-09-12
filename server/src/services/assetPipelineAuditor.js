import * as cheerio from 'cheerio';

/**
 * Asset Pipeline, Fonts, Caching, and HTML Semantics Auditor
 * Based on Sections 21, 24, 25, 26, 27, 28, 34 of webarge.txt
 *
 * @param {string} html
 * @param {Headers} headers
 * @returns {object}
 */
export function auditAssetPipeline(html = '', headers = null) {
  const $ = cheerio.load(html);
  const issues = [];

  // 1. HTML Semantics & Quality (Section 21)
  const hasDoctype = /<!doctype html>/i.test(html.slice(0, 100));
  const htmlLang = $('html').attr('lang');
  const hasCharset = $('meta[charset="utf-8" i], meta[charset="utf8" i]').length > 0;

  if (!htmlLang) {
    issues.push({
      category: 'Accessibility & Semantics',
      severity: 'Warning',
      title: 'Missing <html lang> attribute',
      evidence: 'Root <html> tag lacks language definition.',
      userImpact: 'Screen readers cannot pronounce words with correct pronunciation rules.',
      businessImpact: 'Accessibility non-compliance; lower search relevance in target regions.',
      recommendation: 'Specify appropriate primary language (e.g. <html lang="en">).',
      effort: 'Low'
    });
  }

  if (!hasCharset) {
    issues.push({
      category: 'Accessibility & Semantics',
      severity: 'Low',
      title: 'Missing UTF-8 character encoding declaration',
      evidence: '<meta charset="utf-8"> was not found in document <head>.',
      userImpact: 'Special characters, currency symbols or accents can display as broken glyphs.',
      businessImpact: 'Unprofessional appearance on certain browser locales.',
      recommendation: 'Add <meta charset="utf-8"> within the first 1024 bytes of the <head>.',
      effort: 'Low'
    });
  }

  // 2. Image Pipeline (Section 25)
  let totalImages = 0;
  let nonModernFormatCount = 0;
  let missingLazyCount = 0;

  $('img').each((idx, el) => {
    totalImages++;
    const src = ($(el).attr('src') || '').toLowerCase();
    const loading = $(el).attr('loading');

    // Flag old png/jpg images if not using modern WebP/AVIF
    if (src.endsWith('.png') || src.endsWith('.jpg') || src.endsWith('.jpeg')) {
      nonModernFormatCount++;
    }

    // After above-the-fold hero images (first 2), check lazy loading
    if (idx > 2 && loading !== 'lazy') {
      missingLazyCount++;
    }
  });

  if (nonModernFormatCount > 3) {
    issues.push({
      category: 'Asset Pipeline',
      severity: 'Warning',
      title: 'Legacy image formats used instead of WebP/AVIF',
      evidence: `${nonModernFormatCount} images served as uncompressed PNG/JPEG assets.`,
      userImpact: 'High mobile data consumption; sluggish page load times on cell connections.',
      businessImpact: 'Slower TTFB/LCP scores lead to higher visitor abandonment.',
      recommendation: 'Convert static imagery to WebP or AVIF for 30–50% payload reduction.',
      effort: 'Medium'
    });
  }

  if (missingLazyCount > 3) {
    issues.push({
      category: 'Asset Pipeline',
      severity: 'Low',
      title: 'Below-the-fold images missing loading="lazy"',
      evidence: `${missingLazyCount} images load eagerly during initial page load.`,
      userImpact: 'Bandwidth competition delays rendering of primary hero content.',
      businessImpact: 'Degrades mobile Core Web Vitals (LCP/Speed Index).',
      recommendation: 'Add loading="lazy" and decoding="async" to all non-critical images.',
      effort: 'Low'
    });
  }

  // 3. Font Optimization (Section 26)
  const fontLinks = [];
  let fontPreconnectFound = false;
  let fontDisplaySwapFound = false;

  $('link').each((_, el) => {
    const href = $(el).attr('href') || '';
    const rel = $(el).attr('rel') || '';

    if (rel === 'preconnect' && (href.includes('fonts.googleapis.com') || href.includes('fonts.gstatic.com'))) {
      fontPreconnectFound = true;
    }

    if (href.includes('fonts.googleapis.com')) {
      fontLinks.push(href);
      if (href.includes('display=swap')) {
        fontDisplaySwapFound = true;
      }
    }
  });

  if (fontLinks.length > 0) {
    if (!fontPreconnectFound) {
      issues.push({
        category: 'Asset Pipeline',
        severity: 'Low',
        title: 'Missing preconnect for Google Fonts',
        evidence: 'Google Fonts requested without <link rel="preconnect" href="https://fonts.gstatic.com">.',
        userImpact: 'Adds an extra round-trip DNS & TLS handshake delay before font rendering.',
        businessImpact: 'Unnecessary latency delaying First Contentful Paint (FCP).',
        recommendation: 'Add preconnect hints for fonts.googleapis.com and fonts.gstatic.com.',
        effort: 'Low'
      });
    }

    if (!fontDisplaySwapFound) {
      issues.push({
        category: 'Asset Pipeline',
        severity: 'Warning',
        title: 'Google Fonts missing display=swap parameter',
        evidence: 'Web fonts loaded without display=swap.',
        userImpact: 'Text remains invisible (FOIT - Flash of Invisible Text) while fonts download.',
        businessImpact: 'Harms conversion when visitors stare at blank blocks for 1–2 seconds.',
        recommendation: 'Append &display=swap to all Google Font stylesheet URLs.',
        effort: 'Low'
      });
    }
  }

  // 4. Compression & Transfer (Section 28)
  const contentEncoding = (headers?.get('content-encoding') || '').toLowerCase();
  const hasCompression = contentEncoding.includes('gzip') || contentEncoding.includes('br');

  if (!hasCompression && headers) {
    issues.push({
      category: 'Network & Infrastructure',
      severity: 'Critical',
      title: 'Server compression disabled (No Gzip / Brotli)',
      evidence: 'Response lacks "Content-Encoding: gzip" or "br" header.',
      userImpact: 'HTML and text payloads transferred uncompressed at 4x to 6x normal weight.',
      businessImpact: 'Severely slows down initial page load and drives up hosting egress bandwidth.',
      recommendation: 'Enable Brotli or Gzip compression in Nginx/Apache/Cloudflare configuration.',
      effort: 'Low'
    });
  }

  // 5. Caching Architecture (Section 27)
  const cacheControl = (headers?.get('cache-control') || '').toLowerCase();
  const etag = headers?.get('etag');

  return {
    semantics: {
      hasDoctype,
      htmlLang: htmlLang || null,
      hasCharset
    },
    images: {
      total: totalImages,
      nonModernFormatCount,
      missingLazyCount
    },
    fonts: {
      count: fontLinks.length,
      hasPreconnect: fontPreconnectFound,
      hasDisplaySwap: fontDisplaySwapFound
    },
    compression: {
      enabled: hasCompression,
      encoding: contentEncoding || 'none'
    },
    caching: {
      cacheControl: cacheControl || 'none',
      hasEtag: Boolean(etag)
    },
    issues
  };
}
