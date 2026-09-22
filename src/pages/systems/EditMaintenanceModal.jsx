import { useState } from "react";
import api from "../../api/axios";
import { addMaintenancePeriod, formatDateDisplay, parseDisplayDate } from "../../utils/maintenance";

export default function EditMaintenanceModal({ record, onClose, onSaved }) {
  const [performedAt, setPerformedAt] = useState(formatDateDisplay(record.performed_at));
  const [notes, setNotes] = useState(record.notes || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const parsedDate = parseDisplayDate(performedAt);
  const nextDate = parsedDate ? addMaintenancePeriod(parsedDate) : "";
  const technician = [record.technician_name, record.technician_lastname].filter(Boolean).join(" ") || "Sin técnico registrado";

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!parsedDate) {
      setError("La fecha debe tener el formato DD-MM-AAAA y ser válida.");
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/inventory/maintenance/${record.id}`, { performed_at: parsedDate, notes });
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo actualizar el mantenimiento.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal d-block" role="dialog" aria-modal="true" aria-labelledby="edit-maintenance-title" style={{ background: "rgba(15, 23, 42, .45)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content admin-action-modal">
          <div className="modal-header">
            <h2 className="modal-title h5" id="edit-maintenance-title">Editar mantenimiento</h2>
            <button type="button" className="btn-close" aria-label="Cerrar" onClick={onClose} disabled={saving} />
          </div>
          <form onSubmit={submit}>
            <div className="modal-body">
              <p className="mb-1"><strong>Equipo:</strong> {record.asset_code || "Sin código"} — {record.item_name}</p>
              <p className="text-muted small mb-3"><strong>Técnico:</strong> {technician}</p>
              {error && <div className="alert alert-danger" role="alert">{error}</div>}
              <div className="mb-3">
                <label className="form-label" htmlFor="edit-maintenance-date">Fecha realizada</label>
                <input id="edit-maintenance-date" className="form-control" type="text" inputMode="numeric" placeholder="DD-MM-AAAA" pattern="\d{2}-\d{2}-\d{4}" required value={performedAt} onChange={(event) => setPerformedAt(event.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="edit-maintenance-next">Próximo mantenimiento</label>
                <input id="edit-maintenance-next" className="form-control" type="text" value={formatDateDisplay(nextDate)} readOnly />
              </div>
              <div>
                <label className="form-label" htmlFor="edit-maintenance-notes">Observaciones</label>
                <textarea id="edit-maintenance-notes" className="form-control" rows="3" value={notes} onChange={(event) => setNotes(event.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
