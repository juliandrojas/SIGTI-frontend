import { useEffect, useState } from "react";
import api from "../../api/axios";
import { employeeAreas } from "../../data/employeeAreas";
import { canViewLoanForm, canViewLoanHistory, getStoredUser } from "../../utils/auth";
import { filterPeripheralItems } from "../../utils/inventory";

const initialForm = {
  item_id: "",
  requested_by: "",
  quantity: "1",
  position: "",
  expected_return_datetime: "",
  notes: "",
};

const normalizeName = (name = "") =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

const getCurrentUserDetails = (user) => {
  const fullName = user?.name
    ? user.lastname
      ? `${user.name} ${user.lastname}`
      : user.name
    : "";

  return { fullName, area: employeeAreas[normalizeName(fullName)] || "" };
};

export default function Loans() {
  const currentUser = getStoredUser();
  const showForm = canViewLoanForm();
  const showHistory = canViewLoanHistory();

  const [items, setItems] = useState([]);
  const [loans, setLoans] = useState([]);
  const [form, setForm] = useState(() => {
    const { fullName, area } = getCurrentUserDetails(currentUser);
    return { ...initialForm, requested_by: fullName, position: area };
  });
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const selectedItem = items.find((item) => String(item.id) === String(form.item_id));
  const availableQuantity = Number(selectedItem?.available_quantity ?? 0);
  const exceedsAvailable = Boolean(selectedItem) && Number(form.quantity) > availableQuantity;

  const loadItems = async () => {
    try {
      const response = await api.get("/inventory/items");
      setItems(filterPeripheralItems(response.data));
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
        if (itemsResponse) setItems(filterPeripheralItems(itemsResponse.data));
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

      const { fullName, area } = getCurrentUserDetails(currentUser);
      setForm({ ...initialForm, requested_by: fullName, position: area });
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
                      placeholder="Nombre del solicitante"
                      readOnly
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">Cantidad</label>
                    <input
                      type="number"
                      min="1"
                      className={`form-control ${exceedsAvailable ? "is-invalid" : ""}`}
                      name="quantity"
                      value={form.quantity}
                      onChange={handleChange}
                      required
                    />
                    {exceedsAvailable && (
                      <div className="invalid-feedback d-block" role="alert" aria-live="polite">
                        La cantidad solicitada supera las {availableQuantity} unidades disponibles.
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="position" className="form-label fw-medium">Área</label>
                    <input
                      type="text"
                      className="form-control"
                      id="position"
                      name="position"
                      value={form.position}
                      placeholder="Área del solicitante"
                      readOnly
                      required
                    />
                    {!form.position && (
                      <div className="form-text text-danger">No se encontró un área para este solicitante en el informe de empleados.</div>
                    )}
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
                    <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={exceedsAvailable}>
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
