import { Routes, Route, Link } from "react-router-dom";
import { UserLayout, AdminLayout, RequireAdmin } from "./components/Layouts";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ItemDetail from "./pages/ItemDetail";
import StorageRooms from "./pages/StorageRooms";
import Report from "./pages/Report";
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";
import AdminList from "./pages/AdminList";
import AdminForm from "./pages/AdminForm";

function NotFound() {
  return (
    <main className="app auth">
      <div className="auth-body stack center">
        <h1>Halaman tidak ditemukan</h1>
        <Link to="/" className="btn btn-primary">Kembali ke beranda</Link>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route index element={<Home />} />
        <Route path="katalog" element={<Catalog />} />
        <Route path="barang/:id" element={<ItemDetail />} />
        <Route path="ruang-penitipan" element={<StorageRooms />} />
        <Route path="lapor" element={<Report />} />
      </Route>

      <Route path="admin/login" element={<AdminLogin />} />
      <Route path="admin/daftar" element={<AdminRegister />} />
      <Route path="admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route index element={<AdminList />} />
        <Route path="barang/baru" element={<AdminForm />} />
        <Route path="barang/:id/edit" element={<AdminForm />} />
        <Route path="ruang" element={<StorageRooms admin />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
