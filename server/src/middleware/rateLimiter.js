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
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      return typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : forwarded[0];
    }
    return req.ip || req.socket.remoteAddress;
  },
  message: {
    error: 'Too many scan requests from this IP. Limit is 5 scans per hour.',
    status: 429
  }
});

