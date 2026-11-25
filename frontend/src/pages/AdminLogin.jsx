import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { adminApi } from "../api/client";
import { getToken, setToken } from "../auth";
import { ENABLE_ADMIN_REGISTER } from "../constants";
import { Alert, Field } from "../components/ui";

export default function AdminLogin() {
  const nav = useNavigate();
  const loc = useLocation();
  const [sp] = useSearchParams();
  const [form, setForm] = useState({ nama_admin: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (getToken()) return <Navigate to="/admin" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.nama_admin.trim() || !form.password) { setError("Nama admin dan password wajib diisi."); return; }
    setBusy(true);
    try {
      const res = await adminApi.login(form.nama_admin.trim(), form.password);
      setToken(res.token);
      nav("/admin", { replace: true });
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
          <h1 style={{ marginTop: 12, fontSize: 26 }}>Masuk Admin</h1>
          <p className="lead" style={{ marginTop: 6 }}>Khusus petugas yang mengelola barang temuan dan ruang penitipan.</p>
        </div>

        {sp.get("expired") && <Alert kind="info">Sesi habis, silakan masuk lagi.</Alert>}
        {loc.state?.registered && <Alert kind="success">Admin berhasil didaftarkan. Silakan masuk.</Alert>}
        <Alert>{error}</Alert>

        <Field label="Nama admin" id="nama">
          <input id="nama" autoComplete="username" value={form.nama_admin}
            onChange={(e) => setForm({ ...form, nama_admin: e.target.value })} />
        </Field>
        <Field label="Password" id="pw">
          <input id="pw" type="password" autoComplete="current-password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Field>

        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Masuk…" : "Masuk"}</button>
        {ENABLE_ADMIN_REGISTER && (
          <p className="center muted" style={{ fontSize: 14 }}>
            Belum punya akun? <Link to="/admin/daftar" style={{ fontWeight: 600 }}>Daftar</Link>
          </p>
        )}
        <Link to="/" className="link-center">Kembali ke beranda</Link>
      </form>
    </main>
  );
}
