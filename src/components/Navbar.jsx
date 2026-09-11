import { Link, NavLink } from "react-router-dom";
import { getToken, getUserRole } from "../utils/auth";

export default function Navbar({ brand = "Navbar", links = [], onLogout }) {
  const userRole = getUserRole();
  let brandPath = "/";
  
  if (getToken()) {
    if (userRole === 1 || userRole === 2) brandPath = "/sistemas";
    else if (userRole === 3) brandPath = "/usuario";
  }

  return (
    <nav className="navbar navbar-expand-lg app-navbar" data-bs-theme="dark">
      <div className="container-fluid">
        {/* Título / Marca a la izquierda */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to={brandPath}>
          <span className="brand-mark" aria-hidden="true"><i className="bi bi-box-seam" /></span>
          <span>{brand}</span>
        </Link>

        {/* Botón responsive para móviles */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Contenido colapsable */}
        <div className="collapse navbar-collapse" id="navbarNav">
          {/* ms-auto empuja los enlaces hacia la derecha */}
          <ul className="navbar-nav ms-auto">
            {links.map((link) => (
              <li className="nav-item" key={link.href}>
                <NavLink
                  className={({ isActive }) => `nav-link ${isActive || link.active ? "active fw-semibold" : ""}`}
                  to={link.href || "#"}
                >
                  <i className={`bi ${link.icon || "bi-grid-1x2"} me-2`} aria-hidden="true" />{link.text}
                </NavLink>
              </li>
            ))}
            {onLogout && (
              <li className="nav-item ms-lg-2">
                <button type="button" className="btn btn-logout btn-sm mt-2 mt-lg-0" onClick={onLogout}>
                  <i className="bi bi-box-arrow-right me-2" aria-hidden="true" />Cerrar sesión
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
