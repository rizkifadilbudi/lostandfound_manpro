# 🔍 Lost & Found API with AI Vision

Aplikasi pelaporan dan manajemen barang hilang & temuan (**Lost & Found**) berbasis **RESTful API** yang terintegrasi dengan **AI Vision Service** untuk klasifikasi objek otomatis dan moderasi konten.

> 💡 **Untuk Developer Frontend:** Lihat panduan integrasi lengkap dan contoh kode Fetch/Axios di **[FRONTEND_API_GUIDE.md](FRONTEND_API_GUIDE.md)**.

---

## 📌 Deskripsi Singkat Projek

Proyek ini terdiri dari dua layanan utama yang bekerja bersamaan:

1. **AI Service (`ai-service/`)**:
   - Dibangun menggunakan **Python FastAPI** dan **Google Gemini 3.5 Flash Lite**.
   - Berfungsi menganalisis foto barang temuan, mendeteksi nama dan kategori barang, serta melakukan **moderasi otomatis** (menolak gambar yang mengandung pornografi, kekerasan/senjata, ujaran kebencian, foto buram/polos/spam).
   - Mengembalikan status `is_rejected: true` beserta alasan penolakan jika gambar tidak memenuhi kriteria.

2. **Backend API (`backend/`)**:
   - Dibangun menggunakan **Node.js, Express.js, Sequelize ORM, dan PostgreSQL**.
   - Menyediakan endpoint CRUD barang temuan (`founds`), autentikasi Admin dengan **JWT & Bcrypt**, fitur keamanan **Rate Limiting** (maksimal 10 request/menit untuk AI), serta pembatasan upload file gambar (maksimal 5 MB).
   - Memiliki fitur **migrasi database otomatis** (`npm run migrate`).

---

## 📂 Struktur Direktori

```text
lostandfound/
├── ai-service/             # Microservice AI Vision (FastAPI + Google Gemini)
│   ├── main.py             # Script utama FastAPI & integrasi Gemini AI
│   ├── requirement.txt     # Dependensi library Python
│   ├── .env.example        # Template konfigurasi environment AI
│   └── .env                # File API Key Gemini (tidak di-commit)
│
├── backend/                # Server Backend REST API (Express.js + Sequelize)
│   ├── config/             # Konfigurasi database PostgreSQL (Sequelize)
│   ├── controllers/        # Logika handler request (Found & Admin)
│   ├── database/           # Skema SQL & script migrasi otomatis
│   ├── middlewares/        # Auth JWT, Logger, Rate Limiter, Validasi
│   ├── models/             # Sequelize Models (Found & Admin)
│   ├── routes/             # Routing API (founds & admin)
│   ├── .env.example        # Template konfigurasi environment backend
│   ├── .env                # Kredensial DB & JWT (tidak di-commit)
│   └── server.js           # Entry point backend Express
│
├── .gitignore              # Konfigurasi file yang diabaikan Git
└── README.md               # Dokumentasi utama proyek
```

---

## 🛠️ Prasyarat Sistem

Sebelum menginstal, pastikan komputer Anda telah terpasang:
* **Node.js** (versi 18 atau lebih baru)
* **Python** (versi 3.10 atau lebih baru)
* **PostgreSQL** (versi 14 atau lebih baru)
* **Google Gemini API Key** (didapatkan gratis di [Google AI Studio](https://aistudio.google.com/))

---

## 🚀 Panduan Instalasi & Menjalankan Projek

Jalankan kedua layanan ini di **dua terminal terpisah**:

### 1. Setup & Menjalankan AI Service (Terminal 1)

1. Buka terminal dan masuk ke folder `ai-service`:
   ```bash
   cd ai-service
   ```

2. Buat dan aktifkan Virtual Environment Python:
   * **Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   * **Linux / macOS:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Pasang dependensi library:
   ```bash
   pip install -r requirement.txt
   ```

4. Buat file `.env` di dalam folder `ai-service/`:
   ```env
   GEMINI_API_KEY=masukkan_api_key_gemini_anda_disini
   ```

5. Jalankan server AI Service:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   > Layanan AI Service akan aktif di `http://localhost:8000`.

---

### 2. Setup & Menjalankan Backend (Terminal 2)

1. Buka terminal baru dan masuk ke folder `backend`:
   ```bash
   cd backend
   ```

2. Pasang dependensi Node.js:
   ```bash
   npm install
   ```

3. Buat file `.env` di dalam folder `backend/`:
   ```env
   PORT=3000
   AI_SERVICE_URL=http://localhost:8000/predict

   # Kredensial PostgreSQL
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=password_postgres_anda
   DB_NAME=found_reports

   # Secret Key JWT Admin
   JWT_SECRET=rahasia_jwt_super_aman_2026
   ```

4. Jalankan migrasi database (membuat database & tabel otomatis):
   ```bash
   npm run migrate
   ```

5. Jalankan server Backend:
   ```bash
   npm start
   ```
   > Layanan Backend API akan aktif di `http://localhost:3000`.

---

## 📋 Ringkasan Endpoint API

### 👤 Pengguna Publik / User
| Method | Endpoint | Keterangan |
| :--- | :--- | :--- |
| `POST` | `/api/founds/classify` | Upload gambar untuk dianalisis oleh AI *(Limit 10 req/menit & maks 5 MB)* |
| `POST` | `/api/founds` | Menyimpan laporan barang temuan baru |
| `GET` | `/api/founds` | Melihat semua barang temuan *(Mendukung `?search=...` & `?category=...`)* |
| `GET` | `/api/founds/:id` | Melihat detail satu barang temuan berdasarkan ID |

### 🛡️ Administrator (Wajib Header `Authorization: Bearer <TOKEN>`)
| Method | Endpoint | Keterangan |
| :--- | :--- | :--- |
| `POST` | `/api/admin/auth/register` | Mendaftarkan akun admin baru *(password di-hash)* |
| `POST` | `/api/admin/auth/login` | Login admin untuk mendapatkan token JWT |
| `GET` | `/api/admin/founds` | Admin melihat seluruh data barang temuan |
| `GET` | `/api/admin/founds/:id` | Admin melihat detail barang temuan |
| `POST` | `/api/admin/founds` | Admin menambahkan data barang secara manual |
| `PUT` | `/api/admin/founds/:id` | Admin memperbarui data barang temuan |
| `DELETE` | `/api/admin/founds/:id` | Admin menghapus data barang temuan |

---

## 🛡️ Format Penolakan AI (`is_rejected: true`)

Jika gambar yang diunggah pengguna tidak layak atau tidak relevan, sistem secara otomatis mengembalikan respons khusus penolakan:

```json
{
  "success": false,
  "is_rejected": true,
  "rejection_reason": "Gambar hanya berupa warna solid atau tidak menampilkan objek barang fisik yang jelas.",
  "label": null,
  "category": null,
  "deskripsi": null,
  "predictions": null,
  "data": null
}
```
