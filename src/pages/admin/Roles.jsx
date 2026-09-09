import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await api.get("/roles");
        setRoles(response.data);
      } catch (err) {
        console.error("Error al obtener los datos de la API:", err);
        setError("No se pudieron cargar los roles.");
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  const filteredRoles = roles.filter((role) =>
    role.name?.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="container py-4" style={{ maxWidth: "760px" }}>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
        <div>
          <p className="text-primary text-uppercase small fw-bold mb-2">Administración</p>
          <h2 className="fw-bold mb-1">Roles del sistema</h2>
          <p className="text-secondary mb-0">Administra los perfiles y permisos disponibles.</p>
        </div>
        {!loading && !error && (
          <span className="badge rounded-pill bg-light text-secondary border px-3 py-2">
            {roles.length} {roles.length === 1 ? "rol" : "roles"}
          </span>
        )}
      </div>

      {loading && <p className="text-center text-muted">Cargando roles...</p>}

      {error && <div className="alert alert-danger py-2">{error}</div>}

      {!loading && roles.length === 0 && !error && (
        <div className="text-center border rounded-3 p-5 bg-light">
          <i className="bi bi-shield-exclamation fs-2 text-secondary" aria-hidden="true"></i>
          <p className="text-secondary mb-0 mt-2">No hay roles registrados.</p>
        </div>
      )}

      {!loading && roles.length > 0 && (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-3 p-md-4">
            <div className="input-group mb-3">
              <span className="input-group-text bg-white border-end-0" id="role-search-icon">
                <i className="bi bi-search text-secondary" aria-hidden="true"></i>
              </span>
              <input
                type="search"
                className="form-control border-start-0"
                placeholder="Buscar por nombre de rol"
                aria-label="Buscar por nombre de rol"
                aria-describedby="role-search-icon"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  aria-label="Limpiar búsqueda"
                  title="Limpiar búsqueda"
                  onClick={() => setSearch("")}
                >
                  <i className="bi bi-x-lg" aria-hidden="true"></i>
                </button>
              )}
            </div>

            {filteredRoles.length > 0 ? (
              <div className="list-group list-group-flush">
                {filteredRoles.map((role) => (
                  <div key={role.id} className="list-group-item px-0 py-3 d-flex align-items-center gap-3">
                    <span className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary fw-bold" style={{ width: "38px", height: "38px" }}>
                      <i className="bi bi-shield-check" aria-hidden="true"></i>
                    </span>
                    <div className="flex-grow-1 min-w-0">
                      <div className="fw-semibold text-dark text-truncate">{role.name}</div>
                      <small className="text-secondary">ID de rol: {role.id}</small>
                    </div>
                    <Link
                      to={`/admin/roles/edit/${role.id}`}
                      className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
                    >
                      <i className="bi bi-pencil" aria-hidden="true"></i>
                      <span>Editar</span>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center border rounded-3 p-4 bg-light">
                <i className="bi bi-search fs-3 text-secondary" aria-hidden="true"></i>
                <p className="text-secondary mb-0 mt-2">No encontramos roles con esa búsqueda.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}