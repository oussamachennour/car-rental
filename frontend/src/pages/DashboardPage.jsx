import React, { useEffect, useState } from 'react'
import { TrendingUp, Car, DollarSign, Bell, CheckCircle, XCircle, AlertCircle, ToggleLeft, ToggleRight, BarChart2, Users, ArrowUpRight } from 'lucide-react'
import { useApp } from '../context/AppContext'

// Simple bar chart
function MiniBarChart({ data, color = '#ea580c' }) {
  const max = Math.max(...data)
  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map((v, i) => (
        <div key={i} className="flex-1 rounded-t-sm transition-all duration-300 hover:opacity-80"
          style={{ height: `${(v / max) * 100}%`, backgroundColor: color, opacity: i === data.length - 1 ? 1 : 0.4 + i * 0.08 }}
          title={`${v}`}
        />
      ))}
    </div>
  )
}

// Donut chart
function DonutChart({ value, total, color = '#ea580c' }) {
  const pct = Math.round((value / total) * 100)
  const r = 30
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <div className="relative flex items-center justify-center w-20 h-20">
      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#e7e5e4" strokeWidth="8" className="dark:stroke-stone-700" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
      </svg>
      <span className="absolute text-sm font-bold text-stone-900 dark:text-stone-100">{pct}%</span>
    </div>
  )
}

