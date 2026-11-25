const express = require("express");
const router = express.Router();
const multer = require("multer");

// Import Middleware
const loggerMiddleware = require("../middlewares/loggerMiddleware");
const { validateFound } = require("../middlewares/validationMiddleware");
const rateLimiterMiddleware = require("../middlewares/rateLimitMiddleware");

// Import Controller
const foundController = require("../controllers/foundController");

// Konfigurasi Multer untuk upload gambar (Maksimal 5 MB & hanya gambar)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("File yang diunggah harus berupa gambar (jpg, jpeg, png, webp)."), false);
    }
  },
});

// Middleware wrapper untuk menangani error Multer (seperti LIMIT_FILE_SIZE)
const uploadImageMiddleware = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          error: "Ukuran berkas terlalu besar. Maksimal ukuran file adalah 5 MB.",
        });
      }
      return res.status(400).json({
        success: false,
        error: `Kesalahan unggah file: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }
    next();
  });
};

// Pasang middleware logger untuk seluruh route founds
router.use(loggerMiddleware);

// ==========================================
// DAFTAR ROUTE FOUNDS BIASA (PUBLIK / USER)
// ==========================================

// 1. Simpan laporan barang temuan baru
router.post("/", validateFound, foundController.createFound);

// 2. Tampilkan semua barang temuan (support ?category=... & ?search=...)
router.get("/", foundController.getAllFounds);

// 3. Tampilkan detail satu barang temuan
router.get("/:id", foundController.getFoundById);

// 4. Klasifikasi gambar barang via AI Service (Dibatasi rate limit 10 req/menit & file maks 5 MB)
router.post(
  "/classify",
  rateLimiterMiddleware,
  uploadImageMiddleware,
  foundController.classifyImage
);

module.exports = router;
