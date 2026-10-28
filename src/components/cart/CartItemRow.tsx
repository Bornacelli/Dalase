import { Minus, Plus, Trash2 } from 'lucide-react'
import type { CartItem } from '@/types/cart'
import { formatCOP } from '@/utils/currency'
import { useCart } from '@/context/CartContext'
import { ProductImage } from '@/components/common/ProductImage'

export function CartItemRow({ item }: { item: CartItem }) {
  const { setQuantity, removeItem } = useCart()

  return (
    <div className="cart-item">
      <ProductImage imageUrl={item.imageUrl} alt={item.name} className="cart-item-image" />
      <div className="cart-item-info">
        <h3>{item.name}</h3>
        <span>{formatCOP(item.price)} c/u</span>
      </div>
      <div className="qty-control">
        <button
          type="button"
          className="qty-btn"
          aria-label="Restar"
          onClick={() => setQuantity(item.productId, item.quantity - 1)}
        >
          <Minus size={14} strokeWidth={2.5} />
        </button>
        <span>{item.quantity}</span>
        <button
          type="button"
          className="qty-btn"
          aria-label="Sumar"
          onClick={() => setQuantity(item.productId, item.quantity + 1)}
        >
          <Plus size={14} strokeWidth={2.5} />
        </button>
      </div>
      <button
        type="button"
        className="cart-remove"
        aria-label={`Eliminar ${item.name}`}
        onClick={() => removeItem(item.productId)}
      >
        <Trash2 size={18} strokeWidth={2} />
      </button>
    </div>
  )
}
