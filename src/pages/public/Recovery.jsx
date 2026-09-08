import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function Recovery() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      // Endpoint que procesará el envío de correo de restablecimiento
      await api.post("/api/auth/recovery", { email });
      setSuccess(true);
      setEmail("");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "No se pudo procesar la solicitud. Verifica el correo ingresado.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light py-5">
      <div
        className="card border-0 shadow rounded-4 p-3 p-md-4 bg-white"
        style={{ width: "100%", maxWidth: "440px" }}
      >
        <div className="card-body">
          {/* Encabezado institucional */}
          <div className="text-center mb-4">
            <span className="badge bg-primary-subtle text-primary fw-semibold px-3 py-2 rounded-pill mb-2">
              PETRO-SIGTI
            </span>
            <h3 className="fw-bold text-dark mt-1 mb-1">Recuperar Acceso</h3>
            <p className="text-secondary small mb-0">
              Ingresa tu correo institucional para enviarte las instrucciones de restablecimiento.
            </p>
          </div>

          {/* Mensaje de éxito */}
          {success && (
            <div className="alert alert-success border-0 small py-2 px-3 mb-4 rounded-3">
              Hemos enviado las instrucciones a tu correo. Revisa tu bandeja de entrada o spam.
            </div>
          )}

          {/* Alerta de error */}
          {error && (
            <div className="alert alert-danger border-0 small py-2 px-3 mb-4 rounded-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
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

            <div className="d-grid mb-3">
              <button
                type="submit"
                className="btn btn-primary btn-lg fs-6 fw-semibold rounded-3 py-2 shadow-sm"
                disabled={loading}
              >
                {loading ? "Enviando enlace..." : "Enviar enlace de recuperación"}
              </button>
            </div>

            <div className="text-center pt-2 border-top border-light">
              <Link to="/login" className="small fw-semibold text-decoration-none text-secondary">
                ← Volver al inicio de sesión
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}