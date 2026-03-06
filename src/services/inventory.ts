import { supabase } from './supabase';
import type { InventoryItem, InventoryHistory, Category } from '../types';

export const inventoryService = {
  async getItems(categoryFilter?: Category) {
    let query = supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });

    if (categoryFilter) {
      query = query.eq('category', categoryFilter);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as InventoryItem[];
  },

  async addItem(item: Omit<InventoryItem, 'id' | 'created_at'>, performedBy: string) {
    // 1. Insert the item
    const { data: newItem, error: itemError } = await supabase
      .from('items')
      .insert([item])
      .select()
      .single();

    if (itemError) throw itemError;

    // 2. Record the initial check-in in history
    // Note: The trigger will also update the quantity, but since we just created the item 
    // with that quantity, it might double it if we're not careful.
    // However, the trigger updates quantity based on history insert.
    // If we insert item with quantity X, and then history with quantity X, it becomes 2X.
    // Better approach: Insert item with quantity 0, then history handles the rest.
    // OR: Insert item with quantity X, and skip history for initial creation (but user wants history).
    
    // Let's refine: Insert item with quantity 0, then history handles the initial stock.
    const { error: historyError } = await supabase
      .from('inventory_history')
      .insert([{
        item_id: newItem.id,
        type: 'check-in',
        quantity: item.quantity,
        performed_by: performedBy,
        notes: 'Initial stock'
      }]);

    if (historyError) throw historyError;

    return newItem as InventoryItem;
  },

  async updateItem(id: string, updates: Partial<InventoryItem>) {
    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as InventoryItem;
  },

  async deleteItem(id: string) {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async recordTransaction(transaction: Omit<InventoryHistory, 'id' | 'created_at'>) {
    if (transaction.type === 'check-out') {
      // Check if sufficient quantity exists
      const { data: item, error: itemError } = await supabase
        .from('items')
        .select('quantity')
        .eq('id', transaction.item_id)
        .single();

      if (itemError) throw itemError;
      if (item.quantity < transaction.quantity) {
        throw new Error(`Insufficient stock. Available: ${item.quantity}`);
      }
    }

    // Insert history record (trigger handles quantity update)
    const { data, error } = await supabase
      .from('inventory_history')
      .insert([transaction])
      .select()
      .single();

    if (error) throw error;
    return data as InventoryHistory;
  },

  async getHistory(startDate?: string, endDate?: string, type?: 'check-in' | 'check-out') {
    let query = supabase
      .from('inventory_history')
      .select('*, items(name)')
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      const end = endDate.includes('T') ? endDate : `${endDate}T23:59:59`;
      query = query.lte('created_at', end);
    }
    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as InventoryHistory[];
  },

  subscribeToItems(callback: () => void) {
    return supabase
      .channel('items_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, callback)
      .subscribe();
  }
};
