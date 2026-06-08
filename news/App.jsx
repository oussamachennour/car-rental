import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import FleetPage from './pages/FleetPage'
import BookingsPage from './pages/BookingsPage'
import ProfilePage from './pages/ProfilePage'
import DashboardPage from './pages/DashboardPage'
import UsersPage from './pages/UsersPage'
import ReservationsPage from './pages/ReservationsPage'
import CarsManagementPage from './pages/CarsManagementPage'
import DocumentsPage from './pages/DocumentsPage'
import { Car, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

function Footer() {
  const { lang } = useApp()
  const year = new Date().getFullYear()

  const links = {
    company: {
      label: lang === 'fr' ? 'Entreprise' : 'Company',
      items: [
        { label: lang === 'fr' ? 'Accueil' : 'Home', to: '/' },
        { label: lang === 'fr' ? 'Notre Flotte' : 'Our Fleet', to: '/fleet' },
        { label: lang === 'fr' ? 'Mon Compte' : 'My Account', to: '/profile' },
      ],
    },
    support: {
      label: lang === 'fr' ? 'Assistance' : 'Support',
      items: [
        { label: lang === 'fr' ? 'Mes Réservations' : 'My Bookings', to: '/bookings' },
        { label: lang === 'fr' ? 'Connexion' : 'Sign In', to: '/login' },
        { label: lang === 'fr' ? 'Créer un compte' : 'Register', to: '/register' },
      ],
    },
  }

  const socials = [
    { icon: <Facebook size={16} />, href: '#', label: 'Facebook' },
    { icon: <Twitter size={16} />, href: '#', label: 'Twitter' },
    { icon: <Instagram size={16} />, href: '#', label: 'Instagram' },
    { icon: <Linkedin size={16} />, href: '#', label: 'LinkedIn' },
  ]

  return (
    <footer className="bg-stone-950 text-stone-400 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-orange-600 rounded-lg flex items-center justify-center">
                <Car size={19} className="text-white" />
              </div>
              <span className="text-xl font-bold text-stone-100">
                Car<span className="text-orange-500">Rent</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-stone-400 max-w-xs mb-6">
              {lang === 'fr'
                ? 'Location de voitures premium pour chaque voyage — rapide, abordable et fiable.'
                : 'Premium car rental for every journey — fast, affordable, and reliable.'}
            </p>
            {/* Contact info */}
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-orange-500 shrink-0" />
                <span>contact@carrent.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-orange-500 shrink-0" />
                <span>+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-orange-500 shrink-0" />
                <span>12 Rue de la Paix, Paris 75001</span>
              </li>
            </ul>
          </div>

          {/* Nav columns */}
          {Object.values(links).map(col => (
            <div key={col.label}>
              <h4 className="text-stone-100 font-semibold text-sm mb-4 uppercase tracking-wider">{col.label}</h4>
              <ul className="space-y-2">
                {col.items.map(item => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="text-sm text-stone-400 hover:text-orange-400 transition-colors duration-150"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-stone-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-500">
            © {year} CarRent.{' '}
            {lang === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}
          </p>

          {/* Socials */}
          <div className="flex items-center gap-3">
            {socials.map(s => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-orange-600 flex items-center justify-center text-stone-400 hover:text-white transition-all duration-150"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/fleet" element={<FleetPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/bookings" element={
            <PrivateRoute>
              <BookingsPage />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          } />
          <Route path="/dashboard" element={
            <PrivateRoute requireManager>
              <DashboardPage />
            </PrivateRoute>
          } />
          <Route path="/users" element={
            <PrivateRoute requireManager>
              <UsersPage />
            </PrivateRoute>
          } />
          <Route path="/reservations" element={
            <PrivateRoute requireManager>
              <ReservationsPage />
            </PrivateRoute>
          } />
          <Route path="/cars" element={
            <PrivateRoute requireManager>
              <CarsManagementPage />
            </PrivateRoute>
          } />
          <Route path="/documents" element={
            <PrivateRoute requireManager>
              <DocumentsPage />
            </PrivateRoute>
          } />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </BrowserRouter>
  )
}
