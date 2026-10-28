import { Minus, Plus } from 'lucide-react'
import type { Product } from '@/types/product'
import { formatCOP } from '@/utils/currency'
import { useCart } from '@/context/CartContext'
import { ProductImage } from '@/components/common/ProductImage'

interface ProductCardProps {
  product: Product
  onOpenDetail: (product: Product) => void
}

export function ProductCard({ product, onOpenDetail }: ProductCardProps) {
  const { addItem, setQuantity, getQuantity } = useCart()
  const quantity = getQuantity(product.id)

  return (
    <div className="product-card">
      <button type="button" className="product-card-link" onClick={() => onOpenDetail(product)}>
        <ProductImage imageUrl={product.imageUrl} alt={product.name} className="product-card-image" />
        <div className="product-card-body">
          <span className="product-card-name">{product.name}</span>
        </div>
      </button>
      <div className="product-card-footer">
        <span className="product-card-price">{formatCOP(product.price)}</span>
        {quantity === 0 ? (
          <button
            type="button"
            className="btn-icon"
            aria-label={`Agregar ${product.name} al carrito`}
            onClick={() => addItem(product)}
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        ) : (
          <div className="qty-control">
            <button
              type="button"
              className="qty-btn"
              aria-label={`Restar ${product.name}`}
              onClick={() => setQuantity(product.id, quantity - 1)}
            >
              <Minus size={14} strokeWidth={2.5} />
            </button>
            <span>{quantity}</span>
            <button
              type="button"
              className="qty-btn"
              aria-label={`Sumar ${product.name}`}
              onClick={() => setQuantity(product.id, quantity + 1)}
            >
              <Plus size={14} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
