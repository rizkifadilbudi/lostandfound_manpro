from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool
from PIL import Image
from dotenv import load_dotenv
import google.generativeai as genai
import io
import os
import json
import re

from pathlib import Path

# Load API key dari file .env di direktori yang sama dengan main.py
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY tidak ditemukan! Isi dulu di file .env")

genai.configure(api_key=GEMINI_API_KEY)

gemini = genai.GenerativeModel(
    model_name="gemini-3.5-flash-lite",
    generation_config={
        "response_mime_type": "application/json",
        "temperature": 0.1,
    }
)

app = FastAPI(title="Lost & Found AI Service")

# CORS — izinkan backend dan frontend memanggil AI service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

PROMPT = """
Kamu adalah asisten AI untuk fitur Laporan Kehilangan dan Moderasi Konten pada aplikasi Lost & Found (Barang Hilang & Temuan). Analisis gambar yang diberikan secara objektif dan ikuti dua tahap berikut:

TAHAP 1: EVALUASI KEAMANAN & RELEVANSI GAMBAR
Evaluasi apakah gambar dan benda di dalamnya layak serta aman ditampilkan ke publik.
Tentukan status `is_safe` menjadi `false` jika gambar atau benda di dalamnya memenuhi SALAH SATU kriteria pelanggaran berikut:
1. "PORNOGRAPHY": Mengandung pornografi, ketelanjangan, atau konten seksual eksplisit (NSFW).
2. "GORE_VIOLENCE": Mengandung kekerasan ekstrem, darah, luka parah, senjata berbahaya/ilegal (senjata api, senjata tajam berbahaya), atau gore.
3. "SARA_HATE_SPEECH": Mengandung ujaran kebencian, simbol terlarang, atau unsur SARA (Suku, Agama, Ras, dan Antargolongan) yang menghina/provokatif.
4. "SPAM_IRRELEVANT": Berupa iklan promosi, meme tidak relevan, selfie tanpa objek barang, tangkapan layar (screenshot) acak, gambar gelap/buram total, atau barang yang tidak layak dipublikasikan.

Jika gambar lolos semua pemeriksaan di atas dan menampilkan objek barang yang jelas serta aman, tentukan status `is_safe` menjadi `true` dengan `violation_category` bernilai `"NONE"`.

TAHAP 2: IDENTIFIKASI OBJEK & STATUS PERSETUJUAN BENDA
Identifikasi benda yang terlihat di dalam gambar (jika gambar masih dapat dikenali secara visual, meskipun melanggar aturan; kosongkan array `objects` menjadi `[]` HANYA jika gambar gelap/buram total atau murni konten NSFW/gore tanpa benda yang relevan).

Aturan pengisian setiap item di dalam array `objects`:
- `label`: Nama spesifik benda dalam Bahasa Indonesia (contoh: "Dompet Kulit Lipat", "Pisau Lipat", "Meme Teks").
- `category`: Pilih SATU yang paling sesuai: "Elektronik", "Dompet & Kartu", "Kunci", "Dokumen", "Perhiasan & Aksesoris", "Tas & Pakaian", atau "Lainnya".
- `confidence`: Tingkat keyakinan deteksi berupa angka desimal antara 0.0 hingga 1.0.
- `description`: Deskripsi visual mendetail mengenai jenis barang, warna dominan, bentuk/ukuran, merek/logo (jika terlihat), serta kelengkapan yang menempel. Catatan: Jangan menuliskan nomor sensitif secara lengkap seperti NIK, nomor rekening, atau nomor kartu jika terlihat di gambar.
- `is_rejected`: Bernilai `true` jika benda ini merupakan penyebab pelanggaran (atau jika `moderation.is_safe` bernilai `false`), dan bernilai `false` jika benda aman diterima.
- `rejection_reason`: 
  - Jika `is_rejected` bernilai `true`: Wajib isi dengan penjelasan spesifik dalam Bahasa Indonesia mengapa benda ini ditolak (contoh: "Benda termasuk kategori senjata tajam yang dilarang ditampilkan di publik" atau "Objek berupa tangkapan layar meme dan bukan barang fisik yang hilang").
  - Jika `is_rejected` bernilai `false`: Isi dengan nilai `null`.

ATURAN OUTPUT:
Jawab HANYA dengan format JSON valid di bawah ini. Dilarang menambahkan teks pengantar, penjelasan di luar JSON, markdown, atau blok kode (```json). Isi nilai berdasarkan hasil analisismu:

{
  "moderation": {
    "is_safe": <boolean: isi true jika aman, atau false jika melanggar>,
    "violation_category": "<string: isi 'NONE' jika true, atau pilih salah satu dari 'PORNOGRAPHY' | 'GORE_VIOLENCE' | 'SARA_HATE_SPEECH' | 'SPAM_IRRELEVANT' jika false>",
    "reason": "<string: ringkasan keseluruhan alasan gambar diterima atau ditolak dalam Bahasa Indonesia>"
  },
  "objects": [
    {
      "label": "<string>",
      "category": "<string>",
      "confidence": <float>,
      "description": "<string>",
      "is_rejected": <boolean: true jika benda ditolak, false jika diterima>,
      "rejection_reason": "<string atau null: alasan spesifik benda ditolak jika is_rejected true, atau null jika false>"
    }
  ]
}
"""


