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
  } else {
    try {
      const canonicalUrl = new URL(canonical, baseUrl);
      const targetUrl = new URL(baseUrl);
      if (canonicalUrl.protocol !== targetUrl.protocol) {
        issues.push({
          category: 'SEO',
          severity: 'Warning',
          title: 'Canonical protocol mismatch',
          evidence: `Canonical points to ${canonicalUrl.protocol} while page is served over ${targetUrl.protocol}`,
          recommendation: 'Ensure canonical link matches the secure HTTPS URL scheme.'
        });
      } else if (canonicalUrl.hostname !== targetUrl.hostname) {
        issues.push({
          category: 'SEO',
          severity: 'Warning',
          title: 'Cross-domain canonical tag',
          evidence: `Canonical points to "${canonicalUrl.hostname}" instead of current host "${targetUrl.hostname}"`,
          recommendation: 'Verify cross-domain canonicalization is intentional to avoid dropping page from search index.'
        });
      }
    } catch {}
  }

  // 4a. Hreflang / Multi-language Check (Section 44)
  const hreflangTags = $('link[rel="alternate"][hreflang]');
  if (hreflangTags.length > 0) {
    const hasXDefault = $('link[rel="alternate"][hreflang="x-default" i]').length > 0;
    if (!hasXDefault) {
      issues.push({
        category: 'SEO / Internationalization',
        severity: 'Low',
        title: 'Missing hreflang x-default fallback',
        evidence: `${hreflangTags.length} regional hreflang tags declared, but missing hreflang="x-default" fallback`,
        recommendation: 'Add <link rel="alternate" hreflang="x-default" ...> for unmatched global users.'
      });
    }
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

  // 4c. Mobile Viewport Meta Tag (Mobile / Responsive Audit)
  const viewport = $('meta[name="viewport" i]').attr('content') || null;
  if (!viewport) {
    issues.push({
      category: 'Mobile / Responsive',
      severity: 'Critical',
      title: 'Missing <meta name="viewport"> tag',
      evidence: 'No viewport meta tag declared in document head',
      userImpact: 'Mobile browsers render the desktop site zoomed out at 980px width, causing tiny text and broken touch targets.',
      businessImpact: 'Severe mobile user drop-off and mobile ranking penalties from Google.',
      recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0"> to document <head>.'
    });
  } else if (!viewport.includes('width=device-width')) {
    issues.push({
      category: 'Mobile / Responsive',
      severity: 'Warning',
      title: 'Improper viewport configuration',
      evidence: `Viewport tag content="${viewport}" does not specify width=device-width`,
      recommendation: 'Configure viewport with width=device-width and initial-scale=1.0.'
    });
  }

  // 4d. Robots Meta Tag (Accidental noindex detection)
  const robotsMeta = ($('meta[name="robots" i]').attr('content') || '').toLowerCase();
  if (robotsMeta.includes('noindex')) {
    issues.push({
      category: 'SEO / Crawling',
      severity: 'Critical',
      title: 'Accidental "noindex" robots tag detected',
      evidence: `<meta name="robots" content="${robotsMeta}"> is blocking search engines from indexing the homepage`,
      userImpact: 'Site cannot be found by organic searchers looking for this business.',
      businessImpact: 'Total loss of organic search traffic and search engine rankings.',
      recommendation: 'Remove "noindex" directive from production HTML to allow Google indexing.'
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

  // 11. Development / Staging Environment Leakage (Section 55)
  const htmlLower = html.toLowerCase();
  const devLeaks = [];
  if (htmlLower.includes('localhost:') || htmlLower.includes('http://localhost') || htmlLower.includes('https://localhost')) {
    devLeaks.push('localhost references');
  }
  if (htmlLower.includes('127.0.0.1')) {
    devLeaks.push('127.0.0.1 loopback IP');
  }
  if (/(?:staging\.[a-z0-9\-]+\.[a-z]{2,}|dev\.[a-z0-9\-]+\.[a-z]{2,})/i.test(html)) {
    devLeaks.push('staging/dev subdomains');
  }
  if (devLeaks.length > 0) {
    issues.push({
      category: 'Security / Deployment',
      severity: 'Critical',
      title: 'Development/Staging environment leakage detected',
      evidence: `Production source contains references to ${devLeaks.join(', ')}`,
      userImpact: 'External visitors encounter broken local links or test assets.',
      businessImpact: 'Unprofessional appearance and accidental exposure of non-production servers.',
      recommendation: 'Replace all staging endpoints and localhost URLs with production domain paths.',
      effort: 'Low'
    });
  }

  // 12. CMS / Elementor Deep DOM Nesting Bloat (Section 56 / WordPress audit)
  const hasElementor = $('.elementor, [data-elementor-type]').length > 0;
  const totalDivs = $('div').length;
  if (hasElementor && totalDivs > 450) {
    issues.push({
      category: 'Performance / DOM Architecture',
      severity: 'Warning',
      title: 'Elementor DOM container bloat detected',
      evidence: `Page utilizes Elementor with ${totalDivs} <div> wrapper elements, creating deep DOM nesting`,
      userImpact: 'Slows down style recalculations and causes jank on mobile scrolling.',
      businessImpact: 'Worse Google Core Web Vitals (INP/TBT) and lower mobile organic rankings.',
      recommendation: 'Enable Elementor Optimized DOM Output experiment and consolidate nested column containers.',
      effort: 'Medium'
    });
  }

  // 13. Web App Manifest & Mobile PWA Identity
  const hasManifest = $('link[rel="manifest" i]').length > 0;
  const hasAppleTouchIcon = $('link[rel="apple-touch-icon" i]').length > 0;
  if (!hasManifest && !hasAppleTouchIcon) {
    issues.push({
      category: 'Mobile / PWA',
      severity: 'Low',
      title: 'Missing mobile touch icon / web manifest',
      evidence: 'No <link rel="apple-touch-icon"> or manifest.json declared in <head>',
      recommendation: 'Add apple-touch-icon and web app manifest for crisp home-screen bookmarks on iOS and Android.'
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
