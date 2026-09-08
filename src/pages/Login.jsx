import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Login() {
  const misEnlaces = [{ text: "Volver a inicio", href: "/" }];
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Petición POST enviando usuario y clave al backend
      const response = await axios.post("http://localhost:3000/users/login", {
        username,
        password,
      });

      console.log("Respuesta del servidor:", response.data);

      // Si el backend devuelve un token, lo guardas
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      // Redirigir al panel
      navigate("/admin");
    } catch (err) {
      // Captura el mensaje que programaste en el backend o muestra uno por defecto
      const msg = err.response?.data?.message || "Credenciales incorrectas";
      setError(msg);
    }
  };

  return (
    <>
      <Navbar brand="PETRO-SIGTI" links={misEnlaces} />

      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div
          className="card shadow-sm p-4 border-0"
          style={{ width: "100%", maxWidth: "400px" }}
        >
          <div className="card-body">
            {/* Encabezado */}
            <div className="text-center mb-4">
              <h4 className="fw-bold text-primary">PETRO-SIGTI</h4>
              <p className="text-muted small">Mesa de Ayuda y Gestión de TI</p>
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
                <button type="submit" className="btn btn-primary">
                  Iniciar Sesión
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
              <div className="mt-4 d-flex align-items-center gap-2">
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
