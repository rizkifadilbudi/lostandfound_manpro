import { STORAGE_ROOMS } from "../data/storageRooms";
import { Icon } from "../components/Icons";
import { SubHeader } from "../components/ui";

export default function StorageRooms({ admin = false }) {
  return (
    <>
      {admin ? <h1>Ruang Penitipan</h1> : <SubHeader title="Ruang Penitipan" to="/" />}
      <p className="lead">
        Barang temuan dititipkan di ruang khusus di setiap gedung. Datang ke ruangan yang sesuai dengan barang yang kamu cari.
      </p>
      <ul className="stack" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {STORAGE_ROOMS.map((r) => (
          <li key={r.id} className="card item-main">
            <div className="tile"><Icon name="building" /></div>
            <div>
              <p className="item-title">{r.gedung} · {r.ruangan}</p>
              <p className="muted">Jam buka {r.jam}</p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
