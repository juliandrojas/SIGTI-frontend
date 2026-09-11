import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { getToken, getUserRole, saveSession } from "../utils/auth";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 1. Redirección si ya existe sesión activa (Adaptada a los 2 roles)
  const token = getToken();
  const rawRole = getUserRole();
  const userRole = !isNaN(Number(rawRole)) ? Number(rawRole) : rawRole;

  if (token && userRole) {
    if (userRole === 1 || userRole === "sistemas") {
      return <Navigate to="/sistemas" replace />;
    }
    if (userRole === 2 || userRole === "usuario") {
      return <Navigate to="/usuario" replace />;
    }
  }

  // 2. Procesar Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post("/users/login", {
        username,
        password,
      });

      const rawRoleId = response.data.user?.role_id ?? response.data.user?.role;
      const roleId = !isNaN(Number(rawRoleId)) ? Number(rawRoleId) : rawRoleId;

      // Validar que el rol sea 1 (sistemas) o 2 (usuario)
      if (roleId !== 1 && roleId !== 2 && roleId !== "sistemas" && roleId !== "usuario") {
        setError("Usuario sin rol válido en el sistema.");
        setLoading(false);
        return;
      }

      // Guardar datos en localStorage
      saveSession(response.data);

      // Redirigir según el rol del sistema SIGTI
      if (roleId === 1 || roleId === "sistemas") {
        navigate("/sistemas", { replace: true });
      } else {
        navigate("/usuario", { replace: true });
      }

    } catch (err) {
      const msg = err.response?.data?.message || "Credenciales incorrectas o error de conexión.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar brand="PETRO-SIGTI" />

      <div className="auth-shell">
        <div className="card auth-card border-0">
          <div className="card-body">
            {/* Encabezado */}
            <div className="text-center mb-4">
              <span className="auth-logo mb-3"><i className="bi bi-box-seam" aria-hidden="true" /></span>
              <h4 className="fw-bold mb-1">Bienvenido a PETRO-SIGTI</h4>
              <p className="text-muted small">Mesa de ayuda y gestión de activos TI</p>
            </div>

            {/* Alerta de error si falla el login */}
            {error && <div className="alert alert-danger py-2">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">
                  Usuario
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  value={username}
                  placeholder="nombre.apellido"
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Contraseña
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="d-grid mt-4">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Ingresando..." : "Iniciar Sesión"}
                </button>
              </div>

              <div className="mt-4 d-flex align-items-center gap-2">
                <p className="mb-0 text-muted">¿No tienes una cuenta?</p>
                <a
                  href="/register"
                  className="text-decoration-none fw-semibold"
                >
                  Crea una ahora
                </a>
              </div>

              <div className="mt-2 d-flex align-items-center gap-2">
                <p className="mb-0 text-muted">¿No recuerdas tu contraseña?</p>
                <a
                  href="/recovery"
                  className="text-decoration-none fw-semibold"
                >
                  Restablecer
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
