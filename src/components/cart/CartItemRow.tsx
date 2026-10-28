import type { CartItem } from '@/types/cart'
import { formatCOP } from '@/utils/currency'
import { thumbnailUrl } from '@/utils/cloudinary'
import { useCart } from '@/context/CartContext'

export function CartItemRow({ item }: { item: CartItem }) {
  const { setQuantity, removeItem } = useCart()

  return (
    <div className="cart-item">
      <img src={thumbnailUrl(item.imageUrl)} alt={item.name} className="cart-item-image" />
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
          −
        </button>
        <span>{item.quantity}</span>
        <button
          type="button"
          className="qty-btn"
          aria-label="Sumar"
          onClick={() => setQuantity(item.productId, item.quantity + 1)}
        >
          +
        </button>
      </div>
      <button
        type="button"
        className="cart-remove"
        aria-label={`Eliminar ${item.name}`}
        onClick={() => removeItem(item.productId)}
      >
        🗑
      </button>
    </div>
  )
}
