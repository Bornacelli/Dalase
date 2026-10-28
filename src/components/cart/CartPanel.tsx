import { useCart } from '@/context/CartContext'
import { CartItemRow } from './CartItemRow'
import { CartOrderForm } from './CartOrderForm'

/** Panel fijo en la barra lateral del catálogo en escritorio (>=1024px). */
export function CartPanel() {
  const { items } = useCart()

  return (
    <aside className="cart-panel">
      <h2>Tu pedido</h2>
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
    </aside>
  )
}
