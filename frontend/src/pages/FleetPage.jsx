import React, { useEffect, useState } from 'react'
import { Search, Star, GraduationCap, Users, Fuel, Settings, X, CalendarDays, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function FleetPage() {
  const { t, lang, cars, carsLoading, fetchCars, user, createBooking, isLoggedIn } = useApp()
  const [filter, setFilter] = useState('all')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCar, setSelectedCar] = useState(null)
  const navigate = useNavigate()

  useEffect(() => { fetchCars() }, [fetchCars])

  const filtered = cars.filter(car => {
    if (availableOnly && car.status !== 'available') return false
    if (filter === 'student' && !car.is_student_friendly) return false
    if (filter === 'suv' && car.category !== 'suv') return false
    if (filter === 'luxury' && car.category !== 'luxury') return false
    if (search && !`${car.make} ${car.model}`.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleBookClick = (car) => {
    if (isLoggedIn) setSelectedCar(car)
    else navigate('/login', { state: { from: '/fleet', carId: car.id } })
  }

  const filterBtns = [
    { key: 'all', label: t.fleet.filter_all },
    { key: 'student', label: t.fleet.filter_student, icon: <GraduationCap size={14} /> },
    { key: 'suv', label: t.fleet.filter_suv },
    { key: 'luxury', label: t.fleet.filter_luxury },
  ]

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      <div className="bg-white dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="section-title mb-1">{t.fleet.title}</h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm">{t.fleet.subtitle}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={`${t.common.search} (BMW, Toyota…)`} className="input pl-9" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {filterBtns.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150 ${
                  filter === f.key ? 'bg-brand-600 text-white border-brand-600' : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:border-brand-400'
                }`}>
                {f.icon}{f.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 cursor-pointer shrink-0">
            <div onClick={() => setAvailableOnly(p => !p)}
              className={`rounded-full transition-colors duration-200 relative cursor-pointer ${availableOnly ? 'bg-brand-600' : 'bg-stone-300 dark:bg-stone-600'}`}
              style={{height: '22px', width: '40px'}}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${availableOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-stone-600 dark:text-stone-400 font-medium">{t.fleet.filter_available}</span>
          </label>
        </div>

        <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
          {filtered.length} {t.fleet.vehicles_found}
        </p>

        {carsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="h-44 bg-stone-200 dark:bg-stone-700" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-1/2" />
                  <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-3/4" />
                  <div className="h-8 bg-stone-200 dark:bg-stone-700 rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(car => (
              <CarCard key={car.id} car={car} t={t} onBook={() => handleBookClick(car)} />
            ))}
          </div>
        )}

        {!carsLoading && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-stone-400 dark:text-stone-600 text-lg">{t.fleet.no_match}</p>
            <button onClick={() => { setFilter('all'); setSearch(''); setAvailableOnly(false) }} className="btn-secondary mt-4">
              {t.fleet.clear_filters}
            </button>
          </div>
        )}
      </div>

      {selectedCar && user && (
        <BookingModal car={selectedCar} t={t} lang={lang} user={user} createBooking={createBooking} onClose={() => setSelectedCar(null)} />
      )}
    </div>
  )
}

function CarCard({ car, t, onBook }) {
  const specs = [
    { icon: <Users size={11} />, val: `${car.seats} ${t.fleet.seats}` },
    { icon: <Settings size={11} />, val: car.transmission === 'Automatic' ? t.nav.auto : t.nav.manual_short },
    { icon: <Fuel size={11} />, val: car.fuel_type },
  ]
  return (
    <div className="card overflow-hidden group flex flex-col animate-fade-in">
      <div className="relative overflow-hidden h-44">
        <img src={car.image_url} alt={`${car.make} ${car.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
          {car.is_student_friendly && (
            <span className="badge badge-green text-[10px]">
              <GraduationCap size={9} className="mr-0.5" />{t.nav.student_badge}
            </span>
          )}
          <span className={`badge text-[10px] ${car.status === 'available' ? 'badge-green' : 'badge-red'}`}>
            {car.status === 'available' ? t.nav.available_badge : t.nav.rented_badge}
          </span>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-display font-semibold text-stone-900 dark:text-stone-100 leading-tight">{car.make} {car.model}</h3>
            <p className="text-xs text-stone-400 mt-0.5">{car.year}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-brand-600">€{car.price_per_day}</p>
            <p className="text-[10px] text-stone-400">{t.common.per_day}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {specs.map((item, i) => (
            <div key={i} className="flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400">
              {item.icon}<span>{item.val}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1 text-xs text-stone-400 mb-4">
          <Star size={11} className="text-yellow-400 fill-yellow-400" />
          <span className="text-stone-600 dark:text-stone-300 font-medium">{car.rating}</span>
          <span>({car.reviews} {t.nav.reviews_label})</span>
        </div>
        <div className="mt-auto">
          {car.status === 'available' ? (
            <button onClick={onBook} className="btn-primary w-full justify-center text-sm">{t.fleet.book_now}</button>
          ) : (
            <button disabled className="btn-secondary w-full justify-center text-sm opacity-50 cursor-not-allowed">{t.fleet.unavailable}</button>
          )}
        </div>
      </div>
    </div>
  )
}

function BookingModal({ car, t, user, createBooking, onClose }) {
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const [pickup, setPickup] = useState(today)
  const [returnDate, setReturnDate] = useState(tomorrow)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [bookingId, setBookingId] = useState(null)

  const days = Math.max(1, Math.round((new Date(returnDate) - new Date(pickup)) / 86400000))
  const basePrice = car.price_per_day * days
  const discount = (user && user.is_student) && car.is_student_friendly ? 0.3 : 0
  const total = Math.round(basePrice * (1 - discount))

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const newBooking = await createBooking({
        car_id: car.id,
        pickup_date: pickup,
        return_date: returnDate,
        total_price: total,
        status: 'active',
      })
      setBookingId(newBooking?.id || Math.floor(Math.random() * 9000 + 1000))
      setSuccess(true)
      setTimeout(() => { setSuccess(false); onClose() }, 2500)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative w-full sm:max-w-md card rounded-t-2xl sm:rounded-2xl overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="relative h-36 overflow-hidden">
          <img src={car.image_url} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <h2 className="font-display text-xl font-bold">{car.make} {car.model}</h2>
            <p className="text-sm text-stone-300">€{car.price_per_day}{t.common.per_day}</p>
          </div>
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {success ? (
          <div className="p-8 flex flex-col items-center text-center">
            <CheckCircle2 size={48} className="text-emerald-500 mb-3" />
            <h3 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-1">{t.nav.booking_confirmed}</h3>
            <p className="text-stone-500 text-sm">{t.mybookings.booking_num}{bookingId} {t.nav.confirmed_num}</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <h3 className="font-semibold text-stone-900 dark:text-stone-100">{t.booking.title}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label"><CalendarDays size={13} className="inline mr-1" />{t.booking.pickup}</label>
                <input type="date" value={pickup} min={today} onChange={e => setPickup(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label"><CalendarDays size={13} className="inline mr-1" />{t.booking.return_date}</label>
                <input type="date" value={returnDate} min={pickup} onChange={e => setReturnDate(e.target.value)} className="input" />
              </div>
            </div>
            <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">{t.booking.duration}</span>
                <span className="font-medium text-stone-700 dark:text-stone-300">{days} {t.booking.days}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">{t.booking.base_price}</span>
                <span className="font-medium text-stone-700 dark:text-stone-300">€{basePrice}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600 flex items-center gap-1"><GraduationCap size={13} />{t.booking.discount}</span>
                  <span className="text-emerald-600 font-medium">-€{Math.round(basePrice * discount)}</span>
                </div>
              )}
              <div className="border-t border-stone-200 dark:border-stone-700 pt-2 flex justify-between">
                <span className="font-semibold text-stone-900 dark:text-stone-100">{t.booking.price}</span>
                <span className="font-bold text-brand-600 text-lg">€{total}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary flex-1 justify-center">{t.booking.cancel}</button>
              <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 justify-center">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t.common.loading}
                  </span>
                ) : t.booking.submit}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
