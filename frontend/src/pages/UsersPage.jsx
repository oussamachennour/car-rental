import { useState, useEffect } from 'react'
import { UserPlus, Edit2, Trash2, GraduationCap } from 'lucide-react'
import axios from 'axios'
import { useApp } from '../context/AppContext'
import toast from 'react-hot-toast'

// ✅ URL de base lue depuis la variable d'environnement Vite
const BASE = import.meta.env.VITE_API_URL || 'https://backend-production.up.railway.app/api'

// ✅ Helper : récupère le token Bearer depuis localStorage
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
})

export default function UsersPage() {
  const { isManager, user: currentUser } = useApp()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'client', is_student: false, password: '' })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BASE}/users`, { headers: authHeaders() })
      setUsers(res.data.data || res.data)
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      if (editingUser) {
        await axios.put(`${BASE}/users/${editingUser.id}`, form, { headers: authHeaders() })
        toast.success('User updated')
      } else {
        await axios.post(`${BASE}/users`, form, { headers: authHeaders() })
        toast.success('User created')
      }
      setShowModal(false)
      setEditingUser(null)
      setForm({ name: '', email: '', phone: '', role: 'client', is_student: false, password: '' })
      fetchUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    }
  }

  const handleDelete = async (user) => {
    if (user.id === currentUser?.id) {
      toast.error('You cannot delete yourself')
      return
    }
    if (window.confirm(`Delete ${user.name}?`)) {
      try {
        await axios.delete(`${BASE}/users/${user.id}`, { headers: authHeaders() })
        toast.success('User deleted')
        fetchUsers()
      } catch (error) {
        toast.error('Failed to delete user')
      }
    }
  }

  if (!isManager) {
    return <div className="text-center py-16">Access denied. Manager only.</div>
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      <div className="bg-white dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 py-8 flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100">Users Management</h1>
          <button onClick={() => { setEditingUser(null); setForm({ name: '', email: '', phone: '', role: 'client', is_student: false, password: '' }); setShowModal(true) }} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2">
            <UserPlus size={16} /> Add User
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-stone-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8">Loading...</td></tr>
                ) : users.map(user => (
                  <tr key={user.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-stone-900 dark:text-stone-100">{user.name}</div>
                      <div className="text-xs text-stone-400">{user.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-600 dark:text-stone-400">{user.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'manager' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.is_student ? <GraduationCap size={16} className="text-orange-500" /> : '—'}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => { setEditingUser(user); setForm({ name: user.name, email: user.email, phone: user.phone || '', role: user.role, is_student: user.is_student, password: '' }); setShowModal(true) }} className="text-stone-400 hover:text-orange-500">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(user)} className="text-stone-400 hover:text-red-500 ml-2">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-stone-900 rounded-xl w-full max-w-md border border-stone-200 dark:border-stone-800 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">{editingUser ? 'Edit User' : 'Add User'}</h3>
              <input type="text" placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-stone-800 dark:border-stone-700" />
              <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-stone-800 dark:border-stone-700" />
              <input type="tel" placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-stone-800 dark:border-stone-700" />
              {!editingUser && <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-stone-800 dark:border-stone-700" />}
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-stone-800 dark:border-stone-700">
                <option value="client">Client</option>
                <option value="manager">Manager</option>
              </select>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_student} onChange={e => setForm({...form, is_student: e.target.checked})} />
                <span>Student (eligible for discounts)</span>
              </label>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800">Cancel</button>
                <button onClick={handleSave} className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}