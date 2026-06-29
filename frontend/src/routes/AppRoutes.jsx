import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Home from '../pages/Home'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import VerifyEmail from '../pages/auth/VerifyEmail'
import AdminDashboard from '../pages/admin/AdminDashboard'
import ClientDashboard from '../pages/client/ClientDashboard'
import StaffDashboard from '../pages/staff/StaffDashboard'

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'admin') return <Navigate to="/admin" replace />
    if (user.role === 'staff') return <Navigate to="/staff" replace />
    return <Navigate to="/client" replace />
  }

  return children
}

function AppRoutes() {
  const { user, role, loading } = useAuth()

  // If user is already authenticated and on auth pages, redirect to dashboard
  if (!loading && user) {
    const currentPath = window.location.pathname
    if (['/login', '/register', '/verify-email', '/forgot-password', '/'].includes(currentPath)) {
      if (role === 'admin') return <Navigate to="/admin" replace />
      if (role === 'staff') return <Navigate to="/staff" replace />
      return <Navigate to="/client" replace />
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client"
        element={
          <ProtectedRoute requiredRole="client">
            <ClientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff"
        element={
          <ProtectedRoute requiredRole="staff">
            <StaffDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default AppRoutes
