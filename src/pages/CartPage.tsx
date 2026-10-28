import { Navigate, useNavigate } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { CartItemRow } from '@/components/cart/CartItemRow'
import { CartOrderForm } from '@/components/cart/CartOrderForm'

const DESKTOP_QUERY = '(min-width: 1024px)'

export function CartPage() {
  const navigate = useNavigate()
  const { items } = useCart()

  // En escritorio el carrito ya está visible como panel lateral del catálogo.
  if (typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="cart-screen">
      <header className="cart-header">
        <button
          type="button"
          className="btn-icon btn-icon-outline"
          style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff' }}
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          ←
        </button>
        <h1>Tu pedido</h1>
      </header>

      {items.length === 0 ? (
        <div className="empty-state">Tu carrito está vacío. Vuelve al catálogo para agregar productos.</div>
      ) : (
        <div className="cart-list">
          {items.map((item) => (
            <CartItemRow key={item.productId} item={item} />
          ))}
        </div>
      )}

      <div className="cart-footer">
        <CartOrderForm />
      </div>
    </div>
  )
}
