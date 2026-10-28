import type { Product } from '@/types/product'
import { formatCOP } from '@/utils/currency'
import { thumbnailUrl } from '@/utils/cloudinary'
import { useCart } from '@/context/CartContext'

interface ProductCardProps {
  product: Product
  onOpenDetail: (product: Product) => void
}

export function ProductCard({ product, onOpenDetail }: ProductCardProps) {
  const { addItem } = useCart()

  return (
    <div className="product-card">
      <button type="button" className="product-card-link" onClick={() => onOpenDetail(product)}>
        <img
          src={thumbnailUrl(product.imageUrl)}
          alt={product.name}
          className="product-card-image"
          loading="lazy"
        />
        <div className="product-card-body">
          <span className="product-card-name">{product.name}</span>
        </div>
      </button>
      <div className="product-card-footer">
        <span className="product-card-price">{formatCOP(product.price)}</span>
        <button
          type="button"
          className="btn-icon"
          aria-label={`Agregar ${product.name} al carrito`}
          onClick={() => addItem(product)}
        >
          +
        </button>
      </div>
    </div>
  )
}
