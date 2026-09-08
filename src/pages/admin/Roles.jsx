import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const getData = async () => {
    try {
      const response = await api.get("/roles");
      if (!Array.isArray(response.data)) {
        throw new Error("La API no devolvió una lista de roles.");
      }
      setRoles(response.data);
    } catch (err) {
      console.error("Error al obtener los datos de la API:", err);
      setError(err.response?.data?.message || err.message || "No se pudieron cargar los roles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadRoles = async () => {
      await getData();
    };

    loadRoles();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      await api.post("/roles", { name: name.trim() });
      setName("");
      setSuccess("Rol creado correctamente.");
      await getData();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo crear el rol.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: "600px" }}>
      <h2 className="text-center fw-bold mb-4">Lista de Roles</h2>

      <form onSubmit={handleSubmit} className="card mb-4 shadow-sm border-0">
        <div className="card-body">
          <label htmlFor="newRoleName" className="form-label fw-semibold">Nuevo rol</label>
          <div className="input-group">
            <input
              id="newRoleName"
              type="text"
              className="form-control"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nombre del rol"
              required
            />
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Guardando..." : "Crear"}
            </button>
          </div>
        </div>
      </form>

      {loading && <p className="text-center text-muted">Cargando roles...</p>}
      
      {error && <div className="alert alert-danger py-2">{error}</div>}
      {success && <div className="alert alert-success py-2">{success}</div>}

      {!loading && roles.length === 0 && !error && (
        <p className="text-center text-muted">No hay roles registrados.</p>
      )}

      {roles.map((rol) => (
        <div key={rol.id} className="card mb-3 shadow-sm border-0">
          <div className="card-body d-flex justify-content-between align-items-center">
            <span className="fw-semibold text-dark">{rol.name}</span>
            <Link to={`/admin/roles/edit/${rol.id}`} className="btn btn-sm btn-primary px-3">
              Editar
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}