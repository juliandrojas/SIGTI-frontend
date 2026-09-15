import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

const labels = {
  temporary_loan: "Préstamo temporal",
  permanent_replacement: "Cambio definitivo",
  pending: "Pendiente",
  delivered: "Entregado",
  rejected: "Rechazado",
  returned: "Devuelto",
  active: "Activo",
};

const date = (value) => value ? new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
const statusClass = (status) => status === "pending" ? "text-bg-warning" : status === "rejected" ? "text-bg-danger" : status === "returned" ? "text-bg-secondary" : "text-bg-success";

export default function AdminAssetManagement() {
  const [requests, setRequests] = useState([]);
  const [loans, setLoans] = useState([]);
  const [tab, setTab] = useState("requests");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [rejectionRequest, setRejectionRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [deliveryRequest, setDeliveryRequest] = useState(null);
  const [statusRecord, setStatusRecord] = useState(null);

  const load = async () => {
    try {
      const [requestsResponse, loansResponse] = await Promise.all([api.get("/inventory/requests"), api.get("/inventory/loans")]);
      setRequests(requestsResponse.data);
      setLoans(loansResponse.data);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo cargar la gestión de activos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const loadInitial = async () => {
      try {
        const [requestsResponse, loansResponse] = await Promise.all([api.get("/inventory/requests"), api.get("/inventory/loans")]);
        if (!active) return;
        setRequests(requestsResponse.data);
        setLoans(loansResponse.data);
      } catch (err) {
        if (active) setError(err?.response?.data?.message || "No se pudo cargar la gestión de activos.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadInitial();
    return () => { active = false; };
  }, []);

  const completeAction = async (callback) => {
    try {
      await callback();
      setMessage("Gestión actualizada correctamente.");
      setError("");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo actualizar el registro.");
    }
  };

  const rejectRequest = () => {
    if (!rejectionRequest) return;
    const request = rejectionRequest;
    const reason = rejectionReason.trim();
    setRejectionRequest(null);
    setRejectionReason("");
    completeAction(() => api.patch(`/inventory/requests/${request.id}/reject`, { reason }));
  };

  const deliverRequest = () => {
    if (!deliveryRequest) return;
    const request = deliveryRequest;
    setDeliveryRequest(null);
    completeAction(() => api.patch(`/inventory/requests/${request.id}/deliver`, { previous_component_received: request.request_type === "permanent_replacement" }));
  };

  const action = (record, kind) => {
    if (kind === "reject") {
      setRejectionRequest(record);
      return;
    }
    if (kind === "deliver" && record.request_type === "permanent_replacement") {
      setDeliveryRequest(record);
      return;
    }
    completeAction(() => kind === "deliver"
      ? api.patch(`/inventory/requests/${record.id}/deliver`, { previous_component_received: false })
      : kind === "request-return"
        ? api.patch(`/inventory/requests/${record.id}/return`)
        : api.patch(`/inventory/loans/${record.id}/return`, { actual_return_datetime: new Date().toISOString(), return_signature: "Entrega registrada por sistema" }));
  };

  const normalizedSearch = search.toLowerCase();
  const filteredRequests = useMemo(() => requests.filter((item) => !normalizedSearch || [item.requested_by, item.item_name, item.position].some((value) => String(value || "").toLowerCase().includes(normalizedSearch))), [requests, normalizedSearch]);
  const filteredLoans = useMemo(() => loans.filter((item) => !normalizedSearch || [item.requested_by, item.item_name, item.position].some((value) => String(value || "").toLowerCase().includes(normalizedSearch))), [loans, normalizedSearch]);
  const closeStatus = () => setStatusRecord(null);

  return <main className="app-page">
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4"><div><p className="page-kicker mb-2">Gestión de activos</p><h1 className="page-title mb-2">Préstamos y solicitudes</h1><p className="page-subtitle mb-0">Administra solicitudes, entregas, devoluciones e historial desde un solo módulo.</p></div><span className="badge text-bg-light border px-3 py-2">{requests.filter((item) => item.status === "pending").length} pendientes</span></div>
    {message && <div className="alert alert-success" role="status">{message}</div>}
    {error && <div className="alert alert-danger" role="alert">{error}</div>}
    <div className="card shadow-sm border-0"><div className="card-body">
      <div className="d-flex flex-wrap gap-2 mb-3" role="tablist" aria-label="Gestión de activos"><button className={`btn ${tab === "requests" ? "btn-primary" : "btn-outline-secondary"}`} type="button" onClick={() => setTab("requests")}>Solicitudes <span className="badge text-bg-light ms-1">{requests.filter((item) => item.status === "pending").length}</span></button><button className={`btn ${tab === "loans" ? "btn-primary" : "btn-outline-secondary"}`} type="button" onClick={() => setTab("loans")}>Préstamos activos <span className="badge text-bg-light ms-1">{loans.filter((item) => item.status === "active").length}</span></button><button className={`btn ${tab === "history" ? "btn-primary" : "btn-outline-secondary"}`} type="button" onClick={() => setTab("history")}>Historial</button></div>
      <div className="mb-3"><label className="visually-hidden" htmlFor="asset-search">Buscar registros</label><input id="asset-search" className="form-control" placeholder="Buscar por solicitante, artículo o área" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
      {loading ? <p className="text-muted">Cargando...</p> : tab === "requests" ? <div className="table-responsive"><table className="table align-middle mb-0"><thead><tr><th>Solicitante</th><th>Artículo</th><th>Tipo</th><th>Estado</th><th className="text-end">Acciones</th></tr></thead><tbody>{filteredRequests.filter((item) => item.status === "pending" || item.status === "delivered").map((item) => <tr key={item.id}><td>{item.requested_by}<small className="d-block text-muted">{item.position || "—"}</small></td><td>{item.item_name} × {item.quantity}</td><td>{labels[item.request_type]}</td><td><button type="button" className={`badge border-0 ${statusClass(item.status)} status-button`} onClick={() => setStatusRecord({ record: item, kind: "request" })}>{labels[item.status]}</button></td><td className="text-end">{item.status === "pending" && <><button className="btn btn-sm btn-success me-1" type="button" onClick={() => action(item, "deliver")}>{item.request_type === "permanent_replacement" ? "Recibir y entregar" : "Aprobar y entregar"}</button><button className="btn btn-sm btn-outline-danger" type="button" onClick={() => action(item, "reject")}>Rechazar</button></>}{item.status === "delivered" && item.request_type === "temporary_loan" && <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => action(item, "request-return")}>Registrar devolución</button>}</td></tr>)}{!filteredRequests.some((item) => item.status === "pending" || item.status === "delivered") && <tr><td colSpan="5" className="text-center text-muted py-4">No hay solicitudes pendientes.</td></tr>}</tbody></table></div> : tab === "loans" ? <div className="table-responsive"><table className="table align-middle mb-0"><thead><tr><th>Artículo</th><th>Solicitante</th><th>Cantidad</th><th>Registro</th><th>Devolución esperada</th><th>Estado</th><th className="text-end">Acción</th></tr></thead><tbody>{filteredLoans.filter((item) => item.status === "active").map((item) => <tr key={item.id}><td>{item.item_name}</td><td>{item.requested_by}<small className="d-block text-muted">{item.position || "—"}</small></td><td>{item.quantity}</td><td>{date(item.start_datetime)}</td><td>{date(item.expected_return_datetime)}</td><td><button type="button" className="badge text-bg-success border-0 status-button" onClick={() => setStatusRecord({ record: item, kind: "loan" })}>{labels[item.status]}</button></td><td className="text-end"><button className="btn btn-sm btn-outline-success" type="button" onClick={() => action(item, "loan-return")}>Registrar devolución</button></td></tr>)}{!filteredLoans.some((item) => item.status === "active") && <tr><td colSpan="7" className="text-center text-muted py-4">No hay préstamos activos.</td></tr>}</tbody></table></div> : <div className="table-responsive"><table className="table table-hover align-middle mb-0"><thead><tr><th>Solicitante</th><th>Artículo</th><th>Tipo</th><th>Estado</th><th>Fecha</th></tr></thead><tbody>{filteredRequests.filter((item) => item.status === "rejected" || item.status === "returned").map((item) => <tr key={`request-${item.id}`}><td>{item.requested_by}<small className="d-block text-muted">{item.position || "—"}</small></td><td>{item.item_name} × {item.quantity}</td><td>{labels[item.request_type]}</td><td><button type="button" className={`badge border-0 ${statusClass(item.status)} status-button`} onClick={() => setStatusRecord({ record: item, kind: "request" })}>{labels[item.status]}</button></td><td>{date(item.created_at)}</td></tr>)}{filteredLoans.filter((item) => item.status === "returned").map((item) => <tr key={`loan-${item.id}`}><td>{item.requested_by}<small className="d-block text-muted">{item.position || "—"}</small></td><td>{item.item_name} × {item.quantity}</td><td>Préstamo temporal</td><td><button type="button" className="badge text-bg-secondary border-0 status-button" onClick={() => setStatusRecord({ record: item, kind: "loan" })}>{labels[item.status]}</button></td><td>{date(item.actual_return_datetime)}</td></tr>)}{!filteredRequests.some((item) => item.status === "rejected" || item.status === "returned") && !filteredLoans.some((item) => item.status === "returned") && <tr><td colSpan="5" className="text-center text-muted py-4">No hay registros en el historial.</td></tr>}</tbody></table></div>}
    </div></div>

    {rejectionRequest && <div className="modal d-block" role="dialog" aria-modal="true" aria-labelledby="reject-request-title" style={{ background: "rgba(15, 23, 42, .45)" }}><div className="modal-dialog modal-dialog-centered"><div className="modal-content admin-action-modal"><div className="modal-header"><h2 className="modal-title h5" id="reject-request-title">Rechazar solicitud</h2><button type="button" className="btn-close" aria-label="Cerrar" onClick={() => { setRejectionRequest(null); setRejectionReason(""); }} /></div><div className="modal-body"><p>¿Deseas rechazar la solicitud de <strong>{rejectionRequest.requested_by}</strong> para <strong>{rejectionRequest.item_name}</strong>?</p><label className="form-label" htmlFor="rejection-reason">Motivo del rechazo <span className="text-muted">(opcional)</span></label><textarea id="rejection-reason" className="form-control" rows="3" value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} placeholder="Escribe un motivo para dejar registro." /></div><div className="modal-footer"><button type="button" className="btn btn-outline-secondary" onClick={() => { setRejectionRequest(null); setRejectionReason(""); }}>Cancelar</button><button type="button" className="btn btn-danger" onClick={rejectRequest}>Rechazar solicitud</button></div></div></div></div>}
    {deliveryRequest && <div className="modal d-block" role="dialog" aria-modal="true" aria-labelledby="deliver-request-title" style={{ background: "rgba(15, 23, 42, .45)" }}><div className="modal-dialog modal-dialog-centered"><div className="modal-content admin-action-modal"><div className="modal-header"><h2 className="modal-title h5" id="deliver-request-title">Confirmar cambio definitivo</h2><button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setDeliveryRequest(null)} /></div><div className="modal-body"><p className="mb-0">Confirma que recibiste el componente anterior de <strong>{deliveryRequest.requested_by}</strong> antes de entregar el nuevo elemento.</p></div><div className="modal-footer"><button type="button" className="btn btn-outline-secondary" onClick={() => setDeliveryRequest(null)}>Cancelar</button><button type="button" className="btn btn-success" onClick={deliverRequest}>Confirmar y entregar</button></div></div></div></div>}
    {statusRecord && <div className="modal d-block" role="dialog" aria-modal="true" aria-labelledby="status-detail-title" style={{ background: "rgba(15, 23, 42, .45)" }} onClick={(event) => { if (event.target === event.currentTarget) closeStatus(); }}><div className="modal-dialog modal-dialog-centered"><div className="modal-content admin-action-modal"><div className="modal-header"><h2 className="modal-title h5" id="status-detail-title">Detalle del estado</h2><button type="button" className="btn-close" aria-label="Cerrar" onClick={closeStatus} /></div><div className="modal-body"><div className="d-flex justify-content-between align-items-center mb-3"><span className={`badge ${statusClass(statusRecord.record.status)}`}>{labels[statusRecord.record.status] || statusRecord.record.status}</span><span className="text-muted small">{statusRecord.kind === "loan" ? "Préstamo" : labels[statusRecord.record.request_type]}</span></div><dl className="row mb-0"><dt className="col-sm-5">Solicitante</dt><dd className="col-sm-7">{statusRecord.record.requested_by || "—"}</dd><dt className="col-sm-5">Elemento</dt><dd className="col-sm-7">{statusRecord.record.item_name || "—"}</dd><dt className="col-sm-5">Cantidad</dt><dd className="col-sm-7">{statusRecord.record.quantity || "—"}</dd><dt className="col-sm-5">Fecha de registro</dt><dd className="col-sm-7">{date(statusRecord.record.created_at || statusRecord.record.start_datetime)}</dd>{statusRecord.record.expected_return_datetime && <><dt className="col-sm-5">Devolución esperada</dt><dd className="col-sm-7">{date(statusRecord.record.expected_return_datetime)}</dd></>}{statusRecord.record.actual_return_datetime && <><dt className="col-sm-5">Devolución registrada</dt><dd className="col-sm-7">{date(statusRecord.record.actual_return_datetime)}</dd></>}{statusRecord.record.rejection_reason && <><dt className="col-sm-5">Motivo del rechazo</dt><dd className="col-sm-7">{statusRecord.record.rejection_reason}</dd></>}</dl></div><div className="modal-footer"><button type="button" className="btn btn-primary" onClick={closeStatus}>Cerrar</button></div></div></div></div>}
  </main>;
}
