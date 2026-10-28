import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { CartItemRow } from './CartItemRow'
import { CartOrderForm } from './CartOrderForm'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

/** Panel fijo en la barra lateral del catálogo en escritorio (>=1024px). */
export function CartPanel() {
  const { items, clear } = useCart()
  const [confirmingClear, setConfirmingClear] = useState(false)

  return (
    <aside className="cart-panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 style={{ margin: 0 }}>Tu pedido</h2>
        {items.length > 0 && (
          <button
            type="button"
            className="btn-link"
            style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            onClick={() => setConfirmingClear(true)}
          >
            <Trash2 size={14} strokeWidth={2} />
            Vaciar
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
          Agrega productos del catálogo para armar tu pedido.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {items.map((item) => (
            <CartItemRow key={item.productId} item={item} />
          ))}
        </div>
      )}
      <CartOrderForm />

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
    </aside>
  )
}
