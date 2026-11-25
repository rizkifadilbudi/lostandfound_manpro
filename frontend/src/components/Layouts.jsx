import { NavLink, Link, Outlet, Navigate, useNavigate } from "react-router-dom";
import { Icon } from "./Icons";
import { getToken, clearToken } from "../auth";

function NavItem({ to, icon, label, end }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
      <Icon name={icon} />
      <span>{label}</span>
    </NavLink>
  );
}

export function UserLayout() {
  return (
    <div className="app">
      <header className="topbar"><Link to="/" className="brand">Lost &amp; Found</Link></header>
      <main className="page"><Outlet /></main>
      <nav className="bottom-nav" aria-label="Navigasi utama">
        <NavItem to="/" end icon="home" label="Beranda" />
        <NavItem to="/katalog" icon="search" label="Katalog" />
        <NavItem to="/lapor" icon="plus" label="Lapor Temuan" />
      </nav>
    </div>
  );
}

export function AdminLayout() {
  const nav = useNavigate();
  const logout = () => {
    clearToken();
    nav("/admin/login", { replace: true });
  };
  return (
    <div className="app">
      <header className="topbar"><span className="brand">Admin · Lost &amp; Found</span></header>
      <main className="page"><Outlet /></main>
      <nav className="bottom-nav" aria-label="Navigasi admin">
        <NavItem to="/admin" end icon="box" label="Barang" />
        <NavItem to="/admin/ruang" icon="building" label="Ruang Penitipan" />
        <button type="button" className="nav-item danger" onClick={logout}>
          <Icon name="logout" />
          <span>Keluar</span>
        </button>
      </nav>
    </div>
  );
}

export function RequireAdmin({ children }) {
  return getToken() ? children : <Navigate to="/admin/login" replace />;
}
