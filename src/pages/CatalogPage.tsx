import { useEffect, useState } from 'react'
import { Header } from '@/components/catalog/Header'
import { CategoryChips, CategorySidebar } from '@/components/catalog/CategoryFilter'
import { ProductGrid } from '@/components/catalog/ProductGrid'
import { ProductDetail } from '@/components/catalog/ProductDetail'
import { CartPanel } from '@/components/cart/CartPanel'
import { useCategories } from '@/hooks/useCategories'
import { useProducts } from '@/hooks/useProducts'
import { useDebounce } from '@/hooks/useDebounce'
import { getVisibleProductsCount } from '@/firebase/products'
import type { Product } from '@/types/product'

export function CatalogPage() {
  const { categories } = useCategories()
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [totalCount, setTotalCount] = useState<number | undefined>()

  const { products, loading, loadingMore, hasMore, error, loadMore } = useProducts({
    categoryId,
    searchTerm: debouncedSearch,
    onlyVisible: true,
  })

  useEffect(() => {
    getVisibleProductsCount()
      .then(setTotalCount)
      .catch(() => setTotalCount(undefined))
  }, [])

  return (
    <div className="app-layout">
      <Header searchValue={search} onSearchChange={setSearch} totalProducts={totalCount} />
      <CategoryChips categories={categories} activeId={categoryId} onSelect={setCategoryId} />

      <div className="catalog-page">
        <CategorySidebar categories={categories} activeId={categoryId} onSelect={setCategoryId} />

        <main className="catalog-main">
          <ProductGrid
            products={products}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            error={error}
            onLoadMore={loadMore}
            onOpenDetail={setSelectedProduct}
          />
        </main>

        <div className="catalog-cart-panel">
          <CartPanel />
        </div>
      </div>

      {selectedProduct && (
        <ProductDetail product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  )
}
