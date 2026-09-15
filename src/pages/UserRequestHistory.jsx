import { useEffect, useState } from "react";
import api from "../api/axios";

const requestLabels = { temporary_loan: "Préstamo temporal", permanent_replacement: "Cambio definitivo", pending: "Pendiente", delivered: "Entregada", rejected: "Rechazada", returned: "Devuelta" };
const formatRequestDate = (value) => value ? new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";

export default function UserRequestHistory() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [requestSearch, setRequestSearch] = useState("");
  const [requestStatus, setRequestStatus] = useState("all");
  const [requestType, setRequestType] = useState("all");

  useEffect(() => {
    let active = true;
    api.get("/inventory/requests/mine").then((response) => {
      if (active) setRequests(response.data);
    }).catch((requestError) => {
      if (active) setError(requestError.response?.data?.message || "No se pudieron cargar tus solicitudes.");
    });
    return () => { active = false; };
  }, []);

  const normalizedSearch = requestSearch.trim().toLowerCase();
  const filteredRequests = requests.filter((request) => {
    const matchesSearch = !normalizedSearch || String(request.item_name || "").toLowerCase().includes(normalizedSearch);
    const matchesStatus = requestStatus === "all" || request.status === requestStatus;
    const matchesType = requestType === "all" || request.request_type === requestType;
    return matchesSearch && matchesStatus && matchesType;
  });

  return <main className="app-page"><div className="row justify-content-center"><div className="col-xl-11">
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4"><div><p className="page-kicker mb-2">Seguimiento</p><h1 className="page-title mb-2">Mis solicitudes</h1><p className="page-subtitle mb-0">Consulta el estado y el detalle de tus solicitudes a Sistemas.</p></div><span className="badge text-bg-light border px-3 py-2">{filteredRequests.length} de {requests.length}</span></div>
    {error && <div className="alert alert-danger" role="alert">{error}</div>}
    <section className="card"><div className="card-body p-4 p-lg-5"><div className="row g-2 mb-4"><div className="col-lg-5"><label className="visually-hidden" htmlFor="my-requests-search">Buscar solicitud</label><input id="my-requests-search" className="form-control" type="search" placeholder="Buscar por elemento" value={requestSearch} onChange={(event) => setRequestSearch(event.target.value)} /></div><div className="col-sm-6 col-lg-3"><label className="visually-hidden" htmlFor="my-requests-type">Filtrar por tipo</label><select id="my-requests-type" className="form-select" value={requestType} onChange={(event) => setRequestType(event.target.value)}><option value="all">Todos los tipos</option><option value="temporary_loan">Préstamo temporal</option><option value="permanent_replacement">Cambio definitivo</option></select></div><div className="col-sm-6 col-lg-3"><label className="visually-hidden" htmlFor="my-requests-status">Filtrar por estado</label><select id="my-requests-status" className="form-select" value={requestStatus} onChange={(event) => setRequestStatus(event.target.value)}><option value="all">Todos los estados</option><option value="pending">Pendiente</option><option value="delivered">Entregada</option><option value="returned">Devuelta</option><option value="rejected">Rechazada</option></select></div><div className="col-lg-1 d-grid"><button className="btn btn-outline-secondary" type="button" title="Limpiar filtros" aria-label="Limpiar filtros" onClick={() => { setRequestSearch(""); setRequestType("all"); setRequestStatus("all"); }}><i className="bi bi-x-lg" /></button></div></div>{filteredRequests.length === 0 ? <p className="text-muted mb-0">{requests.length ? "No hay solicitudes que coincidan con los filtros." : "Aún no tienes solicitudes registradas."}</p> : <div className="table-responsive"><table className="table table-hover align-middle mb-0"><thead><tr><th>Elemento</th><th>Tipo</th><th>Cantidad</th><th>Estado</th><th>Fecha</th><th>Devolución</th></tr></thead><tbody>{filteredRequests.map((request) => <tr key={request.id}><td className="fw-semibold">{request.item_name || "Elemento"}</td><td>{requestLabels[request.request_type] || request.request_type}</td><td>{request.quantity}</td><td><span className={`badge ${request.status === "pending" ? "text-bg-warning" : request.status === "rejected" ? "text-bg-danger" : request.status === "returned" ? "text-bg-secondary" : "text-bg-success"}`}>{requestLabels[request.status] || request.status}</span></td><td>{formatRequestDate(request.created_at)}</td><td>{request.request_type === "temporary_loan" ? formatRequestDate(request.expected_return_datetime) : "No aplica"}</td></tr>)}</tbody></table></div>}</div></section>
  </div></div></main>;
}
