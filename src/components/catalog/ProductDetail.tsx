import type { Product } from '@/types/product'
import { formatCOP } from '@/utils/currency'
import { detailUrl } from '@/utils/cloudinary'
import { useCart } from '@/context/CartContext'

interface ProductDetailProps {
  product: Product
  onClose: () => void
}

export function ProductDetail({ product, onClose }: ProductDetailProps) {
  const { addItem } = useCart()

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-sheet" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="btn-icon btn-icon-outline detail-close" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>
        <img src={detailUrl(product.imageUrl)} alt={product.name} className="detail-image" />
        <div className="detail-body">
          <h2>{product.name}</h2>
          <div className="detail-price">{formatCOP(product.price)}</div>
          {product.description && <p className="detail-description">{product.description}</p>}
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={() => {
              addItem(product)
              onClose()
            }}
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  )
}
