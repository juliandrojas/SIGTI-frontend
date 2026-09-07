import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Login() {
  const misEnlaces = [{ text: "Volver a inicio", href: "/" }];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
    navigate("/admin");
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

            {/* onSubmit asignado al form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Correo institucional
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  placeholder="usuario@petrocasinos.com"
                  onChange={(e) => setEmail(e.target.value)}
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
                {/* ✅ Botón limpio con solo type="submit" */}
                <button type="submit" className="btn btn-primary">
                  Iniciar Sesión
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}