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
import { filterComputerItems } from "../../utils/inventory";
import FeedbackModal from "../../components/FeedbackModal";
import EditMaintenanceModal from "./EditMaintenanceModal";

const newForm = () => ({ item_id: "", performed_at: formatDateDisplay(todayIso()), notes: "" });

export default function Maintenance() {
  const [items, setItems] = useState([]);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(newForm);
  const [equipmentSearch, setEquipmentSearch] = useState("");
  const [equipmentOpen, setEquipmentOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [duplicateRecord, setDuplicateRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const performedDate = parseDisplayDate(form.performed_at);
  const nextDate = performedDate ? addMaintenancePeriod(performedDate) : "";
  const equipmentLabel = (item) => [item.asset_code, item.name, item.serial_number].filter(Boolean).join(" — ");
  const getRecordAssetCode = (record) => record.asset_code || items.find((item) => Number(item.id) === Number(record.item_id))?.asset_code || "—";
  const filteredEquipment = items.filter((item) => {
    const query = equipmentSearch.trim().toLowerCase();
    if (!query) return true;
    return equipmentLabel(item).toLowerCase().includes(query);
  }).slice(0, 12);

  const load = async () => {
    const [itemsResponse, recordsResponse] = await Promise.allSettled([
      api.get("/inventory/items"),
      api.get("/inventory/maintenance"),
    ]);
    if (itemsResponse.status === "fulfilled") setItems(filterComputerItems(itemsResponse.value.data));
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
      if (itemsResponse.status === "fulfilled") setItems(filterComputerItems(itemsResponse.value.data));
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
      setEquipmentSearch("");
      setEquipmentOpen(false);
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

  const maintenanceUpdated = () => {
    setEditingRecord(null);
    setMessage("Mantenimiento actualizado correctamente.");
    load();
  };

  return <main className="app-page">
    <div className="d-flex justify-content-between align-items-end gap-3 mb-4">
      <div><p className="page-kicker mb-2">Área de Sistemas</p><h1 className="page-title">Mantenimiento</h1><p className="page-subtitle mb-0">Registra equipos y su mantenimiento semestral.</p></div>
      <span className="status-pill"><i className="bi bi-calendar-check me-2" />Periodicidad: 6 meses</span>
    </div>
    <FeedbackModal message={message} error={error} onClose={() => { setMessage(""); setError(""); }} />
    <div className="card card-body mb-4"><h2 className="h5 mb-3">Registrar equipo</h2><RegisterComponent embedded existingItems={items} onSaved={load} /></div>
    <div className="card card-body mb-4"><h2 className="h5 mb-3">Registrar mantenimiento</h2>
      <form className="row g-3" onSubmit={submit}>
        <div className="col-md-6 position-relative"><label className="form-label" htmlFor="maintenance-item">Equipo</label><input id="maintenance-item" className="form-control" type="search" required={!form.item_id} autoComplete="off" role="combobox" aria-autocomplete="list" aria-expanded={equipmentOpen} aria-controls="maintenance-equipment-options" placeholder="Busca por código EF, equipo o serial" value={equipmentSearch} onFocus={() => setEquipmentOpen(true)} onChange={(event) => { setEquipmentSearch(event.target.value); setForm({ ...form, item_id: "" }); setEquipmentOpen(true); }} onBlur={() => window.setTimeout(() => setEquipmentOpen(false), 150)} />{equipmentOpen && <div id="maintenance-equipment-options" className="list-group position-absolute w-100 shadow-sm maintenance-equipment-options" role="listbox">{filteredEquipment.length ? filteredEquipment.map((item) => <button key={item.id} type="button" className={`list-group-item list-group-item-action text-start ${Number(form.item_id) === Number(item.id) ? "active" : ""}`} role="option" aria-selected={Number(form.item_id) === Number(item.id)} onMouseDown={(event) => event.preventDefault()} onClick={() => { setForm({ ...form, item_id: String(item.id) }); setEquipmentSearch(equipmentLabel(item)); setEquipmentOpen(false); }}><strong className="d-block">{item.asset_code || "Sin código"}</strong><span>{item.name}{item.serial_number ? ` — ${item.serial_number}` : ""}</span></button>) : <div className="list-group-item text-muted">No hay equipos que coincidan.</div>}</div>}</div>
        <div className="col-md-3"><label className="form-label" htmlFor="maintenance-date">Fecha realizada</label><input id="maintenance-date" className="form-control" type="text" inputMode="numeric" placeholder="DD-MM-AAAA" pattern="\d{2}-\d{2}-\d{4}" required value={form.performed_at} onChange={(event) => setForm({ ...form, performed_at: event.target.value })} /><small className="text-muted">Formato: DD-MM-AAAA</small></div>
        <div className="col-md-3"><label className="form-label" htmlFor="maintenance-next">Próximo mantenimiento</label><input id="maintenance-next" className="form-control" type="text" value={formatDateDisplay(nextDate)} readOnly /></div>
        <div className="col-12"><p className="mb-2"><strong>Actividades obligatorias:</strong> Limpieza interna y cambio de pasta térmica.</p><label className="form-label" htmlFor="maintenance-notes">Observaciones</label><textarea id="maintenance-notes" className="form-control" rows="2" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></div>
        <div className="col-12"><button className="btn btn-primary" type="submit">Guardar mantenimiento</button></div>
      </form>
    </div>
    <div className="card"><div className="card-body">
      <div className="d-flex justify-content-between align-items-center mb-3"><h2 className="h5 mb-0">Historial de Mantenimiento</h2><span className="badge text-bg-light border">{records.length} registros</span></div>
      <div className="table-responsive"><table className="table table-hover align-middle mb-0">
        <thead><tr><th>Código</th><th>Equipo</th><th>Fecha</th><th>Próxima fecha</th><th>Técnico</th><th>Observaciones</th><th>Acciones</th></tr></thead>
        <tbody>
          {records.map((record) => <tr key={record.id}>
            <td className="fw-semibold">{getRecordAssetCode(record)}</td>
            <td>{record.item_name}<small className="d-block text-muted">{record.serial_number || "Sin serial"}</small></td>
            <td>{formatDateDisplay(record.performed_at)}</td>
            <td>{formatDateDisplay(record.next_due_date)}</td>
            <td>{[record.technician_name, record.technician_lastname].filter(Boolean).join(" ") || "-"}</td>
            <td>{record.notes || "-"}</td>
            <td><button type="button" className="btn btn-sm btn-outline-primary" onClick={() => { setEditingRecord(record); setMessage(""); setError(""); }}>Editar</button></td>
          </tr>)}
          {!records.length && <tr><td colSpan="7" className="text-center text-muted py-4">Aún no hay mantenimientos registrados.</td></tr>}
        </tbody>
      </table></div>
    </div></div>
    {editingRecord && <EditMaintenanceModal record={editingRecord} onClose={() => setEditingRecord(null)} onSaved={maintenanceUpdated} />}
    {duplicateRecord && <div className="modal d-block" role="dialog" aria-modal="true" aria-labelledby="duplicate-maintenance-title" style={{ background: "rgba(15, 23, 42, .45)" }}><div className="modal-dialog modal-dialog-centered"><div className="modal-content"><div className="modal-header"><h2 className="modal-title h5" id="duplicate-maintenance-title">Mantenimiento reciente</h2><button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setDuplicateRecord(null)} /></div><div className="modal-body"><p className="mb-0">{duplicateRecord.message || `A este equipo ya se le hizo mantenimiento. El próximo está programado para el ${formatDateDisplay(duplicateRecord.next_due_date)}.`}</p></div><div className="modal-footer"><button type="button" className="btn btn-primary" onClick={() => setDuplicateRecord(null)}>Entendido</button></div></div></div></div>}
  </main>;
}
