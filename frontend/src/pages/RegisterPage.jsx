import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Car, Eye, EyeOff, User, Mail, Phone } from 'lucide-react'

export default function RegisterPage() {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    password: '', 
    password_confirmation: '' 
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useApp()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match')
      return
    }
    
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    setLoading(true)

    try {
      const res = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed')
      }
      
      // Auto-login après inscription
      await login(form.email, form.password)
      navigate('/')
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-900 dark:to-stone-950 px-4 py-8">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl w-full max-w-md p-8 border border-stone-200 dark:border-stone-800">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Car size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Create Account</h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Join CarRent to book your dream car</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Full Name</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-stone-800"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-stone-800"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Phone (optional)</label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({...form, phone: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-stone-800"
                placeholder="+33 6 12 34 56 78"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})}
                className="w-full px-4 py-2 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-stone-800 pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Confirm Password</label>
            <input
              type="password"
              value={form.password_confirmation}
              onChange={(e) => setForm({...form, password_confirmation: e.target.value})}
              className="w-full px-4 py-2 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-stone-800"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800 text-center">
          <p className="text-sm text-stone-500">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}