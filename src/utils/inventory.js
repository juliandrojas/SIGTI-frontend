export const isComputerItem = (item) => String(item?.category || "").toLowerCase() === "computer";

export const filterPeripheralItems = (items = []) => items.filter((item) => !isComputerItem(item));

export const filterComputerItems = (items = []) => items.filter(isComputerItem);
