const addMonths = (date, months) => {
  const next = new Date(date);
  const originalDay = next.getDate();
  next.setDate(1);
  next.setMonth(next.getMonth() + months);
  const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(originalDay, lastDay));
  return next;
};

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export const addMaintenancePeriod = (dateValue) => {
  const date = new Date(`${dateValue}T00:00:00`);
  if (!isoDatePattern.test(String(dateValue)) || Number.isNaN(date.getTime())) throw new Error("La fecha de mantenimiento no es válida.");
  return addMonths(date, 6).toISOString().slice(0, 10);
};

export const formatDateDisplay = (value) => {
  const iso = String(value || "").slice(0, 10);
  if (!isoDatePattern.test(iso)) return "-";
  const [year, month, day] = iso.split("-");
  return `${day}-${month}-${year}`;
};

export const parseDisplayDate = (value) => {
  const match = String(value || "").match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return "";
  const [, day, month, year] = match;
  const date = new Date(`${year}-${month}-${day}T00:00:00`);
  if (Number.isNaN(date.getTime()) || date.getFullYear() !== Number(year) || date.getMonth() + 1 !== Number(month) || date.getDate() !== Number(day)) return "";
  return `${year}-${month}-${day}`;
};

export const todayIso = () => {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const defaultMaintenanceTasks = () => ["Limpieza interna", "Cambio de pasta térmica"];

export const isMaintenanceRecent = (record, referenceDate) => Boolean(record?.next_due_date && isoDatePattern.test(referenceDate) && record.next_due_date.slice(0, 10) >= referenceDate);
