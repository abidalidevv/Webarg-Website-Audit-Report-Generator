import * as cheerio from 'cheerio';

/**
 * Analyzes static HTML using Cheerio to extract SEO, DOM quality, contact links,
 * social graph, and third-party script inventories.
 *
 * @param {string} html
 * @param {string} baseUrl
 * @returns {object}
 */
export function analyzeHtml(html, baseUrl) {
  const issues = [];
  const $ = cheerio.load(html);
  const targetHost = new URL(baseUrl).hostname;
  const isHttps = baseUrl.startsWith('https://');

  // 1. Title Tag
  const title = $('title').first().text().trim();
  if (!title) {
    issues.push({
      category: 'SEO',
      severity: 'Warning',
      title: 'Missing <title> tag',
      evidence: 'No <title> element found in document head',
      recommendation: 'Add a concise, descriptive <title> tag (50–60 characters).'
    });
  } else if (title.length > 70) {
    issues.push({
      category: 'SEO',
      severity: 'Low',
      title: 'Lengthy <title> tag',
      evidence: `Title is ${title.length} characters: "${title.slice(0, 50)}..."`,
      recommendation: 'Keep title under 60 characters to prevent truncation in search snippets.'
    });
  }

  // 2. Meta Description
  const metaDescription = $('meta[name="description" i]').attr('content') || '';
  if (!metaDescription.trim()) {
    issues.push({
      category: 'SEO',
      severity: 'Warning',
      title: 'Missing meta description',
      evidence: '<meta name="description"> tag is absent',
      recommendation: 'Add an intent-focused meta description between 120–160 characters.'
    });
  }

  // 3. Headings (H1)
  const h1Elements = $('h1');
  const h1Count = h1Elements.length;
  if (h1Count === 0) {
    issues.push({
      category: 'SEO / Structure',
      severity: 'Warning',
      title: 'Missing <h1> heading',
      evidence: 'Page does not contain an <h1> tag',
      recommendation: 'Add a single primary <h1> element representing the main topic.'
    });
  } else if (h1Count > 1) {
    issues.push({
      category: 'SEO / Structure',
      severity: 'Warning',
      title: 'Duplicate <h1> headings',
      evidence: `${h1Count} separate <h1> tags found`,
      recommendation: 'Consolidate to one primary <h1> and use <h2>/<h3> for sub-sections.'
    });
  }

  // 4. Canonical Link
  const canonical = $('link[rel="canonical" i]').attr('href') || null;
  if (!canonical) {
    issues.push({
      category: 'SEO',
      severity: 'Low',
      title: 'Missing canonical URL',
      evidence: '<link rel="canonical"> tag is absent',
      recommendation: 'Specify a self-referencing canonical tag to prevent duplicate content indexing.'
    });
  }

  // 4b. Favicon Check (Section 11)
  const favicon = $('link[rel*="icon" i]').attr('href') || null;
  if (!favicon) {
    issues.push({
      category: 'HTML / Assets',
      severity: 'Low',
      title: 'Missing favicon declaration',
      evidence: '<link rel="icon"> or shortcut icon is not declared in <head>',
      recommendation: 'Add a standard favicon link (<link rel="icon" href="/favicon.ico">) for browser tab identity and mobile bookmarks.'
    });
  }

  // 5. Open Graph & Social Cards
  const ogTitle = $('meta[property="og:title" i]').attr('content') || null;
  const ogImage = $('meta[property="og:image" i]').attr('content') || null;
  const ogDescription = $('meta[property="og:description" i]').attr('content') || null;
  const twitterCard = $('meta[name="twitter:card" i]').attr('content') || null;

  if (!ogTitle || !ogImage) {
    issues.push({
      category: 'SEO / Social',
      severity: 'Low',
      title: 'Incomplete Open Graph tags',
      evidence: `og:title=${Boolean(ogTitle)}, og:image=${Boolean(ogImage)}`,
      recommendation: 'Add og:title, og:description, and og:image to ensure rich previews when shared on WhatsApp/social media.'
    });
  }

  // 6. Image Audits (Alt text, dimensions, mixed content)
  const images = [];
  let missingAltCount = 0;
  let missingDimensionsCount = 0;
  let mixedContentImages = 0;

  $('img').each((_, el) => {
    const src = $(el).attr('src') || '';
    const alt = $(el).attr('alt');
    const width = $(el).attr('width');
    const height = $(el).attr('height');

    if (alt === undefined || alt === null) {
      missingAltCount++;
    }

    if (!width || !height) {
      missingDimensionsCount++;
    }

    if (isHttps && src.startsWith('http://')) {
      mixedContentImages++;
    }

    images.push({ src, alt: alt || null, width: width || null, height: height || null });
  });

  if (missingAltCount > 0) {
    issues.push({
      category: 'Accessibility',
      severity: 'Warning',
      title: 'Images missing alt text',
      evidence: `${missingAltCount} of ${images.length} images have no alt attribute`,
      recommendation: 'Add descriptive alt text for informative images or alt="" for decorative graphics.'
    });
  }

  if (missingDimensionsCount > 0) {
    issues.push({
      category: 'Performance',
      severity: 'Low',
      title: 'Images without explicit width/height',
      evidence: `${missingDimensionsCount} images lack width and height attributes (CLS risk)`,
      recommendation: 'Include explicit width and height dimensions to prevent cumulative layout shifts.'
    });
  }

  // 7. Contact Link Verification (tel:, mailto:, wa.me)
  const contactLinks = {
    tel: [],
    mailto: [],
    whatsapp: []
  };

  $('a').each((_, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().trim();

    if (href.startsWith('tel:')) {
      const rawNum = href.replace('tel:', '').trim();
      const isValid = /^\+?[0-9\s\-()\.]{7,20}$/.test(rawNum);
      contactLinks.tel.push({ href, text, isValid });
    } else if (href.startsWith('mailto:')) {
      const rawMail = href.replace('mailto:', '').split('?')[0].trim();
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawMail);
      contactLinks.mailto.push({ href, text, isValid });
    } else if (href.includes('wa.me') || href.includes('api.whatsapp.com') || href.includes('whatsapp.com/send')) {
      contactLinks.whatsapp.push({ href, text, isValid: true });
    }
  });

  // Check for invalid contact links
  contactLinks.tel.forEach((t) => {
    if (!t.isValid) {
      issues.push({
        category: 'Conversion / Contacts',
        severity: 'Critical',
        title: 'Malformed click-to-call link',
        evidence: `Link "${t.href}" contains an invalid phone syntax`,
        recommendation: 'Use clean international formatting (e.g. tel:+15551234567).'
      });
    }
  });

  contactLinks.mailto.forEach((m) => {
    if (!m.isValid) {
      issues.push({
        category: 'Conversion / Contacts',
        severity: 'Warning',
        title: 'Malformed mailto: link',
        evidence: `Link "${m.href}" is not a valid email address`,
        recommendation: 'Ensure mailto: targets a valid recipient address.'
      });
    }
  });

  // Check body text for unlinked phone numbers (e.g. +1-800-xxx rendered as plain text)
  const bodyText = $('body').text();
  const rawPhoneMatches = bodyText.match(/(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})/g) || [];
  if (rawPhoneMatches.length > 0 && contactLinks.tel.length === 0) {
    issues.push({
      category: 'Conversion / Mobile',
      severity: 'Warning',
      title: 'Phone number found as plain unclickable text',
      evidence: `Phone detected in body text (${rawPhoneMatches[0]}) but no tel: links exist in DOM`,
      recommendation: 'Wrap visible phone numbers in <a href="tel:..."> so mobile visitors can tap to call.'
    });
  }

  // 8. Third-Party Script Domains & Mixed Content Scripts
  const thirdPartyDomains = new Set();
  let mixedContentScripts = 0;

  $('script').each((_, el) => {
    const src = $(el).attr('src');
    if (src) {
      if (isHttps && src.startsWith('http://')) {
        mixedContentScripts++;
      }
      try {
        const scriptUrl = new URL(src, baseUrl);
        if (scriptUrl.hostname !== targetHost && !scriptUrl.hostname.endsWith('.' + targetHost)) {
          thirdPartyDomains.add(scriptUrl.hostname);
        }
      } catch {}
    }
  });

  const totalMixed = mixedContentImages + mixedContentScripts;
  if (totalMixed > 0) {
    issues.push({
      category: 'Security',
      severity: 'Critical',
      title: 'Mixed content detected',
      evidence: `${totalMixed} insecure HTTP assets requested on HTTPS page (${mixedContentScripts} scripts, ${mixedContentImages} images)`,
      recommendation: 'Update all asset URLs to use https:// to prevent browser blocking and MITM risks.'
    });
  }

  // 9. Cookie-Consent Banner Heuristic
  const cookieBannerDetected = Boolean(
    $('[id*="cookie" i], [class*="cookie" i], [id*="consent" i], [class*="consent" i], [id*="onetrust" i], [class*="cookiebot" i], [id*="termly" i]').length > 0
  );

  // 10. JS-Disabled Content & Crawlability Check
  const rawBodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const hasSpaContainer = $('#root, #app, #__next, #___gatsby, div[data-reactroot]').length > 0;

  if (hasSpaContainer && rawBodyText.length < 150) {
    issues.push({
      category: 'SEO / JavaScript',
      severity: 'Warning',
      title: 'Empty initial HTML (JS-disabled crawlability risk)',
      evidence: `Initial server HTML contains only ${rawBodyText.length} text characters inside SPA container.`,
      recommendation: 'Implement Server-Side Rendering (SSR) or static pre-rendering so search bots and non-JS clients can index critical content and navigation.'
    });
  }

  return {
    title,
    metaDescription,
    h1Count,
    canonical,
    socialGraph: {
      ogTitle,
      ogImage,
      ogDescription,
      twitterCard
    },
    imagesCount: images.length,
    missingAltCount,
    contactLinks,
    thirdPartyDomains: [...thirdPartyDomains],
    mixedContentCount: totalMixed,
    cookieBannerDetected,
    issues
  };
}
