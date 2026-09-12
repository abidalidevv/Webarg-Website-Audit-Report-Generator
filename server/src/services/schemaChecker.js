import * as cheerio from 'cheerio';

/**
 * Extracts schema.org JSON-LD and compares business identity (Name, Phone, Address)
 * between schema markup and visible footer/body text.
 *
 * @param {string} html
 * @returns {{ schemas: Array, napConsistency: object, issues: Array }}
 */
export function analyzeSchemaAndIdentity(html) {
  const issues = [];
  const $ = cheerio.load(html);
  const schemas = [];

  // Extract all JSON-LD blocks
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const raw = $(el).html();
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          schemas.push(...parsed);
        } else {
          schemas.push(parsed);
        }
      }
    } catch {}
  });

  if (schemas.length === 0) {
    issues.push({
      category: 'SEO / Structured Data',
      severity: 'Warning',
      title: 'Missing structured data (Schema.org)',
      evidence: 'No JSON-LD schema found on page',
      recommendation: 'Add Organization or LocalBusiness Schema.org JSON-LD to enhance rich snippets and AI discoverability.'
    });
  }

  // Look for business identity in schema
  let schemaName = null;
  let schemaPhone = null;
  let schemaAddress = null;

  for (const s of schemas) {
    const type = s['@type'] || '';
    if (
      type === 'Organization' ||
      type === 'LocalBusiness' ||
      type.includes('Business') ||
      type === 'Store' ||
      type === 'Restaurant'
    ) {
      if (s.name) schemaName = String(s.name).trim();
      if (s.telephone) schemaPhone = String(s.telephone).trim();
      if (s.address) {
        if (typeof s.address === 'object') {
          schemaAddress = [
            s.address.streetAddress,
            s.address.addressLocality,
            s.address.addressRegion,
            s.address.postalCode
          ]
            .filter(Boolean)
            .join(', ');
        } else {
          schemaAddress = String(s.address).trim();
        }
      }
    }
  }

  // Visible text inspection in footer and contact sections
  const footerText = $('footer, [class*="footer" i], [id*="footer" i]').text();
  const bodyText = $('body').text();

  const napConsistency = {
    schemaFound: Boolean(schemaName || schemaPhone || schemaAddress),
    schemaName,
    schemaPhone,
    schemaAddress,
    footerMatched: true
  };

  // Check if schema telephone exists in visible footer/body
  if (schemaPhone) {
    const cleanDigits = schemaPhone.replace(/\D/g, '');
    const cleanBodyDigits = bodyText.replace(/\D/g, '');
    if (cleanDigits.length >= 7 && !cleanBodyDigits.includes(cleanDigits)) {
      napConsistency.footerMatched = false;
      issues.push({
        category: 'Business Identity Consistency',
        severity: 'Warning',
        title: 'Phone number mismatch between Schema and visible page',
        evidence: `Schema telephone "${schemaPhone}" does not match visible page contact numbers`,
        recommendation: 'Ensure phone numbers in JSON-LD schema and page footer are identical (NAP consistency).'
      });
    }
  }

  return {
    schemasCount: schemas.length,
    schemas: schemas.slice(0, 5), // Keep first 5 schemas
    napConsistency,
    issues
  };
}
