const addMonths = (date, months) => {
  const next = new Date(date);
  const originalDay = next.getDate();
  next.setDate(1);
  next.setMonth(next.getMonth() + months);
  const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(originalDay, lastDay));
  return next;
};

export const addMaintenancePeriod = (dateValue) => {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) throw new Error("La fecha de mantenimiento no es válida.");
  return addMonths(date, 6).toISOString().slice(0, 10);
};

export const defaultMaintenanceTasks = () => ["Limpieza interna", "Cambio de pasta térmica"];
