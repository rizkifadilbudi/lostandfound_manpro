// Middleware Validasi Laporan Founds
const validateFound = (req, res, next) => {
  const { label, category, tempat_ditemukan } = req.body;

  if (!label || typeof label !== "string" || !label.trim()) {
    return res.status(400).json({
      success: false,
      message: "Field 'label' wajib diisi (contoh: 'Dompet Kulit Lipat', 'Kunci Motor Honda').",
    });
  }

  if (!category || typeof category !== "string" || !category.trim()) {
    return res.status(400).json({
      success: false,
      message: "Field 'category' wajib diisi (contoh: 'Elektronik', 'Dompet & Kartu', 'Kunci', 'Dokumen', dll).",
    });
  }

  if (!tempat_ditemukan || typeof tempat_ditemukan !== "string" || !tempat_ditemukan.trim()) {
    return res.status(400).json({
      success: false,
      message: "Field 'tempat_ditemukan' wajib diisi berupa lokasi ditemukannya barang.",
    });
  }

  // Sanitasi trim pada field yang wajib
  req.body.label = label.trim();
  req.body.category = category.trim();
  req.body.tempat_ditemukan = tempat_ditemukan.trim();

  // Field opsional: deskripsi, waktu_ditemukan, lokasi_penitipan, kontak_penemu
  if (req.body.lokasi_penitipan && typeof req.body.lokasi_penitipan === "string") {
    req.body.lokasi_penitipan = req.body.lokasi_penitipan.trim();
  }
  if (req.body.kontak_penemu && typeof req.body.kontak_penemu === "string") {
    req.body.kontak_penemu = req.body.kontak_penemu.trim();
  }
  if (req.body.deskripsi && typeof req.body.deskripsi === "string") {
    req.body.deskripsi = req.body.deskripsi.trim();
  }

  next();
};

module.exports = {
  validateFound,
};
