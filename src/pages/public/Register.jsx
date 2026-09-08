import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function Register() {
  const [name, setName] = useState("");
  const [firstLastName, setFirstLastName] = useState("");
  const [secondLastName, setSecondLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post("/users/create", {
        name,
        firstLastName,
        secondLastName,
        email,
        password,
      });
      alert("Usuario creado con éxito")
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.message || "Ocurrió un error al registrar el usuario";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light py-5">
      <div 
        className="card border-0 shadow rounded-4 p-3 p-md-4 bg-white" 
        style={{ width: "100%", maxWidth: "480px" }}
      >
        <div className="card-body">
          {/* Encabezado con branding limpio */}
          <div className="text-center mb-4">
            <span className="badge bg-primary-subtle text-primary fw-semibold px-3 py-2 rounded-pill mb-2">
              PETRO-SIGTI
            </span>
            <h3 className="fw-bold text-dark mt-1 mb-1">Crea tu cuenta</h3>
            <p className="text-secondary small mb-0">
              Mesa de ayuda y soporte corporativo
            </p>
          </div>

          {/* Alerta de error si falla el registro */}
          {error && (
            <div className="alert alert-danger border-0 small py-2 px-3 mb-4 rounded-3 d-flex align-items-center">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Nombre */}
            <div className="mb-3">
              <label htmlFor="name" className="form-label small fw-semibold text-secondary">
                Nombre
              </label>
              <input
                type="text"
                className="form-control form-control-lg fs-6 bg-light border-0"
                id="name"
                value={name}
                placeholder="Ej. Julian"
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Apellidos en una sola fila nivelada */}
            <div className="row g-2 mb-3">
              <div className="col-6">
                <label htmlFor="firstLastName" className="form-label small fw-semibold text-secondary d-block">
                  Primer Apellido
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg fs-6 bg-light border-0"
                  id="firstLastName"
                  value={firstLastName}
                  placeholder="Ej. Rojas"
                  onChange={(e) => setFirstLastName(e.target.value)}
                  required
                />
              </div>

              <div className="col-6">
                <label htmlFor="secondLastName" className="form-label small fw-semibold text-secondary d-flex justify-content-between">
                  Segundo Apellido <span className="text-muted fw-normal" style={{ fontSize: "0.75rem" }}>(Opcional)</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg fs-6 bg-light border-0"
                  id="secondLastName"
                  value={secondLastName}
                  placeholder="Ej. Alvarez"
                  onChange={(e) => setSecondLastName(e.target.value)}
                />
              </div>
            </div>

            {/* Correo Electrónico */}
            <div className="mb-3">
              <label htmlFor="email" className="form-label small fw-semibold text-secondary">
                Correo institucional
              </label>
              <input
                type="email"
                className="form-control form-control-lg fs-6 bg-light border-0"
                id="email"
                value={email}
                placeholder="usuario@petrocasinos.com"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Contraseña */}
            <div className="mb-4">
              <label htmlFor="password" className="form-label small fw-semibold text-secondary">
                Contraseña
              </label>
              <input
                type="password"
                className="form-control form-control-lg fs-6 bg-light border-0"
                id="password"
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Botón de acción */}
            <div className="d-grid mb-3">
              <button
                type="submit"
                className="btn btn-primary btn-lg fs-6 fw-semibold rounded-3 py-2 shadow-sm"
                disabled={loading}
              >
                {loading ? "Registrando..." : "Registrarme"}
              </button>
            </div>

            {/* Pie de tarjeta / enlace a Login */}
            <div className="text-center pt-2 border-top border-light">
              <span className="text-secondary small">¿Ya tienes cuenta? </span>
              <Link to="/login" className="small fw-semibold text-decoration-none">
                Inicia sesión
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}