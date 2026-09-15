import { useEffect, useState } from "react";
import api from "../../api/axios";
import { filterPeripheralItems } from "../../utils/inventory";
import { getStoredUser } from "../../utils/auth";

export default function AdminDashboard() {
  const user = getStoredUser();
  const [items, setItems] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.allSettled([api.get("/inventory/items"), api.get("/inventory/maintenance")])
      .then(([itemsResult, maintenanceResult]) => {
        if (itemsResult.status === "fulfilled") setItems(filterPeripheralItems(itemsResult.value.data));
        if (maintenanceResult.status === "fulfilled") setMaintenanceRecords(maintenanceResult.value.data);
        if (itemsResult.status === "rejected") {
          setError(itemsResult.reason?.response?.data?.message || "No se pudieron cargar las estadísticas.");
        }
      });
  }, []);

  const inventoryTotals = items.reduce((totals, item) => ({
    total: totals.total + Number(item.quantity || 0),
    available: totals.available + (item.status === "maintenance" ? 0 : Number(item.available_quantity || 0)),
    maintenance: totals.maintenance + (item.status === "maintenance" ? Number(item.quantity || 0) : 0),
  }), { total: 0, available: 0, maintenance: 0 });
  const borrowedUnits = Math.max(inventoryTotals.total - inventoryTotals.available - inventoryTotals.maintenance, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maintenanceLimit = new Date(today);
  maintenanceLimit.setDate(maintenanceLimit.getDate() + 30);
  const upcomingMaintenance = maintenanceRecords.filter((record) => {
    const dueDate = new Date(`${String(record.next_due_date || "").slice(0, 10)}T00:00:00`);
    return !Number.isNaN(dueDate.getTime()) && dueDate >= today && dueDate <= maintenanceLimit;
  }).length;

  return (
    <main className="app-page">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
        <div>
          <p className="page-kicker mb-2">Centro de control</p>
          <h1 className="page-title mb-2">Dashboard de inventario</h1>
          <p className="page-subtitle mb-0">Una vista rápida del estado de tus activos y préstamos.</p>
        </div>
        <span className="status-pill"><i className="bi bi-person-circle me-2" aria-hidden="true" />{user?.username || "Usuario"}</span>
      </div>
      {error && <div className="alert alert-danger" role="alert"><i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />{error}</div>}
      <section className="row g-3" aria-label="Resumen del inventario y mantenimientos">
            {[
              ["Tipos de componentes", items.length, "bi-boxes", ""],
              ["Unidades totales", inventoryTotals.total, "bi-collection", ""],
              ["Unidades disponibles", inventoryTotals.available, "bi-check2-circle", "text-success"],
              ["Unidades prestadas", borrowedUnits, "bi-arrow-left-right", "text-primary"],
              ["En mantenimiento", inventoryTotals.maintenance, "bi-tools", "text-warning"],
              ["Próximos mantenimientos", upcomingMaintenance, "bi-calendar-check", "text-danger"],
            ].map(([label, value, icon, color]) => (
              <div className="col-sm-6 col-xl-4" key={label}>
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
