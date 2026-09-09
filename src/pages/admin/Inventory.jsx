import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
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
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const response = await api.get("/inventory/items");
      setItems(response.data);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudieron cargar los artículos.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await api.post("/inventory/items", {
        ...form,
        quantity: Number(form.quantity || 0),
        available_quantity: Number(form.available_quantity || form.quantity || 0),
      });

      setForm({
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
      });

      await loadItems();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo crear el artículo.");
    }
  };

  return (
    <div className="container py-4">
      <div className="row g-4 align-items-start">
        <div className="col-lg-5">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h2 className="h4 fw-bold mb-3">Registrar componente</h2>
              {error && <div className="alert alert-danger py-2">{error}</div>}
              <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-12">
                  <label className="form-label">Nombre</label>
                  <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Categoría</label>
                  <input className="form-control" name="category" value={form.category} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Marca</label>
                  <input className="form-control" name="brand" value={form.brand} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Referencia</label>
                  <input className="form-control" name="reference" value={form.reference} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Modelo</label>
                  <input className="form-control" name="model" value={form.model} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Serial</label>
                  <input className="form-control" name="serial_number" value={form.serial_number} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Cantidad total</label>
                  <input type="number" min="0" className="form-control" name="quantity" value={form.quantity} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Disponible</label>
                  <input type="number" min="0" className="form-control" name="available_quantity" value={form.available_quantity} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Condición</label>
                  <select className="form-select" name="condition" value={form.condition} onChange={handleChange}>
                    <option value="good">Bueno</option>
                    <option value="warning">Advertencia</option>
                    <option value="damaged">Dañado</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Ubicación</label>
                  <input className="form-control" name="location" value={form.location} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Estado</label>
                  <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                    <option value="available">Disponible</option>
                    <option value="loaned">Prestado</option>
                    <option value="maintenance">Mantenimiento</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Notas</label>
                  <textarea className="form-control" rows="3" name="notes" value={form.notes} onChange={handleChange} />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary w-100">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h2 className="h4 fw-bold mb-3">Inventario</h2>
              {loading ? (
                <p className="text-muted">Cargando...</p>
              ) : items.length === 0 ? (
                <p className="text-muted">No hay artículos registrados.</p>
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
                      {items.map((item) => (
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
