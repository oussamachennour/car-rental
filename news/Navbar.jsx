import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { Car, LogOut, Moon, Sun, Bell, X, CheckCheck } from 'lucide-react'

function NotificationDropdown({ notifications, unreadCount, markAllRead, clearNotifications, t }) {
  const notiColors = {
    cancellation: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
    document:     'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
    profile:      'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400',
    new_booking:  'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400',
  }
  const notiEmoji = { cancellation: '✕', document: '📄', profile: '👤', new_booking: '✓', default: '🔔' }

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 dark:border-stone-800">
        <span className="font-semibold text-sm text-stone-900 dark:text-stone-100">
          {t.admin.notifications}
          {unreadCount > 0 && (
            <span className="ml-2 px-1.5 py-0.5 bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400 rounded-full text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </span>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-stone-400 hover:text-orange-500 transition-colors" title="Mark all as read">
              <CheckCheck size={14} />
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearNotifications} className="text-stone-400 hover:text-red-500 transition-colors" title={t.admin.clear_all}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="max-h-72 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-stone-400">{t.admin.no_notifications}</div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={`flex items-start gap-3 px-4 py-3 border-b border-stone-50 dark:border-stone-800 last:border-0 ${!n.read ? 'bg-orange-50/60 dark:bg-orange-950/20' : ''}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs ${notiColors[n.type] || 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400'}`}>
                {notiEmoji[n.type] || notiEmoji.default}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-stone-800 dark:text-stone-200 leading-snug">{n.message}</p>
                <p className="text-[10px] text-stone-400 mt-0.5">{n.time}</p>
              </div>
              {!n.read && <span className="w-2 h-2 bg-orange-500 rounded-full shrink-0 mt-1.5" />}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Composant lien actif
function NavLink({ to, children }) {
  const { pathname } = useLocation()
  const active = pathname === to || (to !== '/' && pathname.startsWith(to))
  return (
    <Link
      to={to}
      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        active
          ? 'text-orange-600 bg-orange-50 dark:bg-orange-950/30'
          : 'text-stone-600 dark:text-stone-400 hover:text-orange-600 hover:bg-stone-100 dark:hover:bg-stone-800'
      }`}
    >
      {children}
    </Link>
  )
}

export default function Navbar() {
  const {
    user, isLoggedIn, isManager, logout,
    theme, toggleTheme,
    lang, toggleLang,
    notifications, unreadCount, markAllRead, clearNotifications,
    t,
  } = useApp()

  const navigate = useNavigate()
  const [showNotifs, setShowNotifs] = useState(false)
  const notifRef = useRef(null)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  // Fermer le dropdown en cliquant à l'extérieur
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ─── Navbar non connecté ───────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <nav className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <Car size={18} className="text-white" />
              </div>
              <span className="font-bold text-lg text-stone-900 dark:text-stone-100">
                Car<span className="text-orange-600">Rent</span>
              </span>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-3 py-2 text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-orange-600 rounded-lg transition-colors">
                {t.nav.signIn}
              </Link>

              {/* Theme */}
              <button onClick={toggleTheme} className="p-2 text-stone-600 dark:text-stone-400 hover:text-orange-600 rounded-lg transition-colors">
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              {/* Lang — une seule fois */}
              <button onClick={toggleLang} className="px-2 py-1 text-sm font-bold text-stone-600 dark:text-stone-400 hover:text-orange-600 rounded-lg transition-colors">
                {lang === 'en' ? '🇫🇷 FR' : '🇬🇧 EN'}
              </button>

              <Link to="/register" className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  // ─── Navbar connecté ──────────────────────────────────────────────────────
  return (
    <nav className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
              <Car size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg text-stone-900 dark:text-stone-100">
              Car<span className="text-orange-600">Rent</span>
            </span>
          </Link>

          {/* Navigation links */}
          <div className="flex items-center gap-0.5">

            {/* Liens communs — seulement pour les clients */}
            {!isManager && (
              <>
                <NavLink to="/fleet">{t.nav.fleet}</NavLink>
                <NavLink to="/bookings">{t.nav.bookings}</NavLink>
              </>
            )}

            {/* Liens communs pour tout le monde */}
            {isManager && (
              <NavLink to="/fleet">{t.nav.fleet}</NavLink>
            )}

            {/* Liens manager */}
            {isManager && (
              <>
                <NavLink to="/dashboard">{t.nav.dashboard}</NavLink>
                <NavLink to="/reservations">{t.nav.reservations}</NavLink>
                <NavLink to="/users">{t.nav.users}</NavLink>
                <NavLink to="/cars">{t.nav.fleet_mgmt}</NavLink>
              </>
            )}

            {/* Profil — prénom de l'utilisateur */}
            <NavLink to="/profile">
              {user?.name?.split(' ')[0] || t.nav.profile}
            </NavLink>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-stone-600 dark:text-stone-400 hover:text-orange-600 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Lang toggle — une seule fois */}
            <button
              onClick={toggleLang}
              className="px-2 py-2 text-sm font-bold text-stone-600 dark:text-stone-400 hover:text-orange-600 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
            >
              {lang === 'en' ? '🇫🇷' : '🇬🇧'}
            </button>

            {/* 🔔 Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifs(p => !p)}
                className="relative p-2 text-stone-600 dark:text-stone-400 hover:text-orange-600 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <NotificationDropdown
                  notifications={notifications}
                  unreadCount={unreadCount}
                  markAllRead={markAllRead}
                  clearNotifications={clearNotifications}
                  t={t}
                />
              )}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut size={15} />
              {t.nav.logout}
            </button>

          </div>
        </div>
      </div>
    </nav>
  )
}
