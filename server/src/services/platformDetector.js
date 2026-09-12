/**
 * Platform, CMS, Framework, and Analytics Detector
 * Based on Section 79 of webarge.txt
 *
 * @param {string} html
 * @param {Headers} headers
 * @param {string[]} scriptDomains
 * @returns {object}
 */
export function detectPlatform(html = '', headers = null, scriptDomains = []) {
  const detected = [];
  const lowerHtml = html.toLowerCase();
  const serverHeader = (headers?.get('server') || '').toLowerCase();
  const poweredBy = (headers?.get('x-powered-by') || '').toLowerCase();

  // 1. CMS & Website Builders
  if (lowerHtml.includes('wp-content') || lowerHtml.includes('wp-includes') || lowerHtml.includes('name="generator" content="wordpress')) {
    detected.push({ category: 'CMS', name: 'WordPress', confidence: 'High' });
  }
  if (lowerHtml.includes('cdn.shopify.com') || lowerHtml.includes('shopify.theme')) {
    detected.push({ category: 'CMS / E-Commerce', name: 'Shopify', confidence: 'High' });
  }
  if (lowerHtml.includes('webflow.js') || lowerHtml.includes('data-wf-page') || lowerHtml.includes('wf-')) {
    detected.push({ category: 'CMS', name: 'Webflow', confidence: 'High' });
  }
  if (lowerHtml.includes('static1.squarespace.com') || lowerHtml.includes('squarespace.com')) {
    detected.push({ category: 'CMS', name: 'Squarespace', confidence: 'High' });
  }
  if (lowerHtml.includes('wix.com') || lowerHtml.includes('wix-image') || lowerHtml.includes('_wix')) {
    detected.push({ category: 'CMS', name: 'Wix', confidence: 'High' });
  }
  if (lowerHtml.includes('leadconnectorhq.com') || lowerHtml.includes('msgsndr.com') || lowerHtml.includes('highlevel')) {
    detected.push({ category: 'CRM / Funnel', name: 'GoHighLevel', confidence: 'High' });
  }
  if (lowerHtml.includes('hubspot.com') || lowerHtml.includes('hs-scripts.com')) {
    detected.push({ category: 'Marketing / CRM', name: 'HubSpot', confidence: 'High' });
  }

  // 2. E-Commerce
  if (lowerHtml.includes('woocommerce') || lowerHtml.includes('wc-block') || lowerHtml.includes('wc-cart')) {
    detected.push({ category: 'E-Commerce', name: 'WooCommerce', confidence: 'High' });
  }
  if (lowerHtml.includes('js.stripe.com') || lowerHtml.includes('stripe')) {
    detected.push({ category: 'Payments', name: 'Stripe', confidence: 'Medium' });
  }
  if (lowerHtml.includes('paypal.com/sdk')) {
    detected.push({ category: 'Payments', name: 'PayPal', confidence: 'Medium' });
  }

  // 3. Frontend Frameworks
  if (lowerHtml.includes('__next_data__') || lowerHtml.includes('_next/static')) {
    detected.push({ category: 'Framework', name: 'Next.js', confidence: 'High' });
  } else if (lowerHtml.includes('react') || lowerHtml.includes('_react') || lowerHtml.includes('data-reactroot')) {
    detected.push({ category: 'Framework', name: 'React', confidence: 'Medium' });
  }
  if (lowerHtml.includes('__nuxt__') || lowerHtml.includes('_nuxt/')) {
    detected.push({ category: 'Framework', name: 'Nuxt.js', confidence: 'High' });
  } else if (lowerHtml.includes('v-cloak') || lowerHtml.includes('data-v-')) {
    detected.push({ category: 'Framework', name: 'Vue.js', confidence: 'Medium' });
  }
  if (lowerHtml.includes('ng-version') || lowerHtml.includes('ng-app')) {
    detected.push({ category: 'Framework', name: 'Angular', confidence: 'High' });
  }
  if (lowerHtml.includes('jquery') || lowerHtml.includes('jquery.min.js')) {
    detected.push({ category: 'Library', name: 'jQuery', confidence: 'High' });
  }

  // 4. Analytics & Marketing Pixels
  if (lowerHtml.includes('googletagmanager.com/gtm.js') || lowerHtml.includes('gtm-')) {
    detected.push({ category: 'Tag Management', name: 'Google Tag Manager', confidence: 'High' });
  }
  if (lowerHtml.includes('google-analytics.com/analytics.js') || lowerHtml.includes('googletagmanager.com/gtag/js') || /g-[a-z0-9]+/i.test(lowerHtml)) {
    detected.push({ category: 'Analytics', name: 'Google Analytics 4', confidence: 'High' });
  }
  if (lowerHtml.includes('connect.facebook.net') || lowerHtml.includes('fbevents.js') || lowerHtml.includes('fbq(')) {
    detected.push({ category: 'Tracking Pixel', name: 'Meta (Facebook) Pixel', confidence: 'High' });
  }
  if (lowerHtml.includes('analytics.tiktok.com') || lowerHtml.includes('ttq.load')) {
    detected.push({ category: 'Tracking Pixel', name: 'TikTok Pixel', confidence: 'High' });
  }
  if (lowerHtml.includes('static.hotjar.com') || lowerHtml.includes('_hjsettings')) {
    detected.push({ category: 'Session Recording', name: 'Hotjar', confidence: 'High' });
  }
  if (lowerHtml.includes('klaviyo.com') || lowerHtml.includes('static.klaviyo.com')) {
    detected.push({ category: 'Email Marketing', name: 'Klaviyo', confidence: 'High' });
  }

  // 5. Server & Infrastructure
  if (serverHeader.includes('cloudflare') || headers?.get('cf-ray')) {
    detected.push({ category: 'CDN / Security', name: 'Cloudflare', confidence: 'High' });
  }
  if (serverHeader.includes('nginx')) {
    detected.push({ category: 'Web Server', name: 'Nginx', confidence: 'High' });
  } else if (serverHeader.includes('apache')) {
    detected.push({ category: 'Web Server', name: 'Apache', confidence: 'High' });
  } else if (serverHeader.includes('litespeed')) {
    detected.push({ category: 'Web Server', name: 'LiteSpeed', confidence: 'High' });
  }

  if (poweredBy.includes('php')) {
    detected.push({ category: 'Backend Runtime', name: 'PHP', confidence: 'High' });
  } else if (poweredBy.includes('express')) {
    detected.push({ category: 'Backend Runtime', name: 'Express (Node.js)', confidence: 'High' });
  }

  return detected;
}
