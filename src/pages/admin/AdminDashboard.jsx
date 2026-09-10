import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../../api/axios";
import { isExternalUser } from "../../utils/auth";

export default function AdminDashboard() {
  const isExternal = isExternalUser();

  if (isExternal) {
    return <Navigate to="/usuario/loans" replace />;
  }

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

  const totalAvailable = items.reduce((sum, item) => sum + Number(item.available_quantity || 0), 0);
  const activeLoans = loans.filter((loan) => loan.status === "active").length;
  const lowStockItems = items.filter((item) => Number(item.available_quantity || 0) <= 1).length;

  return (
    <div className="container py-4">
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h1 className="h3 fw-bold mb-4">Dashboard de inventario</h1>
          <div className="row g-3">
            {[
              ["Total de items", items.length, ""],
              ["Disponibles", totalAvailable, "text-success"],
              ["Préstamos activos", activeLoans, "text-warning"],
              ["Bajo stock", lowStockItems, "text-danger"],
            ].map(([label, value, color]) => (
              <div className="col-sm-6 col-xl-3" key={label}>
                <div className="border rounded-3 p-3 h-100 bg-light">
                  <div className="text-muted small">{label}</div>
                  <div className={`fs-2 fw-bold ${color}`}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
