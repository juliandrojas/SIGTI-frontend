import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  addMaintenancePeriod,
  defaultMaintenanceTasks,
  formatDateDisplay,
  isMaintenanceRecent,
  parseDisplayDate,
  todayIso,
} from "../../utils/maintenance";
import RegisterComponent from "../admin/RegisterComponent";

const newForm = () => ({ item_id: "", performed_at: formatDateDisplay(todayIso()), notes: "" });

export default function Maintenance() {
  const [items, setItems] = useState([]);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(newForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [duplicateRecord, setDuplicateRecord] = useState(null);
  const performedDate = parseDisplayDate(form.performed_at);
  const nextDate = performedDate ? addMaintenancePeriod(performedDate) : "";

  const load = async () => {
    const [itemsResponse, recordsResponse] = await Promise.allSettled([
      api.get("/inventory/items"),
      api.get("/inventory/maintenance"),
    ]);
    if (itemsResponse.status === "fulfilled") setItems(itemsResponse.value.data);
    if (recordsResponse.status === "fulfilled") setRecords(recordsResponse.value.data);
    if (recordsResponse.status === "rejected") {
      setError(recordsResponse.reason?.response?.status === 404
        ? "El historial de mantenimiento requiere aplicar la migración del sistema."
        : recordsResponse.reason?.response?.data?.message || "No se pudo cargar el historial de mantenimiento.");
    }
  };

  useEffect(() => {
    let active = true;
    const loadInitial = async () => {
      const [itemsResponse, recordsResponse] = await Promise.allSettled([
        api.get("/inventory/items"),
        api.get("/inventory/maintenance"),
      ]);
      if (!active) return;
      if (itemsResponse.status === "fulfilled") setItems(itemsResponse.value.data);
      if (recordsResponse.status === "fulfilled") setRecords(recordsResponse.value.data);
      if (recordsResponse.status === "rejected") {
        setError(recordsResponse.reason?.response?.status === 404
          ? "El historial de mantenimiento requiere aplicar la migración del sistema."
          : recordsResponse.reason?.response?.data?.message || "No se pudo cargar el historial de mantenimiento.");
      }
    };
    loadInitial();
    return () => { active = false; };
  }, []);

  const saveMaintenance = async () => {
    setError("");
    setMessage("");
    try {
      await api.post("/inventory/maintenance", {
        ...form,
        item_id: Number(form.item_id),
        performed_at: performedDate,
        tasks: defaultMaintenanceTasks(),
      });
      setMessage(`Mantenimiento registrado. Próxima fecha: ${formatDateDisplay(nextDate)}.`);
      setForm(newForm());
      setDuplicateRecord(null);
      await load();
    } catch (err) {
      if (err?.response?.status === 409) setDuplicateRecord(err.response.data);
      else setError(err?.response?.data?.message || "No se pudo registrar el mantenimiento.");
    }
  };

  const submit = (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!performedDate) {
      setError("La fecha debe tener el formato DD-MM-AAAA y ser válida.");
      return;
    }
    const previous = records.find((record) => Number(record.item_id) === Number(form.item_id)
      && isMaintenanceRecent(record, performedDate));
    if (previous) {
      setDuplicateRecord(previous);
      return;
    }
    saveMaintenance();
  };

  return <main className="app-page">
    <div className="d-flex justify-content-between align-items-end gap-3 mb-4">
      <div><p className="page-kicker mb-2">Área de Sistemas</p><h1 className="page-title">Mantenimiento</h1><p className="page-subtitle mb-0">Registra equipos y su mantenimiento semestral.</p></div>
      <span className="status-pill"><i className="bi bi-calendar-check me-2" />Periodicidad: 6 meses</span>
    </div>
    {message && <div className="alert alert-success">{message}</div>}
    {error && <div className="alert alert-danger">{error}</div>}
    <div className="card card-body mb-4"><h2 className="h5 mb-3">Registrar computador</h2><RegisterComponent embedded existingItems={items} onSaved={load} /></div>
    <div className="card card-body mb-4"><h2 className="h5 mb-3">Registrar mantenimiento</h2>
      <form className="row g-3" onSubmit={submit}>
        <div className="col-md-6"><label className="form-label" htmlFor="maintenance-item">Equipo</label><select id="maintenance-item" className="form-select" required value={form.item_id} onChange={(event) => setForm({ ...form, item_id: event.target.value })}><option value="">Selecciona un equipo</option>{items.map((item) => <option key={item.id} value={item.id}>{item.name}{item.serial_number ? ` — ${item.serial_number}` : ""}</option>)}</select></div>
        <div className="col-md-3"><label className="form-label" htmlFor="maintenance-date">Fecha realizada</label><input id="maintenance-date" className="form-control" type="text" inputMode="numeric" placeholder="DD-MM-AAAA" pattern="\d{2}-\d{2}-\d{4}" required value={form.performed_at} onChange={(event) => setForm({ ...form, performed_at: event.target.value })} /><small className="text-muted">Formato: DD-MM-AAAA</small></div>
        <div className="col-md-3"><label className="form-label" htmlFor="maintenance-next">Próximo mantenimiento</label><input id="maintenance-next" className="form-control" type="text" value={formatDateDisplay(nextDate)} readOnly /></div>
        <div className="col-12"><p className="mb-2"><strong>Actividades obligatorias:</strong> Limpieza interna y cambio de pasta térmica.</p><label className="form-label" htmlFor="maintenance-notes">Observaciones</label><textarea id="maintenance-notes" className="form-control" rows="2" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></div>
        <div className="col-12"><button className="btn btn-primary" type="submit">Guardar mantenimiento</button></div>
      </form>
    </div>
    <div className="card"><div className="card-body"><div className="d-flex justify-content-between align-items-center mb-3"><h2 className="h5 mb-0">Historial</h2><span className="badge text-bg-light border">{records.length} registros</span></div><div className="table-responsive"><table className="table table-hover align-middle mb-0"><thead><tr><th>Equipo</th><th>Fecha</th><th>Próxima fecha</th><th>Técnico</th><th>Observaciones</th></tr></thead><tbody>{records.map((record) => <tr key={record.id}><td>{record.item_name}<small className="d-block text-muted">{record.serial_number || "Sin serial"}</small></td><td>{formatDateDisplay(record.performed_at)}</td><td>{formatDateDisplay(record.next_due_date)}</td><td>{[record.technician_name, record.technician_lastname].filter(Boolean).join(" ") || "-"}</td><td>{record.notes || "-"}</td></tr>)}{!records.length && <tr><td colSpan="5" className="text-center text-muted py-4">Aún no hay mantenimientos registrados.</td></tr>}</tbody></table></div></div></div>
    {duplicateRecord && <div className="modal d-block" role="dialog" aria-modal="true" aria-labelledby="duplicate-maintenance-title" style={{ background: "rgba(15, 23, 42, .45)" }}><div className="modal-dialog modal-dialog-centered"><div className="modal-content"><div className="modal-header"><h2 className="modal-title h5" id="duplicate-maintenance-title">Mantenimiento reciente</h2><button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setDuplicateRecord(null)} /></div><div className="modal-body"><p className="mb-0">{duplicateRecord.message || `A este equipo ya se le hizo mantenimiento. El próximo está programado para el ${formatDateDisplay(duplicateRecord.next_due_date)}.`}</p></div><div className="modal-footer"><button type="button" className="btn btn-primary" onClick={() => setDuplicateRecord(null)}>Entendido</button></div></div></div></div>}
  </main>;
}
