export type Category = 'food' | 'cleaning' | 'essentials';
export type UnitOfMeasurement = 'pack' | 'piece' | 'box';

export interface InventoryItem {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  unit_of_measurement: UnitOfMeasurement;
  supplier_name: string;
  created_at: string;
}

export interface InventoryHistory {
  id: string;
  item_id: string;
  type: 'check-in' | 'check-out';
  quantity: number;
  performed_by: string;
  notes?: string;
  created_at: string;
  // Joined item name for history display
  items?: {
    name: string;
  };
}

export interface User {
  id: string;
  email?: string;
  name?: string;
}
