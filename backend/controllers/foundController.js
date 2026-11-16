const { Found } = require("../models");
const { Op } = require("sequelize");
const FormData = require("form-data");
const axios = require("axios");

// 1. User membuat laporan barang yang ditemukan
const createFound = async (req, res) => {
  try {
    const {
      label,
      category,
      deskripsi,
      waktu_ditemukan,
      tempat_ditemukan,
      kontak_penemu,
    } = req.body;

    // Simpan data menggunakan Sequelize Model
    const newFound = await Found.create({
      label,
      category,
      deskripsi: deskripsi || null,
      waktu_ditemukan: waktu_ditemukan || new Date(),
      tempat_ditemukan,
      kontak_penemu: kontak_penemu || null,
    });

    return res.status(201).json({
      success: true,
      message: "Laporan barang temuan berhasil disimpan.",
      data: newFound,
    });
  } catch (error) {
    console.error("Error createFound:", error.message);
    return res.status(500).json({
      success: false,
      message: "Gagal menyimpan laporan barang temuan.",
      error: error.message,
    });
  }
};

// 2. User melihat daftar semua barang yang ditemukan (bisa filter category & search)
const getAllFounds = async (req, res) => {
  try {
    const { category, search } = req.query;
    const whereClause = {};

    // Filter kategori jika ada
    if (category) {
      whereClause.category = category;
    }

    // Filter pencarian teks jika ada
    if (search) {
      whereClause[Op.or] = [
        { label: { [Op.iLike]: `%${search}%` } },
        { category: { [Op.iLike]: `%${search}%` } },
        { deskripsi: { [Op.iLike]: `%${search}%` } },
        { tempat_ditemukan: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Ambil data menggunakan Sequelize Model
    const founds = await Found.findAll({
      where: whereClause,
      order: [["waktu_ditemukan", "DESC"]],
    });

    return res.json({
      success: true,
      count: founds.length,
      data: founds,
    });
  } catch (error) {
    console.error("Error getAllFounds:", error.message);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data barang temuan.",
      error: error.message,
    });
  }
};

// 3. User melihat detail satu barang temuan berdasarkan ID
const getFoundById = async (req, res) => {
  try {
    const { id } = req.params;
    const found = await Found.findByPk(id);

    if (!found) {
      return res.status(404).json({
        success: false,
        message: `Barang temuan dengan ID ${id} tidak ditemukan.`,
      });
    }

    return res.json({
      success: true,
      data: found,
    });
  } catch (error) {
    console.error("Error getFoundById:", error.message);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail barang temuan.",
      error: error.message,
    });
  }
};

// 4. Klasifikasi gambar menggunakan AI Service
const classifyImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Harap unggah berkas gambar.",
      });
    }

    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname || "image.jpg",
      contentType: req.file.mimetype || "image/jpeg",
    });

    const aiUrl = process.env.AI_SERVICE_URL || "http://localhost:8000/predict";
    const aiResponse = await axios.post(aiUrl, formData, {
      headers: formData.getHeaders(),
      timeout: 30000,
    });

    const aiData = aiResponse.data;

    // Periksa apakah hasil AI menolak gambar/objek (is_rejected: true)
    const hasRejectedPred =
      Array.isArray(aiData.predictions) &&
      aiData.predictions.some((p) => p.is_rejected === true);
    const isModerationUnsafe =
      aiData.moderation && aiData.moderation.is_safe === false;

    if (aiData.is_rejected === true || hasRejectedPred || isModerationUnsafe) {
      const rejectedPred = Array.isArray(aiData.predictions)
        ? aiData.predictions.find((p) => p.is_rejected === true)
        : null;

      const rejectionReason =
        aiData.rejection_reason ||
        (rejectedPred && rejectedPred.rejection_reason) ||
        (aiData.moderation && aiData.moderation.reason) ||
        "Gambar atau objek tidak memenuhi ketentuan dan ditolak oleh sistem AI.";

      // Response baru yang hanya menampilkan is_rejected dan rejection_reason, sisanya null
      return res.json({
        success: false,
        is_rejected: true,
        rejection_reason: rejectionReason,
        label: null,
        category: null,
        deskripsi: null,
        predictions: null,
        data: null,
      });
    }

    return res.json(aiData);
  } catch (error) {
    if (error.response) {
      console.error("AI Service Error:", error.response.data);
      return res.status(error.response.status).json({
        success: false,
        error: "Gagal diproses oleh AI Service",
        detail: error.response.data?.detail || null,
      });
    }
    console.error("Koneksi AI Service Gagal:", error.message);
    return res.status(500).json({
      success: false,
      error: "Gagal terhubung ke layanan AI Service",
      detail: error.message,
    });
  }
};

module.exports = {
  createFound,
  getAllFounds,
  getFoundById,
  classifyImage,
};
