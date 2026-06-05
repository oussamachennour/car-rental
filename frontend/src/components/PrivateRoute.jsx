import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function PrivateRoute({ children, requireManager = false }) {
  const { isLoggedIn, isManager, loading } = useApp()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  if (requireManager && !isManager) {
    return <Navigate to="/" replace />
  }

  return children
}