const { Admin, Found } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ==========================================
// 1. AUTENTIKASI ADMIN
// ==========================================

// Registrasi Admin baru (Password disamarkan dengan bcrypt hash)
const registerAdmin = async (req, res) => {
  try {
    const { nama_admin, password } = req.body;

    if (!nama_admin || !password) {
      return res.status(400).json({
        success: false,
        message: "nama_admin dan password wajib diisi.",
      });
    }

    // Cek apakah admin sudah ada via ORM Admin.findOne
    const existing = await Admin.findOne({ where: { nama_admin } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "nama_admin sudah digunakan, silakan pilih nama lain.",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Buat data admin via ORM Admin.create
    const newAdmin = await Admin.create({
      nama_admin,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Admin berhasil didaftarkan.",
      data: {
        id: newAdmin.id,
        nama_admin: newAdmin.nama_admin,
        created_at: newAdmin.created_at,
      },
    });
  } catch (error) {
    console.error("Error registerAdmin:", error.message);
    return res.status(500).json({
      success: false,
      message: "Gagal mendaftarkan admin.",
      error: error.message,
    });
  }
};

// Login Admin (Memeriksa password tersamar & memberikan token JWT)
const loginAdmin = async (req, res) => {
  try {
    const { nama_admin, password } = req.body;

    if (!nama_admin || !password) {
      return res.status(400).json({
        success: false,
        message: "nama_admin dan password wajib diisi.",
      });
    }

    // Cari admin via ORM Admin.findOne
    const admin = await Admin.findOne({ where: { nama_admin } });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "nama_admin atau password salah.",
      });
    }

    // Cek kecocokan password hash
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "nama_admin atau password salah.",
      });
    }

    // Buat JWT Token
    const payload = {
      id: admin.id,
      nama_admin: admin.nama_admin,
    };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "default_jwt_secret_lostandfound",
      { expiresIn: "1d" }
    );

    return res.json({
      success: true,
      message: "Login admin berhasil.",
      token: token,
      admin: {
        id: admin.id,
        nama_admin: admin.nama_admin,
      },
    });
  } catch (error) {
    console.error("Error loginAdmin:", error.message);
    return res.status(500).json({
      success: false,
      message: "Gagal login admin.",
      error: error.message,
    });
  }
};

// ==========================================
// 2. CRUD ADMIN PADA TABEL FOUNDS (ORM)
// ==========================================

// [READ ALL] Admin melihat semua data barang temuan
const adminGetAllFounds = async (req, res) => {
  try {
    const founds = await Found.findAll({
      order: [["created_at", "DESC"]],
    });

    return res.json({
      success: true,
      count: founds.length,
      data: founds,
    });
  } catch (error) {
    console.error("Error adminGetAllFounds:", error.message);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data barang temuan untuk admin.",
      error: error.message,
    });
  }
};

// [READ ONE] Admin melihat satu detail barang temuan
const adminGetFoundById = async (req, res) => {
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
    console.error("Error adminGetFoundById:", error.message);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail barang temuan.",
      error: error.message,
    });
  }
};

// [CREATE] Admin menambahkan data barang temuan
const adminCreateFound = async (req, res) => {
  try {
    const {
      label,
      category,
      deskripsi,
      waktu_ditemukan,
      tempat_ditemukan,
      kontak_penemu,
    } = req.body;

    if (!label || !category || !tempat_ditemukan) {
      return res.status(400).json({
        success: false,
        message: "label, category, dan tempat_ditemukan wajib diisi.",
      });
    }

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
      message: "Admin berhasil menambahkan data barang temuan.",
      data: newFound,
    });
  } catch (error) {
    console.error("Error adminCreateFound:", error.message);
    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan barang temuan.",
      error: error.message,
    });
  }
};

// [UPDATE] Admin mengubah / memperbarui data barang temuan
const adminUpdateFound = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      label,
      category,
      deskripsi,
      waktu_ditemukan,
      tempat_ditemukan,
      kontak_penemu,
    } = req.body;

    const found = await Found.findByPk(id);
    if (!found) {
      return res.status(404).json({
        success: false,
        message: `Barang temuan dengan ID ${id} tidak ditemukan.`,
      });
    }

    // Update atribut via ORM found.update
    await found.update({
      label: label !== undefined ? label : found.label,
      category: category !== undefined ? category : found.category,
      deskripsi: deskripsi !== undefined ? deskripsi : found.deskripsi,
      waktu_ditemukan: waktu_ditemukan !== undefined ? waktu_ditemukan : found.waktu_ditemukan,
      tempat_ditemukan: tempat_ditemukan !== undefined ? tempat_ditemukan : found.tempat_ditemukan,
      kontak_penemu: kontak_penemu !== undefined ? kontak_penemu : found.kontak_penemu,
    });

    return res.json({
      success: true,
      message: `Barang temuan ID ${id} berhasil diperbarui oleh admin.`,
      data: found,
    });
  } catch (error) {
    console.error("Error adminUpdateFound:", error.message);
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui barang temuan.",
      error: error.message,
    });
  }
};

// [DELETE] Admin menghapus data barang temuan
const adminDeleteFound = async (req, res) => {
  try {
    const { id } = req.params;
    const found = await Found.findByPk(id);

    if (!found) {
      return res.status(404).json({
        success: false,
        message: `Barang temuan dengan ID ${id} tidak ditemukan.`,
      });
    }

    await found.destroy();

    return res.json({
      success: true,
      message: `Barang temuan ID ${id} berhasil dihapus oleh admin.`,
      deleted_id: parseInt(id, 10),
    });
  } catch (error) {
    console.error("Error adminDeleteFound:", error.message);
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus barang temuan.",
      error: error.message,
    });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  adminGetAllFounds,
  adminGetFoundById,
  adminCreateFound,
  adminUpdateFound,
  adminDeleteFound,
};
