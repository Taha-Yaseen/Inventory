import { useInventory } from '../hooks/useInventory'
import { inventoryService } from '../services/inventory'
import { useState, useEffect } from 'react'
import {
  Package,
  AlertTriangle,
  TrendingDown,
  Clock,
  ArrowRight,
  PlusCircle,
  List,
  History,
  Loader2
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Checkout } from '../types'

export function Dashboard() {
  const { items, loading: itemsLoading } = useInventory()
  const [recentCheckouts, setRecentCheckouts] = useState<Checkout[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const data = await inventoryService.getCheckoutHistory()
        setRecentCheckouts(data.slice(0, 5))
      } catch (err) {
        console.error('Failed to fetch recent history', err)
      } finally {
        setHistoryLoading(false)
      }
    }
    fetchRecent()
  }, [])

  const totalItems = items.length
  const lowStockItems = items.filter(i => i.quantity < 5).length
  const outOfStockItems = items.filter(i => i.quantity === 0).length

  if (itemsLoading && items.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of current inventory status and recent activity.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-blue-500 p-5">
          <div className="flex items-center">
            <div className="shrink-0 bg-blue-100 rounded-md p-3">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Unique Items</dt>
                <dd className="text-2xl font-bold text-gray-900">{totalItems}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-amber-500 p-5">
          <div className="flex items-center">
            <div className="shrink-0 bg-amber-100 rounded-md p-3">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Low Stock Items</dt>
                <dd className="text-2xl font-bold text-gray-900">{lowStockItems}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-red-500 p-5">
          <div className="flex items-center">
            <div className="shrink-0 bg-red-100 rounded-md p-3">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Out of Stock</dt>
                <dd className="text-2xl font-bold text-gray-900">{outOfStockItems}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-green-500 p-5">
          <div className="flex items-center">
            <div className="shrink-0 bg-green-100 rounded-md p-3">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Recent Activity</dt>
                <dd className="text-2xl font-bold text-gray-900">{recentCheckouts.length}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/add-item"
                className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-200 transition-colors group"
              >
                <div className="flex items-center">
                  <PlusCircle className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Add New Item</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
              </Link>
              <Link
                to="/inventory"
                className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-200 transition-colors group"
              >
                <div className="flex items-center">
                  <List className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">View Inventory</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
              </Link>
              <Link
                to="/history"
                className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-200 transition-colors group"
              >
                <div className="flex items-center">
                  <History className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Checkout History</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
              </Link>
            </div>
          </div>

          {/* Low Stock Alert */}
          {lowStockItems > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-600 mr-2" />
                <h2 className="text-lg font-bold text-amber-900">Low Stock Alerts</h2>
              </div>
              <div className="space-y-3">
                {items.filter(i => i.quantity < 5).slice(0, 3).map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span className="text-amber-800 font-medium">{item.name}</span>
                    <span className="text-amber-600 font-bold">{item.quantity} left</span>
                  </div>
                ))}
                {lowStockItems > 3 && (
                  <Link to="/inventory" className="block text-xs text-amber-600 hover:underline pt-2">
                    And {lowStockItems - 3} more...
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Recent Checkouts</h2>
              <Link to="/history" className="text-sm text-blue-600 hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-gray-200">
              {historyLoading ? (
                <div className="p-10 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : recentCheckouts.length === 0 ? (
                <div className="p-10 text-center text-gray-500">
                  No recent activity found.
                </div>
              ) : (
                recentCheckouts.map((checkout) => (
                  <div key={checkout.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {checkout.items?.name || 'Unknown Item'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Checked out by <span className="font-medium text-gray-700">{checkout.checked_out_by}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-blue-600">-{checkout.quantity}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(checkout.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
