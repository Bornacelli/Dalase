import { NavLink, Outlet } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { signOut } from '@/firebase/auth'
import { useAuth } from '@/context/AuthContext'

export function AdminLayout() {
  const { role } = useAuth()

  return (
    <div className="admin-layout">
      <header className="admin-topbar">
        <h1>Panel admin</h1>
        <button
          type="button"
          onClick={() => signOut()}
          aria-label="Salir"
          style={{ background: 'none', border: 'none', color: '#fff', display: 'flex' }}
        >
          <LogOut size={20} strokeWidth={2} />
        </button>
      </header>

      <div className="admin-body">
        <nav className="admin-nav">
          <NavLink to="/admin/productos" className={({ isActive }) => (isActive ? 'active' : '')}>
            Productos
          </NavLink>
          <NavLink to="/admin/categorias" className={({ isActive }) => (isActive ? 'active' : '')}>
            Categorías
          </NavLink>
          {role === 'duena' && (
            <NavLink to="/admin/usuarios" className={({ isActive }) => (isActive ? 'active' : '')}>
              Usuarios
            </NavLink>
          )}
        </nav>

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
