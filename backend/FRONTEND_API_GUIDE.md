# 📖 Panduan Integrasi Frontend — Lost & Found API

Dokumentasi ini dibuat khusus untuk developer **Frontend (React, Vue, Next.js, Flutter, Android, dll.)** agar dapat mengintegrasikan antarmuka pengguna dengan Backend Lost & Found secara cepat, mudah, dan tepat.

---

## 🌐 1. Konfigurasi Awal

* **Base URL Backend:** `http://localhost:3000`
* **CORS:** Sudah diaktifkan (`allow all origins`), Anda dapat melakukan request dari `localhost:5173`, `localhost:3000`, atau port frontend lainnya tanpa kendala CORS.
* **Content-Type Standar:** `application/json` (kecuali endpoint upload gambar yang menggunakan `multipart/form-data`).

---

## 🏗️ 2. TypeScript Interfaces / Model Data

Gunakan interface ini pada project frontend Anda (TypeScript/Dart):

```typescript
// Model Barang Temuan (Found Item)
export interface FoundItem {
  id: number;
  label: string;              // Nama barang, misal: "Dompet Kulit Lipat"
  category: string;           // Kategori, misal: "Dompet & Kartu"
  deskripsi: string | null;   // Ciri-ciri visual
  waktu_ditemukan: string;    // ISO Date string
  tempat_ditemukan: string;   // Lokasi ditemukan
  kontak_penemu: string | null; // No. WA / Nama penemu (Opsional)
  created_at: string;
}

// Respons Klasifikasi AI
export interface ClassifyResponse {
  success: boolean;
  is_rejected: boolean;
  rejection_reason: string | null;
  moderation?: {
    is_safe: boolean;
    violation_category: string;
    reason: string;
  } | null;
  count?: number;
  predictions?: Array<{
    label: string;
    category: string;
    confidence: number;
    description: string;
    is_rejected: boolean;
    rejection_reason: string | null;
  }> | null;
}
```

---

## 🔄 3. Alur Kerja Utama Frontend (*Core Workflows*)

### Alur 1: Upload Foto Barang & Auto-fill Form dengan AI
Ketika user memilih gambar di form pelaporan, frontend mengirimkan gambar ke endpoint AI `/classify` untuk mendeteksi barang otomatis dan memeriksa apakah gambar aman.

```javascript
import axios from "axios";

async function handleImageUpload(file) {
  // 1. Validasi ukuran file di sisi frontend (maks 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert("Ukuran gambar maksimal 5 MB!");
    return;
  }

  const formData = new FormData();
  formData.append("image", file); // Key wajib bernama 'image'

  try {
    const response = await axios.post("http://localhost:3000/api/founds/classify", formData);
    const data = response.data;

    // 2. Cek apakah gambar ditolak oleh AI (NSFW/Senjata/Spam/Gambar Polos)
    if (data.is_rejected) {
      alert(`Gambar Ditolak: ${data.rejection_reason}`);
      // Kosongkan file input & cegah user melanjutkan
      return;
    }

    // 3. Jika lolos, ambil rekomendasi deteksi pertama untuk Auto-Fill form
    if (data.predictions && data.predictions.length > 0) {
      const bestMatch = data.predictions[0];
      
      // Auto-fill ke state form input Anda:
      setFormValues({
        label: bestMatch.label,             // Contoh: "Kunci Motor Honda"
        category: bestMatch.category,       // Contoh: "Kunci"
        deskripsi: bestMatch.description,   // Contoh: "Kunci motor dengan gantungan pita merah"
      });
    }
  } catch (error) {
    if (error.response?.status === 429) {
      alert("Terlalu sering melakukan scan. Tunggu 1 menit sebelum mencoba lagi.");
    } else {
      alert(error.response?.data?.error || "Gagal memproses gambar.");
    }
  }
}
```

---

### Alur 2: Simpan Laporan Barang Temuan
Setelah form selesai diisi (baik lewat auto-fill AI maupun diedit manual oleh user):

* **Endpoint:** `POST /api/founds`
* **Headers:** `Content-Type: application/json`

