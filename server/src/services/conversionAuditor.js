import * as cheerio from 'cheerio';

/**
 * Deep Conversion Journey & Public Lead Path Auditor
 * Based on Sections 1, 3, 4, 5, 11, 18, and 19 of webarge.txt
 *
 * @param {string} html
 * @param {string} baseUrl
 * @returns {object}
 */
export function auditConversionJourneys(html, baseUrl) {
  const $ = cheerio.load(html);
  const issues = [];
  const targetHost = new URL(baseUrl).hostname;

  // 1. Phone & Click-to-Call Audit
  const telLinks = [];
  $('a[href^="tel:" i]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const rawNumber = href.replace(/tel:/i, '').trim();
    const cleanNumber = rawNumber.replace(/[\s\-\(\)\.]/g, '');
    const isInternational = cleanNumber.startsWith('+') || cleanNumber.length >= 10;
    telLinks.push({ href, text: $(el).text().trim(), rawNumber, isInternational });
  });

  const bodyText = $('body').text();
  const rawPhoneMatches = bodyText.match(/(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})/g) || [];

  if (telLinks.length === 0 && rawPhoneMatches.length > 0) {
    issues.push({
      category: 'Conversion Journey',
      severity: 'Critical',
      title: 'Phone number is unclickable plain text',
      evidence: `Detected phone ${rawPhoneMatches[0]} in page text, but 0 <a href="tel:"> links exist.`,
      userImpact: 'Mobile visitors tapping the phone number cannot initiate a call.',
      businessImpact: 'High bounce rate on mobile; direct commercial lead loss.',
      recommendation: 'Wrap visible phone numbers in <a href="tel:+1..."> with clean international dialer formatting.',
      effort: 'Low'
    });
  } else if (telLinks.length > 0) {
    telLinks.forEach((t) => {
      if (!t.isInternational) {
        issues.push({
          category: 'Conversion Journey',
          severity: 'Warning',
          title: 'Click-to-call link lacks international dial code',
          evidence: `Link "${t.href}" has no country prefix.`,
          userImpact: 'Call fails for users whose carrier requires full dialing format.',
          businessImpact: 'Lost inquiries from cross-border or roaming prospects.',
          recommendation: 'Prefix all telephone links with + and country code (e.g. tel:+1...).',
          effort: 'Low'
        });
      }
    });
  }

  // 2. WhatsApp Direct Link Audit
  const whatsappLinks = [];
  $('a[href*="wa.me" i], a[href*="whatsapp.com" i]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().trim();
    const hasNumber = /[0-9]{8,15}/.test(href);
    whatsappLinks.push({ href, text, hasNumber });
    if (!hasNumber) {
      issues.push({
        category: 'Conversion Journey',
        severity: 'Critical',
        title: 'Broken WhatsApp CTA link',
        evidence: `WhatsApp button links to "${href}" without a valid destination phone number.`,
        userImpact: 'Clicking the WhatsApp button opens a blank or error screen.',
        businessImpact: 'Direct lead loss for high-intent visitors choosing instant messaging.',
        recommendation: 'Ensure link uses format https://wa.me/<countrycode><phonenumber>.',
        effort: 'Low'
      });
    }
  });

  // 3. Email & mailto: Link Audit
  const emailLinks = [];
  $('a[href^="mailto:" i]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const address = href.replace(/mailto:/i, '').split('?')[0].trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address);
    emailLinks.push({ href, address, isValid });
    if (!isValid) {
      issues.push({
        category: 'Conversion Journey',
        severity: 'Warning',
        title: 'Malformed mailto: address',
        evidence: `Link "${href}" is missing or contains an invalid email format.`,
        userImpact: 'Opens email client with empty or corrupt recipient field.',
        businessImpact: 'Prospective clients unable to send RFPs or inquiries.',
        recommendation: 'Correct recipient address syntax in mailto: link.',
        effort: 'Low'
      });
    }
  });

  // 4. Dead CTAs & Empty Anchors
  const deadCtas = [];
  $('a').each((_, el) => {
    const href = ($(el).attr('href') || '').trim();
    const text = $(el).text().trim();
    const isActionWord = /call|book|contact|quote|started|demo|sign\s?up|submit|buy|order/i.test(text);

    if ((href === '#' || href === 'javascript:void(0)' || href === 'javascript:;') && isActionWord) {
      deadCtas.push({ text, href });
    }
  });

  if (deadCtas.length > 0) {
    issues.push({
      category: 'Conversion Journey',
      severity: 'Critical',
      title: 'Dead CTA buttons (action keywords with # anchor)',
      evidence: `${deadCtas.length} buttons found with dummy href="#": "${deadCtas.slice(0, 3).map(d => d.text).join('", "')}"`,
      userImpact: 'Visitors click primary conversion buttons and nothing happens (page jumps to top).',
      businessImpact: 'Frustrated prospects bounce immediately; zero lead capture.',
      recommendation: 'Attach valid destination routes or working modal event listeners to all CTA buttons.',
      effort: 'Medium'
    });
  }

  // 5. Reverse Tabnabbing Security on External Links
  let tabnabbingVulnerabilities = 0;
  $('a[target="_blank"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const rel = ($(el).attr('rel') || '').toLowerCase();
    if (href.startsWith('http') && !href.includes(targetHost)) {
      if (!rel.includes('noopener') && !rel.includes('noreferrer')) {
        tabnabbingVulnerabilities++;
      }
    }
  });

  if (tabnabbingVulnerabilities > 0) {
    issues.push({
      category: 'Security',
      severity: 'Warning',
      title: 'External links vulnerable to reverse tabnabbing',
      evidence: `${tabnabbingVulnerabilities} external target="_blank" links lack rel="noopener noreferrer".`,
      userImpact: 'Opened external pages can execute window.opener.location redirection attacks.',
      businessImpact: 'Reputational damage and security warning flags from enterprise browsers.',
      recommendation: 'Add rel="noopener noreferrer" to all outgoing target="_blank" hyperlinks.',
      effort: 'Low'
    });
  }

  // 6. Contact Form Audit
  const forms = [];
  $('form').each((_, el) => {
    const action = $(el).attr('action') || '';
    const method = ($(el).attr('method') || 'GET').toUpperCase();
    const inputs = $(el).find('input, textarea, select').length;
    const hasSubmit = $(el).find('button[type="submit"], input[type="submit"], button:not([type])').length > 0;
    const hasHoneypot = $(el).find('input[style*="display:none"], input[style*="visibility:hidden"], [class*="honeypot" i]').length > 0;
    const hasRecaptcha = $(el).find('[class*="recaptcha" i], [id*="recaptcha" i], [class*="turnstile" i]').length > 0;

    forms.push({ action, method, inputs, hasSubmit, hasSpamProtection: hasHoneypot || hasRecaptcha });
  });

  if (forms.length > 0) {
    const formsWithoutSubmit = forms.filter(f => !f.hasSubmit);
    if (formsWithoutSubmit.length > 0) {
      issues.push({
        category: 'Conversion Journey',
        severity: 'Critical',
        title: 'Form missing dedicated submit button',
        evidence: `${formsWithoutSubmit.length} form(s) do not contain a visible submit button.`,
        userImpact: 'Users unable to complete or send form submissions on mobile.',
        businessImpact: '100% loss of form-generated leads.',
        recommendation: 'Add an explicit <button type="submit"> to all enquiry and lead capture forms.',
        effort: 'Low'
      });
    }
  }

  // 7. Google Maps Embed Check
  const hasGoogleMaps = $('iframe[src*="google.com/maps" i], a[href*="maps.google.com" i], a[href*="goo.gl/maps" i]').length > 0;

  // 8. Social Media Profile Links
  const socialLinks = [];
  const socialDomains = ['facebook.com', 'instagram.com', 'linkedin.com', 'twitter.com', 'x.com', 'youtube.com', 'tiktok.com'];
  $('a').each((_, el) => {
    const href = $(el).attr('href') || '';
    socialDomains.forEach(domain => {
      if (href.includes(domain)) {
        const isGeneric = href.replace(/https?:\/\/(www\.)?/, '').replace(/\/$/, '') === domain;
        socialLinks.push({ domain, href, isGeneric });
      }
    });
  });

  const genericSocials = socialLinks.filter(s => s.isGeneric);
  if (genericSocials.length > 0) {
    issues.push({
      category: 'Conversion Journey',
      severity: 'Warning',
      title: 'Social links point to generic platform homepages',
      evidence: `${genericSocials.length} social icons point to root ${genericSocials.map(g => g.domain).join(', ')} rather than business profile.`,
      userImpact: 'Visitors clicking company social icons are dumped onto generic homepage logins.',
      businessImpact: 'Lost social proof and trust degradation.',
      recommendation: 'Update all social icons with the direct URL of the company profiles.',
      effort: 'Low'
    });
  }

  // 9. Legal & Trust Signals (Privacy Policy, Terms, Outdated Copyright)
  const hasPrivacy = $('a[href*="privacy" i]').length > 0;
  const hasTerms = $('a[href*="terms" i]').length > 0;

  if (!hasPrivacy) {
    issues.push({
      category: 'Legal & Trust',
      severity: 'Warning',
      title: 'Missing Privacy Policy link',
      evidence: 'No link containing "privacy" was detected in footer or navigation.',
      userImpact: 'No disclosure on how visitor contact data is processed or stored.',
      businessImpact: 'GDPR / CCPA compliance exposure; required for Google Ads approval.',
      recommendation: 'Add a dedicated Privacy Policy page linked in the global footer.',
      effort: 'Low'
    });
  }

  const currentYear = new Date().getFullYear();
  const footerText = $('footer, [class*="footer" i]').text();
  const yearMatches = footerText.match(/©\s*([0-9]{4})/g) || [];
  if (yearMatches.length > 0) {
    const year = parseInt(yearMatches[0].replace(/[^0-9]/g, ''), 10);
    if (year < currentYear - 1) {
      issues.push({
        category: 'Legal & Trust',
        severity: 'Warning',
        title: 'Outdated copyright year in footer',
        evidence: `Footer displays copyright year ${year} (current year is ${currentYear}).`,
        userImpact: 'Gives the impression that the business or website is abandoned.',
        businessImpact: 'Decreases buyer trust; prospects question if business is actively operating.',
        recommendation: 'Update the copyright string or automate it using dynamic year output.',
        effort: 'Low'
      });
    }
  }

  return {
    contactChannels: {
      phone: { count: telLinks.length, items: telLinks, unlinkedInBody: rawPhoneMatches.length > 0 },
      whatsapp: { count: whatsappLinks.length, items: whatsappLinks },
      email: { count: emailLinks.length, items: emailLinks },
      maps: { present: hasGoogleMaps },
      forms: { count: forms.length, details: forms },
      socials: { count: socialLinks.length, genericCount: genericSocials.length }
    },
    trustSignals: {
      privacyPolicy: hasPrivacy,
      termsOfService: hasTerms,
      deadCtasCount: deadCtas.length
    },
    issues
  };
}
