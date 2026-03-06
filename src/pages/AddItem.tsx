import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { inventoryService } from '../services/inventory'
import { useAuth } from '../context/AuthContext'
import type { Category, UnitOfMeasurement } from '../types'
import { Save, ArrowLeft, Loader2 } from 'lucide-react'

export function AddItem() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    category: 'food' as Category,
    quantity: 0,
    unit_of_measurement: 'piece' as UnitOfMeasurement,
    supplier_name: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      if (!user) throw new Error('User not authenticated');
      const performedBy = user.name || user.email || 'Unknown';
      await inventoryService.addItem(formData, performedBy)
      setSuccess(true)
      // Reset form
      setFormData({
        name: '',
        category: 'food' as Category,
        quantity: 0,
        unit_of_measurement: 'piece' as UnitOfMeasurement,
        supplier_name: '',
      })
      // Redirect after a short delay
      setTimeout(() => navigate('/inventory'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 0 : value,
    }))
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Item</h1>
          <p className="mt-1 text-sm text-gray-500">
            Fill in the details to add a new item to the inventory.
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back
        </button>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <p className="text-sm text-green-700">Item added successfully! Redirecting...</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Item Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="e.g. Apples"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <div className="mt-1">
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                >
                  <option value="food">Food</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="essentials">Essentials</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Initial Quantity
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="quantity"
                  id="quantity"
                  min="0"
                  required
                  value={formData.quantity}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="unit_of_measurement" className="block text-sm font-medium text-gray-700">
                Unit
              </label>
              <div className="mt-1">
                <select
                  id="unit_of_measurement"
                  name="unit_of_measurement"
                  value={formData.unit_of_measurement}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                >
                  <option value="piece">Piece</option>
                  <option value="pack">Pack</option>
                  <option value="box">Box</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="supplier_name" className="block text-sm font-medium text-gray-700">
                Supplier Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="supplier_name"
                  id="supplier_name"
                  required
                  value={formData.supplier_name}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="e.g. Local Farm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin mr-2 w-4 h-4" />
              ) : (
                <Save className="mr-2 w-4 h-4" />
              )}
              Add to Inventory
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
