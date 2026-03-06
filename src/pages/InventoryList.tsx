import React, { useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import { useAuth } from '../context/AuthContext';
import { inventoryService } from '../services/inventory';
import type { Category, InventoryItem, UnitOfMeasurement } from '../types';
import { Search, Filter, ShoppingCart, Trash2, AlertTriangle, Loader2, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function InventoryList() {
  const { user } = useAuth();
  const [categoryFilter, setCategoryFilter] = useState<Category | ''>('');
  const [unitFilter, setUnitFilter] = useState<UnitOfMeasurement | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const { items, loading, error } = useInventory(categoryFilter || undefined);

  const [checkoutItem, setCheckoutItem] = useState<InventoryItem | null>(null);
  const [checkoutQuantity, setCheckoutQuantity] = useState(1);
  const [checkoutNotes, setCheckoutNotes] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnit = !unitFilter || item.unit_of_measurement === unitFilter;
    return matchesSearch && matchesUnit;
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutItem || !user) return;

    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      await inventoryService.recordTransaction({
        item_id: checkoutItem.id,
        type: 'check-out',
        quantity: checkoutQuantity,
        performed_by: user.name ?? user.email ?? 'Unknown',
        notes: checkoutNotes,
      });
      setCheckoutItem(null);
      setCheckoutQuantity(1);
      setCheckoutNotes('');
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await inventoryService.deleteItem(id);
      } catch (err) {
        alert('Failed to delete item');
      }
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Items</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all items in the shared inventory.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 shadow rounded-lg mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search items or suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 w-4 h-4" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as Category | '')}
            className="border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">All Categories</option>
            <option value="food">Food</option>
            <option value="cleaning">Cleaning</option>
            <option value="essentials">Essentials</option>
          </select>
          <select
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value as UnitOfMeasurement | '')}
            className="border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">All Units</option>
            <option value="pack">Packs</option>
            <option value="piece">Pieces</option>
            <option value="box">Boxes</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-sm text-red-700">Error: {error.message}</p>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  No items found.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                      item.category === 'food' ? "bg-green-100 text-green-800" :
                        item.category === 'cleaning' ? "bg-blue-100 text-blue-800" :
                          "bg-purple-100 text-purple-800"
                    )}>
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <span className={cn(
                        "font-bold mr-1",
                        item.quantity < 5 ? "text-red-600" : "text-gray-900"
                      )}>
                        {item.quantity}
                      </span>
                      <span className="text-gray-500 text-xs">{item.unit_of_measurement}s</span>
                      {item.quantity < 5 && (
                        <AlertTriangle className="ml-2 w-4 h-4 text-amber-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.supplier_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => setCheckoutItem(item)}
                      disabled={item.quantity === 0}
                      className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Checkout"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-md"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Checkout Modal */}
      {checkoutItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Checkout Item</h3>
              <button onClick={() => setCheckoutItem(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Checking out <span className="font-bold">{checkoutItem.name}</span>.
              Available: {checkoutItem.quantity} {checkoutItem.unit_of_measurement}s.
            </p>

            <form onSubmit={handleCheckout} className="space-y-4">
              {checkoutError && (
                <div className="bg-red-50 text-red-700 p-3 rounded text-sm">
                  {checkoutError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to checkout</label>
                <input
                  type="number"
                  min="1"
                  max={checkoutItem.quantity}
                  required
                  value={checkoutQuantity}
                  onChange={(e) => setCheckoutQuantity(parseInt(e.target.value) || 1)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={checkoutNotes}
                  onChange={(e) => setCheckoutNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Why are you checking this out?"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCheckoutItem(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center"
                >
                  {checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Checkout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
