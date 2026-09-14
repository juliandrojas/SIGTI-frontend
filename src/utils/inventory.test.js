import assert from "node:assert/strict";
import test from "node:test";
import { filterComputerItems, filterPeripheralItems } from "./inventory.js";

const items = [
  { id: 1, category: "computer", name: "Dell" },
  { id: 2, category: "component", name: "Mouse" },
  { id: 3, category: "peripheral", name: "Teclado" },
];

test("separa computadores de los elementos del inventario", () => {
  assert.deepEqual(filterComputerItems(items).map((item) => item.name), ["Dell"]);
  assert.deepEqual(filterPeripheralItems(items).map((item) => item.name), ["Mouse", "Teclado"]);
});
