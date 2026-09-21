import { useEffect, useState } from "react";
import api from "../../api/axios";
import { filterPeripheralItems, getInventorySearchSuggestions } from "../../utils/inventory";
import FeedbackModal from "../../components/FeedbackModal";

const emptyForm = {
  name: "", category: "component", brand: "", reference: "", model: "", serial_number: "",
  quantity: 1, available_quantity: 1, condition: "good", location: "bodega", status: "available", notes: "",
};

const statusLabels = { available: "Disponible", loaned: "Prestado", maintenance: "Mantenimiento" };
const conditionLabels = { good: "Bueno", warning: "Regular", damaged: "Dañado" };

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [itemToDelete, setItemToDelete] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const load = async () => {
    try {
      const response = await api.get("/inventory/items");
      setItems(filterPeripheralItems(response.data));
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudieron cargar los artículos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const loadInitial = async () => {
      try {
        const response = await api.get("/inventory/items");
        if (active) setItems(filterPeripheralItems(response.data));
      } catch (err) {
        if (active) setError(err?.response?.data?.message || "No se pudieron cargar los artículos.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadInitial();
    return () => { active = false; };
  }, []);

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); };

  const editItem = (item) => {
    setForm({ ...emptyForm, name: item.name || "", category: "component", brand: item.brand || "", reference: item.reference || "", model: item.model || "", serial_number: item.serial_number || "", quantity: Number(item.quantity || 0), available_quantity: Number(item.available_quantity || 0), condition: item.condition || "good", location: item.location || "bodega", status: item.status || "available", notes: item.notes || "" });
    setEditingId(item.id);
    setShowForm(true);
    setError("");
    setMessage("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    const quantity = Number(form.quantity);
    const availableQuantity = Number(form.available_quantity);
    if (!form.name.trim()) return setError("El nombre del artículo es obligatorio.");
    if (!Number.isInteger(quantity) || quantity < 0 || !Number.isInteger(availableQuantity) || availableQuantity < 0) return setError("Las cantidades deben ser números enteros no negativos.");
    if (availableQuantity > quantity) return setError("La cantidad disponible no puede superar la cantidad total.");
    setSaving(true);
    try {
      const payload = { ...form, category: "component", quantity, available_quantity: availableQuantity };
      if (editingId) await api.patch(`/inventory/items/${editingId}`, payload);
      else await api.post("/inventory/items", payload);
      setMessage(editingId ? "Artículo actualizado correctamente." : "Artículo registrado correctamente.");
      resetForm();
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo guardar el artículo.");
    } finally {
      setSaving(false);
    }
  };

  const remove = (item) => setItemToDelete(item);

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setError("");
    try {
      await api.delete(`/inventory/items/${itemToDelete.id}`);
      setMessage("Artículo eliminado correctamente.");
      setItemToDelete(null);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo eliminar el artículo.");
    }
  };

  const filteredItems = items.filter((item) => {
    const term = search.toLowerCase();
    const matchesSearch = !term || [item.name, item.brand, item.model, item.serial_number].some((value) => String(value || "").toLowerCase().includes(term));
    return matchesSearch && (status === "all" || item.status === status);
  });
  const inventoryTotals = items.reduce((totals, item) => ({
    total: totals.total + Number(item.quantity || 0),
    available: totals.available + (item.status === "maintenance" ? 0 : Number(item.available_quantity || 0)),
    maintenance: totals.maintenance + (item.status === "maintenance" ? Number(item.quantity || 0) : 0),
  }), { total: 0, available: 0, maintenance: 0 });
  const borrowedUnits = Math.max(inventoryTotals.total - inventoryTotals.available - inventoryTotals.maintenance, 0);
  const suggestions = getInventorySearchSuggestions(items, search);

  return <div className="container py-4">
    <div className="d-flex justify-content-between align-items-center mb-4"><div><p className="text-uppercase text-primary small fw-semibold mb-1">Periféricos</p><h1 className="h3 fw-bold mb-0">Inventario</h1></div><div className="d-flex align-items-center gap-2"><span className="badge text-bg-light border">{filteredItems.length} periféricos</span><button className="btn btn-primary" type="button" onClick={() => { resetForm(); setShowForm(true); }}>Nuevo artículo</button></div></div>
    <FeedbackModal message={message} error={error} onClose={() => { setMessage(""); setError(""); }} />
    {showForm && <div className="card shadow-sm border-0 mb-4"><div className="card-body"><div className="d-flex justify-content-between align-items-center mb-3"><h2 className="h5 mb-0">{editingId ? "Editar artículo" : "Registrar artículo"}</h2><button type="button" className="btn-close" aria-label="Cerrar" onClick={resetForm} /></div><form onSubmit={submit} className="row g-3">
      <div className="col-md-6"><label className="form-label" htmlFor="component-name">Nombre *</label><input id="component-name" className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
      <div className="col-md-6"><label className="form-label" htmlFor="component-brand">Marca</label><input id="component-brand" className="form-control" value={form.brand || ""} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></div>
      <div className="col-md-6"><label className="form-label" htmlFor="component-model">Modelo</label><input id="component-model" className="form-control" value={form.model || ""} onChange={(e) => setForm({ ...form, model: e.target.value })} /></div>
      <div className="col-md-3"><label className="form-label" htmlFor="component-quantity">Cantidad *</label><input id="component-quantity" className="form-control" type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required /></div>
      <div className="col-md-3"><label className="form-label" htmlFor="component-available">Disponibles *</label><input id="component-available" className="form-control" type="number" min="0" value={form.available_quantity} onChange={(e) => setForm({ ...form, available_quantity: e.target.value })} required /></div>
      <div className="col-md-4"><label className="form-label" htmlFor="component-condition">Condición</label><select id="component-condition" className="form-select" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}><option value="good">Bueno</option><option value="warning">Regular</option><option value="damaged">Dañado</option></select></div>
      <div className="col-md-4"><label className="form-label" htmlFor="component-status">Estado</label><select id="component-status" className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="available">Disponible</option><option value="loaned">Prestado</option><option value="maintenance">Mantenimiento</option></select></div>
      <div className="col-md-4"><label className="form-label" htmlFor="component-location">Ubicación</label><input id="component-location" className="form-control" value={form.location || ""} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
      <div className="col-12"><label className="form-label" htmlFor="component-notes">Observaciones</label><textarea id="component-notes" className="form-control" rows="2" value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
      <div className="col-12 d-flex gap-2"><button className="btn btn-primary" type="submit" disabled={saving}>{saving ? "Guardando..." : editingId ? "Guardar cambios" : "Registrar artículo"}</button><button className="btn btn-outline-secondary" type="button" onClick={resetForm}>Cancelar</button></div>
    </form></div></div>}
    <div className="row g-3 mb-4"><div className="col-6 col-lg"><div className="card h-100"><div className="card-body py-3"><small className="text-muted d-block">Tipos de componentes</small><strong className="fs-4">{items.length}</strong></div></div></div><div className="col-6 col-lg"><div className="card h-100"><div className="card-body py-3"><small className="text-muted d-block">Unidades totales</small><strong className="fs-4">{inventoryTotals.total}</strong></div></div></div><div className="col-6 col-lg"><div className="card h-100"><div className="card-body py-3"><small className="text-muted d-block">Disponibles</small><strong className="fs-4 text-success">{inventoryTotals.available}</strong></div></div></div><div className="col-6 col-lg"><div className="card h-100"><div className="card-body py-3"><small className="text-muted d-block">Prestadas</small><strong className="fs-4 text-primary">{borrowedUnits}</strong></div></div></div><div className="col-6 col-lg"><div className="card h-100"><div className="card-body py-3"><small className="text-muted d-block">En mantenimiento</small><strong className="fs-4 text-warning">{inventoryTotals.maintenance}</strong></div></div></div></div>
    <div className="card shadow-sm border-0"><div className="card-body"><div className="row g-2 mb-4"><div className="col-md-8 position-relative"><label className="visually-hidden" htmlFor="inventory-search">Buscar por nombre</label><input id="inventory-search" className="form-control" placeholder="Buscar por nombre, marca o modelo" value={search} autoComplete="off" onChange={(event) => setSearch(event.target.value)} />{suggestions.length > 0 && <div className="list-group position-absolute w-100 shadow-sm" style={{ zIndex: 10 }} role="listbox" aria-label="Sugerencias de búsqueda">{suggestions.map((suggestion) => <button key={suggestion} type="button" className="list-group-item list-group-item-action" onMouseDown={(event) => event.preventDefault()} onClick={() => setSearch(suggestion)}><i className="bi bi-search me-2 text-muted" aria-hidden="true" />{suggestion}</button>)}</div>}</div><div className="col-md-4"><label className="visually-hidden" htmlFor="inventory-status">Filtrar por estado</label><select id="inventory-status" className="form-select" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Todos los estados</option><option value="available">Disponible</option><option value="loaned">Prestado</option><option value="maintenance">Mantenimiento</option></select></div></div>{loading ? <p className="text-muted">Cargando...</p> : filteredItems.length === 0 ? <p className="text-muted mb-0">No hay artículos con esos filtros.</p> : <div className="table-responsive"><table className="table table-hover align-middle mb-0"><thead><tr><th>Artículo</th><th>Marca / modelo</th><th>Disponibles</th><th>Condición</th><th>Estado</th><th className="text-end">Acciones</th></tr></thead><tbody>{filteredItems.map((item) => <tr key={item.id}><td className="fw-semibold">{item.name}<small className="d-block text-muted">{item.location || "Sin ubicación"}</small></td><td>{[item.brand, item.model].filter(Boolean).join(" / ") || "-"}</td><td>{item.available_quantity}</td><td>{conditionLabels[item.condition] || item.condition || "-"}</td><td><span className={`badge ${item.status === "available" ? "bg-success" : item.status === "loaned" ? "bg-warning text-dark" : "bg-secondary"}`}>{statusLabels[item.status] || item.status}</span></td><td className="text-end"><button className="btn btn-sm btn-outline-primary me-1" type="button" onClick={() => editItem(item)}>Editar</button><button className="btn btn-sm btn-outline-danger" type="button" onClick={() => remove(item)}>Eliminar</button></td></tr>)}</tbody></table></div>}</div></div>
    {itemToDelete && <div className="modal d-block" role="dialog" aria-modal="true" aria-labelledby="delete-inventory-title" style={{ background: "rgba(15, 23, 42, .45)" }}><div className="modal-dialog modal-dialog-centered"><div className="modal-content inventory-delete-modal"><div className="modal-header"><h2 className="modal-title h5" id="delete-inventory-title">Eliminar artículo</h2><button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setItemToDelete(null)} /></div><div className="modal-body"><p className="mb-0">¿Eliminar <strong>{itemToDelete.name}</strong>? Esta acción no se puede deshacer.</p></div><div className="modal-footer"><button type="button" className="btn btn-outline-secondary" onClick={() => setItemToDelete(null)}>Cancelar</button><button type="button" className="btn btn-danger" onClick={confirmDelete}>Eliminar</button></div></div></div></div>}
  </div>;
}
