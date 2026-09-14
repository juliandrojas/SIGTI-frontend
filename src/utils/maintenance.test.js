import assert from "node:assert/strict";
import test from "node:test";
import { addMaintenancePeriod, defaultMaintenanceTasks, formatDateDisplay, isMaintenanceRecent, parseDisplayDate } from "./maintenance.js";

test("programa el siguiente mantenimiento seis meses después", () => {
  assert.equal(addMaintenancePeriod("2026-01-15"), "2026-07-15");
});

test("usa limpieza y cambio de pasta térmica como tareas obligatorias", () => {
  assert.deepEqual(defaultMaintenanceTasks(), ["Limpieza interna", "Cambio de pasta térmica"]);
});

test("detecta un mantenimiento vigente dentro de los seis meses", () => {
  assert.equal(isMaintenanceRecent({ performed_at: "2026-09-14", next_due_date: "2027-03-14" }, "2026-09-14"), true);
});

test("permite registrar cuando el mantenimiento anterior ya venció", () => {
  assert.equal(isMaintenanceRecent({ performed_at: "2025-09-14", next_due_date: "2026-03-14" }, "2026-09-14"), false);
});

test("muestra las fechas en formato DD-MM-AAAA y las convierte a ISO", () => {
  assert.equal(formatDateDisplay("2026-09-14T00:00:00.000Z"), "14-09-2026");
  assert.equal(parseDisplayDate("14-09-2026"), "2026-09-14");
});

test("rechaza fechas mostradas inválidas", () => {
  assert.equal(parseDisplayDate("31-02-2026"), "");
  assert.equal(parseDisplayDate("2026-09-14"), "");
});
