import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { CartItemRow } from '@/components/cart/CartItemRow'
import { CartOrderForm } from '@/components/cart/CartOrderForm'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

const DESKTOP_QUERY = '(min-width: 1024px)'

export function CartPage() {
  const navigate = useNavigate()
  const { items, clear } = useCart()
  const [confirmingClear, setConfirmingClear] = useState(false)

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
          <ArrowLeft size={18} strokeWidth={2.2} />
        </button>
        <h1 style={{ flex: 1 }}>Tu pedido</h1>
        {items.length > 0 && (
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              opacity: 0.85,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.82rem',
            }}
            onClick={() => setConfirmingClear(true)}
          >
            <Trash2 size={15} strokeWidth={2} />
            Vaciar
          </button>
        )}
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

      {confirmingClear && (
        <ConfirmDialog
          title="Vaciar carrito"
          message="¿Seguro que quieres quitar todos los productos del carrito?"
          confirmLabel="Vaciar"
          onCancel={() => setConfirmingClear(false)}
          onConfirm={() => {
            clear()
            setConfirmingClear(false)
          }}
        />
      )}
    </div>
  )
}
