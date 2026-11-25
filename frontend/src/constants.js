// 7 kategori yang dipakai AI service (ai-service/main.py)
export const CATEGORIES = [
  "Elektronik",
  "Dompet & Kartu",
  "Kunci",
  "Dokumen",
  "Perhiasan & Aksesoris",
  "Tas & Pakaian",
  "Lainnya",
];

// Batas ukuran foto maksimal (disamakan dengan konfigurasi multer di backend)
export const MAX_IMAGE_MB = 5;

export const ENABLE_ADMIN_REGISTER =
  import.meta.env.VITE_ENABLE_ADMIN_REGISTER !== "false";
