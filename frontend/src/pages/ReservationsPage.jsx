import { useState, useEffect } from 'react'
import { Edit2, Trash2, CheckCircle, Clock, XCircle, Plus, Search, Filter } from 'lucide-react'
import { api } from '../context/AppContext'
import { useApp } from '../context/AppContext'
import toast from 'react-hot-toast'

const BASE = import.meta.env.VITE_API_URL || 'https://backend-production.up.railway.app/api'
 
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
})

export default function ReservationsPage() {
  const { isManager } = useApp()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingBooking, setEditingBooking] = useState(null)
  const [form, setForm] = useState({
    user_id: '',
    car_id: '',
    pickup_date: '',
    return_date: '',
    status: 'active',
    total_price: 0,
  })
  const [users, setUsers] = useState([])
  const [cars, setCars] = useState([])

  useEffect(() => {
    fetchBookings()
    fetchUsers()
    fetchCars()
  }, [])

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings')
      setBookings(res.data.data || res.data)
    } catch (error) {
      toast.error('Failed to load reservations')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users')
      setUsers(res.data.data || res.data)
    } catch (error) {
      console.error('Failed to load users')
    }
  }

  const fetchCars = async () => {
    try {
      const res = await api.get('/cars')
      setCars(res.data.data || res.data)
    } catch (error) {
      console.error('Failed to load cars')
    }
  }

  const handleSave = async () => {
    try {
      if (editingBooking) {
        await api.put(`/bookings/${editingBooking.id}`, form)
        toast.success('Reservation updated')
      } else {
        await api.post('/bookings', form)
        toast.success('Reservation created')
      }
      setShowModal(false)
      setEditingBooking(null)
      setForm({
        user_id: '',
        car_id: '',
        pickup_date: '',
        return_date: '',
        status: 'active',
        total_price: 0,
      })
      fetchBookings()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    }
  }

  const handleDelete = async (booking) => {
    if (window.confirm(`Delete reservation #${booking.id}?`)) {
      try {
        await api.delete(`/bookings/${booking.id}`)
        toast.success('Reservation deleted')
        fetchBookings()
      } catch (error) {
        toast.error('Failed to delete reservation')
      }
    }
  }

  const filtered = bookings.filter(b => {
    if (filter !== 'all' && b.status !== filter) return false
    if (search) {
      const searchLower = search.toLowerCase()
      return (
        (b.user?.name || '').toLowerCase().includes(searchLower) ||
        (b.car?.make || '').toLowerCase().includes(searchLower) ||
        (b.car?.model || '').toLowerCase().includes(searchLower) ||
        b.id.toString().includes(searchLower)
      )
    }
    return true
  })

  const getStatusBadge = (status) => {
    const badges = {
      active: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: <Clock size={14} /> },
      completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: <CheckCircle size={14} /> },
      cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: <XCircle size={14} /> },
    }
    const badge = badges[status] || badges.active
    return <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>{badge.icon} {status}</span>
  }

  const calculateDays = (pickup, returnDate) => {
    const start = new Date(pickup)
    const end = new Date(returnDate)
    return Math.max(1, Math.round((end - start) / 86400000))
  }

  if (!isManager) {
    return <div className="text-center py-16 text-stone-600">Access denied. Manager only.</div>
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      <div className="bg-white dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 py-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100">Reservations</h1>
            <p className="text-stone-500 text-sm mt-1">{filtered.length} total bookings</p>
          </div>
          <button
            onClick={() => {
              setEditingBooking(null)
              setForm({
                user_id: '',
                car_id: '',
                pickup_date: '',
                return_date: '',
                status: 'active',
                total_price: 0,
              })
              setShowModal(true)
            }}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2"
          >
            <Plus size={16} /> New Reservation
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
              placeholder="Search by user, car, or booking ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-lg dark:bg-stone-900 dark:border-stone-700 dark:text-stone-100"
            />
          </div>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="px-4 py-2 border border-stone-300 rounded-lg dark:bg-stone-900 dark:border-stone-700 dark:text-stone-100 flex items-center gap-2"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase">Vehicle</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase">Dates</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase">Days</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-stone-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-stone-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-stone-400">
                      Loading...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-stone-400">
                      No reservations found
                    </td>
                  </tr>
                ) : (
                  filtered.map(booking => (
                    <tr key={booking.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                      <td className="px-4 py-3 text-sm font-medium text-stone-900 dark:text-stone-100">#{booking.id}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-stone-900 dark:text-stone-100">{booking.user?.name || 'Unknown'}</div>
                        <div className="text-xs text-stone-400">{booking.user?.email || '—'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
                          {booking.car?.make} {booking.car?.model}
                        </div>
                        <div className="text-xs text-stone-400">{booking.car?.year || '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-600 dark:text-stone-400">
                        <div>{booking.pickup_date}</div>
                        <div className="text-xs text-stone-400">to {booking.return_date}</div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-stone-900 dark:text-stone-100">
                        {calculateDays(booking.pickup_date, booking.return_date)} days
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-orange-600 dark:text-orange-400">
                        €{booking.total_price}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(booking.status)}</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingBooking(booking)
                            setForm({
                              user_id: booking.user_id || '',
                              car_id: booking.car_id || '',
                              pickup_date: booking.pickup_date || '',
                              return_date: booking.return_date || '',
                              status: booking.status || 'active',
                              total_price: booking.total_price || 0,
                            })
                            setShowModal(true)
                          }}
                          className="text-stone-400 hover:text-orange-500"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(booking)} className="text-stone-400 hover:text-red-500 ml-2">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
          <div
            className="bg-white dark:bg-stone-900 rounded-xl w-full max-w-md border border-stone-200 dark:border-stone-800 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                {editingBooking ? 'Edit Reservation' : 'New Reservation'}
              </h3>
              <select
                value={form.user_id}
                onChange={e => setForm({ ...form, user_id: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
              >
                <option value="">Select User</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
              <select
                value={form.car_id}
                onChange={e => setForm({ ...form, car_id: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
              >
                <option value="">Select Car</option>
                {cars.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.make} {c.model} (€{c.price_per_day}/day)
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={form.pickup_date}
                onChange={e => setForm({ ...form, pickup_date: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
              />
              <input
                type="date"
                value={form.return_date}
                onChange={e => setForm({ ...form, return_date: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
              />
              <input
                type="number"
                placeholder="Total Price"
                value={form.total_price}
                onChange={e => setForm({ ...form, total_price: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
              />
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 dark:border-stone-700"
                >
                  Cancel
                </button>
                <button onClick={handleSave} className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
