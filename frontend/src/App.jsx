import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
import DocumentsPage from './pages/DocumentsPage'  // ✅ Added

function AppLayout() {
  return (
    <>
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
          {/* ✅ Documents route — manager only */}
          <Route path="/documents" element={
            <PrivateRoute requireManager>
              <DocumentsPage />
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </>
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
