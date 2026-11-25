import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { Alert, ItemCard, Loading } from "../components/ui";

export default function Home() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let off = false;
    api.listFounds()
      .then((r) => { if (!off) setItems((r.data || []).slice(0, 3)); })
      .catch((e) => { if (!off) setError(e.message); });
    return () => { off = true; };
  }, []);

  return (
    <>
      <section className="hero stack">
        <h1>Menemukan atau kehilangan barang?</h1>
        <p className="lead">Laporkan barang temuan, atau cari barang yang mungkin sudah ditemukan orang lain.</p>
        <Link to="/lapor" className="btn btn-primary">Saya Menemukan Barang</Link>
        <Link to="/katalog" className="btn btn-accent">Cari Barang Hilang</Link>
        <Link to="/ruang-penitipan" className="link-center">Lihat ruang penitipan</Link>
      </section>

      <section className="stack">
        <h2>Barang terbaru</h2>
        <Alert>{error}</Alert>
        {!items && !error && <Loading />}
        {items && items.length === 0 && <p className="muted">Belum ada barang temuan.</p>}
        {items && items.map((it) => <ItemCard key={it.id} item={it} to={`/barang/${it.id}`} />)}
        {items && items.length > 0 && <Link to="/katalog" className="link-center">Lihat semua barang</Link>}
      </section>
    </>
  );
}
