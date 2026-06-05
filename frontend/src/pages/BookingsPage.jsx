import React, { useEffect, useState } from 'react'
import { CalendarDays, Car, XCircle, CheckCircle2, Clock, AlertTriangle, ChevronDown } from 'lucide-react'
import { useApp } from '../context/AppContext'

const STATUS_TABS = ['all', 'active', 'completed', 'cancelled']

export default function BookingsPage() {
  const { t, lang, bookings, bookingsLoading, fetchBookings, cancelBooking } = useApp()
  const [tab, setTab] = useState('all')
  const [cancelingId, setCancelingId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const filtered = bookings.filter(b => tab === 'all' || b.status === tab)

  const handleCancel = async (id) => {
    setCancelingId(id)
    await cancelBooking(id)
    setCancelingId(null)
    setConfirmId(null)
  }

  const tabLabels = {
    all: lang === 'fr' ? 'Toutes' : 'All',
    active: t.mybookings.active,
    completed: t.mybookings.past,
    cancelled: t.mybookings.cancelled,
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      <div className="bg-white dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="section-title">{t.mybookings.title}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-stone-100 dark:bg-stone-800 rounded-xl p-1 mb-8 w-fit">
          {STATUS_TABS.map(s => (
            <button
              key={s}
              onClick={() => setTab(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                tab === s
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
              }`}
            >
              {tabLabels[s]}
              {s !== 'all' && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  s === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                  : s === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                  : 'bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-400'
                }`}>
                  {bookings.filter(b => b.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {bookingsLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-24 h-16 bg-stone-200 dark:bg-stone-700 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-1/3" />
                    <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Car size={40} className="text-stone-300 dark:text-stone-600 mx-auto mb-4" />
            <p className="text-stone-500 dark:text-stone-400">{t.mybookings.no_bookings}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                t={t}
                lang={lang}
                onCancelClick={() => setConfirmId(booking.id)}
                confirmId={confirmId}
                cancelingId={cancelingId}
                onConfirmCancel={() => handleCancel(booking.id)}
                onDismissConfirm={() => setConfirmId(null)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function BookingCard({ booking, t, lang, onCancelClick, confirmId, cancelingId, onConfirmCancel, onDismissConfirm }) {
  const isConfirming = confirmId === booking.id
  const isCanceling = cancelingId === booking.id

  // Simulate time-limit check: can cancel if pickup is > 24h away
  const pickupDate = new Date(booking.pickup_date)
  const now = new Date()
  const hoursUntilPickup = (pickupDate - now) / 3600000
  const canCancel = booking.status === 'active' && hoursUntilPickup > 24

  const statusConfig = {
    active: { icon: <Clock size={14} />, cls: 'badge-green', label: lang === 'fr' ? 'Active' : 'Active' },
    completed: { icon: <CheckCircle2 size={14} />, cls: 'badge-blue', label: lang === 'fr' ? 'Terminée' : 'Completed' },
    cancelled: { icon: <XCircle size={14} />, cls: 'badge-red', label: lang === 'fr' ? 'Annulée' : 'Cancelled' },
  }
  const sc = statusConfig[booking.status] || statusConfig.active

  return (
    <div className={`card overflow-hidden animate-fade-in ${booking.status === 'cancelled' ? 'opacity-60' : ''}`}>
      <div className="flex flex-col sm:flex-row">
        {/* Car image */}
        <div className="sm:w-36 h-28 sm:h-auto overflow-hidden shrink-0">
          <img
            src={booking.car?.image_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&q=80'}
            alt={`${booking.car?.make} ${booking.car?.model}`}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-display font-semibold text-stone-900 dark:text-stone-100">
                  {booking.car?.make} {booking.car?.model}
                </h3>
                <span className={`badge ${sc.cls} flex items-center gap-1`}>
                  {sc.icon}{sc.label}
                </span>
              </div>
              <p className="text-xs text-stone-400 font-mono">Booking #{booking.id}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-stone-900 dark:text-stone-100">€{booking.total_price}</p>
              <p className="text-xs text-stone-400">{lang === 'fr' ? 'Total' : 'Total'}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
              <CalendarDays size={14} />
              <span>{booking.pickup_date}</span>
              <span className="text-stone-300">→</span>
              <span>{booking.return_date}</span>
            </div>
          </div>

          {/* Cancel zone */}
          {booking.status === 'active' && (
            <div>
              {!canCancel && (
                <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 mb-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
                  <AlertTriangle size={13} />
                  {lang === 'fr' ? 'Annulation impossible — moins de 24h avant le retrait' : 'Cannot cancel — pickup is within 24 hours'}
                </div>
              )}
              {!isConfirming ? (
                <button
                  onClick={onCancelClick}
                  disabled={!canCancel}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150 ${
                    canCancel
                      ? 'border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20'
                      : 'border-stone-200 text-stone-400 cursor-not-allowed opacity-50 dark:border-stone-700'
                  }`}
                >
                  <XCircle size={15} />
                  {t.mybookings.cancel_btn}
                </button>
              ) : (
                <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
                  <AlertTriangle size={16} className="text-red-500 shrink-0" />
                  <p className="text-sm text-stone-700 dark:text-stone-300 flex-1">{t.mybookings.cancel_confirm}</p>
                  <div className="flex gap-2">
                    <button onClick={onDismissConfirm} className="btn-secondary text-xs px-3 py-1.5">{t.booking.cancel}</button>
                    <button
                      onClick={onConfirmCancel}
                      disabled={isCanceling}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      {isCanceling ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                      {lang === 'fr' ? 'Confirmer' : 'Confirm'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
