import { NavLink, Outlet } from "react-router";
import Logo from "./Logo.jsx";

export default function Layout() {
  return (
    <div className="app">
      <header className="cabecera">
        <div className="marca">
          <Logo />
          <div>
            <span className="marca-nombre">MERIDIAN</span>
            <span className="marca-sub">Taller de reparación electrónica</span>
          </div>
        </div>
        <nav className="menu">
          <NavLink to="/" end>Panel</NavLink>
          <NavLink to="/ordenes" end>Órdenes</NavLink>
          <NavLink to="/ordenes/nueva">Recibir equipo</NavLink>
        </nav>
      </header>

      <main className="contenido">
        <Outlet />
      </main>

      <footer className="pie">
        Meridian · Reparación electrónica de precisión · Teléfonos, laptops y televisores
      </footer>
    </div>
  );
}
