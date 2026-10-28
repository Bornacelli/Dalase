import { useState, type FormEvent } from 'react'
import type { Category } from '@/types/category'
import type { Product, ProductInput } from '@/types/product'
import { ImageUploader } from '@/components/common/ImageUploader'
import { Toggle } from '@/components/common/Toggle'
import { createProduct, updateProduct } from '@/firebase/products'
import { deleteProductImage } from '@/utils/cloudinary'

interface ProductFormProps {
  product: Product | null
  categories: Category[]
  onClose: () => void
  onSaved: () => void
}

export function ProductForm({ product, categories, onClose, onSaved }: ProductFormProps) {
  const [name, setName] = useState(product?.name ?? '')
  const [price, setPrice] = useState(product ? String(product.price) : '')
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [visible, setVisible] = useState(product?.visible ?? true)
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? '')
  const [imagePublicId, setImagePublicId] = useState(product?.imagePublicId ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const previousPublicId = product?.imagePublicId ?? ''

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const priceNumber = Number(price)
    if (!name.trim() || !categoryId || !imageUrl || !priceNumber || priceNumber <= 0) {
      setError('Completa nombre, precio, categoría y foto.')
      return
    }

    const input: ProductInput = {
      name: name.trim(),
      price: priceNumber,
      categoryId,
      description: description.trim(),
      imageUrl,
      imagePublicId,
      visible,
    }

    setSaving(true)
    try {
      if (product) {
        await updateProduct(product.id, input)
      } else {
        await createProduct(input)
      }
      if (previousPublicId && previousPublicId !== imagePublicId) {
        deleteProductImage(previousPublicId)
      }
      onSaved()
    } catch {
      setError('No se pudo guardar el producto. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="form-overlay" onClick={onClose}>
      <div className="form-panel" onClick={(e) => e.stopPropagation()}>
        <div className="form-panel-header">
          <h2>{product ? 'Editar producto' : 'Nuevo producto'}</h2>
          <button type="button" className="btn-icon btn-icon-outline" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-panel-body">
          <ImageUploader
            imageUrl={imageUrl}
            onUploaded={(result) => {
              setImageUrl(result.url)
              setImagePublicId(result.publicId)
            }}
          />

          <div className="field">
            <label htmlFor="product-name">Nombre</label>
            <input
              id="product-name"
              className="input"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="field">
              <label htmlFor="product-price">Precio</label>
              <input
                id="product-price"
                className="input"
                type="number"
                min={1}
                step={1}
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="product-category">Categoría</label>
              <select
                id="product-category"
                className="select"
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="" disabled>
                  Elige una
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="product-description">Descripción</label>
            <textarea
              id="product-description"
              className="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Toggle checked={visible} onChange={setVisible} label="Visible en catálogo" />

          {error && <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: 16 }}>{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 20 }} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar producto'}
          </button>
        </form>
      </div>
    </div>
  )
}
