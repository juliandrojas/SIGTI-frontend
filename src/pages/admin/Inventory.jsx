import { useEffect, useState } from "react";
import api from "../../api/axios";

const emptyItemForm = {
  name: "",
  category: "component",
  brand: "",
  reference: "",
  model: "",
  serial_number: "",
  quantity: "1",
  available_quantity: "1",
  condition: "good",
  location: "bodega",
  status: "available",
  notes: "",
};

const emptyLoanForm = {
  item_id: "",
  requested_by: "",
  quantity: "1",
  position: "",
  expected_return_datetime: "",
  notes: "",
};

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [loanForm, setLoanForm] = useState(emptyLoanForm);
  const [itemSearch, setItemSearch] = useState("");
  const [itemStatusFilter, setItemStatusFilter] = useState("all");
  const [loanSearch, setLoanSearch] = useState("");
  const [loanStatusFilter, setLoanStatusFilter] = useState("all");
  const [itemPage, setItemPage] = useState(1);
  const [loanPage, setLoanPage] = useState(1);

  const ITEMS_PER_PAGE = 5;
  const LOANS_PER_PAGE = 5;

  const loadItems = async () => {
    try {
      const response = await api.get("/inventory/items");
      setItems(response.data);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudieron cargar los artículos.");
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
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        await Promise.all([loadItems(), loadLoans()]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleItemChange = (event) => {
    const { name, value } = event.target;
    setItemForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoanChange = (event) => {
    const { name, value } = event.target;
    setLoanForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...itemForm,
        quantity: Number(itemForm.quantity || 0),
        available_quantity: Number(itemForm.available_quantity || itemForm.quantity || 0),
      };

      await api.post("/inventory/items", payload);
      setItemForm(emptyItemForm);
      setSuccess("Artículo registrado correctamente.");
      await Promise.all([loadItems(), loadLoans()]);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo crear el artículo.");
    }
  };

  const handleLoanSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const selectedItem = items.find((item) => String(item.id) === String(loanForm.item_id));

      if (!selectedItem) {
        throw new Error("Debes seleccionar un artículo válido.");
      }

      if (Number(loanForm.quantity || 0) > Number(selectedItem.available_quantity || 0)) {
        throw new Error("La cantidad solicitada supera la disponible del artículo.");
      }

      await api.post("/inventory/loans", {
        ...loanForm,
        item_id: Number(loanForm.item_id),
        quantity: Number(loanForm.quantity || 0),
      });

      setLoanForm(emptyLoanForm);
      setSuccess("Préstamo registrado correctamente.");
      await Promise.all([loadItems(), loadLoans()]);
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "No se pudo registrar el préstamo.";
      setError(message);
    }
  };

  const handleReturnLoan = async (loanId) => {
    setError("");
    setSuccess("");

    try {
      await api.patch(`/inventory/loans/${loanId}/return`, {
        actual_return_datetime: new Date().toISOString(),
        return_signature: "Entrega registrada por sistema",
      });

      setSuccess("Artículo devuelto correctamente.");
      await Promise.all([loadItems(), loadLoans()]);
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "No se pudo registrar la devolución.";
      setError(message);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = !itemSearch || item.name?.toLowerCase().includes(itemSearch.toLowerCase());
    const matchesStatus = itemStatusFilter === "all" || item.status === itemStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredLoans = loans.filter((loan) => {
    const matchesSearch = !loanSearch ||
      loan.requested_by?.toLowerCase().includes(loanSearch.toLowerCase()) ||
      loan.item_name?.toLowerCase().includes(loanSearch.toLowerCase());
    const matchesStatus = loanStatusFilter === "all" || loan.status === loanStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const itemPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const loanPages = Math.max(1, Math.ceil(filteredLoans.length / LOANS_PER_PAGE));

  const safeItemPage = Math.min(itemPage, itemPages);
  const safeLoanPage = Math.min(loanPage, loanPages);

  const paginatedItems = filteredItems.slice((safeItemPage - 1) * ITEMS_PER_PAGE, safeItemPage * ITEMS_PER_PAGE);
  const paginatedLoans = filteredLoans.slice((safeLoanPage - 1) * LOANS_PER_PAGE, safeLoanPage * LOANS_PER_PAGE);

  const totalAvailable = items.reduce((sum, item) => sum + Number(item.available_quantity || 0), 0);
  const activeLoans = loans.filter((loan) => loan.status === "active").length;
  const lowStockItems = items.filter((item) => Number(item.available_quantity || 0) <= 1).length;

  const clearItemFilters = () => {
    setItemSearch("");
    setItemStatusFilter("all");
    setItemPage(1);
  };

  const clearLoanFilters = () => {
    setLoanSearch("");
    setLoanStatusFilter("all");
    setLoanPage(1);
  };

  return (
    <div className="container py-4">
      {success && <div className="alert alert-success py-2">{success}</div>}
      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h4 fw-bold mb-0">Dashboard de inventario</h2>
          </div>

          <div className="row g-3">
            <div className="col-md-3">
              <div className="border rounded-3 p-3 h-100 bg-light">
                <div className="text-muted small">Total de items</div>
                <div className="fs-3 fw-bold">{items.length}</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="border rounded-3 p-3 h-100 bg-light">
                <div className="text-muted small">Disponibles</div>
                <div className="fs-3 fw-bold text-success">{totalAvailable}</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="border rounded-3 p-3 h-100 bg-light">
                <div className="text-muted small">Préstamos activos</div>
                <div className="fs-3 fw-bold text-warning">{activeLoans}</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="border rounded-3 p-3 h-100 bg-light">
                <div className="text-muted small">Bajo stock</div>
                <div className="fs-3 fw-bold text-danger">{lowStockItems}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 align-items-start">
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h2 className="h4 fw-bold mb-3">Registrar componente</h2>
              <form onSubmit={handleItemSubmit} className="row g-3">
                <div className="col-12">
                  <label className="form-label">Nombre</label>
                  <input className="form-control" name="name" value={itemForm.name} onChange={handleItemChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Categoría</label>
                  <input className="form-control" name="category" value={itemForm.category} onChange={handleItemChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Marca</label>
                  <input className="form-control" name="brand" value={itemForm.brand} onChange={handleItemChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Referencia</label>
                  <input className="form-control" name="reference" value={itemForm.reference} onChange={handleItemChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Modelo</label>
                  <input className="form-control" name="model" value={itemForm.model} onChange={handleItemChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Serial</label>
                  <input className="form-control" name="serial_number" value={itemForm.serial_number} onChange={handleItemChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Cantidad total</label>
                  <input type="number" min="0" className="form-control" name="quantity" value={itemForm.quantity} onChange={handleItemChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Disponible</label>
                  <input type="number" min="0" className="form-control" name="available_quantity" value={itemForm.available_quantity} onChange={handleItemChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Condición</label>
                  <select className="form-select" name="condition" value={itemForm.condition} onChange={handleItemChange}>
                    <option value="good">Bueno</option>
                    <option value="warning">Advertencia</option>
                    <option value="damaged">Dañado</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Ubicación</label>
                  <input className="form-control" name="location" value={itemForm.location} onChange={handleItemChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Estado</label>
                  <select className="form-select" name="status" value={itemForm.status} onChange={handleItemChange}>
                    <option value="available">Disponible</option>
                    <option value="loaned">Prestado</option>
                    <option value="maintenance">Mantenimiento</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Notas</label>
                  <textarea className="form-control" rows="3" name="notes" value={itemForm.notes} onChange={handleItemChange} />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary w-100">Guardar</button>
                </div>
              </form>
            </div>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h2 className="h4 fw-bold mb-3">Registrar préstamo</h2>
              <form onSubmit={handleLoanSubmit} className="row g-3">
                <div className="col-12">
                  <label className="form-label">Artículo</label>
                  <select className="form-select" name="item_id" value={loanForm.item_id} onChange={handleLoanChange} required>
                    <option value="">Selecciona un artículo</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>{item.name} ({item.available_quantity} disponibles)</option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Solicitante</label>
                  <input className="form-control" name="requested_by" value={loanForm.requested_by} onChange={handleLoanChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Cantidad</label>
                  <input type="number" min="1" className="form-control" name="quantity" value={loanForm.quantity} onChange={handleLoanChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Cargo/Posición</label>
                  <input className="form-control" name="position" value={loanForm.position} onChange={handleLoanChange} />
                </div>
                <div className="col-12">
                  <label className="form-label">Fecha esperada de devolución</label>
                  <input type="datetime-local" className="form-control" name="expected_return_datetime" value={loanForm.expected_return_datetime} onChange={handleLoanChange} />
                </div>
                <div className="col-12">
                  <label className="form-label">Notas</label>
                  <textarea className="form-control" rows="3" name="notes" value={loanForm.notes} onChange={handleLoanChange} />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary w-100">Guardar préstamo</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h2 className="h4 fw-bold mb-3">Inventario</h2>
              <div className="row g-2 mb-3">
                <div className="col-md-8">
                  <input
                    className="form-control"
                    placeholder="Buscar por nombre"
                    value={itemSearch}
                    onChange={(event) => setItemSearch(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") setItemPage(1);
                    }}
                  />
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={itemStatusFilter}
                    onChange={(event) => {
                      setItemStatusFilter(event.target.value);
                      setItemPage(1);
                    }}
                  >
                    <option value="all">Todos los estados</option>
                    <option value="available">Disponible</option>
                    <option value="loaned">Prestado</option>
                    <option value="maintenance">Mantenimiento</option>
                  </select>
                </div>
                <div className="col-12 d-flex justify-content-end">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={clearItemFilters}>
                    Limpiar filtros
                  </button>
                </div>
              </div>

              {loading ? (
                <p className="text-muted">Cargando...</p>
              ) : filteredItems.length === 0 ? (
                <p className="text-muted">No hay artículos registrados con esos filtros.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Marca</th>
                        <th>Stock</th>
                        <th>Disponible</th>
                        <th>Ubicación</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedItems.map((item) => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>{item.brand || "-"}</td>
                          <td>{item.quantity}</td>
                          <td>{item.available_quantity}</td>
                          <td>{item.location}</td>
                          <td>
                            <span className={`badge ${item.status === "available" ? "bg-success" : item.status === "loaned" ? "bg-warning text-dark" : "bg-secondary"}`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <small className="text-muted">
                      Página {safeItemPage} de {itemPages}
                    </small>
                    <div className="btn-group" role="group">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        disabled={safeItemPage === 1}
                        onClick={() => setItemPage((page) => Math.max(1, page - 1))}
                      >
                        Anterior
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        disabled={safeItemPage === itemPages}
                        onClick={() => setItemPage((page) => Math.min(itemPages, page + 1))}
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h2 className="h4 fw-bold mb-3">Préstamos</h2>
              <div className="row g-2 mb-3">
                <div className="col-md-8">
                  <input
                    className="form-control"
                    placeholder="Buscar por solicitante o artículo"
                    value={loanSearch}
                    onChange={(event) => setLoanSearch(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") setLoanPage(1);
                    }}
                  />
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={loanStatusFilter}
                    onChange={(event) => {
                      setLoanStatusFilter(event.target.value);
                      setLoanPage(1);
                    }}
                  >
                    <option value="all">Todos</option>
                    <option value="active">Activos</option>
                    <option value="returned">Devueltos</option>
                  </select>
                </div>
                <div className="col-12 d-flex justify-content-end">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={clearLoanFilters}>
                    Limpiar filtros
                  </button>
                </div>
              </div>

              {loans.length === 0 ? (
                <p className="text-muted">No hay préstamos registrados.</p>
              ) : filteredLoans.length === 0 ? (
                <p className="text-muted">No hay préstamos con esos filtros.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Artículo</th>
                        <th>Solicitante</th>
                        <th>Cantidad</th>
                        <th>Estado</th>
                        <th>Entrega</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedLoans.map((loan) => (
                        <tr key={loan.id}>
                          <td>{loan.item_name || loan.item_id}</td>
                          <td>{loan.requested_by}</td>
                          <td>{loan.quantity}</td>
                          <td>
                            <span className={`badge ${loan.status === "active" ? "bg-warning text-dark" : "bg-success"}`}>
                              {loan.status}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2 align-items-center">
                              <span>{loan.start_datetime ? new Date(loan.start_datetime).toLocaleString() : "-"}</span>
                              {loan.status === "active" && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => handleReturnLoan(loan.id)}
                                >
                                  Devolver
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <small className="text-muted">
                      Página {safeLoanPage} de {loanPages}
                    </small>
                    <div className="btn-group" role="group">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        disabled={safeLoanPage === 1}
                        onClick={() => setLoanPage((page) => Math.max(1, page - 1))}
                      >
                        Anterior
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        disabled={safeLoanPage === loanPages}
                        onClick={() => setLoanPage((page) => Math.min(loanPages, page + 1))}
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
