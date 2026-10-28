import { useCallback, useEffect, useRef, useState } from 'react'
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'
import { getProductsPage } from '@/firebase/products'
import type { Product } from '@/types/product'

interface UseProductsOptions {
  categoryId?: string | null
  searchTerm?: string
  onlyVisible: boolean
}

export function useProducts({ categoryId, searchTerm, onlyVisible }: UseProductsOptions) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const cursorRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null)
  const requestId = useRef(0)

  const loadFirstPage = useCallback(async () => {
    const currentRequest = ++requestId.current
    setLoading(true)
    setError(null)
    cursorRef.current = null
    try {
      const result = await getProductsPage({ categoryId, searchTerm, onlyVisible, cursor: null })
      if (currentRequest !== requestId.current) return
      setProducts(result.products)
      cursorRef.current = result.lastDoc
      setHasMore(result.hasMore)
    } catch (err) {
      console.error('Error cargando productos:', err)
      if (currentRequest !== requestId.current) return
      setError('No se pudo cargar el catálogo. Revisa tu conexión.')
    } finally {
      if (currentRequest === requestId.current) setLoading(false)
    }
  }, [categoryId, searchTerm, onlyVisible])

  useEffect(() => {
    loadFirstPage()
  }, [loadFirstPage])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || loading) return
    const currentRequest = requestId.current
    setLoadingMore(true)
    try {
      const result = await getProductsPage({
        categoryId,
        searchTerm,
        onlyVisible,
        cursor: cursorRef.current,
      })
      if (currentRequest !== requestId.current) return
      setProducts((prev) => [...prev, ...result.products])
      cursorRef.current = result.lastDoc
      setHasMore(result.hasMore)
    } catch (err) {
      console.error('Error cargando más productos:', err)
      if (currentRequest !== requestId.current) return
      setError('No se pudieron cargar más productos.')
    } finally {
      if (currentRequest === requestId.current) setLoadingMore(false)
    }
  }, [categoryId, searchTerm, onlyVisible, loadingMore, hasMore, loading])

  return { products, loading, loadingMore, hasMore, error, loadMore, reload: loadFirstPage }
}
