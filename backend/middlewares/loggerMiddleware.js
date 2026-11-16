// Middleware Logger: mencatat setiap request yang masuk
const loggerMiddleware = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
};

module.exports = loggerMiddleware;
