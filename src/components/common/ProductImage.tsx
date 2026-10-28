import { Package } from 'lucide-react'
import { detailUrl, thumbnailUrl } from '@/utils/cloudinary'

interface ProductImageProps {
  imageUrl: string
  alt: string
  className?: string
  variant?: 'thumb' | 'detail'
}

/** Imagen de producto con un reemplazo visual cuando todavía no tiene foto cargada. */
export function ProductImage({ imageUrl, alt, className, variant = 'thumb' }: ProductImageProps) {
  if (!imageUrl) {
    return (
      <div className={`${className ?? ''} product-image-placeholder`} role="img" aria-label={alt}>
        <Package size={variant === 'detail' ? '35%' : '38%'} strokeWidth={1.5} />
      </div>
    )
  }

  const src = variant === 'detail' ? detailUrl(imageUrl) : thumbnailUrl(imageUrl)
  return <img src={src} alt={alt} className={className} loading="lazy" />
}
