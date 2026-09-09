import { useEffect, useState } from "react";
import api from "../../api/axios";

const initialForm = { item_id: "", requested_by: "", quantity: "1", position: "", expected_return_datetime: "", notes: "" };

export default function Loans() {
  const [items, setItems] = useState([]);
  const [loans, setLoans] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    const [itemsResponse, loansResponse] = await Promise.all([api.get("/inventory/items"), api.get("/inventory/loans")]);
    setItems(itemsResponse.data);
    setLoans(loansResponse.data);
  };
  useEffect(() => {
    let active = true;
    Promise.all([api.get("/inventory/items"), api.get("/inventory/loans")])
      .then(([itemsResponse, loansResponse]) => {
        if (!active) return;
        setItems(itemsResponse.data);
        setLoans(loansResponse.data);
      })
      .catch((err) => {
        if (active) setError(err?.response?.data?.message || "No se pudieron cargar los préstamos.");
      });

    return () => {
      active = false;
    };
  }, []);
  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const handleSubmit = async (event) => {
    event.preventDefault(); setError(""); setMessage("");
    try {
      const item = items.find((current) => String(current.id) === String(form.item_id));
      if (!item) throw new Error("Debes seleccionar un artículo válido.");
      if (Number(form.quantity) > Number(item.available_quantity)) throw new Error("La cantidad solicitada supera la disponible.");
      await api.post("/inventory/loans", { ...form, item_id: Number(form.item_id), quantity: Number(form.quantity) });
      setForm(initialForm); setMessage("Préstamo registrado correctamente."); await loadData();
    } catch (err) { setError(err?.response?.data?.message || err.message || "No se pudo registrar el préstamo."); }
  };
  const handleReturn = async (id) => {
    try { await api.patch(`/inventory/loans/${id}/return`, { actual_return_datetime: new Date().toISOString(), return_signature: "Entrega registrada por sistema" }); setMessage("Artículo devuelto correctamente."); await loadData(); }
    catch (err) { setError(err?.response?.data?.message || "No se pudo registrar la devolución."); }
  };
  const filteredLoans = loans.filter((loan) => !search || loan.requested_by?.toLowerCase().includes(search.toLowerCase()) || loan.item_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="container py-4">
      <p className="text-uppercase text-primary small fw-semibold mb-1">Gestión de activos</p>
      <h1 className="h3 fw-bold mb-4">Préstamos</h1>
      {message && <div className="alert alert-success">{message}</div>}{error && <div className="alert alert-danger">{error}</div>}
      <div className="row g-4">
        <div className="col-lg-5"><div className="card shadow-sm border-0"><div className="card-body"><h2 className="h5 fw-bold mb-3">Registrar préstamo</h2><form onSubmit={handleSubmit} className="row g-3">
          <div className="col-12"><label className="form-label">Artículo</label><select className="form-select" name="item_id" value={form.item_id} onChange={handleChange} required><option value="">Selecciona un artículo</option>{items.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.available_quantity} disponibles)</option>)}</select></div>
          <div className="col-12"><label className="form-label">Solicitante</label><input className="form-control" name="requested_by" value={form.requested_by} onChange={handleChange} required /></div>
          <div className="col-md-6"><label className="form-label">Cantidad</label><input type="number" min="1" className="form-control" name="quantity" value={form.quantity} onChange={handleChange} required /></div>
          <div className="col-md-6"><label className="form-label">Cargo/Posición</label><input className="form-control" name="position" value={form.position} onChange={handleChange} /></div>
          <div className="col-12"><label className="form-label">Fecha esperada de devolución</label><input type="datetime-local" className="form-control" name="expected_return_datetime" value={form.expected_return_datetime} onChange={handleChange} /></div>
          <div className="col-12"><label className="form-label">Notas</label><textarea className="form-control" rows="3" name="notes" value={form.notes} onChange={handleChange} /></div>
          <div className="col-12"><button className="btn btn-primary w-100">Guardar préstamo</button></div>
        </form></div></div></div>
        <div className="col-lg-7"><div className="card shadow-sm border-0"><div className="card-body"><h2 className="h5 fw-bold mb-3">Historial de préstamos</h2><input className="form-control mb-3" placeholder="Buscar por solicitante o artículo" value={search} onChange={(event) => setSearch(event.target.value)} />
          {filteredLoans.length === 0 ? <p className="text-muted mb-0">No hay préstamos registrados.</p> : <div className="table-responsive"><table className="table table-hover align-middle"><thead><tr><th>Artículo</th><th>Solicitante</th><th>Cantidad</th><th>Estado</th><th>Acción</th></tr></thead><tbody>{filteredLoans.map((loan) => <tr key={loan.id}><td>{loan.item_name || loan.item_id}</td><td>{loan.requested_by}</td><td>{loan.quantity}</td><td><span className={`badge ${loan.status === "active" ? "bg-warning text-dark" : "bg-success"}`}>{loan.status}</span></td><td>{loan.status === "active" && <button className="btn btn-sm btn-outline-success" onClick={() => handleReturn(loan.id)}>Devolver</button>}</td></tr>)}</tbody></table></div>}
        </div></div></div>
      </div>
    </div>
  );
}
