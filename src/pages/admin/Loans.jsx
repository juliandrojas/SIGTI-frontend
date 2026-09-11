import { useEffect, useState } from "react";
import api from "../../api/axios";
import { canViewLoanForm, canViewLoanHistory, getStoredUser } from "../../utils/auth";

const initialForm = {
  item_id: "",
  requested_by: "",
  quantity: "1",
  position: "",
  expected_return_datetime: "",
  notes: "",
};

export default function Loans() {
  const currentUser = getStoredUser();
  const showForm = canViewLoanForm();
  const showHistory = canViewLoanHistory();

  const [items, setItems] = useState([]);
  const [loans, setLoans] = useState([]);
  const [form, setForm] = useState(() => {
    const fullName = currentUser?.name
      ? currentUser.lastname
        ? `${currentUser.name} ${currentUser.lastname}`
        : currentUser.name
      : "";
    const defaultPosition = currentUser?.role_name || "Usuario Externo";
    return { ...initialForm, requested_by: fullName, position: defaultPosition };
  });
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadItems = async () => {
    try {
      const response = await api.get("/inventory/items");
      setItems(response.data);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudieron cargar los artículos disponibles.");
    }
  };

  const loadLoans = async () => {
    try {
      const response = await api.get("/inventory/loans");
      setLoans(response.data);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudieron cargar los préstamos.");
    }
  };

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        const [itemsResponse, loansResponse] = await Promise.all([
          showForm ? api.get("/inventory/items") : Promise.resolve(null),
          showHistory ? api.get("/inventory/loans") : Promise.resolve(null),
        ]);
        if (!active) return;
        if (itemsResponse) setItems(itemsResponse.data);
        if (loansResponse) setLoans(loansResponse.data);
      } catch (err) {
        if (active) setError(err?.response?.data?.message || "No se pudieron cargar los datos del módulo.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadData();

    return () => {
      active = false;
    };
  }, [showForm, showHistory]);

  const handleChange = (event) =>
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const item = items.find((current) => String(current.id) === String(form.item_id));
      if (!item) throw new Error("Debes seleccionar un artículo válido.");
      if (Number(form.quantity) > Number(item.available_quantity)) {
        throw new Error("La cantidad solicitada supera la disponible.");
      }

      await api.post("/inventory/loans", {
        ...form,
        item_id: Number(form.item_id),
        quantity: Number(form.quantity),
      });

      const fullName = currentUser?.name
        ? currentUser.lastname
          ? `${currentUser.name} ${currentUser.lastname}`
          : currentUser.name
        : "";

      const defaultPosition = currentUser?.role_name || "Usuario Externo";
      setForm({ ...initialForm, requested_by: fullName, position: defaultPosition });
      setMessage("Solicitud de préstamo registrada correctamente.");
      await loadItems();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "No se pudo registrar el préstamo.");
    }
  };

  const handleReturn = async (id) => {
    try {
      await api.patch(`/inventory/loans/${id}/return`, {
        actual_return_datetime: new Date().toISOString(),
        return_signature: "Entrega registrada por sistema",
      });
      setMessage("Artículo devuelto correctamente.");
      await loadLoans();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo registrar la devolución.");
    }
  };

  const filteredLoans = loans.filter(
    (loan) =>
      !search ||
      loan.requested_by?.toLowerCase().includes(search.toLowerCase()) ||
      loan.item_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-4">
      {/* Mensajes globales */}
      {message && <div className="alert alert-success alert-dismissible fade show">{message}</div>}
      {error && <div className="alert alert-danger alert-dismissible fade show">{error}</div>}

      {/* Si el usuario no tiene permisos para ninguna de las dos vistas */}
      {!showForm && !showHistory && !loading && (
        <div className="alert alert-warning">
          No tienes permisos para visualizar este módulo.
        </div>
      )}

      {/* VISTA 1: Formulario de Préstamos (Únicamente para Usuario Externo - Rol 3) */}
      {showForm && (
        <div className="row justify-content-center">
          <div className="col-lg-8 col-xl-7">
            <div className="mb-4 text-center">
              <p className="text-uppercase text-primary small fw-semibold mb-1">
                Servicios al Usuario
              </p>
              <h1 className="h3 fw-bold mb-2">Solicitud de Préstamo</h1>
              <p className="text-muted">
                Completa el formulario para solicitar un artículo o equipo de TI.
              </p>
            </div>

            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h2 className="h5 fw-bold mb-3 pb-2 border-bottom">Datos del préstamo</h2>
                <form onSubmit={handleSubmit} className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-medium">Equipo / Artículo (Inventario)</label>
                    <select
                      className="form-select"
                      name="item_id"
                      value={form.item_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecciona un equipo o artículo de inventario</option>
                      {items.length === 0 ? (
                        <option value="" disabled>No hay equipos registrados en inventario</option>
                      ) : (
                        items.map((item) => {
                          const available = Number(item.available_quantity ?? 0);
                          const isAvailable = available > 0;
                          const details = [item.brand, item.model].filter(Boolean).join(" ");
                          return (
                            <option key={item.id} value={item.id} disabled={!isAvailable}>
                              {item.name} {details ? `[${details}]` : ""} — {isAvailable ? `${available} disponibles` : "Sin disponibilidad"}
                            </option>
                          );
                        })
                      )}
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-medium">Solicitante</label>
                    <input
                      className="form-control"
                      name="requested_by"
                      value={form.requested_by}
                      onChange={handleChange}
                      placeholder="Nombre del solicitante"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">Cantidad</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      name="quantity"
                      value={form.quantity}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        type="text"
                        className="form-control"
                        id="position"
                        name="position"
                        value={form.position}
                        onChange={handleChange}
                        placeholder="Cargo / Área / Posición"
                        list="google-positions-list"
                        autoComplete="off"
                        required
                      />
                      <label htmlFor="position">
                        <i className="bi bi-briefcase-fill text-primary me-1"></i> Cargo / Área / Posición
                      </label>
                      <datalist id="google-positions-list">
                        <option value="Usuario Externo" />
                        <option value="Consultoría Externa" />
                        <option value="Área de Sistemas / TI" />
                        <option value="Operaciones / Planta" />
                        <option value="Administración General" />
                        <option value="Contabilidad y Finanzas" />
                        <option value="Recursos Humanos" />
                        <option value="Comercial y Ventas" />
                        <option value="Auditoría / Control Interno" />
                        <option value="Mantenimiento y Soporte" />
                        <option value="Gerencia / Dirección" />
                      </datalist>
                    </div>
                    {/* Sugerencias rápidas con clases nativas de Bootstrap */}
                    <div className="d-flex flex-wrap gap-1 mt-2 align-items-center">
                      <span className="text-muted small me-1" style={{ fontSize: "0.75rem" }}>
                        <i className="bi bi-lightning-charge-fill text-warning me-1"></i>Sugerencias:
                      </span>
                      {["Usuario Externo", "Consultoría Externa", "Área Sistemas", "Operaciones", "Administración"].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          className={`btn btn-sm rounded-pill py-0 px-2 ${
                            form.position === chip ? "btn-primary" : "btn-outline-secondary"
                          }`}
                          style={{ fontSize: "0.75rem" }}
                          onClick={() => setForm((c) => ({ ...c, position: chip }))}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-medium">Fecha y hora esperada de devolución</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      name="expected_return_datetime"
                      value={form.expected_return_datetime}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-medium">Notas / Justificación</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      placeholder="Indica el motivo o detalles adicionales del préstamo"
                    />
                  </div>

                  <div className="col-12 mt-4">
                    <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold">
                      Guardar préstamo
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VISTA 2: Historial de Préstamos (Únicamente para Administrador - Rol 1 y Usuario Área Sistemas - Rol 2) */}
      {showHistory && (
        <div className="row">
          <div className="col-12">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
              <div>
                <p className="text-uppercase text-primary small fw-semibold mb-1">
                  Gestión de Activos
                </p>
                <h1 className="h3 fw-bold mb-0">Historial de Préstamos</h1>
              </div>
              <span className="badge bg-light text-dark border px-3 py-2">
                Total registrados: {loans.length}
              </span>
            </div>

            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <div className="row mb-3">
                  <div className="col-md-6 col-lg-5">
                    <input
                      className="form-control"
                      placeholder="Buscar por solicitante o artículo..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </div>
                </div>

                {filteredLoans.length === 0 ? (
                  <p className="text-muted mb-0 py-3 text-center">
                    No hay préstamos registrados que coincidan con la búsqueda.
                  </p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Artículo</th>
                          <th>Solicitante</th>
                          <th>Cargo</th>
                          <th>Cantidad</th>
                          <th>Fecha Registro</th>
                          <th>Fecha Devolución Estimada</th>
                          <th>Estado</th>
                          <th className="text-end">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLoans.map((loan) => (
                          <tr key={loan.id}>
                            <td className="fw-semibold">{loan.item_name || `Artículo #${loan.item_id}`}</td>
                            <td>{loan.requested_by}</td>
                            <td>{loan.position || "—"}</td>
                            <td>{loan.quantity}</td>
                            <td>
                              {loan.start_datetime
                                ? new Date(loan.start_datetime).toLocaleDateString()
                                : "—"}
                            </td>
                            <td>
                              {loan.expected_return_datetime
                                ? new Date(loan.expected_return_datetime).toLocaleDateString()
                                : "—"}
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  loan.status === "active"
                                    ? "bg-warning text-dark"
                                    : "bg-success"
                                }`}
                              >
                                {loan.status === "active" ? "Activo" : "Devuelto"}
                              </span>
                            </td>
                            <td className="text-end">
                              {loan.status === "active" && (
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => handleReturn(loan.id)}
                                >
                                  Devolver
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
