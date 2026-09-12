import { Router } from 'express';
import { nanoid } from 'nanoid';
import { listReports, deleteReport, getReport } from '../services/reportStorage.js';

export const adminRouter = Router();

// In-memory active admin sessions token store
const activeTokens = new Set();

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || 'admin-webarg-secret-2026';
}

// Middleware: Verify admin session token
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim() || req.headers['x-admin-token'];

  if (!token || !activeTokens.has(token)) {
    return res.status(401).json({
      error: 'Unauthorized. Please log in with the administrator password.'
    });
  }

  next();
}

// POST /admin/login - Authenticate password
adminRouter.post('/login', (req, res) => {
  const { password } = req.body || {};
  const expectedPassword = getAdminPassword();

  if (!password || password !== expectedPassword) {
    return res.status(401).json({
      error: 'Invalid administrator password. Access denied.'
    });
  }

  const token = `adm_${nanoid(32)}`;
  activeTokens.add(token);

  return res.status(200).json({
    success: true,
    token,
    message: 'Admin session authenticated.'
  });
});

// POST /admin/logout - Invalidate session
adminRouter.post('/logout', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  activeTokens.delete(token);
  return res.status(200).json({ success: true });
});

// GET /admin/reports - List past reports
adminRouter.get('/reports', requireAdminAuth, (req, res) => {
  const reports = listReports();
  return res.status(200).json({
    count: reports.length,
    reports
  });
});

// DELETE /admin/reports/:id - Remove past report
adminRouter.delete('/reports/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const deleted = deleteReport(id);

  if (!deleted) {
    return res.status(404).json({ error: 'Report not found or already deleted.' });
  }

  return res.status(200).json({ success: true, message: `Report ${id} removed.` });
});

// GET /admin/config - System configuration & API key status
adminRouter.get('/config', requireAdminAuth, (req, res) => {
  const apiKey = process.env.BROWSERLESS_API_KEY || '';
  const maskedKey = apiKey.length > 4 ? `sk_...${apiKey.slice(-4)}` : (apiKey ? 'Configured' : 'Not Configured');

  return res.status(200).json({
    browserless: {
      isConfigured: Boolean(apiKey),
      maskedKey,
      endpoint: process.env.BROWSERLESS_WS_ENDPOINT || 'wss://chrome.browserless.io'
    },
    system: {
      uptimeSeconds: Math.round(process.uptime()),
      reportsOnDisk: listReports().length,
      nodeVersion: process.version,
      platform: process.platform
    }
  });
});

// POST /admin/config - Update Browserless API key without server restart
adminRouter.post('/config', requireAdminAuth, (req, res) => {
  const { browserlessApiKey, browserlessEndpoint } = req.body || {};

  if (browserlessApiKey !== undefined) {
    process.env.BROWSERLESS_API_KEY = String(browserlessApiKey).trim();
  }
  if (browserlessEndpoint !== undefined) {
    process.env.BROWSERLESS_WS_ENDPOINT = String(browserlessEndpoint).trim();
  }

  return res.status(200).json({
    success: true,
    message: 'System runtime configuration updated.'
  });
});