```javascript
async function submitFoundReport(formState) {
  /*
  Payload yang dikirim:
  {
    "label": "Dompet Kulit Lipat",        // Wajib
    "category": "Dompet & Kartu",        // Wajib
    "tempat_ditemukan": "Perpus Lt. 2",  // Wajib
    "deskripsi": "Warna coklat tua...",  // Opsional
    "waktu_ditemukan": "2026-11-16 14:00:00", // Opsional (default: waktu sekarang)
    "kontak_penemu": "08123456789 (Budi)"     // Opsional
  }
  */
  try {
    const res = await axios.post("http://localhost:3000/api/founds", formState);
    alert("Laporan berhasil diterbitkan!");
    console.log("Data tersimpan:", res.data.data);
  } catch (err) {
    alert(err.response?.data?.message || "Gagal menyimpan laporan.");
  }
}
```

---

### Alur 3: Menampilkan Katalog Barang Temuan (Dengan Filter & Search)
Menampilkan daftar barang temuan publik dengan dukungan pencarian kata kunci dan filter kategori.

* **Endpoint:** `GET /api/founds`
* **Query Params Opsional:**
  * `search` : Mencari teks pada label, kategori, deskripsi, atau tempat ditemukan.
  * `category` : Filter kategori persis (contoh: `Elektronik`, `Kunci`, `Dompet & Kartu`).

```javascript
async function fetchFounds(searchTerm = "", selectedCategory = "") {
  try {
    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (selectedCategory) params.category = selectedCategory;

    const res = await axios.get("http://localhost:3000/api/founds", { params });
    // Data list barang ada di: res.data.data (array of FoundItem)
    setItems(res.data.data);
  } catch (err) {
    console.error("Gagal mengambil daftar barang:", err);
  }
}
```

---

### Alur 4: Autentikasi Admin & Akses Dashboard Admin
Untuk halaman Dashboard Admin, seluruh request ke `/api/admin/founds/*` harus menyertakan **JWT Bearer Token**.

#### A. Login Admin
```javascript
async function loginAdmin(username, password) {
  try {
    const res = await axios.post("http://localhost:3000/api/admin/auth/login", {
      nama_admin: username,
      password: password,
    });

    // Simpan token ke localStorage
    const token = res.data.token;
    localStorage.setItem("admin_token", token);
    
    // Redirect ke dashboard admin
    window.location.href = "/admin/dashboard";
  } catch (err) {
    alert(err.response?.data?.message || "Username atau password salah!");
  }
}
```

#### B. Setup Axios Interceptor untuk Request Admin
Disarankan membuat Axios instance khusus untuk request admin agar token terkirim otomatis di header:

```javascript
// apiAdmin.js
const apiAdmin = axios.create({
  baseURL: "http://localhost:3000/api/admin",
});

// Pasang header Authorization secara otomatis
apiAdmin.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tangani jika token kadaluwarsa (401/403)
apiAdmin.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      alert("Sesi login Anda telah habis. Silakan login kembali.");
      localStorage.removeItem("admin_token");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

export default apiAdmin;
```

#### C. Operasi CRUD Admin
```javascript
// 1. Ambil semua barang (termasuk yang perlu diawasi)
const resAll = await apiAdmin.get("/founds");

// 2. Tambah data barang langsung oleh admin
await apiAdmin.post("/founds", {
  label: "Laptop Asus ROG",
  category: "Elektronik",
  tempat_ditemukan: "Lab Komputer 3",
  kontak_penemu: "Pak Satpam Pos A"
});

// 3. Edit / Update data barang
await apiAdmin.put(`/founds/${itemId}`, {
  tempat_ditemukan: "Sudah dipindahkan ke Ruang Kemahasiswaan"
});

// 4. Hapus data barang
await apiAdmin.delete(`/founds/${itemId}`);
```

---

## ⚠️ 4. Penanganan Status Kode HTTP (Error Handling)

| Status Code | Kondisi Penyebab | Tindakan di Frontend |
| :---: | :--- | :--- |
| **`200 / 201`** | Sukses request / data berhasil dibuat | Render UI data seperti biasa. |
| **`400`** | File > 5MB atau form tidak lengkap | Tampilkan pesan error dari `error.response.data.message` atau `error.response.data.error`. |
| **`401`** | Header token tidak ditemukan | Alihkan (*redirect*) ke halaman Login Admin. |
| **`403`** | Token JWT palsu atau kedaluwarsa | Hapus token dari `localStorage` dan arahkan ke Login. |
| **`404`** | ID barang tidak ditemukan di database | Tampilkan tampilan *"Barang tidak ditemukan / 404"*. |
| **`429`** | Melebihi rate limit 10 request/menit | Tampilkan pesan: *"Terlalu banyak permintaan scan, silakan tunggu 1 menit"*. |
| **`500`** | Masalah pada database / AI service | Tampilkan modal error server umum. |
