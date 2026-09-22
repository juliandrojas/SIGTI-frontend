import { useEffect, useState } from "react";
import api from "../../api/axios";
import { filterComputerItems, filterPeripheralItems } from "../../utils/inventory";
import { summarizeMaintenance } from "../../utils/maintenance";
import { getStoredUser } from "../../utils/auth";

const StatCard = ({ label, value, icon, color = "", detail = "", column = "col-sm-6 col-xl-4" }) => (
  <div className={column}>
    <div className="card stat-card">
      <div className="card-body">
        <span className="stat-icon mb-3"><i className={`bi ${icon}`} aria-hidden="true" /></span>
        <div className="text-muted small">{label}</div>
        <div className={`stat-value ${color}`}>{value}</div>
        {detail && <div className="text-muted small mt-1">{detail}</div>}
      </div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const user = getStoredUser();
  const displayName = [user?.name, user?.lastname].filter(Boolean).join(" ") || "Usuario";
  const [items, setItems] = useState(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.allSettled([api.get("/inventory/items"), api.get("/inventory/maintenance")])
      .then(([itemsResult, maintenanceResult]) => {
        if (itemsResult.status === "fulfilled") setItems(itemsResult.value.data);
        if (maintenanceResult.status === "fulfilled") setMaintenanceRecords(maintenanceResult.value.data);
        const failures = [];
        if (itemsResult.status === "rejected") failures.push("No se pudo cargar el inventario.");
        if (maintenanceResult.status === "rejected") failures.push("No se pudo cargar el historial de mantenimiento.");
        setError(failures.join(" "));
      });
  }, []);

  const peripherals = filterPeripheralItems(items || []);
  const computers = filterComputerItems(items || []);
  const inventoryTotals = peripherals.reduce((totals, item) => ({
    total: totals.total + Number(item.quantity || 0),
    available: totals.available + Number(item.available_quantity || 0),
  }), { total: 0, available: 0 });
  const borrowedUnits = Math.max(inventoryTotals.total - inventoryTotals.available, 0);
  const maintenanceTotals = items && maintenanceRecords ? summarizeMaintenance(computers, maintenanceRecords) : null;
  const inventoryValue = (value) => items ? value : "—";
  const maintenanceValue = (value) => maintenanceTotals ? value : "—";

  return (
    <main className="app-page">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
        <div>
          <p className="page-kicker mb-2">Centro de control</p>
          <h1 className="page-title mb-2">Dashboard de activos TI</h1>
          <p className="page-subtitle mb-0">Resumen de componentes, préstamos y mantenimiento de equipos.</p>
        </div>
        <span className="status-pill"><i className="bi bi-person-circle me-2" aria-hidden="true" />{displayName}</span>
      </div>
      {error && <div className="alert alert-danger" role="alert"><i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />{error}</div>}
      <section aria-labelledby="inventory-summary-title" className="mb-4">
        <h2 id="inventory-summary-title" className="h5 mb-3">Inventario de componentes</h2>
        <div className="row g-3">
          <StatCard label="Tipos de componentes" value={inventoryValue(peripherals.length)} icon="bi-boxes" column="col-sm-6 col-xl-3" />
          <StatCard label="Unidades totales" value={inventoryValue(inventoryTotals.total)} icon="bi-collection" column="col-sm-6 col-xl-3" />
          <StatCard label="Unidades disponibles" value={inventoryValue(inventoryTotals.available)} icon="bi-check2-circle" color="text-success" column="col-sm-6 col-xl-3" />
          <StatCard label="Unidades prestadas" value={inventoryValue(borrowedUnits)} icon="bi-arrow-left-right" color="text-primary" column="col-sm-6 col-xl-3" />
        </div>
      </section>
      <section aria-labelledby="maintenance-summary-title">
        <h2 id="maintenance-summary-title" className="h5 mb-1">Mantenimiento de equipos</h2>
        <p className="text-muted small mb-3">Estado del ciclo semestral según el último mantenimiento de cada equipo.</p>
        <div className="row g-3">
          <StatCard label="Vencidos" value={maintenanceValue(maintenanceTotals?.overdue)} icon="bi-exclamation-triangle" color="text-danger" detail="Incluye equipos sin mantenimiento" />
          <StatCard label="Próximos 30 días" value={maintenanceValue(maintenanceTotals?.upcoming)} icon="bi-calendar-event" color="text-warning" detail="Desde hoy hasta dentro de 30 días" />
          <StatCard label="Al día (6 meses)" value={maintenanceValue(maintenanceTotals?.current)} icon="bi-calendar-check" color="text-success" detail="Vencen después de 30 días" />
        </div>
      </section>
    </main>
  );
}
