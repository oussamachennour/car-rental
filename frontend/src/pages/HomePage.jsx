import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Star, Zap, GraduationCap, XCircle, ShieldCheck, MapPin, Send, Bot, User2, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'

// Mock AI chatbot responses
const aiResponses = {
  en: {
    greetings: ["Hi! I'm CarBot 🤖 — tell me what you need and I'll find the perfect car for you!"],
    budget: ["For budget trips, I recommend the **Dacia Sandero** at €22/day or **Citroën C3** at €25/day. Both are fuel-efficient and qualify for student discounts!"],
    family: ["For families, the **Toyota RAV4** (7-seat) or **Mercedes GLE** are excellent. The RAV4 is great value at €65/day with hybrid fuel savings."],
    luxury: ["Looking for luxury? The **BMW 5 Series** (€120/day) or **Audi Q5** (€95/day) offer premium comfort with all modern features."],
    student: ["As a student, you qualify for up to 30% off! Check out the **Economy** filter in our fleet — the Sandero and Clio are your best bets."],
    default: ["Great question! Browse our fleet and use the filters to find exactly what you need. I suggest starting with your budget and number of passengers."],
  },
  fr: {
    greetings: ["Bonjour! Je suis CarBot 🤖 — dites-moi ce qu'il vous faut et je trouverai la voiture parfaite!"],
    budget: ["Pour les petits budgets, je recommande la **Dacia Sandero** à 22€/jour ou la **Citroën C3** à 25€/jour. Les deux sont économiques et éligibles aux remises étudiantes!"],
    family: ["Pour les familles, le **Toyota RAV4** (7 places) ou le **Mercedes GLE** sont excellents. Le RAV4 est très avantageux à 65€/jour."],
    luxury: ["Pour le luxe, la **BMW Série 5** (120€/jour) ou l'**Audi Q5** (95€/jour) offrent un confort premium."],
    student: ["En tant qu'étudiant, vous avez jusqu'à 30% de réduction! Consultez le filtre **Étudiant** dans notre flotte."],
    default: ["Bonne question! Parcourez notre flotte et utilisez les filtres pour trouver exactement ce qu'il vous faut."],
  }
}

function getAIResponse(input, lang) {
  const lower = input.toLowerCase()
  const r = aiResponses[lang] || aiResponses.en
  if (/budget|cheap|economy|économi|pas cher/.test(lower)) return r.budget[0]
  if (/family|famille|kids|enfant|seats|places/.test(lower)) return r.family[0]
  if (/luxury|luxe|premium|bmw|audi|mercedes/.test(lower)) return r.luxury[0]
  if (/student|étudiant|discount|remise/.test(lower)) return r.student[0]
  return r.default[0]
}

