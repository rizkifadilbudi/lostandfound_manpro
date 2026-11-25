const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Found = sequelize.define(
  "Found",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    label: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Label barang tidak boleh kosong." },
      },
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Kategori barang tidak boleh kosong." },
      },
    },
    deskripsi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    waktu_ditemukan: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    tempat_ditemukan: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Tempat ditemukan tidak boleh kosong." },
      },
    },
    lokasi_penitipan: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    kontak_penemu: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "founds",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false, // Hanya gunakan created_at sesuai skema
  }
);

module.exports = Found;
