import assert from "node:assert/strict";
import test from "node:test";
import { filterComputerItems, filterPeripheralItems, getInventorySearchSuggestions } from "./inventory.js";

const items = [
  { id: 1, asset_type: "laptop", name: "Dell" },
  { id: 2, asset_type: "peripheral", name: "Mouse" },
  { id: 3, asset_type: "peripheral", name: "Teclado" },
];

test("separa computadores de los elementos del inventario", () => {
  assert.deepEqual(filterComputerItems(items).map((item) => item.name), ["Dell"]);
  assert.deepEqual(filterPeripheralItems(items).map((item) => item.name), ["Mouse", "Teclado"]);
});

test("genera sugerencias de inventario mientras se escribe", () => {
  assert.deepEqual(getInventorySearchSuggestions(items, "log"), []);
  assert.deepEqual(getInventorySearchSuggestions([{ name: "Mouse Gamer", brand: "Logitech", model: "G203" }], "log"), ["Logitech"]);
});
