# 🤖 Lost & Found — AI Vision Service

Microservice mandiri berbasis **Python FastAPI** dan **Google Gemini Vision AI** yang bertugas menganalisis gambar laporan barang hilang dan temuan, mengidentifikasi objek barang secara otomatis, serta melakukan moderasi konten.

---

## 📋 Fitur Utama AI Service

1. **Deteksi & Klasifikasi Objek Otomatis**:
   - Menghasilkan `label` spesifik (contoh: *"Dompet Kulit Lipat"*, *"Kunci Motor Honda"*).
   - Menentukan `category` standar (*Elektronik*, *Dompet & Kartu*, *Kunci*, *Dokumen*, *Tas & Pakaian*, dll.).
   - Memberikan tingkat keyakinan (*confidence score*) dan deskripsi visual detail benda.

2. **Moderasi Konten & Deteksi Pelanggaran**:
   - Menolak gambar yang melanggar aturan publikasi:
     - `PORNOGRAPHY` (konten seksual / NSFW)
     - `GORE_VIOLENCE` (kekerasan, senjata tajam berbahaya, senjata api, darah)
     - `SARA_HATE_SPEECH` (ujaran kebencian, simbol terlarang)
     - `SPAM_IRRELEVANT` (gambar kosong/polos, selfie tanpa barang, screenshot acak, meme)

3. **Format Khusus Penolakan (`is_rejected: true`)**:
   - Jika gambar tidak layak, AI Service langsung mengembalikan status `is_rejected: true` dan penjelasan `rejection_reason`, dengan data barang dinolkan (`null`).

---

## 🛠️ Prasyarat Sistem

* **Python 3.10** atau lebih baru
* **Google Gemini API Key** (Dapatkan gratis di [Google AI Studio](https://aistudio.google.com/))

---

## 🚀 Panduan Instalasi & Menjalankan AI Service

Ikuti langkah-langkah berikut di terminal:

### 1. Masuk ke Folder `ai-service`
```bash
cd ai-service
```

### 2. Buat Virtual Environment Python
Disarankan menggunakan virtual environment agar dependensi terisolasi dengan rapi:
* **Windows (PowerShell / CMD):**
  ```powershell
  python -m venv venv
  ```
* **macOS / Linux:**
  ```bash
  python3 -m venv venv
  ```

### 3. Aktifkan Virtual Environment
* **Windows PowerShell:**
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
  *(Jika muncul error script execution policy di PowerShell, jalankan: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` lalu ulangi)*
* **Windows Command Prompt (CMD):**
  ```cmd
  venv\Scripts\activate.bat
  ```
* **macOS / Linux:**
  ```bash
  source venv/bin/activate
  ```
*(Setelah aktif, di awal baris terminal akan muncul tanda `(venv)`)*

### 4. Pasang Dependensi Package
```bash
pip install -r requirement.txt
```

### 5. Konfigurasi Environment File (`.env`)
Salin file template `.env.example` menjadi `.env`:
* **Windows (PowerShell):**
  ```powershell
  Copy-Item .env.example .env
  ```
* **Linux / macOS:**
  ```bash
  cp .env.example .env
  ```

Buka file `.env` dan masukkan API Key Google Gemini Anda:
```env
GEMINI_API_KEY=masukkan_api_key_gemini_anda_disini
```

### 6. Jalankan Server AI Service
```bash
uvicorn main:app --reload --port 8000
```

Jika berhasil, terminal akan menampilkan output:
```text
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Application startup complete.
```

---

## 🧪 Cara Pengujian / Testing

### A. Melalui Web Browser (Swagger UI / OpenAPI)
Buka dokumentasi interaktif bawaan FastAPI di browser:
👉 **`http://localhost:8000/docs`**
* Anda dapat langsung menguji endpoint `/predict` dengan menekan tombol **Try it out** dan mengunggah gambar.

### B. Cek Status Server (Health Check)
* **Method:** `GET`
* **URL:** `http://localhost:8000/`
* **Response:**
  ```json
  {
    "status": "AI Service Running",
    "model": "Google Gemini Vision (gemini-3.5-flash-lite)",
    "description": "Deteksi objek menggunakan Gemini Vision AI"
  }
  ```

### C. Testing Prediksi via Postman
* **Method:** `POST`
* **URL:** `http://localhost:8000/predict`
* **Body:** Pilih **`form-data`**
  * Key: `file` (Ubah dropdown dari *Text* menjadi **`File`**)
  * Value: Pilih file gambar dari komputer Anda

---

## 📦 Contoh Respons API

### 1. Contoh Gambar Aman & Diterima:
```json
{
  "success": true,
  "is_rejected": false,
  "rejection_reason": null,
  "moderation": {
    "is_safe": true,
    "violation_category": "NONE",
    "reason": "Gambar aman dan menampilkan objek barang fisik yang jelas."
  },
  "count": 1,
  "predictions": [
    {
      "label": "Dompet Kulit Lipat",
      "category": "Dompet & Kartu",
      "confidence": 0.95,
      "description": "Dompet pria berbahan kulit warna coklat tua dengan jahitan rapi di tepinya.",
      "is_rejected": false,
      "rejection_reason": null
    }
  ]
}
```

### 2. Contoh Gambar Ditolak (`is_rejected: true`):
```json
{
  "success": false,
  "is_rejected": true,
  "rejection_reason": "Gambar hanya berupa warna solid atau tidak menampilkan objek barang fisik yang jelas.",
  "label": null,
  "category": null,
  "description": null,
  "confidence": null,
  "predictions": null,
  "moderation": null
}
```
