import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

export default function EditRole() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Paso 1: Cargar el rol puntual por su ID
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await api.get(`/roles/${id}`);
        setName(response.data.name);
      } catch (err) {
        console.error("No se pudo cargar el rol:", err);
        setError("No se pudo cargar la información del rol.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRole();
    }
  }, [id]);

  // Paso 3: Enviar la actualización
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/roles/${id}`, { name: name.trim() });
      
      // Volver a la lista de roles
      navigate("/admin/roles");
    } catch (err) {
      const msg = err.response?.data?.message || "Error al actualizar el rol.";
      console.error(msg);
      setError(msg);
    }
  };

  if (loading) {
    return <p className="p-4 text-secondary">Cargando rol...</p>;
  }

  return (
    <div className="container py-4" style={{ maxWidth: "420px" }}>
      <h4 className="fw-bold mb-3">Editar Rol #{id}</h4>
      
      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="roleName" className="form-label fw-semibold">
            Nombre del rol
          </label>
          <input 
            type="text" 
            id="roleName" 
            className="form-control" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required
          />
        </div>

        <div className="d-flex gap-2">
          <Link to="/admin/roles" className="btn btn-secondary w-50">
            Cancelar
          </Link>
          <button type="submit" className="btn btn-primary w-50">
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}