import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const AppContext = createContext(null)

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ✅ Fix: Only redirect to /login on 401 if NOT on a public auth route.
    // This prevents the page from reloading when the user types wrong credentials.
    const url = error.config?.url || ''
    const isAuthRoute = url.includes('/login') || url.includes('/register')

    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

const translations = {
  en: {
    nav: {
      home: 'Home',
      fleet: 'Fleet',
      bookings: 'My Bookings',
      profile: 'Profile',
      dashboard: 'Dashboard',
      signIn: 'Sign In',
      signOut: 'Sign Out',
      users: 'Users',
      reservations: 'Reservations',
      fleet_mgmt: 'Fleet Mgmt',
      logout: 'Logout',
      sign_up: 'Sign Up',
      today: 'today',
      this_week: 'this week',
      last_month: 'vs last month',
      yoy: 'YoY',
      available_sub: 'available',
      car_col: 'Car',
      status_col: 'Status',
      price_col: 'Price',
      toggle_col: 'Toggle',
      booking_confirmed: 'Booking confirmed!',
      confirmed_num: 'confirmed',
      auto: 'Auto',
      manual_short: 'Manual',
      student_badge: 'Student',
      available_badge: '● Available',
      rented_badge: '● Rented',
      to_label: 'to',
      reviews_label: 'reviews',
    },
    home: {
      hero_title: 'Drive the Car You Deserve',
      hero_subtitle: 'Premium rentals for every journey — from city commutes to cross-country adventures.',
      hero_cta: 'Browse Fleet',
      hero_cta2: 'View Deals',
      why_title: 'Why Choose CarRent?',
      feat1_title: 'Instant Booking',
      feat1_desc: 'Reserve your car in under 2 minutes with real-time availability.',
      feat2_title: 'Student Discounts',
      feat2_desc: 'Up to 30% off for students and budget-conscious drivers.',
      feat3_title: 'Free Cancellation',
      feat3_desc: 'Cancel up to 24h before pickup at no charge.',
      feat4_title: 'GPS & Insurance',
      feat4_desc: 'Full coverage and navigation included in every rental.',
      popular_title: 'Popular This Week',
      ai_title: 'Not sure which car?',
      ai_subtitle: 'Ask our AI assistant for personalised recommendations.',
    },
    fleet: {
      title: 'Our Fleet',
      subtitle: 'Find the perfect vehicle for your journey',
      filter_all: 'All Cars',
      filter_student: 'Student / Economy',
      filter_suv: 'SUVs',
      filter_luxury: 'Luxury',
      filter_available: 'Available Only',
      per_day: '/day',
      book_now: 'Book Now',
      unavailable: 'Unavailable',
      seats: 'seats',
      transmission: 'Transmission',
      fuel: 'Fuel',
      vehicles_found: 'vehicles found',
      no_match: 'No cars match your filters.',
      clear_filters: 'Clear Filters',
    },
    booking: {
      title: 'Book Your Car',
      pickup: 'Pickup Date',
      return_date: 'Return Date',
      duration: 'Duration',
      days: 'days',
      price: 'Estimated Total',
      submit: 'Confirm Booking',
      cancel: 'Cancel',
      discount: 'Student Discount Applied',
      success: 'Booking confirmed!',
      base_price: 'Base price',
    },
    profile: {
      title: 'My Profile',
      name: 'Full Name',
      email: 'Email Address',
      phone: 'Phone',
      save: 'Save Changes',
      saving: 'Saving…',
      saved: 'Saved!',
      password_title: 'Change Password',
      current_pw: 'Current Password',
      new_pw: 'New Password',
      confirm_pw: 'Confirm Password',
      update_pw: 'Update Password',
      updating: 'Updating…',
      updated: 'Updated!',
      upload_avatar: 'Upload Avatar',
      docs_title: 'My Documents',
      upload_license: "Upload Driver's License",
      drop_here: 'Drop your file here, or click to browse',
      file_types: 'PDF, JPG, PNG up to 10MB',
      uploading: 'Uploading…',
      uploaded_docs: 'Uploaded Documents',
      verified: 'Verified',
      pending: 'Pending',
      pw_mismatch: 'Passwords do not match',
      pw_min: 'Minimum 8 characters',
    },
    mybookings: {
      title: 'My Bookings',
      all: 'All',
      active: 'Active',
      past: 'Past',
      cancelled: 'Cancelled',
      cancel_btn: 'Cancel Booking',
      cancel_confirm: 'Are you sure you want to cancel?',
      no_bookings: 'No bookings yet.',
      cannot_cancel: 'Cannot cancel — pickup is within 24 hours',
      total: 'Total',
      booking_num: 'Booking #',
      confirm: 'Confirm',
    },
    admin: {
      title: 'Manager Dashboard',
      total_rentals: 'Active Rentals',
      revenue: 'Monthly Revenue',
      fleet_util: 'Fleet Utilization',
      notifications: 'Notifications',
      fleet_mgmt: 'Fleet Management',
      mark_available: 'Set Available',
      mark_unavailable: 'Set Unavailable',
      clear_all: 'Clear All',
      no_notifications: 'No notifications',
      live: 'Live',
      monthly_revenue: 'Monthly Revenue',
      last_12: 'Last 12 months',
      total_clients: 'Total Clients',
      rented: 'Rented',
      available: 'Available',
      maintenance: 'Maintenance',
    },
    reservations: {
      title: 'Reservations',
      total: 'total bookings',
      new: 'New Reservation',
      edit: 'Edit Reservation',
      search: 'Search by user, car, or booking ID...',
      all_status: 'All Status',
      active: 'Active',
      completed: 'Completed',
      cancelled: 'Cancelled',
      no_results: 'No reservations found',
      loading: 'Loading...',
      id: 'ID',
      user: 'User',
      vehicle: 'Vehicle',
      dates: 'Dates',
      days: 'Days',
      price: 'Price',
      status: 'Status',
      actions: 'Actions',
      select_user: 'Select User',
      select_car: 'Select Car',
      total_price: 'Total Price',
      save: 'Save',
      cancel: 'Cancel',
      delete_confirm: 'Delete reservation #',
      deleted: 'Reservation deleted',
      updated: 'Reservation updated',
      created: 'Reservation created',
      failed_load: 'Failed to load reservations',
      failed_delete: 'Failed to delete reservation',
      access_denied: 'Access denied. Manager only.',
      to: 'to',
    },
    users: {
      title: 'Users Management',
      add: 'Add User',
      edit: 'Edit User',
      user_col: 'User',
      contact: 'Contact',
      role: 'Role',
      student: 'Student',
      actions: 'Actions',
      full_name: 'Full Name',
      email: 'Email',
      phone: 'Phone',
      password: 'Password',
      client: 'Client',
      manager: 'Manager',
      student_label: 'Student (eligible for discounts)',
      save: 'Save',
      cancel: 'Cancel',
      updated: 'User updated',
      created: 'User created',
      deleted: 'User deleted',
      cannot_delete_self: 'You cannot delete yourself',
      failed_load: 'Failed to load users',
      failed_delete: 'Failed to delete user',
      access_denied: 'Access denied. Manager only.',
      delete_confirm: 'Delete ',
      loading: 'Loading...',
    },
    cars_mgmt: {
      title: 'Fleet Management',
      vehicles: 'vehicles',
      add: 'Add Car',
      edit_car: 'Edit Car',
      add_car: 'Add New Car',
      search: 'Search by make, model, or year...',
      all_status: 'All Status',
      available: 'Available',
      rented: 'Rented',
      maintenance: 'Maintenance',
      unavailable: 'Unavailable',
      make: 'Make',
      model: 'Model',
      year: 'Year',
      category: 'Category',
      price_per_day: 'Price / Day',
      seats: 'Seats',
      transmission: 'Transmission',
      fuel_type: 'Fuel Type',
      status: 'Status',
      student_friendly: 'Student Friendly',
      image_url: 'Image URL',
      description: 'Description',
      color: 'Color',
      license_plate: 'License Plate',
      mileage: 'Mileage',
      update: 'Update',
      create: 'Create',
      cancel: 'Cancel',
      updated: 'Car updated',
      created: 'Car created',
      deleted: 'Car deleted',
      failed_load: 'Failed to load cars',
      failed_delete: 'Failed to delete car',
      fill_required: 'Please fill all required fields',
      delete_confirm: 'Delete ',
      access_denied: 'Access denied. Manager only.',
    },
    login: {
      title: 'Welcome Back',
      subtitle: 'Sign in to book your car',
      email: 'Email',
      password: 'Password',
      submit: 'Sign In',
      submitting: 'Signing in...',
      error: 'Invalid email or password',
      demo: 'Demo credentials:',
    },
    register: {
      title: 'Create Account',
      subtitle: 'Join CarRent to start booking',
      full_name: 'Full Name',
      email: 'Email',
      phone: 'Phone (optional)',
      password: 'Password',
      confirm_password: 'Confirm Password',
      submit: 'Create Account',
      submitting: 'Creating account...',
      pw_mismatch: 'Passwords do not match',
      pw_min: 'Password must be at least 6 characters',
      failed: 'Registration failed',
      already: 'Already have an account?',
      sign_in: 'Sign In',
    },
    common: {
      loading: 'Loading…',
      error: 'An error occurred.',
      search: 'Search',
      close: 'Close',
      confirm: 'Confirm',
      per_day: '/day',
      error_occurred: 'An error occurred',
    },
  },
  fr: {
    nav: {
      home: 'Accueil',
      fleet: 'Flotte',
      bookings: 'Mes Réservations',
      profile: 'Profil',
      dashboard: 'Tableau de Bord',
      signIn: 'Connexion',
      signOut: 'Déconnexion',
      users: 'Utilisateurs',
      reservations: 'Réservations',
      fleet_mgmt: 'Gestion Flotte',
      logout: 'Déconnexion',
      sign_up: 'S\'inscrire',
      today: 'aujourd\'hui',
      this_week: 'cette semaine',
      last_month: 'vs mois dernier',
      yoy: 'annuel',
      available_sub: 'disponible',
      car_col: 'Voiture',
      status_col: 'Statut',
      price_col: 'Prix',
      toggle_col: 'Modifier',
      booking_confirmed: 'Réservation confirmée!',
      confirmed_num: 'confirmé',
      auto: 'Auto',
      manual_short: 'Manuelle',
      student_badge: 'Étudiant',
      available_badge: '● Disponible',
      rented_badge: '● Loué',
      to_label: 'au',
      reviews_label: 'avis',
    },
    home: {
      hero_title: 'Conduisez la Voiture que Vous Méritez',
      hero_subtitle: 'Locations premium pour chaque trajet — des trajets urbains aux aventures transcontinentales.',
      hero_cta: 'Voir la Flotte',
      hero_cta2: 'Voir les Offres',
      why_title: 'Pourquoi Choisir CarRent?',
      feat1_title: 'Réservation Instantanée',
      feat1_desc: 'Réservez votre voiture en moins de 2 minutes avec disponibilité en temps réel.',
      feat2_title: 'Réductions Étudiantes',
      feat2_desc: "Jusqu'à 30% de réduction pour les étudiants et les conducteurs soucieux de leur budget.",
      feat3_title: 'Annulation Gratuite',
      feat3_desc: "Annulez jusqu'à 24h avant la prise en charge sans frais.",
      feat4_title: 'GPS & Assurance',
      feat4_desc: 'Couverture complète et navigation incluses dans chaque location.',
      popular_title: 'Populaires Cette Semaine',
      ai_title: 'Pas sûr de votre choix?',
      ai_subtitle: "Demandez à notre assistant IA des recommandations personnalisées.",
    },
    fleet: {
      title: 'Notre Flotte',
      subtitle: 'Trouvez le véhicule parfait pour votre trajet',
      filter_all: 'Toutes les Voitures',
      filter_student: 'Étudiant / Économique',
      filter_suv: 'SUVs',
      filter_luxury: 'Luxe',
      filter_available: 'Disponibles Uniquement',
      per_day: '/jour',
      book_now: 'Réserver',
      unavailable: 'Indisponible',
      seats: 'places',
      transmission: 'Transmission',
      fuel: 'Carburant',
      vehicles_found: 'véhicules trouvés',
      no_match: 'Aucune voiture ne correspond à vos filtres.',
      clear_filters: 'Effacer les Filtres',
    },
    booking: {
      title: 'Réserver Votre Voiture',
      pickup: 'Date de Prise en Charge',
      return_date: 'Date de Retour',
      duration: 'Durée',
      days: 'jours',
      price: 'Total Estimé',
      submit: 'Confirmer la Réservation',
      cancel: 'Annuler',
      discount: 'Réduction Étudiant Appliquée',
      success: 'Réservation confirmée!',
      base_price: 'Prix de base',
    },
    profile: {
      title: 'Mon Profil',
      name: 'Nom Complet',
      email: 'Adresse Email',
      phone: 'Téléphone',
      save: 'Enregistrer',
      saving: 'Enregistrement…',
      saved: 'Enregistré!',
      password_title: 'Changer le Mot de Passe',
      current_pw: 'Mot de Passe Actuel',
      new_pw: 'Nouveau Mot de Passe',
      confirm_pw: 'Confirmer le Mot de Passe',
      update_pw: 'Mettre à Jour',
      updating: 'Mise à jour…',
      updated: 'Mis à jour!',
      upload_avatar: 'Télécharger Avatar',
      docs_title: 'Mes Documents',
      upload_license: 'Télécharger Permis de Conduire',
      drop_here: 'Déposez votre fichier ici, ou cliquez pour parcourir',
      file_types: 'PDF, JPG, PNG jusqu\'à 10 Mo',
      uploading: 'Téléchargement…',
      uploaded_docs: 'Documents Téléchargés',
      verified: 'Vérifié',
      pending: 'En Attente',
      pw_mismatch: 'Les mots de passe ne correspondent pas',
      pw_min: 'Minimum 8 caractères',
    },
    mybookings: {
      title: 'Mes Réservations',
      all: 'Toutes',
      active: 'Actives',
      past: 'Passées',
      cancelled: 'Annulées',
      cancel_btn: 'Annuler la Réservation',
      cancel_confirm: 'Êtes-vous sûr de vouloir annuler?',
      no_bookings: 'Aucune réservation.',
      cannot_cancel: 'Impossible d\'annuler — la prise en charge est dans moins de 24h',
      total: 'Total',
      booking_num: 'Réservation #',
      confirm: 'Confirmer',
    },
    admin: {
      title: 'Tableau de Bord',
      total_rentals: 'Locations Actives',
      revenue: 'Revenus Mensuels',
      fleet_util: 'Utilisation Flotte',
      notifications: 'Notifications',
      fleet_mgmt: 'Gestion Flotte',
      mark_available: 'Rendre Disponible',
      mark_unavailable: 'Rendre Indisponible',
      clear_all: 'Tout Effacer',
      no_notifications: 'Pas de notifications',
      live: 'En direct',
      monthly_revenue: 'Revenus Mensuels',
      last_12: 'Les 12 derniers mois',
      total_clients: 'Total Clients',
      rented: 'Loué',
      available: 'Disponible',
      maintenance: 'Maintenance',
    },
    reservations: {
      title: 'Réservations',
      total: 'réservations au total',
      new: 'Nouvelle Réservation',
      edit: 'Modifier la Réservation',
      search: 'Rechercher par utilisateur, voiture ou ID...',
      all_status: 'Tous les Statuts',
      active: 'Active',
      completed: 'Terminée',
      cancelled: 'Annulée',
      no_results: 'Aucune réservation trouvée',
      loading: 'Chargement...',
      id: 'ID',
      user: 'Utilisateur',
      vehicle: 'Véhicule',
      dates: 'Dates',
      days: 'Jours',
      price: 'Prix',
      status: 'Statut',
      actions: 'Actions',
      select_user: 'Sélectionner Utilisateur',
      select_car: 'Sélectionner Voiture',
      total_price: 'Prix Total',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete_confirm: 'Supprimer la réservation #',
      deleted: 'Réservation supprimée',
      updated: 'Réservation mise à jour',
      created: 'Réservation créée',
      failed_load: 'Erreur de chargement des réservations',
      failed_delete: 'Erreur de suppression',
      access_denied: 'Accès refusé. Gérants uniquement.',
      to: 'au',
    },
    users: {
      title: 'Gestion des Utilisateurs',
      add: 'Ajouter Utilisateur',
      edit: 'Modifier Utilisateur',
      user_col: 'Utilisateur',
      contact: 'Contact',
      role: 'Rôle',
      student: 'Étudiant',
      actions: 'Actions',
      full_name: 'Nom Complet',
      email: 'Email',
      phone: 'Téléphone',
      password: 'Mot de Passe',
      client: 'Client',
      manager: 'Gérant',
      student_label: 'Étudiant (éligible aux réductions)',
      save: 'Enregistrer',
      cancel: 'Annuler',
      updated: 'Utilisateur mis à jour',
      created: 'Utilisateur créé',
      deleted: 'Utilisateur supprimé',
      cannot_delete_self: 'Vous ne pouvez pas vous supprimer',
      failed_load: 'Erreur de chargement des utilisateurs',
      failed_delete: 'Erreur de suppression',
      access_denied: 'Accès refusé. Gérants uniquement.',
      delete_confirm: 'Supprimer ',
      loading: 'Chargement...',
    },
    cars_mgmt: {
      title: 'Gestion de la Flotte',
      vehicles: 'véhicules',
      add: 'Ajouter Voiture',
      edit_car: 'Modifier Voiture',
      add_car: 'Ajouter Nouvelle Voiture',
      search: 'Rechercher par marque, modèle ou année...',
      all_status: 'Tous les Statuts',
      available: 'Disponible',
      rented: 'Loué',
      maintenance: 'Maintenance',
      unavailable: 'Indisponible',
      make: 'Marque',
      model: 'Modèle',
      year: 'Année',
      category: 'Catégorie',
      price_per_day: 'Prix / Jour',
      seats: 'Places',
      transmission: 'Transmission',
      fuel_type: 'Type de Carburant',
      status: 'Statut',
      student_friendly: 'Adapté Étudiants',
      image_url: 'URL Image',
      description: 'Description',
      color: 'Couleur',
      license_plate: 'Plaque d\'Immatriculation',
      mileage: 'Kilométrage',
      update: 'Mettre à jour',
      create: 'Créer',
      cancel: 'Annuler',
      updated: 'Voiture mise à jour',
      created: 'Voiture créée',
      deleted: 'Voiture supprimée',
      failed_load: 'Erreur de chargement',
      failed_delete: 'Erreur de suppression',
      fill_required: 'Veuillez remplir tous les champs obligatoires',
      delete_confirm: 'Supprimer ',
      access_denied: 'Accès refusé. Gérants uniquement.',
    },
    login: {
      title: 'Bon Retour',
      subtitle: 'Connectez-vous pour réserver votre voiture',
      email: 'Email',
      password: 'Mot de Passe',
      submit: 'Se Connecter',
      submitting: 'Connexion...',
      error: 'Email ou mot de passe invalide',
      demo: 'Identifiants de démonstration:',
    },
    register: {
      title: 'Créer un Compte',
      subtitle: 'Rejoignez CarRent pour réserver votre voiture',
      full_name: 'Nom Complet',
      email: 'Email',
      phone: 'Téléphone (optionnel)',
      password: 'Mot de Passe',
      confirm_password: 'Confirmer le Mot de Passe',
      submit: 'Créer un Compte',
      submitting: 'Création du compte...',
      pw_mismatch: 'Les mots de passe ne correspondent pas',
      pw_min: 'Le mot de passe doit contenir au moins 6 caractères',
      failed: 'Échec de l\'inscription',
      already: 'Vous avez déjà un compte?',
      sign_in: 'Se Connecter',
    },
    common: {
      loading: 'Chargement…',
      error: 'Une erreur est survenue.',
      search: 'Rechercher',
      close: 'Fermer',
      confirm: 'Confirmer',
      per_day: '/jour',
      error_occurred: 'Une erreur est survenue',
    },
  }
}

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })
  const [notifications, setNotifications] = useState([])
  const [cars, setCars] = useState([])
  const [bookings, setBookings] = useState([])
  const [carsLoading, setCarsLoading] = useState(false)
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [notifLoading, setNotifLoading] = useState(false)

  const t = translations[lang]
  const isLoggedIn = !!user
  const isManager = user?.role === 'manager'

  useEffect(() => { setLoading(false) }, [])

  useEffect(() => {
    const root = window.document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => { localStorage.setItem('lang', lang) }, [lang])

  const toggleTheme = () => setTheme(p => p === 'light' ? 'dark' : 'light')
  const toggleLang = () => setLang(p => p === 'en' ? 'fr' : 'en')

  // ─── Notifications ──────────────────────────────────────────────────────────

  const addNotification = useCallback((notif) => {
    setNotifications(prev => [{ id: Date.now(), ...notif, time: 'just now', read: false }, ...prev])
  }, [])

  const fetchNotifications = useCallback(async () => {
    if (!localStorage.getItem('token')) return
    setNotifLoading(true)
    try {
      const res = await api.get('/notifications')
      const data = res.data.data || res.data
      const mapped = data.map(n => ({
        id: n.id,
        type: n.type,
        message: n.message || n.title,
        time: n.created_at
          ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'just now',
        read: !!n.read_at,
      }))
      setNotifications(mapped)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setNotifLoading(false)
    }
  }, [])

  const markAllRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    try {
      await api.patch('/notifications/read-all', { user_id: user?.id })
    } catch {}
  }, [user?.id])

  const clearNotifications = useCallback(async () => {
    setNotifications([])
    try {
      await api.delete('/notifications')
    } catch {}
  }, [])

  // ─── Cars ───────────────────────────────────────────────────────────────────

  const fetchCars = useCallback(async () => {
    setCarsLoading(true)
    try {
      const res = await api.get('/cars')
      setCars(res.data.data || res.data)
    } catch (error) {
      console.error('Error fetching cars:', error)
    } finally {
      setCarsLoading(false)
    }
  }, [])

  // ─── Bookings ───────────────────────────────────────────────────────────────

  const fetchBookings = useCallback(async () => {
    setBookingsLoading(true)
    try {
      const res = await api.get('/bookings')
      setBookings(res.data.data || res.data)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setBookingsLoading(false)
    }
  }, [])

  const cancelBooking = useCallback(async (bookingId) => {
    try {
      await api.patch(`/bookings/${bookingId}/cancel`)
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b))
      addNotification({ type: 'cancellation', message: `Booking #${bookingId} cancelled` })
    } catch (error) {
      console.error('Error cancelling booking:', error)
    }
  }, [addNotification])

  // ✅ Fixed: after creating a booking, re-fetch notifications so the manager
  // notification (sent by BookingController) appears immediately for the client too
  const createBooking = useCallback(async (data) => {
    const res = await api.post('/bookings', data)
    const newB = res.data.data || res.data
    setBookings(prev => [newB, ...prev])
    // Re-fetch notifications to pick up any server-side notifications
    fetchNotifications()
    return newB
  }, [fetchNotifications])

  // ─── Profile ────────────────────────────────────────────────────────────────

  const updateProfile = useCallback(async (data) => {
    await api.put('/users/profile', data)
    const updated = { ...user, ...data }
    setUser(updated)
    localStorage.setItem('user', JSON.stringify(updated))
    addNotification({ type: 'profile', message: `${data.name || user?.name} updated their profile` })
  }, [user, addNotification])

  const toggleCarStatus = useCallback(async (carId) => {
    setCars(prev => prev.map(c => c.id === carId
      ? { ...c, status: c.status === 'available' ? 'unavailable' : 'available' }
      : c
    ))
    try { await api.patch(`/cars/${carId}/toggle-status`) } catch {}
  }, [])

  // ─── Auth ───────────────────────────────────────────────────────────────────

  const login = useCallback(async (email, password) => {
    // ✅ This will throw on 401 — the interceptor now won't redirect for /login
    const res = await api.post('/login', { email, password })
    const { token, user: userData } = res.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(async () => {
    try { await api.post('/logout') } catch {}
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setNotifications([])
    setBookings([])
  }, [])

  // ─── Initial data fetch ─────────────────────────────────────────────────────

  useEffect(() => {
    if (isLoggedIn) {
      fetchCars()
      fetchBookings()
      fetchNotifications()
    }
  }, [isLoggedIn, fetchCars, fetchBookings, fetchNotifications])

  // ✅ Poll notifications every 30s for managers (to pick up new booking notifications)
  useEffect(() => {
    if (!isLoggedIn) return
    const interval = setInterval(() => {
      fetchNotifications()
    }, 30_000)
    return () => clearInterval(interval)
  }, [isLoggedIn, fetchNotifications])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <AppContext.Provider value={{
      theme, lang, t, user, cars, bookings, notifications,
      carsLoading, bookingsLoading, notifLoading, loading,
      isLoggedIn, isManager,
      unreadCount,
      toggleTheme, toggleLang,
      login, logout,
      fetchCars, fetchBookings, fetchNotifications,
      cancelBooking, createBooking, updateProfile, toggleCarStatus,
      addNotification, markAllRead, clearNotifications, setUser,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
