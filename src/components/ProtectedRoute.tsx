import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth, type UserRole } from '../context/AuthContext'

interface ProtectedRouteProps {
  allowedRoles: UserRole[]
}

export default function ProtectedRoute({
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate
        to="/auth/signin"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />
    }

    if (user.role === 'BRAND') {
      return <Navigate to="/brand/dashboard" replace />
    }

    return <Navigate to="/shop" replace />
  }

  return <Outlet />
}