const express = require("express");
const router = express.Router();

// Import Middleware
const loggerMiddleware = require("../middlewares/loggerMiddleware");
const { verifyAdminToken } = require("../middlewares/authMiddleware");

// Import Controller
const adminController = require("../controllers/adminController");

// Pasang logger untuk seluruh route admin
router.use(loggerMiddleware);

// ==========================================
// 1. ROUTE AUTENTIKASI ADMIN
// Alur: Route -> Controller
// ==========================================
router.post("/auth/register", adminController.registerAdmin);
router.post("/auth/login", adminController.loginAdmin);

// ==========================================
// 2. ROUTE CRUD ADMIN PADA TABEL FOUNDS
// Alur: Route -> Middleware (Verifikasi Token) -> Controller
// ==========================================

// [READ ALL] Admin melihat semua barang temuan
router.get("/founds", verifyAdminToken, adminController.adminGetAllFounds);

// [READ ONE] Admin melihat detail satu barang temuan
router.get("/founds/:id", verifyAdminToken, adminController.adminGetFoundById);

// [CREATE] Admin menambahkan data barang temuan
router.post("/founds", verifyAdminToken, adminController.adminCreateFound);

// [UPDATE] Admin mengubah data barang temuan
router.put("/founds/:id", verifyAdminToken, adminController.adminUpdateFound);

// [DELETE] Admin menghapus data barang temuan
router.delete("/founds/:id", verifyAdminToken, adminController.adminDeleteFound);

module.exports = router;
