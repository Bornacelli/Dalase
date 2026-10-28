import { useMemo, useState } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { useDebounce } from '@/hooks/useDebounce'
import { useInfiniteScrollSentinel } from '@/hooks/useInfiniteScrollSentinel'
import { deleteProductDoc } from '@/firebase/products'
import { deleteProductImage, thumbnailUrl } from '@/utils/cloudinary'
import { formatCOP } from '@/utils/currency'
import { ProductForm } from '@/components/admin/ProductForm'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Spinner } from '@/components/common/Spinner'
import type { Product } from '@/types/product'

export function AdminProductsPage() {
  const { categories } = useCategories()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { products, loading, loadingMore, hasMore, error, loadMore, reload } = useProducts({
    searchTerm: debouncedSearch,
    onlyVisible: false,
  })

  const sentinelRef = useInfiniteScrollSentinel(loadMore, hasMore && !loading)

  const categoryNameById = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c.name]))
    return (id: string) => map.get(id) ?? '—'
  }, [categories])

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteProductDoc(deleteTarget.id)
      if (deleteTarget.imagePublicId) deleteProductImage(deleteTarget.imagePublicId)
      setDeleteTarget(null)
      reload()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="admin-stats">
        <div className="stat-card">
          <div className="value">{products.length}{hasMore ? '+' : ''}</div>
          <div className="label">Productos</div>
        </div>
        <div className="stat-card">
          <div className="value">{categories.length}</div>
          <div className="label">Categorías</div>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="search-bar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input placeholder="Buscar producto" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>
          + Nuevo producto
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="error-banner">{error}</div>
      ) : products.length === 0 ? (
        <div className="empty-state">No hay productos todavía.</div>
      ) : (
        <>
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Visible</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td style={{ width: 56 }}>
                    <img
                      src={thumbnailUrl(product.imageUrl)}
                      alt={product.name}
                      style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }}
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>{categoryNameById(product.categoryId)}</td>
                  <td>{formatCOP(product.price)}</td>
                  <td>{product.visible ? 'Sí' : 'No'}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="btn-icon btn-icon-outline"
                        onClick={() => setEditingProduct(product)}
                        aria-label={`Editar ${product.name}`}
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        className="btn-icon btn-icon-outline"
                        onClick={() => setDeleteTarget(product)}
                        aria-label={`Borrar ${product.name}`}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="admin-mobile-list">
            {products.map((product) => (
              <div className="admin-list-item" key={product.id}>
                <img src={thumbnailUrl(product.imageUrl)} alt={product.name} />
                <div className="info">
                  <h3>{product.name}</h3>
                  <span>{formatCOP(product.price)}</span>
                </div>
                <div className="actions">
                  <button
                    type="button"
                    className="btn-icon btn-icon-outline"
                    onClick={() => setEditingProduct(product)}
                    aria-label={`Editar ${product.name}`}
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    className="btn-icon btn-icon-outline"
                    onClick={() => setDeleteTarget(product)}
                    aria-label={`Borrar ${product.name}`}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div ref={sentinelRef} className="loading-more">
              {loadingMore ? <Spinner /> : null}
            </div>
          )}
        </>
      )}

      {(creating || editingProduct) && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          onClose={() => {
            setCreating(false)
            setEditingProduct(null)
          }}
          onSaved={() => {
            setCreating(false)
            setEditingProduct(null)
            reload()
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Borrar producto"
          message={`¿Seguro que quieres borrar "${deleteTarget.name}"? Esta acción no se puede deshacer.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          loading={deleting}
        />
      )}
    </div>
  )
}