@app.get("/")
def read_root():
    return {
        "status": "AI Service Running",
        "model": "Google Gemini Vision (gemini-3.5-flash-lite)",
        "description": "Deteksi objek menggunakan Gemini Vision AI"
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Validasi tipe file
    content_type = file.content_type or ""
    if not content_type.startswith("image/"):
        filename = file.filename or ""
        if not any(filename.lower().endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"]):
            raise HTTPException(
                status_code=400,
                detail="File harus berupa gambar (jpg, jpeg, png, gif, bmp, webp)"
            )

    # Baca file gambar
    image_bytes = await file.read()

    try:
        image = Image.open(io.BytesIO(image_bytes))
        # Pastikan mode RGB agar kompatibel dengan Gemini
        if image.mode != "RGB":
            image = image.convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File tidak dapat dibaca sebagai gambar: {str(e)}")

    # Kirim ke Gemini Vision
    try:
        response = await run_in_threadpool(gemini.generate_content, [PROMPT, image])
        
        # Cek apakah Gemini memblokir gambar secara internal karena konten terlalu ekstrem
        if not response.parts:
            return {
                "success": False,
                "is_rejected": True,
                "rejection_reason": "Gambar diblokir otomatis oleh sistem keamanan karena mengandung konten sensitif atau berbahaya.",
                "label": None,
                "category": None,
                "description": None,
                "confidence": None,
                "predictions": None,
                "moderation": None,
            }

        raw_text = response.text.strip()
        raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
        raw_text = re.sub(r"\s*```$", "", raw_text)

        result = json.loads(raw_text)
        
        # Ambil data moderasi dan daftar objek
        moderation = result.get("moderation", {
            "is_safe": True,
            "violation_category": "NONE",
            "reason": "Gambar aman."
        })
        objects = result.get("objects", [])

        # Urutkan dari confidence tertinggi
        objects.sort(key=lambda x: x.get("confidence", 0), reverse=True)

        # Cek apakah ditolak (is_safe == False atau ada objek dengan is_rejected == True)
        is_safe = moderation.get("is_safe", True)
        rejected_obj = next((obj for obj in objects if obj.get("is_rejected") is True), None)

        if not is_safe or rejected_obj is not None:
            rejection_reason = (
                rejected_obj.get("rejection_reason")
                if rejected_obj and rejected_obj.get("rejection_reason")
                else moderation.get("reason", "Gambar atau objek tidak diizinkan.")
            )
            return {
                "success": False,
                "is_rejected": True,
                "rejection_reason": rejection_reason,
                "label": None,
                "category": None,
                "description": None,
                "confidence": None,
                "predictions": None,
                "moderation": None,
            }

        # Jika aman dan tidak ditolak, kembalikan hasil prediksi normal
        return {
            "success": True,
            "is_rejected": False,
            "rejection_reason": None,
            "moderation": moderation,
            "count": len(objects),
            "predictions": objects
        }

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Gemini mengembalikan format yang tidak valid")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini inference gagal: {str(e)}")