const MONTHLY_REVENUE = [2800, 3200, 2900, 3800, 4100, 3600, 4800, 5200, 4600, 5800, 6200, 7100]
const MONTHLY_BOOKINGS = [18, 22, 19, 26, 28, 24, 32, 35, 30, 38, 41, 47]
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function DashboardPage() {
  const { t, lang, cars, bookings, notifications, fetchCars, fetchBookings, toggleCarStatus, clearNotifications } = useApp()

  useEffect(() => { fetchCars(); fetchBookings() }, [fetchCars, fetchBookings])

  const activeBookings = bookings.filter(b => b.status === 'active').length
  const availableCars = cars.filter(c => c.status === 'available').length
  const monthlyRevenue = bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.total_price || 0), 0)
  const fleetUtil = cars.length ? Math.round(((cars.length - availableCars) / cars.length) * 100) : 0

  const stats = [
    { label: t.admin.total_rentals, value: activeBookings, icon: <Car size={20} />, sub: `+${Math.floor(Math.random()*3)+1} today`, color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' },
    { label: t.admin.revenue, value: `€${monthlyRevenue.toLocaleString()}`, icon: <DollarSign size={20} />, sub: '+12% vs last month', color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30' },
    { label: t.admin.fleet_util, value: `${fleetUtil}%`, icon: <BarChart2 size={20} />, sub: `${availableCars} available`, color: 'text-brand-500 bg-brand-100 dark:bg-brand-900/30' },
    { label: lang === 'fr' ? 'Total Clients' : 'Total Clients', value: '247', icon: <Users size={20} />, sub: '+8 this week', color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30' },
  ]

  const notiIcons = {
    cancellation: <XCircle size={14} className="text-red-500" />,
    document: <CheckCircle size={14} className="text-blue-500" />,
    profile: <AlertCircle size={14} className="text-yellow-500" />,
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      <div className="bg-white dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="section-title">{t.admin.title}</h1>
              <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
                {new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-slow"></span>
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">{lang === 'fr' ? 'En direct' : 'Live'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((s, i) => (
            <div key={i} className="card p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                  {s.icon}
                </div>
                <ArrowUpRight size={16} className="text-stone-300 dark:text-stone-600" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-stone-900 dark:text-stone-100">{s.value}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{s.label}</p>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue chart */}
          <div className="card p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">{lang === 'fr' ? 'Revenus Mensuels' : 'Monthly Revenue'}</h3>
                <p className="text-xs text-stone-400">{lang === 'fr' ? '12 derniers mois' : 'Last 12 months'}</p>
              </div>
              <span className="badge badge-green">+15% YoY</span>
            </div>
            <div className="mt-4">
              <MiniBarChart data={MONTHLY_REVENUE} color="#ea580c" />
              <div className="flex justify-between mt-2">
                {MONTHS.map((m, i) => (
                  <span key={i} className="text-[9px] text-stone-400 flex-1 text-center hidden sm:block">{m}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Fleet utilisation donut */}
          <div className="card p-6">
            <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-4">{t.admin.fleet_util}</h3>
            <div className="flex flex-col items-center gap-4">
              <DonutChart value={cars.length - availableCars} total={Math.max(cars.length, 1)} color="#ea580c" />
              <div className="w-full space-y-2">
                {[
                  { label: lang === 'fr' ? 'Louées' : 'Rented', count: cars.filter(c => c.status === 'rented').length, color: 'bg-brand-500' },
                  { label: lang === 'fr' ? 'Disponibles' : 'Available', count: availableCars, color: 'bg-emerald-500' },
                  { label: lang === 'fr' ? 'Maintenance' : 'Maintenance', count: cars.filter(c => c.status === 'maintenance').length, color: 'bg-yellow-500' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                      <span className="text-stone-600 dark:text-stone-400">{item.label}</span>
                    </div>
                    <span className="font-medium text-stone-900 dark:text-stone-100">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notifications */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Bell size={16} />
                {t.admin.notifications}
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="badge badge-red">{notifications.filter(n => !n.read).length}</span>
                )}
              </h3>
              {notifications.length > 0 && (
                <button onClick={clearNotifications} className="text-xs text-stone-400 hover:text-red-500 transition-colors">{t.admin.clear_all}</button>
              )}
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
              {notifications.length === 0 ? (
                <p className="text-sm text-stone-400 text-center py-6">{lang === 'fr' ? 'Aucune notification' : 'No notifications'}</p>
              ) : notifications.map(n => (
                <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${n.read ? 'bg-stone-50 dark:bg-stone-800/30' : 'bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900'}`}>
                  <div className="w-6 h-6 rounded-full bg-white dark:bg-stone-800 flex items-center justify-center shadow-sm shrink-0 mt-0.5">
                    {notiIcons[n.type] || <Bell size={12} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-800 dark:text-stone-200 leading-snug">{n.message}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{n.time}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 bg-brand-500 rounded-full mt-1 shrink-0 animate-pulse-slow"></span>}
                </div>
              ))}
            </div>
          </div>

          {/* Fleet management table */}
          <div className="card p-6">
            <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-4">{t.admin.fleet_mgmt}</h3>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 dark:border-stone-800">
                    {['Car', 'Status', 'Price', 'Toggle'].map(h => (
                      <th key={h} className="text-left py-2 px-2 text-xs font-medium text-stone-400 uppercase tracking-wide first:pl-0 last:pr-0 last:text-right">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50 dark:divide-stone-800">
                  {cars.map(car => (
                    <tr key={car.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors">
                      <td className="py-2.5 px-2 pl-0">
                        <div className="flex items-center gap-2">
                          <img src={car.image_url} alt="" className="w-8 h-6 rounded object-cover" />
                          <span className="font-medium text-stone-800 dark:text-stone-200 whitespace-nowrap">{car.make} {car.model}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2">
                        <span className={`badge text-[10px] ${
                          car.status === 'available' ? 'badge-green'
                          : car.status === 'rented' ? 'badge-blue'
                          : 'badge-yellow'
                        }`}>
                          {car.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-stone-600 dark:text-stone-400">€{car.price_per_day}</td>
                      <td className="py-2.5 pr-0 text-right">
                        <button
                          onClick={() => toggleCarStatus(car.id)}
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-all ${
                            car.status === 'available'
                              ? 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20'
                              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/20'
                          }`}
                        >
                          {car.status === 'available' ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                          {car.status === 'available' ? t.admin.mark_unavailable : t.admin.mark_available}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
