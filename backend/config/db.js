const { Sequelize } = require("sequelize");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// Cek apakah menggunakan cloud database (seperti Supabase) yang membutuhkan SSL
const isCloudOrSsl =
  process.env.DATABASE_URL ||
  process.env.DB_SSL === "true" ||
  (process.env.DB_HOST && !["localhost", "127.0.0.1"].includes(process.env.DB_HOST));

const dialectOptions = isCloudOrSsl
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Diperlukan untuk sertifikat SSL Supabase / Cloud PostgreSQL
      },
    }
  : {};

let sequelize;

if (process.env.DATABASE_URL) {
  // Jika menggunakan Connection String / URI Supabase (postgresql://...)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectOptions,
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
} else {
  // Jika menggunakan parameter host, port, user terpisah
  sequelize = new Sequelize(
    process.env.DB_NAME || "found_reports",
    process.env.DB_USER || "postgres",
    process.env.DB_PASSWORD || "",
    {
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      dialect: "postgres",
      dialectOptions,
      logging: false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
}

module.exports = sequelize;
