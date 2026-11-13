import { Navigate, Outlet, useLocation } from 'react-router-dom'

export default function ProtectedRoute() {
  const location = useLocation()
  const token = localStorage.getItem('vaccination_manager_token')

  return token ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />
}
