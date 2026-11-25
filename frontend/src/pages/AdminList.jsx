import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../api/client";
import { Alert, CategoryChips, ConfirmDialog, Empty, ItemCard, Loading } from "../components/ui";
import { waLink } from "../utils/format";

export default function AdminList() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let off = false;
    setError("");
    adminApi.listFounds()
      .then((r) => { if (!off) setItems(r.data || []); })
      .catch((e) => { if (!off) setError(e.message); });
    return () => { off = true; };
  }, [reload]);

  // API admin belum punya filter, jadi pencarian dilakukan di sisi klien
  const shown = useMemo(() => {
    if (!items) return [];
    const term = q.trim().toLowerCase();
    return items.filter((it) => {
      if (category && it.category !== category) return false;
      if (!term) return true;
      return [it.label, it.category, it.deskripsi, it.tempat_ditemukan]
        .some((v) => (v || "").toLowerCase().includes(term));
    });
  }, [items, q, category]);

  async function confirmDelete() {
    setDeleting(true);
    try {
      await adminApi.deleteFound(toDelete.id);
      setItems((list) => list.filter((x) => x.id !== toDelete.id));
      setToDelete(null);
    } catch (e) {
      setError(e.message);
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="row" style={{ alignItems: "center" }}>
        <h1 style={{ fontSize: 20 }}>Barang Temuan</h1>
        <Link to="/admin/barang/baru" className="btn btn-primary btn-sm" style={{ flex: "none" }}>+ Tambah</Link>
      </div>

      <input type="search" aria-label="Cari barang" placeholder="Cari barang atau tempat"
        value={q} onChange={(e) => setQ(e.target.value)} />
      <CategoryChips value={category} onChange={setCategory} />

      {error && (
        <>
          <Alert>{error}</Alert>
          <button type="button" className="btn btn-secondary" onClick={() => setReload((n) => n + 1)}>Coba lagi</button>
        </>
      )}
      {!items && !error && <Loading />}

      {items && (
        <section className="stack">
          <p className="muted">{shown.length} barang</p>
          {shown.length === 0 && <Empty title="Tidak ada barang">Ubah pencarian atau tambahkan barang baru.</Empty>}
          {shown.map((it) => {
            const wa = waLink(it.kontak_penemu);
            return (
              <ItemCard key={it.id} item={it}>
                <p style={{ fontSize: 13 }}>
                  Kontak penemu:{" "}
                  {it.kontak_penemu
                    ? (wa
                        ? <a href={wa} target="_blank" rel="noreferrer" style={{ fontWeight: 600 }}>{it.kontak_penemu}</a>
                        : <strong>{it.kontak_penemu}</strong>)
                    : "-"}
                </p>
                <div className="row">
                  <Link to={`/barang/${it.id}`} className="btn btn-secondary btn-sm">Lihat</Link>
                  <Link to={`/admin/barang/${it.id}/edit`} className="btn btn-primary btn-sm">Edit</Link>
                  <button type="button" className="btn btn-secondary btn-sm" style={{ color: "var(--danger)" }}
                    onClick={() => setToDelete(it)}>Hapus</button>
                </div>
              </ItemCard>
            );
          })}
        </section>
      )}

      {toDelete && (
        <ConfirmDialog title="Hapus barang ini?"
          message={`"${toDelete.label}" akan dihapus permanen dan tidak bisa dikembalikan.`}
          confirmLabel="Hapus" busy={deleting} onConfirm={confirmDelete} onCancel={() => !deleting && setToDelete(null)} />
      )}
    </>
  );
}
