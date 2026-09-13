import { validateSsrf } from '../services/ssrfChecker.js';

/**
 * Express middleware to validate target URL and block SSRF vectors.
 */
export async function ssrfGuard(req, res, next) {
  const { url } = req.body || {};

  if (!url || typeof url !== 'string') {
    return res.status(400).json({
      error: 'Missing or invalid "url" field in request body.'
    });
  }

  let formattedUrl = url.trim();
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = 'https://' + formattedUrl;
  }

  const result = await validateSsrf(formattedUrl);

  if (!result.isSafe) {
    return res.status(400).json({
      error: result.error,
      blocked: true,
      resolvedIps: result.resolvedIps || []
    });
  }

  req.targetUrl = result.parsedUrl.href;
  req.parsedTargetUrl = result.parsedUrl;
  req.resolvedIps = result.resolvedIps;
  req.pinnedIp = result.pinnedIp;
  next();
}
