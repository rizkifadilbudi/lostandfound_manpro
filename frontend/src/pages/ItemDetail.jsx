import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { Alert, Loading, SubHeader } from "../components/ui";
import { Icon } from "../components/Icons";
import { formatDate } from "../utils/format";

export default function ItemDetail() {
  const { id } = useParams();
  const [state, setState] = useState({ loading: true, item: null, error: "", notFound: false });

  useEffect(() => {
    let off = false;
    setState({ loading: true, item: null, error: "", notFound: false });
    api.getFound(id)
      .then((r) => { if (!off) setState({ loading: false, item: r.data, error: "", notFound: false }); })
      .catch((e) => {
        if (!off) setState({ loading: false, item: null, error: e.message, notFound: e.status === 404 });
      });
    return () => { off = true; };
  }, [id]);

  const { loading, item, error, notFound } = state;

  return (
    <>
      <SubHeader title="Detail Barang" to="/katalog" />
      {loading && <Loading rows={2} />}

      {notFound && (
        <div className="card center stack">
          <p className="item-title">Barang tidak ditemukan</p>
          <p className="muted">Barang ini mungkin sudah dihapus.</p>
          <Link to="/katalog" className="btn btn-secondary">Kembali ke katalog</Link>
        </div>
      )}
      {!notFound && <Alert>{error}</Alert>}

      {item && (
        <>
          <div className="row" style={{ alignItems: "center" }}>
            <div className="tile" style={{ width: 56, height: 56, flex: "none" }}><Icon name="box" size={28} /></div>
            <div style={{ flex: 1 }}>
              <h1>{item.label}</h1>
              <p className="muted">{item.category}</p>
            </div>
          </div>

          <div className="card stack" style={{ gap: 8 }}>
            <div className="info-row"><span className="muted">Ditemukan di</span><span>{item.tempat_ditemukan}</span></div>
            <div className="info-row"><span className="muted">Waktu</span><span>{formatDate(item.waktu_ditemukan)}</span></div>
            {item.lokasi_penitipan && (
              <div className="info-row"><span className="muted">Lokasi penitipan</span><span>{item.lokasi_penitipan}</span></div>
            )}
            {item.deskripsi && <p style={{ fontSize: 14, marginTop: 4 }}>{item.deskripsi}</p>}
          </div>

          <div className="callout">
            <p className="muted" style={{ fontWeight: 600 }}>Ambil barang di</p>
            <p className="item-title" style={{ fontSize: 17 }}>
              {item.lokasi_penitipan || "Ruang penitipan di gedung terkait"}
            </p>
            <p className="muted">
              {item.lokasi_penitipan
                ? "Silakan kunjungi lokasi penitipan di atas untuk mengambil barang ini."
                : "Lihat daftar ruangan dan jam bukanya sebelum datang."}
            </p>
          </div>

          <div className="card stack">
            <h2>Cara mengambil barang</h2>
            <ol className="steps">
              <li>Datang ke ruang penitipan.</li>
              <li>Bawa kartu identitas.</li>
              <li>Sebutkan ciri barang kepada petugas.</li>
            </ol>
          </div>

          <Link to="/ruang-penitipan" className="btn btn-secondary">Lihat semua ruang penitipan</Link>
        </>
      )}
    </>
  );
}
