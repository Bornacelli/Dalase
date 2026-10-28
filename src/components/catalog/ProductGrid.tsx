import type { Product } from '@/types/product'
import { ProductCard } from './ProductCard'
import { Spinner } from '@/components/common/Spinner'
import { useInfiniteScrollSentinel } from '@/hooks/useInfiniteScrollSentinel'

interface ProductGridProps {
  products: Product[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  error: string | null
  onLoadMore: () => void
  onOpenDetail: (product: Product) => void
}

export function ProductGrid({
  products,
  loading,
  loadingMore,
  hasMore,
  error,
  onLoadMore,
  onOpenDetail,
}: ProductGridProps) {
  const sentinelRef = useInfiniteScrollSentinel(onLoadMore, hasMore && !loading)

  if (loading) return <Spinner />

  if (error) return <div className="error-banner">{error}</div>

  if (products.length === 0) {
    return <div className="empty-state">No encontramos productos con ese criterio.</div>
  }

  return (
    <>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onOpenDetail={onOpenDetail} />
        ))}
      </div>
      {hasMore && (
        <div ref={sentinelRef} className="loading-more">
          {loadingMore ? <Spinner /> : null}
        </div>
      )}
    </>
  )
}
