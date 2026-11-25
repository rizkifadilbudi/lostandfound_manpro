import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "./Icons";
import { CATEGORIES } from "../constants";
import { formatDate } from "../utils/format";

export function Field({ label, id, hint, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}

export function Alert({ kind = "error", children }) {
  if (!children) return null;
  return (
    <div role={kind === "error" ? "alert" : "status"} className={`alert alert-${kind}`}>
      {children}
    </div>
  );
}

export function Loading({ rows = 3 }) {
  return (
    <div className="stack" aria-busy="true" aria-label="Memuat">
      {Array.from({ length: rows }).map((_, i) => <div key={i} className="skeleton" />)}
    </div>
  );
}

export function Empty({ title, children }) {
  return (
    <div className="card empty">
      <p className="item-title">{title}</p>
      {children && <p className="muted">{children}</p>}
    </div>
  );
}

export function CategoryChips({ value, onChange }) {
  return (
    <div className="chips" role="group" aria-label="Filter kategori">
      {["", ...CATEGORIES].map((c) => (
        <button key={c || "all"} type="button" className={`chip${value === c ? " on" : ""}`}
          aria-pressed={value === c} onClick={() => onChange(c)}>
          {c || "Semua"}
        </button>
      ))}
    </div>
  );
}

export function ItemCard({ item, to, children }) {
  const main = (
    <>
      <div className="tile"><Icon name="box" /></div>
      <div className="item-text">
        <p className="item-title">{item.label}</p>
        <p className="muted">{item.category} · {item.tempat_ditemukan}</p>
        <p className="muted">{formatDate(item.waktu_ditemukan)}</p>
      </div>
    </>
  );
  return (
    <div className="card item">
      {to ? <Link to={to} className="item-main">{main}</Link> : <div className="item-main">{main}</div>}
      {children}
    </div>
  );
}

export function SubHeader({ title, to }) {
  const nav = useNavigate();
  return (
    <div className="subheader">
      <button type="button" className="icon-btn" aria-label="Kembali"
        onClick={() => (to ? nav(to) : nav(-1))}>
        <Icon name="back" />
      </button>
      <h1>{title}</h1>
    </div>
  );
}

export function ConfirmDialog({ title, message, confirmLabel = "Ya", busy, onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="overlay" onClick={onCancel}>
      <div className="dialog stack" role="dialog" aria-modal="true" aria-labelledby="dlg-title"
        onClick={(e) => e.stopPropagation()}>
        <h2 id="dlg-title">{title}</h2>
        <p className="muted">{message}</p>
        <div className="row">
          <button type="button" className="btn btn-secondary" autoFocus onClick={onCancel} disabled={busy}>Batal</button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? "Menghapus…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
