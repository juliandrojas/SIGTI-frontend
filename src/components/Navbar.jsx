import { Link } from "react-router-dom";
import { getToken, getUserRole } from "../utils/auth";

export default function Navbar({ brand = "Navbar", links = [], onLogout }) {
  const userRole = getUserRole();
  let brandPath = "/";
  
  if (getToken()) {
    if (userRole === 1) brandPath = "/admin";
    else if (userRole === 2) brandPath = "/sistemas";
    else if (userRole === 3) brandPath = "/usuario";
  }

  return (
    <nav className="navbar navbar-expand-lg bg-dark" data-bs-theme="dark">
      <div className="container-fluid">
        {/* Título / Marca a la izquierda */}
        <Link className="navbar-brand text-white fw-bold" to={brandPath}>
          {brand}
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
                <Link
                  className={`nav-link text-white ${link.active ? "active fw-semibold" : ""}`}
                  to={link.href || "#"}
                >
                  {link.text}
                </Link>
              </li>
            ))}
            {onLogout && (
              <li className="nav-item ms-lg-2">
                <button type="button" className="btn btn-danger btn-sm mt-1 mt-lg-0" onClick={onLogout}>
                  Cerrar sesión
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}