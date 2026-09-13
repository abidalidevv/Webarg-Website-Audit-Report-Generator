import puppeteer from 'puppeteer-core';
import fs from 'fs';

const LOCAL_CHROME_PATHS = [
  // Windows
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  // Linux
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/snap/bin/chromium',
  // macOS
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
];

function getLocalBrowserExecutable() {
  for (const p of LOCAL_CHROME_PATHS) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

/**
 * Generates a clean, vector-crisp PDF using headless Chromium page.pdf()
 *
 * @param {string} reportId
 * @param {object} options
 * @returns {Promise<Buffer>} PDF Buffer
 */
export async function generateReportPdf(reportId, options = {}) {
  const clientBaseUrl = process.env.CLIENT_BASE_URL || 'http://localhost:5173';
  const viewParam = options.view ? `&view=${encodeURIComponent(options.view)}` : '';
  const targetUrl = `${clientBaseUrl}/report/${reportId}?print=true${viewParam}`;
  const browserlessToken = process.env.BROWSERLESS_API_KEY;
  const browserlessWs = process.env.BROWSERLESS_WS_ENDPOINT || 'wss://chrome.browserless.io';

  let browser = null;

  try {
    if (browserlessToken) {
      // Connect to hosted Browserless instance (clean endpoint without unnecessary disable-web-security flag)
      browser = await puppeteer.connect({
        browserWSEndpoint: `${browserlessWs}?token=${browserlessToken}`,
        defaultViewport: { width: 1200, height: 1600 }
      });
    } else {
      // Launch local installed Chrome or Edge (Windows, Linux, macOS)
      const executablePath = getLocalBrowserExecutable();
      if (!executablePath) {
        throw new Error('No local Chrome or Edge installation found (checked Windows, Linux, and macOS standard paths). In production environments without a GUI browser, please set BROWSERLESS_API_KEY in server/.env.');
      }

      browser = await puppeteer.launch({
        executablePath,
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--hide-scrollbars'
        ],
        defaultViewport: { width: 1200, height: 1600 }
      });
    }

    const page = await browser.newPage();

    // Emulate print media
    await page.emulateMediaType('print');

    // Navigate to printable report route
    await page.goto(targetUrl, {
      waitUntil: ['domcontentloaded', 'networkidle0'],
      timeout: 30000
    });

    // Ensure the results container has rendered
    await page.waitForSelector('#results', { timeout: 10000 });

    // Brief pause for GSAP number counters or font metrics to settle
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Generate clean A4 PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '14mm',
        bottom: '14mm',
        left: '12mm',
        right: '12mm'
      }
    });

    await page.close();
    await browser.close();

    return pdfBuffer;
  } catch (err) {
    if (browser) {
      try {
        await browser.close();
      } catch (_) {}
    }
    throw new Error(`PDF generation failed: ${err.message}`);
  }
}
