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

const date = (value) => value ? new Date(value).toLocaleDateString() : "—";

export default function AdminAssetManagement() {
  const [requests, setRequests] = useState([]);
  const [loans, setLoans] = useState([]);
  const [tab, setTab] = useState("requests");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [requestsResponse, loansResponse] = await Promise.all([
        api.get("/inventory/requests"),
        api.get("/inventory/loans"),
      ]);
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
        const [requestsResponse, loansResponse] = await Promise.all([
          api.get("/inventory/requests"),
          api.get("/inventory/loans"),
        ]);
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

  const action = async (id, kind) => {
    try {
      if (kind === "reject") {
        const reason = window.prompt("Motivo del rechazo (opcional):");
        await api.patch(`/inventory/requests/${id}/reject`, { reason });
      } else if (kind === "deliver") {
        const request = requests.find((item) => item.id === id);
        const previousReceived = request?.request_type === "permanent_replacement"
          ? window.confirm("¿Confirmas que recibiste el componente anterior?") : false;
        if (request?.request_type === "permanent_replacement" && !previousReceived) return;
        await api.patch(`/inventory/requests/${id}/deliver`, { previous_component_received: previousReceived });
      } else if (kind === "request-return") {
        await api.patch(`/inventory/requests/${id}/return`);
      } else {
        await api.patch(`/inventory/loans/${id}/return`, {
          actual_return_datetime: new Date().toISOString(),
          return_signature: "Entrega registrada por sistema",
        });
      }
      setMessage("Gestión actualizada correctamente.");
      setError("");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo actualizar el registro.");
    }
  };

  const normalizedSearch = search.toLowerCase();
  const filteredRequests = useMemo(() => requests.filter((item) => !normalizedSearch || [item.requested_by, item.item_name, item.position].some((value) => String(value || "").toLowerCase().includes(normalizedSearch))), [requests, normalizedSearch]);
  const filteredLoans = useMemo(() => loans.filter((item) => !normalizedSearch || [item.requested_by, item.item_name, item.position].some((value) => String(value || "").toLowerCase().includes(normalizedSearch))), [loans, normalizedSearch]);

  return <main className="app-page">
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4"><div><p className="page-kicker mb-2">Gestión de activos</p><h1 className="page-title mb-2">Préstamos y solicitudes</h1><p className="page-subtitle mb-0">Administra solicitudes, entregas, devoluciones e historial desde un solo módulo.</p></div><span className="badge text-bg-light border px-3 py-2">{requests.filter((item) => item.status === "pending").length} pendientes</span></div>
    {message && <div className="alert alert-success">{message}</div>}
    {error && <div className="alert alert-danger">{error}</div>}
    <div className="card shadow-sm border-0"><div className="card-body">
      <div className="d-flex flex-wrap gap-2 mb-3" role="tablist" aria-label="Gestión de activos"><button className={`btn ${tab === "requests" ? "btn-primary" : "btn-outline-secondary"}`} type="button" onClick={() => setTab("requests")}>Solicitudes <span className="badge text-bg-light ms-1">{requests.filter((item) => item.status === "pending").length}</span></button><button className={`btn ${tab === "loans" ? "btn-primary" : "btn-outline-secondary"}`} type="button" onClick={() => setTab("loans")}>Préstamos activos <span className="badge text-bg-light ms-1">{loans.filter((item) => item.status === "active").length}</span></button><button className={`btn ${tab === "history" ? "btn-primary" : "btn-outline-secondary"}`} type="button" onClick={() => setTab("history")}>Historial</button></div>
      <div className="mb-3"><input className="form-control" placeholder="Buscar por solicitante, artículo o área" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
      {loading ? <p className="text-muted">Cargando...</p> : tab === "requests" ? <div className="table-responsive"><table className="table align-middle mb-0"><thead><tr><th>Solicitante</th><th>Artículo</th><th>Tipo</th><th>Estado</th><th className="text-end">Acciones</th></tr></thead><tbody>{filteredRequests.filter((item) => item.status === "pending" || item.status === "delivered").map((item) => <tr key={item.id}><td>{item.requested_by}<small className="d-block text-muted">{item.position || "—"}</small></td><td>{item.item_name} × {item.quantity}</td><td>{labels[item.request_type]}</td><td>{labels[item.status]}</td><td className="text-end">{item.status === "pending" && <><button className="btn btn-sm btn-success me-1" type="button" onClick={() => action(item.id, "deliver")}>{item.request_type === "permanent_replacement" ? "Recibir y entregar" : "Aprobar y entregar"}</button><button className="btn btn-sm btn-outline-danger" type="button" onClick={() => action(item.id, "reject")}>Rechazar</button></>}{item.status === "delivered" && item.request_type === "temporary_loan" && <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => action(item.id, "request-return")}>Registrar devolución</button>}</td></tr>)}{!filteredRequests.some((item) => item.status === "pending" || item.status === "delivered") && <tr><td colSpan="5" className="text-center text-muted py-4">No hay solicitudes pendientes.</td></tr>}</tbody></table></div> : tab === "loans" ? <div className="table-responsive"><table className="table align-middle mb-0"><thead><tr><th>Artículo</th><th>Solicitante</th><th>Cantidad</th><th>Registro</th><th>Devolución esperada</th><th className="text-end">Acción</th></tr></thead><tbody>{filteredLoans.filter((item) => item.status === "active").map((item) => <tr key={item.id}><td>{item.item_name}</td><td>{item.requested_by}<small className="d-block text-muted">{item.position || "—"}</small></td><td>{item.quantity}</td><td>{date(item.start_datetime)}</td><td>{date(item.expected_return_datetime)}</td><td className="text-end"><button className="btn btn-sm btn-outline-success" type="button" onClick={() => action(item.id, "loan-return")}>Registrar devolución</button></td></tr>)}{!filteredLoans.some((item) => item.status === "active") && <tr><td colSpan="6" className="text-center text-muted py-4">No hay préstamos activos.</td></tr>}</tbody></table></div> : <div className="row g-4"><div className="col-lg-6"><h2 className="h5">Solicitudes finalizadas</h2><div className="table-responsive"><table className="table table-sm align-middle"><thead><tr><th>Solicitante</th><th>Artículo</th><th>Estado</th></tr></thead><tbody>{filteredRequests.filter((item) => item.status === "rejected" || item.status === "returned").map((item) => <tr key={item.id}><td>{item.requested_by}</td><td>{item.item_name}</td><td>{labels[item.status]}</td></tr>)}{!filteredRequests.some((item) => item.status === "rejected" || item.status === "returned") && <tr><td colSpan="3" className="text-muted">Sin registros.</td></tr>}</tbody></table></div></div><div className="col-lg-6"><h2 className="h5">Préstamos finalizados</h2><div className="table-responsive"><table className="table table-sm align-middle"><thead><tr><th>Solicitante</th><th>Artículo</th><th>Devolución</th></tr></thead><tbody>{filteredLoans.filter((item) => item.status === "returned").map((item) => <tr key={item.id}><td>{item.requested_by}</td><td>{item.item_name}</td><td>{date(item.actual_return_datetime)}</td></tr>)}{!filteredLoans.some((item) => item.status === "returned") && <tr><td colSpan="3" className="text-muted">Sin registros.</td></tr>}</tbody></table></div></div></div>}
    </div></div>
  </main>;
}
