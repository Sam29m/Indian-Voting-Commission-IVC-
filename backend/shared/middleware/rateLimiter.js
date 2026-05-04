// Simple in-memory rate limiter
const rateLimitStore = new Map();

const rateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    message = 'Too many requests, please try again later.',
  } = options;

  // Cleanup old entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of rateLimitStore) {
      if (now - data.resetTime > windowMs) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, { count: 1, resetTime: now });
      return next();
    }

    const record = rateLimitStore.get(key);

    if (now - record.resetTime > windowMs) {
      record.count = 1;
      record.resetTime = now;
      return next();
    }

    record.count++;

    if (record.count > maxRequests) {
      return res.status(429).json({ message });
    }

    next();
  };
};

// Stricter rate limit for auth endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 2000,
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
});

// General API rate limit
const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 200,
  message: 'Too many requests. Please slow down.',
});

module.exports = { rateLimit, authRateLimit, apiRateLimit };
