export interface InventoryItem {
  sku: string;
  title: string;
  quantity: number;
  warehouse: string;
}

export function reserveInventory(items: InventoryItem[], sku: string, quantity: number): InventoryItem[] {
  return items.map((item) =>
    item.sku === sku ? { ...item, quantity: Math.max(0, item.quantity - quantity) } : item
  );
}

export function findLowStockItems(items: InventoryItem[], threshold = 5): InventoryItem[] {
  return items.filter((item) => item.quantity <= threshold);
}

export function groupInventoryByWarehouse(items: InventoryItem[]): Record<string, InventoryItem[]> {
  return items.reduce<Record<string, InventoryItem[]>>((groups, item) => {
    groups[item.warehouse] = [...(groups[item.warehouse] ?? []), item];
    return groups;
  }, {});
}
