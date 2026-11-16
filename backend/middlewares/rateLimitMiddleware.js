// Middleware Rate Limiting: Maksimal 10 request per menit
let rateLimiterMiddleware;

try {
  const rateLimit = require("express-rate-limit");
  rateLimiterMiddleware = rateLimit({
    windowMs: 60 * 1000, // 1 menit (60000 ms)
    max: 10, // Maksimal 10 request per IP per menit
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message:
        "Terlalu banyak permintaan. Batas maksimal adalah 10 request per menit. Silakan coba lagi beberapa saat lagi.",
    },
  });
} catch (_) {
  // In-Memory Fallback rate limiter (aktif otomatis jika package belum di-install)
  const requestCounts = new Map();
  const WINDOW_MS = 60 * 1000;
  const MAX_REQUESTS = 10;

  rateLimiterMiddleware = (req, res, next) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "client";
    const now = Date.now();

    const record = requestCounts.get(ip) || { count: 0, resetTime: now + WINDOW_MS };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + WINDOW_MS;
    } else {
      record.count += 1;
    }

    requestCounts.set(ip, record);

    if (record.count > MAX_REQUESTS) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfter);
      return res.status(429).json({
        success: false,
        message:
          "Terlalu banyak permintaan. Batas maksimal adalah 10 request per menit. Silakan coba lagi beberapa saat lagi.",
        retry_after_seconds: retryAfter,
      });
    }

    next();
  };
}

module.exports = rateLimiterMiddleware;
