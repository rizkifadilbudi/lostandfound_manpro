# Lost & Found — Frontend

React + Vite + React Router. Mengikuti backend di folder `backend/` dan desain UI/UX (palet teal & koral).

## Menjalankan

```bash
cd frontend
cp .env.example .env      # sesuaikan VITE_API_URL jika backend tidak di localhost:3000
npm install
npm run dev               # http://localhost:5173
```

Backend (`backend/`) dan AI service (`ai-service/`) harus jalan lebih dulu. CORS di backend sudah terbuka.

Build produksi: `npm run build` (hasil di `dist/`). Karena memakai BrowserRouter, server hosting
harus mengarahkan semua path ke `index.html` (SPA fallback).

## Halaman

| Path | Halaman | Endpoint backend |
|---|---|---|
| `/` | Beranda | `GET /api/founds` |
| `/katalog` | Katalog + search + filter kategori | `GET /api/founds?search=&category=` |
| `/barang/:id` | Detail barang | `GET /api/founds/:id` |
| `/ruang-penitipan` | Daftar ruang penitipan | — (data statis) |
| `/lapor` | Lapor temuan: foto, hasil AI, informasi, sukses | `POST /api/founds/classify`, `POST /api/founds` |
| `/admin/login` | Login admin | `POST /api/admin/auth/login` |
| `/admin/daftar` | Daftar admin | `POST /api/admin/auth/register` |
| `/admin` | Daftar barang (cari, filter, hapus) | `GET/DELETE /api/admin/founds` |
| `/admin/barang/baru` | Tambah barang | `POST /api/admin/founds` |
| `/admin/barang/:id/edit` | Edit barang | `GET/PUT /api/admin/founds/:id` |
| `/admin/ruang` | Ruang penitipan (tampilan admin) | — |

Token admin disimpan di `localStorage` (`admin_token`). Jika API admin membalas 401/403,
token dihapus dan admin diarahkan ke `/admin/login`.

## Yang disesuaikan dengan backend saat ini

- **Tidak ada status verifikasi.** Tab Dilaporkan/Dititipkan/Diambil dan tombol "Tandai dititipkan"
  di mockup belum bisa dibuat. Admin memakai filter kategori, Edit, dan Hapus.
- **Ruang penitipan tidak ada di database.** Daftarnya ada di `src/data/storageRooms.js`
  (isinya contoh, ganti dengan data asli). Detail barang hanya mengarahkan ke daftar itu.
- **Foto tidak disimpan.** Foto hanya dikirim ke AI, jadi kartu barang memakai ikon.
- **Batas foto 3 MB**, sesuai nilai di kode backend (komentar dan dokumentasinya menulis 5 MB).
  Ubah `MAX_IMAGE_MB` di `src/constants.js` bila backend diubah.
- **Kontak penemu wajib** di form lapor (validasi sisi klien), dan tidak ditampilkan di halaman publik.
- **Tidak ada login/registrasi user biasa**, karena backend hanya punya akun admin.

## Catatan keamanan untuk backend

- `GET /api/founds` dan `GET /api/founds/:id` masih mengirim `kontak_penemu` ke publik. Frontend tidak
  menampilkannya, tetapi siapa pun bisa melihatnya lewat respons API. Sebaiknya hilangkan field itu dari respons publik.
- `POST /api/admin/auth/register` tidak dilindungi, sehingga siapa saja bisa membuat akun admin.
  Lindungi dengan token admin atau kode undangan. Untuk menyembunyikan link daftar di login,
  isi `VITE_ENABLE_ADMIN_REGISTER=false`.

## Struktur

```
src/
  api/client.js        panggilan API + penanganan error
  auth.js              token admin
  constants.js         kategori, batas foto
  components/          Icons, ui (Field, Alert, ItemCard, dll.), Layouts
  pages/               satu file per halaman
  data/storageRooms.js data ruang penitipan (statis)
  styles.css           palet dan gaya
```
