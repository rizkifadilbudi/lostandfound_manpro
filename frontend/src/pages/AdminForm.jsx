import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminApi } from "../api/client";
import { Alert, Field, Loading, SubHeader } from "../components/ui";
import { CATEGORIES } from "../constants";
import { fromInputValue, toInputValue } from "../utils/format";

const EMPTY = { label: "", category: "", deskripsi: "", tempat_ditemukan: "", lokasi_penitipan: "", waktu: toInputValue(), kontak_penemu: "" };

export default function AdminForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const nav = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(editing);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editing) return undefined;
    let off = false;
    adminApi.getFound(id)
      .then((r) => {
        if (off) return;
        const d = r.data;
        setForm({
          label: d.label || "", category: d.category || "", deskripsi: d.deskripsi || "",
          tempat_ditemukan: d.tempat_ditemukan || "", lokasi_penitipan: d.lokasi_penitipan || "", waktu: toInputValue(d.waktu_ditemukan),
          kontak_penemu: d.kontak_penemu || "",
        });
        setLoading(false);
      })
      .catch((e) => { if (!off) { setError(e.message); setLoading(false); } });
    return () => { off = true; };
  }, [id, editing]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const options = form.category && !CATEGORIES.includes(form.category) ? [...CATEGORIES, form.category] : CATEGORIES;

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.label.trim() || !form.category || !form.tempat_ditemukan.trim()) {
      setError("Nama barang, kategori, dan tempat ditemukan wajib diisi.");
      return;
    }
    const body = {
      label: form.label.trim(),
      category: form.category,
      deskripsi: form.deskripsi.trim() || null,
      tempat_ditemukan: form.tempat_ditemukan.trim(),
      lokasi_penitipan: form.lokasi_penitipan.trim() || null,
      waktu_ditemukan: fromInputValue(form.waktu),
      kontak_penemu: form.kontak_penemu.trim() || null,
    };
    setBusy(true);
    try {
      if (editing) await adminApi.updateFound(id, body);
      else await adminApi.createFound(body);
      nav("/admin", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <SubHeader title={editing ? "Edit Barang" : "Tambah Barang"} to="/admin" />
      {loading ? <Loading rows={3} /> : (
        <form className="stack" onSubmit={onSubmit} noValidate>
          <Field label="Nama barang (wajib)" id="label">
            <input id="label" value={form.label} maxLength={100} onChange={set("label")} />
          </Field>
          <Field label="Kategori (wajib)" id="kategori">
            <select id="kategori" value={form.category} onChange={set("category")}>
              <option value="">Pilih kategori</option>
              {options.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Deskripsi" id="deskripsi">
            <textarea id="deskripsi" value={form.deskripsi} onChange={set("deskripsi")} />
          </Field>
          <Field label="Tempat ditemukan (wajib)" id="tempat">
            <input id="tempat" value={form.tempat_ditemukan} maxLength={255} onChange={set("tempat_ditemukan")} />
          </Field>
          <Field label="Lokasi penitipan barang" id="lokasi_penitipan" hint="Ruang atau pos tempat barang ini disimpan saat ini">
            <input id="lokasi_penitipan" value={form.lokasi_penitipan} maxLength={255} onChange={set("lokasi_penitipan")}
              placeholder="Contoh: Pos Satpam Gedung Utama, Ruang 101" />
          </Field>
          <Field label="Waktu ditemukan" id="waktu">
            <input id="waktu" type="datetime-local" value={form.waktu} onChange={set("waktu")} />
          </Field>
          <Field label="Kontak penemu" id="kontak">
            <input id="kontak" value={form.kontak_penemu} maxLength={100} onChange={set("kontak_penemu")}
              placeholder="No. WhatsApp atau nama" />
          </Field>

          <Alert>{error}</Alert>
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Menyimpan…" : "Simpan"}</button>
          <button type="button" className="btn btn-secondary" onClick={() => nav("/admin")} disabled={busy}>Batal</button>
        </form>
      )}
    </>
  );
}
