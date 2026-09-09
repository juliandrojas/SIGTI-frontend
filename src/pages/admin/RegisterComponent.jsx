import { useState } from "react";
import api from "../../api/axios";

const initialForm = {
  name: "", category: "component", brand: "", reference: "", model: "", serial_number: "",
  quantity: "1", available_quantity: "1", condition: "good", location: "bodega", status: "available", notes: "",
};

export default function RegisterComponent() {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      await api.post("/inventory/items", { ...form, quantity: Number(form.quantity), available_quantity: Number(form.available_quantity) });
      setForm(initialForm);
      setMessage("Componente registrado correctamente.");
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo registrar el componente.");
    }
  };

  return (
    <div className="container py-4">
      <p className="text-uppercase text-primary small fw-semibold mb-1">Gestión de activos</p>
      <h1 className="h3 fw-bold mb-4">Registrar componente</h1>
      <div className="card shadow-sm border-0">
        <div className="card-body">
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit} className="row g-3">
            {[
              ["name", "Nombre", "col-12"], ["category", "Categoría", "col-md-6"], ["brand", "Marca", "col-md-6"],
              ["reference", "Referencia", "col-md-6"], ["model", "Modelo", "col-md-6"], ["serial_number", "Serial", "col-md-6"],
              ["quantity", "Cantidad total", "col-md-6"], ["available_quantity", "Disponible", "col-md-6"],
              ["location", "Ubicación", "col-md-6"],
            ].map(([name, label, column]) => (
              <div className={column} key={name}>
                <label className="form-label" htmlFor={`component-${name}`}>{label}</label>
                <input id={`component-${name}`} type={["quantity", "available_quantity"].includes(name) ? "number" : "text"} min={["quantity", "available_quantity"].includes(name) ? "0" : undefined} className="form-control" name={name} value={form[name]} onChange={handleChange} required={name === "name"} />
              </div>
            ))}
            <div className="col-md-6"><label className="form-label" htmlFor="component-condition">Condición</label><select id="component-condition" className="form-select" name="condition" value={form.condition} onChange={handleChange}><option value="good">Bueno</option><option value="warning">Advertencia</option><option value="damaged">Dañado</option></select></div>
            <div className="col-md-6"><label className="form-label" htmlFor="component-status">Estado</label><select id="component-status" className="form-select" name="status" value={form.status} onChange={handleChange}><option value="available">Disponible</option><option value="loaned">Prestado</option><option value="maintenance">Mantenimiento</option></select></div>
            <div className="col-12"><label className="form-label" htmlFor="component-notes">Notas</label><textarea id="component-notes" className="form-control" rows="3" name="notes" value={form.notes} onChange={handleChange} /></div>
            <div className="col-12"><button type="submit" className="btn btn-primary">Guardar componente</button></div>
          </form>
        </div>
      </div>
    </div>
  );
}
