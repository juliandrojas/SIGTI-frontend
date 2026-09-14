import assert from "node:assert/strict";
import test from "node:test";
import { addMaintenancePeriod, defaultMaintenanceTasks } from "./maintenance.js";

test("programa el siguiente mantenimiento seis meses después", () => {
  assert.equal(addMaintenancePeriod("2026-01-15"), "2026-07-15");
});

test("usa limpieza y cambio de pasta térmica como tareas obligatorias", () => {
  assert.deepEqual(defaultMaintenanceTasks(), ["Limpieza interna", "Cambio de pasta térmica"]);
});
