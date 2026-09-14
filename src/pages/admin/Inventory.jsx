import { useEffect, useState } from "react";
import api from "../../api/axios";
import RegisterComponent from "./RegisterComponent";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    api.get("/inventory/items")
      .then((response) => setItems(response.data))
      .catch((err) => setError(err?.response?.data?.message || "No se pudieron cargar los artículos."))
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesSearch = !search || item.name?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (status === "all" || item.status === status);
  });

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <p className="text-uppercase text-primary small fw-semibold mb-1">Gestión de activos</p>
          <h1 className="h3 fw-bold mb-0">Inventario</h1>
        </div>
        <div className="d-flex align-items-center gap-2"><span className="badge text-bg-light border">{filteredItems.length} resultados</span><button type="button" className="btn btn-primary" onClick={() => setShowRegister((current) => !current)}>{showRegister ? "Cerrar formulario" : "Registrar componente"}</button></div>
      </div>
      {showRegister && <div className="card shadow-sm border-0 mb-4"><div className="card-body"><RegisterComponent embedded onSaved={() => { setShowRegister(false); api.get("/inventory/items").then((response) => setItems(response.data)); }} /></div></div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="row g-2 mb-4">
            <div className="col-md-8">
              <label className="visually-hidden" htmlFor="inventory-search">Buscar por nombre</label>
              <input id="inventory-search" className="form-control" placeholder="Buscar por nombre" value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="visually-hidden" htmlFor="inventory-status">Filtrar por estado</label>
              <select id="inventory-status" className="form-select" value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="all">Todos los estados</option>
                <option value="available">Disponible</option>
                <option value="loaned">Prestado</option>
                <option value="maintenance">Mantenimiento</option>
              </select>
            </div>
          </div>
          {loading ? <p className="text-muted">Cargando...</p> : filteredItems.length === 0 ? <p className="text-muted mb-0">No hay artículos con esos filtros.</p> : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead><tr><th>Nombre</th><th>Marca</th><th>Stock</th><th>Disponible</th><th>Ubicación</th><th>Estado</th></tr></thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td><td>{item.brand || "-"}</td><td>{item.quantity}</td><td>{item.available_quantity}</td><td>{item.location}</td>
                      <td><span className={`badge ${item.status === "available" ? "bg-success" : item.status === "loaned" ? "bg-warning text-dark" : "bg-secondary"}`}>{item.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
