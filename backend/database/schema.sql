-- Schema database found_reports

-- 1. Tabel Admins (Menyimpan akun administrator dengan password tersamar/hash)
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    nama_admin VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Founds (Menyimpan informasi barang-barang yang ditemukan)
CREATE TABLE IF NOT EXISTS founds (
    id SERIAL PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    waktu_ditemukan TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tempat_ditemukan VARCHAR(255) NOT NULL,
    lokasi_penitipan VARCHAR(255),
    kontak_penemu VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
