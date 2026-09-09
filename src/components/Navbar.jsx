import { Link } from "react-router-dom";
import { getToken } from "../utils/auth";

export default function Navbar({ brand = "Navbar", links = [] }) {
  const brandPath = getToken() ? "/admin" : "/";

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
            {links.map((link, index) => (
              <li className="nav-item" key={index}>
                <a
                  className={`nav-link text-white ${link.active ? 'active fw-semibold' : ''}`}
                  href={link.href || "#"}
                >
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}