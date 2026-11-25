const fmt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
});

export const formatDate = (v) => (v ? fmt.format(new Date(v)) : "-");

// Nilai untuk <input type="datetime-local">
export function toInputValue(v) {
  const d = v ? new Date(v) : new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
export const fromInputValue = (s) => (s ? new Date(s).toISOString() : undefined);

// Ubah "08123456789 (Budi)" menjadi tautan WhatsApp, atau null jika bukan nomor HP
export function waLink(contact) {
  const m = (contact || "").replace(/[\s-]/g, "").match(/(\+?\d{8,15})/);
  if (!m) return null;
  let n = m[1].replace("+", "");
  if (n.startsWith("0")) n = "62" + n.slice(1);
  return `https://wa.me/${n}`;
}
