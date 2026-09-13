import rateLimit from 'express-rate-limit';

/**
 * Scan rate limiter: 5 requests per hour per IP.
 */
const limitMax = process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX, 10) : 5;

export const scanRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: limitMax,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // req.ip respects app.set('trust proxy', ...) configuration, preventing client header spoofing
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  message: {
    error: 'Too many scan requests from this IP. Limit is 5 scans per hour.',
    status: 429
  }
});

