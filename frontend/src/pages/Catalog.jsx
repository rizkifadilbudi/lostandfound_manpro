import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Alert, CategoryChips, Empty, ItemCard, Loading, Field } from "../components/ui";

export default function Catalog() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [category, setCategory] = useState("");
  const [reload, setReload] = useState(0);
  const [state, setState] = useState({ loading: true, items: [], error: "" });

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let off = false;
    setState((s) => ({ ...s, loading: true, error: "" }));
    api.listFounds({ search: debounced, category })
      .then((r) => { if (!off) setState({ loading: false, items: r.data || [], error: "" }); })
      .catch((e) => { if (!off) setState({ loading: false, items: [], error: e.message }); });
    return () => { off = true; };
  }, [debounced, category, reload]);

  const { loading, items, error } = state;

  return (
    <>
      <div className="sticky-top stack">
        <h1>Katalog Barang Temuan</h1>
        <Field label="Cari barang" id="q">
          <input id="q" type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Nama barang, kategori, atau lokasi" />
        </Field>
        <CategoryChips value={category} onChange={setCategory} />
      </div>

      <section className="stack" aria-live="polite">
        {error && (
          <>
            <Alert>{error}</Alert>
            <button type="button" className="btn btn-secondary" onClick={() => setReload((n) => n + 1)}>Coba lagi</button>
          </>
        )}
        {loading && <Loading />}
        {!loading && !error && (
          <>
            <p className="muted">{items.length} barang ditemukan</p>
            {items.length === 0 && (
              <Empty title="Tidak ada barang yang cocok">Coba kata kunci atau kategori lain.</Empty>
            )}
            {items.map((it) => <ItemCard key={it.id} item={it} to={`/barang/${it.id}`} />)}
          </>
        )}
      </section>
    </>
  );
}
