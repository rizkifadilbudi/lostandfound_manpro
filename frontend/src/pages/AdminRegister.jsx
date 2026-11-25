import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminApi } from "../api/client";
import { Alert, Field } from "../components/ui";

export default function AdminRegister() {
  const nav = useNavigate();
  const [form, setForm] = useState({ nama_admin: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.nama_admin.trim() || !form.password) { setError("Nama admin dan password wajib diisi."); return; }
    setBusy(true);
    try {
      await adminApi.register(form.nama_admin.trim(), form.password);
      nav("/admin/login", { replace: true, state: { registered: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="app auth">
      <form className="auth-body stack" onSubmit={onSubmit} noValidate>
        <div>
          <p className="brand">Lost &amp; Found</p>
          <h1 style={{ marginTop: 12, fontSize: 26 }}>Daftar Admin</h1>
          <p className="lead" style={{ marginTop: 6 }}>Buat akun untuk petugas yang mengelola barang temuan dan ruang penitipan.</p>
        </div>

        <Alert>{error}</Alert>

        <Field label="Nama admin" id="nama" hint="Harus unik. Jika sudah dipakai, pilih nama lain.">
          <input id="nama" autoComplete="username" placeholder="Contoh: admin_gedung_b" value={form.nama_admin}
            onChange={(e) => setForm({ ...form, nama_admin: e.target.value })} />
        </Field>
        <Field label="Password" id="pw">
          <input id="pw" type="password" autoComplete="new-password" placeholder="Masukkan password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Field>

        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Mendaftar…" : "Daftar"}</button>
        <p className="center muted" style={{ fontSize: 14 }}>
          Sudah punya akun? <Link to="/admin/login" style={{ fontWeight: 600 }}>Masuk</Link>
        </p>
      </form>
    </main>
  );
}
