const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { Client } = require("pg");
const { sequelize, Found, Admin } = require("../models");

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
};
const targetDb = process.env.DB_NAME || "found_reports";

/**
 * 1. Memastikan database target sudah ada di PostgreSQL (khusus lokal)
 */
const ensureDatabaseExists = async () => {
  // Lewati jika menggunakan DATABASE_URL atau jika database cloud sudah bernama 'postgres'
  if (process.env.DATABASE_URL || targetDb === "postgres") {
    return;
  }

  const client = new Client({
    ...dbConfig,
    database: "postgres",
  });

  try {
    await client.connect();
    const checkDb = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [targetDb]
    );

    if (checkDb.rows.length === 0) {
      console.log(`[Migration] Database '${targetDb}' belum ada. Membuat database baru...`);
      await client.query(`CREATE DATABASE "${targetDb}"`);
      console.log(`[Migration] Database '${targetDb}' berhasil dibuat! 🎉`);
    } else {
      console.log(`[Migration] Database '${targetDb}' sudah ada.`);
    }
  } catch (error) {
    console.warn(
      `[Migration] Info: Tidak dapat membuat database secara otomatis (${error.message}). Melanjutkan ke koneksi database target...`
    );
  } finally {
    try {
      await client.end();
    } catch (_) {}
  }
};

/**
 * 2. Migrasi / Sinkronisasi Tabel Menggunakan Sequelize ORM
 */
const runMigration = async () => {
  console.log("=========================================");
  console.log("🚀 MEMULAI MIGRASI DATABASE DENGAN SEQUELIZE ORM");
  console.log("=========================================");

  // Pastikan database target ada
  await ensureDatabaseExists();

  try {
    // Tes koneksi Sequelize
    await sequelize.authenticate();
    console.log(`[Migration] Terhubung ke database '${targetDb}' via Sequelize ORM.`);

    // Sinkronisasi model ke database PostgreSQL (alter: true menyesuaikan tabel jika sudah ada)
    await sequelize.sync({ alter: true });

    console.log("-----------------------------------------");
    console.log("✅ Sinkronisasi Model Selesai:");
    console.log("   - Model: Admin  -> Tabel 'admins'");
    console.log("   - Model: Found  -> Tabel 'founds' (label, category, deskripsi, waktu_ditemukan, tempat_ditemukan, lokasi_penitipan, kontak_penemu)");
    console.log("-----------------------------------------");
    console.log("🎉 Database siap digunakan!");
    console.log("=========================================");
  } catch (error) {
    console.error("❌ Gagal migrasi database Sequelize:", error.message);
    throw error;
  }
};

// Eksekusi langsung jika dipanggil via CLI
if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = runMigration;
