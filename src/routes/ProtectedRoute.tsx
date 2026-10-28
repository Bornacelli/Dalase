import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Spinner } from '@/components/common/Spinner'

export function ProtectedRoute() {
  const { user, role, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner />
      </div>
    )
  }

  if (!user) return <Navigate to="/admin" replace />

  if (!role) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Tu cuenta no tiene un rol asignado en el panel. Pide a la dueña que te agregue como administrador.
      </div>
    )
  }

  return <Outlet />
}

export function DuenaRoute() {
  const { role } = useAuth()
  if (role !== 'duena') {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Solo la dueña puede gestionar usuarios.
      </div>
    )
  }
  return <Outlet />
}
