const jwt = require("jsonwebtoken");

// Middleware untuk memverifikasi token autentikasi Admin
const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Akses ditolak. Token autentikasi tidak ditemukan.",
    });
  }

  // Format header: Bearer <token>
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_jwt_secret_lostandfound"
    );
    req.admin = decoded; // Menyimpan data admin yang login ke objek request
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Token tidak valid atau sudah kedaluwarsa.",
      error: error.message,
    });
  }
};

module.exports = {
  verifyAdminToken,
};
