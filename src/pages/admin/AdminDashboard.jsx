import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../../api/axios";
import { isExternalUser } from "../../utils/auth";

export default function AdminDashboard() {
  const isExternal = isExternalUser();
  const [items, setItems] = useState([]);
  const [loans, setLoans] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/inventory/items"), api.get("/inventory/loans")])
      .then(([itemsResponse, loansResponse]) => {
        setItems(itemsResponse.data);
        setLoans(loansResponse.data);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "No se pudieron cargar las estadísticas.");
      });
  }, []);

  if (isExternal) {
    return <Navigate to="/usuario/loans" replace />;
  }

  const totalAvailable = items.reduce((sum, item) => sum + Number(item.available_quantity || 0), 0);
  const activeLoans = loans.filter((loan) => loan.status === "active").length;
  const lowStockItems = items.filter((item) => Number(item.available_quantity || 0) <= 1).length;

  return (
    <main className="app-page">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
        <div>
          <p className="page-kicker mb-2">Centro de control</p>
          <h1 className="page-title mb-2">Dashboard de inventario</h1>
          <p className="page-subtitle mb-0">Una vista rápida del estado de tus activos y préstamos.</p>
        </div>
        <span className="status-pill"><i className="bi bi-circle-fill me-2" aria-hidden="true" />Sistema operativo</span>
      </div>
      {error && <div className="alert alert-danger" role="alert"><i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />{error}</div>}
      <section className="row g-3" aria-label="Resumen del inventario">
            {[
              ["Total de artículos", items.length, "bi-boxes", ""],
              ["Unidades disponibles", totalAvailable, "bi-check2-circle", "text-success"],
              ["Préstamos activos", activeLoans, "bi-arrow-left-right", "text-warning"],
              ["Bajo stock", lowStockItems, "bi-exclamation-triangle", "text-danger"],
            ].map(([label, value, icon, color]) => (
              <div className="col-sm-6 col-xl-3" key={label}>
                <div className="card stat-card">
                  <div className="card-body">
                    <span className="stat-icon mb-3"><i className={`bi ${icon}`} aria-hidden="true" /></span>
                    <div className="text-muted small">{label}</div>
                    <div className={`stat-value ${color}`}>{value}</div>
                  </div>
                </div>
              </div>
            ))}
      </section>
    </main>
  );
}