function ChatBot({ lang, t }) {
  const [messages, setMessages] = useState([{ role: 'bot', text: (aiResponses[lang] || aiResponses.en).greetings[0], id: 0 }])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])

  const send = () => {
    if (!input.trim()) return
    const userMsg = { role: 'user', text: input, id: Date.now() }
    setMessages(p => [...p, userMsg])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages(p => [...p, { role: 'bot', text: getAIResponse(userMsg.text, lang), id: Date.now() + 1 }])
    }, 1200)
  }

  return (
    <div className="flex flex-col h-72">
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
        {messages.map(m => (
          <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${m.role === 'bot' ? 'bg-brand-100 dark:bg-brand-900/40' : 'bg-stone-200 dark:bg-stone-700'}`}>
              {m.role === 'bot' ? <Bot size={14} className="text-brand-600 dark:text-brand-400" /> : <User2 size={14} className="text-stone-600 dark:text-stone-300" />}
            </div>
            <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
              m.role === 'bot'
                ? 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-tl-none'
                : 'bg-brand-600 text-white rounded-tr-none'
            }`}>
              {m.text.split('**').map((part, i) =>
                i % 2 === 1 ? <strong key={i}>{part}</strong> : part
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
              <Bot size={14} className="text-brand-600" />
            </div>
            <div className="bg-stone-100 dark:bg-stone-800 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
              <span className="typing-dot w-1.5 h-1.5 bg-stone-400 rounded-full"></span>
              <span className="typing-dot w-1.5 h-1.5 bg-stone-400 rounded-full"></span>
              <span className="typing-dot w-1.5 h-1.5 bg-stone-400 rounded-full"></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-stone-200 dark:border-stone-700 p-3 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder={lang === 'fr' ? 'Ex: voiture pas chère pour étudiant...' : 'Ex: cheap car for a student trip...'}
          className="input flex-1 py-2 text-sm"
        />
        <button onClick={send} className="btn-primary px-3 py-2"><Send size={15} /></button>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { t, lang, cars, fetchCars, carsLoading } = useApp()
  const [showChatbot, setShowChatbot] = useState(false)

  useEffect(() => { fetchCars() }, [fetchCars])

  const popular = cars.filter(c => c.status === 'available').slice(0, 3)

  const features = [
    { icon: <Zap size={22} />, title: t.home.feat1_title, desc: t.home.feat1_desc, color: 'text-yellow-500' },
    { icon: <GraduationCap size={22} />, title: t.home.feat2_title, desc: t.home.feat2_desc, color: 'text-brand-500' },
    { icon: <XCircle size={22} />, title: t.home.feat3_title, desc: t.home.feat3_desc, color: 'text-emerald-500' },
    { icon: <ShieldCheck size={22} />, title: t.home.feat4_title, desc: t.home.feat4_desc, color: 'text-blue-500' },
  ]

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-stone-950 min-h-[85vh] flex items-center">
        {/* Background: art-direction responsive */}
        <picture className="absolute inset-0 w-full h-full">
          {/* Mobile: square/portrait crop */}
          <source
            media="(max-width: 639px)"
            srcSet="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=640&h=900&fit=crop&q=80"
          />
          {/* Tablet */}
          <source
            media="(max-width: 1023px)"
            srcSet="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1024&h=680&fit=crop&q=80"
          />
          {/* Desktop: wide panoramic */}
          <img
            src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1920&h=900&fit=crop&q=85"
            alt="Premium sports car on open road"
            className="w-full h-full object-cover opacity-60"
          />
        </picture>

        {/* Overlay gradient */}
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />

        {/* Hero content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 w-full">
          <div className="max-w-2xl animate-slide-up">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-brand-600/20 border border-brand-500/30 rounded-full text-brand-300 text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse-slow"></span>
              Premium Car Rental Service
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              {t.home.hero_title}
            </h1>
            <p className="text-stone-300 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
              {t.home.hero_subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/fleet" className="btn-primary text-base px-6 py-3">
                {t.home.hero_cta} <ArrowRight size={18} />
              </Link>
              <Link to="/fleet?filter=student" className="btn-secondary text-base px-6 py-3 border-white/20 text-white hover:bg-white/10 hover:border-white/30">
                <GraduationCap size={18} />
                {t.home.hero_cta2}
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-10">
              {[['500+', 'Happy Clients'], ['50+', 'Cars Available'], ['4.8★', 'Average Rating']].map(([v, l]) => (
                <div key={l}>
                  <div className="text-2xl font-display font-bold text-white">{v}</div>
                  <div className="text-xs text-stone-400">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-20 bg-white dark:bg-stone-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">{t.home.why_title}</h2>
            <div className="w-12 h-1 bg-brand-600 rounded-full mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="card p-6 text-center hover:-translate-y-1 transition-transform duration-200">
                <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-4 bg-stone-100 dark:bg-stone-800 ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2 font-body">{f.title}</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Cars ── */}
      <section className="py-20 bg-stone-50 dark:bg-stone-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-title mb-1">{t.home.popular_title}</h2>
              <div className="w-8 h-1 bg-brand-600 rounded-full" />
            </div>
            <Link to="/fleet" className="btn-ghost text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium">
              {lang === 'fr' ? 'Voir tout' : 'View all'} <ChevronRight size={16} />
            </Link>
          </div>
          {carsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="card overflow-hidden animate-pulse">
                  <div className="h-48 bg-stone-200 dark:bg-stone-700" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-1/2" />
                    <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {popular.map(car => (
                <CarCard key={car.id} car={car} t={t} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── AI Chatbot section ── */}
      <section className="py-20 bg-gradient-to-br from-brand-600 to-brand-800 dark:from-brand-800 dark:to-brand-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Bot size={28} />
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">{t.home.ai_title}</h2>
              <p className="text-brand-100 text-lg leading-relaxed mb-6">{t.home.ai_subtitle}</p>
              <div className="flex gap-3 flex-wrap">
                {(lang === 'fr'
                  ? ['Voiture pour famille', 'Budget étudiant', 'Option luxe']
                  : ['Family car', 'Student budget', 'Luxury option']
                ).map(q => (
                  <button key={q} onClick={() => setShowChatbot(true)}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-full text-sm text-white transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
            <div className="card overflow-hidden shadow-2xl">
              <div className="px-5 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center gap-3 bg-stone-50 dark:bg-stone-900">
                <div className="w-8 h-8 bg-brand-100 dark:bg-brand-900/40 rounded-full flex items-center justify-center">
                  <Bot size={16} className="text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">CarBot AI</p>
                  <p className="text-xs text-emerald-500 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Online</p>
                </div>
              </div>
              <ChatBot lang={lang} t={t} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Pickup Map ── */}
      <section className="py-20 bg-white dark:bg-stone-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <MapPin className="text-brand-600" size={24} />
            <h2 className="section-title">{lang === 'fr' ? 'Zones de Retrait' : 'Pickup Zones'}</h2>
          </div>
          <MockMap lang={lang} />
        </div>
      </section>
    </div>
  )
}

function CarCard({ car, t }) {
  const navigate = useNavigate()
  const { isLoggedIn } = useApp()

  const handleBookClick = () => {
    if (isLoggedIn) {
      // Navigate to fleet with the car selected
      navigate(`/fleet?car=${car.id}`)
    } else {
      navigate('/login', { state: { from: '/', carId: car.id } })
    }
  }

  return (
    <div className="card overflow-hidden group animate-fade-in">
      <div className="relative overflow-hidden h-48">
        <img
          src={car.image_url}
          alt={`${car.make} ${car.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {car.is_student_friendly && (
            <span className="badge badge-green"><GraduationCap size={10} className="mr-1" />Student</span>
          )}
          <span className={`badge ${car.status === 'available' ? 'badge-green' : 'badge-red'}`}>
            {car.status === 'available' ? '● Available' : '● Rented'}
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-display font-semibold text-lg text-stone-900 dark:text-stone-100">{car.make} {car.model}</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">{car.year} · {car.transmission} · {car.fuel_type}</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-brand-600">€{car.price_per_day}</span>
            <span className="text-xs text-stone-500 dark:text-stone-500">{t.common.per_day}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-stone-500">
            <Star size={13} className="text-yellow-400 fill-yellow-400" />
            <span className="font-medium text-stone-700 dark:text-stone-300">{car.rating}</span>
            <span>({car.reviews})</span>
          </div>
          {car.status === 'available' ? (
            <button onClick={handleBookClick} className="btn-primary text-xs px-4 py-2">{t.fleet.book_now}</button>
          ) : (
            <span className="badge badge-red">{t.fleet.unavailable}</span>
          )}
        </div>
      </div>
    </div>
  )
}

function MockMap({ lang }) {
  const zones = [
    { id: 1, name: lang === 'fr' ? 'Centre-Ville' : 'City Center', x: 48, y: 38, count: 8 },
    { id: 2, name: lang === 'fr' ? 'Aéroport' : 'Airport', x: 72, y: 62, count: 12 },
    { id: 3, name: lang === 'fr' ? 'Gare Centrale' : 'Train Station', x: 28, y: 55, count: 5 },
    { id: 4, name: 'University', x: 58, y: 22, count: 4 },
  ]
  return (
    <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 shadow-sm" style={{height: 320}}>
      {/* Fake map tiles */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-stone-800 dark:to-stone-900">
        {/* Roads */}
        <svg className="absolute inset-0 w-full h-full opacity-20 dark:opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="0" y1="40" x2="100" y2="40" stroke="#94a3b8" strokeWidth="0.8"/>
          <line x1="0" y1="60" x2="100" y2="60" stroke="#94a3b8" strokeWidth="0.8"/>
          <line x1="30" y1="0" x2="30" y2="100" stroke="#94a3b8" strokeWidth="0.8"/>
          <line x1="60" y1="0" x2="60" y2="100" stroke="#94a3b8" strokeWidth="0.8"/>
          <line x1="0" y1="40" x2="60" y2="60" stroke="#cbd5e1" strokeWidth="0.5"/>
          <line x1="30" y1="40" x2="100" y2="65" stroke="#cbd5e1" strokeWidth="0.5"/>
          <rect x="20" y="20" width="18" height="12" rx="1" fill="#e2e8f0" opacity="0.6"/>
          <rect x="55" y="42" width="22" height="14" rx="1" fill="#e2e8f0" opacity="0.6"/>
          <rect x="65" y="25" width="14" height="10" rx="1" fill="#e2e8f0" opacity="0.4"/>
          <circle cx="48" cy="55" r="6" fill="#bfdbfe" opacity="0.5"/>
        </svg>
      </div>
      {/* Pins */}
      {zones.map(z => (
        <div key={z.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
          style={{ left: `${z.x}%`, top: `${z.y}%` }}>
          <div className="relative">
            <div className="map-pulse w-4 h-4 bg-brand-500 rounded-full border-2 border-white shadow-lg"></div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none">
              <span className="font-semibold">{z.name}</span> — {z.count} cars
            </div>
          </div>
        </div>
      ))}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-stone-900/90 glass rounded-xl px-4 py-2 text-xs text-stone-600 dark:text-stone-300 shadow border border-stone-200 dark:border-stone-700">
        <MapPin size={11} className="inline mr-1 text-brand-500" />
        {lang === 'fr' ? '4 zones de retrait disponibles' : '4 pickup zones available'}
      </div>
    </div>
  )
}
