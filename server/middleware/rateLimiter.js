/**
 * Simple in-memory rate limiter for auth endpoints.
 * In production swap this for express-rate-limit + Redis.
 *
 * Limits: 10 attempts per IP per 15-minute window.
 */

const attempts = new Map(); // ip → { count, resetAt }

const AUTH_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS   = 10;

const authRateLimiter = (req, res, next) => {
  const ip  = req.ip || req.connection?.remoteAddress || "unknown";
  const now = Date.now();
  const rec = attempts.get(ip);

  if (rec) {
    if (now < rec.resetAt) {
      if (rec.count >= MAX_ATTEMPTS) {
        const retryAfter = Math.ceil((rec.resetAt - now) / 1000);
        res.set("Retry-After", retryAfter);
        return res.status(429).json({
          message: `Too many attempts. Try again in ${Math.ceil(retryAfter / 60)} minute(s).`,
        });
      }
      rec.count += 1;
    } else {
      // Window expired — reset
      attempts.set(ip, { count: 1, resetAt: now + AUTH_WINDOW_MS });
    }
  } else {
    attempts.set(ip, { count: 1, resetAt: now + AUTH_WINDOW_MS });
  }

  next();
};

// Clean up old entries every 30 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, rec] of attempts.entries()) {
    if (now >= rec.resetAt) attempts.delete(ip);
  }
}, 30 * 60 * 1000);

module.exports = { authRateLimiter };
