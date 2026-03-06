import { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventory';
import type { InventoryItem, Category } from '../types';

export function useInventory(category?: Category) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getItems(category);
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch items'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();

    // Set up realtime subscription
    const subscription = inventoryService.subscribeToItems(() => {
      fetchItems();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [category]);

  return { items, loading, error, refresh: fetchItems };
}
