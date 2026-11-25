import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { Alert, Field } from "../components/ui";
import { Icon } from "../components/Icons";
import { CATEGORIES, MAX_IMAGE_MB } from "../constants";
import { fromInputValue, toInputValue } from "../utils/format";

const EMPTY_FORM = { label: "", category: "", deskripsi: "" };

export default function Report() {
  const [step, setStep] = useState("foto"); // foto | info | sukses

  // Langkah 1: foto + hasil AI
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done
  const [manual, setManual] = useState(false);
  const [error, setError] = useState("");
  const [rejected, setRejected] = useState("");
  const [preds, setPreds] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);

  // Langkah 2: informasi temuan
  const [info, setInfo] = useState({ tempat_ditemukan: "", waktu: toInputValue(), kontak_penemu: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!file) { setPreview(""); return undefined; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const showForm = status === "done" || manual;
  const categoryOptions = form.category && !CATEGORIES.includes(form.category)
    ? [...CATEGORIES, form.category]
    : CATEGORIES;

  function onPickFile(e) {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!f) return;
    setError(""); setRejected("");
    if (!f.type.startsWith("image/")) { setError("File harus berupa gambar (jpg, png, atau webp)."); return; }
    if (f.size > MAX_IMAGE_MB * 1024 * 1024) { setError(`Ukuran gambar maksimal ${MAX_IMAGE_MB} MB.`); return; }
    setFile(f);
    setStatus("idle");
    setPreds([]);
    setForm(EMPTY_FORM);
  }

  function applyPrediction(p) {
    setForm({ label: p.label || "", category: p.category || "", deskripsi: p.description || "" });
  }

  async function analyze() {
    setError(""); setRejected(""); setStatus("loading");
    try {
      const res = await api.classify(file);
      if (res.is_rejected) {
        setRejected(res.rejection_reason || "Gambar tidak memenuhi ketentuan.");
        setStatus("idle");
        return;
      }
      const list = Array.isArray(res.predictions) ? res.predictions : [];
      if (list.length === 0) {
        setError("AI tidak mengenali barang pada foto ini. Coba foto lain atau isi data secara manual.");
        setStatus("idle");
        return;
      }
      setPreds(list);
      applyPrediction(list[0]);
      setStatus("done");
    } catch (e) {
      setError(e.message);
      setStatus("idle");
    }
  }

  async function submit(e) {
    e.preventDefault();
    setSubmitError("");
    if (!info.tempat_ditemukan.trim()) { setSubmitError("Tempat ditemukan wajib diisi."); return; }
    if (!info.kontak_penemu.trim()) { setSubmitError("Kontak penemu wajib diisi supaya admin bisa menghubungimu."); return; }
    setSubmitting(true);
    try {
      await api.createFound({
        label: form.label.trim(),
        category: form.category,
        deskripsi: form.deskripsi.trim() || undefined,
        tempat_ditemukan: info.tempat_ditemukan.trim(),
        waktu_ditemukan: fromInputValue(info.waktu),
        kontak_penemu: info.kontak_penemu.trim(),
      });
      setStep("sukses");
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // ---------- Sukses ----------
  if (step === "sukses") {
    return (
      <div className="stack">
        <div className="success-badge"><Icon name="check" size={32} /></div>
        <h1 className="center">Laporan terkirim</h1>
        <p className="lead center">Jangan taruh barang dulu. Tunggu admin menghubungimu lewat kontak yang kamu isi.</p>
        <div className="card stack">
          <h2>Langkah selanjutnya</h2>
          <ol className="steps">
            <li>Admin menghubungimu.</li>
            <li>Antar barang ke ruang penitipan yang diarahkan.</li>
            <li>Barang siap diambil oleh pemiliknya.</li>
          </ol>
        </div>
        <Link to="/" className="btn btn-primary">Kembali ke Beranda</Link>
      </div>
    );
  }

  // ---------- Langkah 2 ----------
  if (step === "info") {
    return (
      <form className="stack" onSubmit={submit} noValidate>
        <div>
          <p className="step-label">Langkah 2 dari 2</p>
          <h1>Isi informasi temuan</h1>
        </div>

        <div className="card item-main">
          <div className="tile"><Icon name="box" /></div>
          <div>
            <p className="item-title">{form.label}</p>
            <p className="muted">{form.category}</p>
          </div>
        </div>

        <Field label="Tempat ditemukan (wajib)" id="tempat">
          <input id="tempat" value={info.tempat_ditemukan} maxLength={255} autoComplete="off"
            onChange={(e) => setInfo({ ...info, tempat_ditemukan: e.target.value })} placeholder="Contoh: Perpus Lt. 2" />
        </Field>
        <Field label="Waktu ditemukan" id="waktu">
          <input id="waktu" type="datetime-local" value={info.waktu}
            onChange={(e) => setInfo({ ...info, waktu: e.target.value })} />
        </Field>
        <Field label="Kontak penemu (wajib)" id="kontak"
          hint="Admin akan menghubungimu untuk menentukan ruang penitipan. Kontak tidak ditampilkan ke publik.">
          <input id="kontak" value={info.kontak_penemu} maxLength={100} inputMode="tel"
            onChange={(e) => setInfo({ ...info, kontak_penemu: e.target.value })} placeholder="No. WhatsApp, contoh: 08123456789 (Budi)" />
        </Field>

        <Alert>{submitError}</Alert>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Mengirim…" : "Kirim Laporan"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => setStep("foto")} disabled={submitting}>Kembali</button>
      </form>
    );
  }

  // ---------- Langkah 1 ----------
  return (
    <div className="stack">
      <div>
        <p className="step-label">Langkah 1 dari 2</p>
        <h1>Foto &amp; hasil analisis AI</h1>
      </div>

      <label className="dropzone" htmlFor="foto">
        {preview
          ? <img src={preview} alt="Pratinjau foto barang" />
          : <span className="stack center" style={{ alignItems: "center", gap: 6 }}>
              <Icon name="image" size={32} />
              <span>Ketuk untuk memilih atau mengambil foto barang</span>
              <span className="hint">Maksimal {MAX_IMAGE_MB} MB</span>
            </span>}
        <input id="foto" className="sr-only" type="file" accept="image/*" onChange={onPickFile} />
      </label>
      <p className="hint">Foto hanya dipakai untuk analisis AI dan tidak disimpan.</p>

      <Alert>{error}</Alert>
      {rejected && (
        <div role="alert" className="alert alert-error">
          <strong>Gambar ditolak.</strong> {rejected} Unggah foto lain.
        </div>
      )}

      {file && status !== "done" && (
        <button type="button" className="btn btn-primary" onClick={analyze} disabled={status === "loading"}>
          {status === "loading" ? "Menganalisis foto…" : "Analisis dengan AI"}
        </button>
      )}
      {!showForm && status !== "loading" && (
        <button type="button" className="link-center" style={{ background: "none", border: 0, cursor: "pointer" }}
          onClick={() => setManual(true)}>
          Isi manual tanpa foto
        </button>
      )}

      {showForm && (
        <div className="card stack">
          <p className="muted" style={{ fontWeight: 700, color: "var(--primary)" }}>
            {status === "done" ? "Hasil analisis AI · periksa dan ubah jika salah" : "Isi data barang"}
          </p>

          {preds.length > 1 && (
            <div className="stack" style={{ gap: 6 }}>
              <span className="hint">Saran lain dari AI:</span>
              <div className="chips" style={{ margin: 0, padding: 0 }}>
                {preds.map((p, i) => (
                  <button key={i} type="button" className={`chip${p.label === form.label ? " on" : ""}`}
                    onClick={() => applyPrediction(p)}>{p.label}</button>
                ))}
              </div>
            </div>
          )}

          <Field label="Nama barang" id="label">
            <input id="label" value={form.label} maxLength={100}
              onChange={(e) => setForm({ ...form, label: e.target.value })} />
          </Field>
          <Field label="Kategori" id="kategori">
            <select id="kategori" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Pilih kategori</option>
              {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Deskripsi" id="deskripsi">
            <textarea id="deskripsi" value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} />
          </Field>
        </div>
      )}

      {showForm && (
        <button type="button" className="btn btn-primary" disabled={!form.label.trim() || !form.category}
          onClick={() => setStep("info")}>
          Lanjut isi informasi
        </button>
      )}
    </div>
  );
}
