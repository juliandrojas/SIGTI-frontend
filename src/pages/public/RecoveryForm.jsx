import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

export default function RecoveryForm() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("El enlace de recuperación no es válido.");
      return;
    }

    if (!/^[a-f0-9]{64}$/i.test(token)) {
      setError("El enlace de recuperación no es válido.");
      return;
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/users/reset-password", {
        token,
        password: newPassword,
      });

      setSuccess(true);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "No se pudo actualizar la contraseña. El enlace puede haber expirado.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccess(false);
    navigate("/login");
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light py-5">
      <div
        className="card border-0 shadow rounded-4 p-3 p-md-4 bg-white"
        style={{ width: "100%", maxWidth: "440px" }}
      >
        <div className="card-body">
          <div className="text-center mb-4">
            <span className="badge bg-primary-subtle text-primary fw-semibold px-3 py-2 rounded-pill mb-2">
              PETRO-SIGTI
            </span>
            <h3 className="fw-bold text-dark mt-1 mb-1">Restablecer contraseña</h3>
            <p className="text-secondary small mb-0">
              Ingresa tu nueva contraseña para continuar.
            </p>
          </div>

          {error && (
            <div className="alert alert-danger border-0 small py-2 px-3 mb-4 rounded-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label small fw-semibold text-secondary">
                Nueva contraseña
              </label>
              <input
                type="password"
                className="form-control form-control-lg fs-6 bg-light border-0"
                id="newPassword"
                value={newPassword}
                placeholder="••••••••"
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPassword" className="form-label small fw-semibold text-secondary">
                Confirmar contraseña
              </label>
              <input
                type="password"
                className="form-control form-control-lg fs-6 bg-light border-0"
                id="confirmPassword"
                value={confirmPassword}
                placeholder="••••••••"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="d-grid mb-3">
              <button
                type="submit"
                className="btn btn-primary btn-lg fs-6 fw-semibold rounded-3 py-2 shadow-sm"
                disabled={loading}
              >
                {loading ? "Actualizando..." : "Guardar nueva contraseña"}
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

      {success && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">Contraseña actualizada</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
                  onClick={handleSuccessClose}
                ></button>
              </div>
              <div className="modal-body pt-2">
                <p className="mb-0 text-secondary">
                  Tu contraseña se actualizó correctamente. Ahora puedes iniciar sesión con la nueva credencial.
                </p>
              </div>
              <div className="modal-footer border-0 pt-2">
                <button
                  type="button"
                  className="btn btn-primary px-4"
                  onClick={handleSuccessClose}
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
