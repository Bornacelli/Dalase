import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CatalogPage } from '@/pages/CatalogPage'
import { CartPage } from '@/pages/CartPage'
import { Spinner } from '@/components/common/Spinner'
import { ProtectedRoute, DuenaRoute } from './ProtectedRoute'

// El panel admin se carga aparte: la mayoría de visitas son al catálogo público.
const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })))
const AdminLayout = lazy(() => import('@/components/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })))
const AdminProductsPage = lazy(() =>
  import('@/pages/admin/AdminProductsPage').then((m) => ({ default: m.AdminProductsPage }))
)
const AdminCategoriesPage = lazy(() =>
  import('@/pages/admin/AdminCategoriesPage').then((m) => ({ default: m.AdminCategoriesPage }))
)
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })))

function AdminFallback() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner />
    </div>
  )
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<CatalogPage />} />
      <Route path="/carrito" element={<CartPage />} />

      <Route
        path="/admin"
        element={
          <Suspense fallback={<AdminFallback />}>
            <AdminLoginPage />
          </Suspense>
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <Suspense fallback={<AdminFallback />}>
              <AdminLayout />
            </Suspense>
          }
        >
          <Route path="/admin/productos" element={<AdminProductsPage />} />
          <Route path="/admin/categorias" element={<AdminCategoriesPage />} />
          <Route element={<DuenaRoute />}>
            <Route path="/admin/usuarios" element={<AdminUsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
