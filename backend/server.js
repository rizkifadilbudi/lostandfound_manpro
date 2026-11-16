const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import Inisialisasi Database
const initDatabase = require("./database/initDb");

// Import Route
const foundRoutes = require("./routes/foundRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get("/", (req, res) => {
  res.json({
    status: "Backend API Lost & Found is running",
    database: `PostgreSQL (${process.env.DB_NAME || "found_reports"})`,
    endpoints: {
      founds: "/api/founds",
      founds_classify: "/api/founds/classify",
      admin: "/api/admin",
    },
  });
});

// Alias backward compatibility untuk /api/classify
app.use("/api/classify", (req, res, next) => {
  req.url = "/classify";
  foundRoutes(req, res, next);
});

// Routing
app.use("/api/founds", foundRoutes); // Route founds biasa (publik)
app.use("/api/admin", adminRoutes);  // Route admin (auth & CRUD founds)

// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} tidak ditemukan.`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan internal pada server.",
    error: err.message,
  });
});

// Jalankan Server & Inisialisasi Database
const startServer = async () => {
  try {
    // Inisialisasi tabel database PostgreSQL saat server start
    await initDatabase();

    app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`🚀 Backend running on http://localhost:${PORT}`);
      console.log(`📡 AI Service URL: ${process.env.AI_SERVICE_URL || "http://localhost:8000/predict"}`);
      console.log(`🐘 Database: ${process.env.DB_NAME || "found_reports"}`);
      console.log(`=========================================`);
    });
  } catch (error) {
    console.error("Gagal memulai server:", error.message);
  }
};

startServer();

module.exports = app;
