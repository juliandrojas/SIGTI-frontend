export const isComputerItem = (item) => String(item?.category || "").toLowerCase() === "computer";

export const filterPeripheralItems = (items = []) => items.filter((item) => !isComputerItem(item));

export const filterComputerItems = (items = []) => items.filter(isComputerItem);

export const getInventorySearchSuggestions = (items = [], query = "", limit = 8) => {
  const normalizedQuery = String(query).trim().toLowerCase();
  if (!normalizedQuery) return [];
  const values = items.flatMap((item) => [item.name, item.brand, item.model, item.serial_number, item.reference]);
  return [...new Set(values.filter(Boolean).map((value) => String(value).trim()).filter((value) => value.toLowerCase().includes(normalizedQuery)))].slice(0, limit);
};
