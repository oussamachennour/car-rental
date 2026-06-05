import { useState, useEffect } from 'react'
import { Edit2, Trash2, Plus, Search, Filter, Image as ImageIcon } from 'lucide-react'
import { api } from '../context/AppContext'
import { useApp } from '../context/AppContext'
import toast from 'react-hot-toast'

export default function CarsManagementPage() {
  const { isManager } = useApp()
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCar, setEditingCar] = useState(null)
  const [form, setForm] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    category: 'economy',
    status: 'available',
    price_per_day: 0,
    seats: 5,
    transmission: 'Automatic',
    fuel_type: 'Petrol',
    image_url: '',
    is_student_friendly: false,
    rating: 4.5,
    reviews: 0,
  })

  useEffect(() => {
    fetchCars()
  }, [])

  const fetchCars = async () => {
    try {
      const res = await api.get('/cars')
      setCars(res.data.data || res.data)
    } catch (error) {
      toast.error('Failed to load cars')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!form.make || !form.model || !form.price_per_day) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      if (editingCar) {
        await api.put(`/cars/${editingCar.id}`, form)
        toast.success('Car updated')
      } else {
        await api.post('/cars', form)
        toast.success('Car created')
      }
      setShowModal(false)
      setEditingCar(null)
      resetForm()
      fetchCars()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    }
  }

  const handleDelete = async (car) => {
    if (window.confirm(`Delete ${car.make} ${car.model}?`)) {
      try {
        await api.delete(`/cars/${car.id}`)
        toast.success('Car deleted')
        fetchCars()
      } catch (error) {
        toast.error('Failed to delete car')
      }
    }
  }

  const resetForm = () => {
    setForm({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      category: 'economy',
      status: 'available',
      price_per_day: 0,
      seats: 5,
      transmission: 'Automatic',
      fuel_type: 'Petrol',
      image_url: '',
      is_student_friendly: false,
      rating: 4.5,
      reviews: 0,
    })
  }

  const filtered = cars.filter(c => {
    if (filter !== 'all' && c.category !== filter) return false
    if (search) {
      const searchLower = search.toLowerCase()
      return (
        c.make.toLowerCase().includes(searchLower) ||
        c.model.toLowerCase().includes(searchLower) ||
        c.year.toString().includes(searchLower)
      )
    }
    return true
  })

  const getStatusBadge = status => {
    return status === 'available' ? (
      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
        Available
      </span>
    ) : (
      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
        Unavailable
      </span>
    )
  }

  if (!isManager) {
    return <div className="text-center py-16 text-stone-600">Access denied. Manager only.</div>
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      <div className="bg-white dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 py-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100">Fleet Management</h1>
            <p className="text-stone-500 text-sm mt-1">{filtered.length} vehicles</p>
          </div>
          <button
            onClick={() => {
              setEditingCar(null)
              resetForm()
              setShowModal(true)
            }}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2"
          >
            <Plus size={16} /> Add Car
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search by make, model, or year..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-lg dark:bg-stone-900 dark:border-stone-700 dark:text-stone-100"
            />
          </div>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="px-4 py-2 border border-stone-300 rounded-lg dark:bg-stone-900 dark:border-stone-700 dark:text-stone-100"
          >
            <option value="all">All Categories</option>
            <option value="economy">Economy</option>
            <option value="suv">SUV</option>
            <option value="luxury">Luxury</option>
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-800 animate-pulse">
                <div className="h-44 bg-stone-200 dark:bg-stone-700 rounded-t-xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4" />
                  <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-stone-400 text-lg">No cars found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(car => (
              <div key={car.id} className="bg-white dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="relative h-44 bg-stone-200 dark:bg-stone-800 overflow-hidden">
                  {car.image_url ? (
                    <img
                      src={car.image_url}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      <ImageIcon size={32} />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">{getStatusBadge(car.status)}</div>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                      {car.make} {car.model}
                    </h3>
                    <p className="text-xs text-stone-400">{car.year}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-stone-600 dark:text-stone-400">
                      <span className="font-medium">Seats:</span> {car.seats}
                    </div>
                    <div className="text-stone-600 dark:text-stone-400">
                      <span className="font-medium">Type:</span> {car.transmission}
                    </div>
                    <div className="text-stone-600 dark:text-stone-400">
                      <span className="font-medium">Fuel:</span> {car.fuel_type}
                    </div>
                    <div className="text-stone-600 dark:text-stone-400">
                      <span className="font-medium">Category:</span> {car.category}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-stone-200 dark:border-stone-700">
                    <div>
                      <p className="text-lg font-bold text-orange-600 dark:text-orange-400">€{car.price_per_day}</p>
                      <p className="text-xs text-stone-400">/day</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingCar(car)
                          setForm(car)
                          setShowModal(true)
                        }}
                        className="p-2 text-stone-400 hover:text-orange-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(car)}
                        className="p-2 text-stone-400 hover:text-red-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div
            className="bg-white dark:bg-stone-900 rounded-xl w-full max-w-2xl border border-stone-200 dark:border-stone-800 shadow-xl my-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">{editingCar ? 'Edit Car' : 'Add New Car'}</h3>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Make (e.g., BMW)"
                  value={form.make}
                  onChange={e => setForm({ ...form, make: e.target.value })}
                  className="px-4 py-2 border rounded-lg dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                  required
                />
                <input
                  type="text"
                  placeholder="Model (e.g., 5 Series)"
                  value={form.model}
                  onChange={e => setForm({ ...form, model: e.target.value })}
                  className="px-4 py-2 border rounded-lg dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Year"
                  value={form.year}
                  onChange={e => setForm({ ...form, year: parseInt(e.target.value) })}
                  className="px-4 py-2 border rounded-lg dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                />
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="px-4 py-2 border rounded-lg dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                >
                  <option value="economy">Economy</option>
                  <option value="suv">SUV</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Price per day (€)"
                  value={form.price_per_day}
                  onChange={e => setForm({ ...form, price_per_day: parseFloat(e.target.value) })}
                  className="px-4 py-2 border rounded-lg dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                  required
                />
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="px-4 py-2 border rounded-lg dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Number of Seats"
                  value={form.seats}
                  onChange={e => setForm({ ...form, seats: parseInt(e.target.value) })}
                  className="px-4 py-2 border rounded-lg dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                />
                <select
                  value={form.transmission}
                  onChange={e => setForm({ ...form, transmission: e.target.value })}
                  className="px-4 py-2 border rounded-lg dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                >
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select
                  value={form.fuel_type}
                  onChange={e => setForm({ ...form, fuel_type: e.target.value })}
                  className="px-4 py-2 border rounded-lg dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Electric">Electric</option>
                </select>
                <input
                  type="number"
                  placeholder="Rating (0-5)"
                  value={form.rating}
                  onChange={e => setForm({ ...form, rating: parseFloat(e.target.value) })}
                  min="0"
                  max="5"
                  step="0.1"
                  className="px-4 py-2 border rounded-lg dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                />
              </div>

              <input
                type="url"
                placeholder="Image URL"
                value={form.image_url}
                onChange={e => setForm({ ...form, image_url: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
              />

              <input
                type="number"
                placeholder="Number of Reviews"
                value={form.reviews}
                onChange={e => setForm({ ...form, reviews: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
              />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_student_friendly}
                  onChange={e => setForm({ ...form, is_student_friendly: e.target.checked })}
                />
                <span className="text-stone-700 dark:text-stone-300">Student friendly (eligible for 30% discount)</span>
              </label>

              <div className="flex gap-3 pt-6 border-t border-stone-200 dark:border-stone-700">
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 dark:border-stone-700">
                  Cancel
                </button>
                <button onClick={handleSave} className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg">
                  {editingCar ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
