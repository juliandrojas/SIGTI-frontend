import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/roles");
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

  return (
    <div className="container py-4" style={{ maxWidth: "600px" }}>
      <h2 className="text-center fw-bold mb-4">Lista de Roles</h2>

      {loading && <p className="text-center text-muted">Cargando roles...</p>}
      
      {error && <div className="alert alert-danger py-2">{error}</div>}

      {!loading && roles.length === 0 && !error && (
        <p className="text-center text-muted">No hay roles registrados.</p>
      )}

      {roles.map((rol) => (
        <div key={rol.id} className="card mb-3 shadow-sm border-0">
          <div className="card-body d-flex justify-content-between align-items-center">
            <span className="fw-semibold text-dark">{rol.name}</span>
            <Link to={`/roles/edit/${rol.id}`} className="btn btn-sm btn-primary px-3">
              Editar
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}