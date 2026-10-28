import { useState, type FormEvent } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useCategories } from '@/hooks/useCategories'
import { createCategory, deleteCategoryDoc, updateCategory } from '@/firebase/categories'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Spinner } from '@/components/common/Spinner'
import type { Category } from '@/types/category'

export function AdminCategoriesPage() {
  const { categories, loading } = useCategories()
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      await createCategory({ name: name.trim(), order: categories.length })
      setName('')
    } finally {
      setSaving(false)
    }
  }

  async function handleRename(category: Category) {
    if (!editingName.trim() || editingName.trim() === category.name) {
      setEditingId(null)
      return
    }
    await updateCategory(category.id, { name: editingName.trim(), order: category.order })
    setEditingId(null)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setSaving(true)
    try {
      await deleteCategoryDoc(deleteTarget.id)
      setDeleteTarget(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleCreate} className="admin-toolbar">
        <div className="field" style={{ flex: 1, marginBottom: 0 }}>
          <input
            className="input"
            placeholder="Nombre de la nueva categoría"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          <Plus size={18} strokeWidth={2.4} />
          Agregar
        </button>
      </form>

      {loading ? (
        <Spinner />
      ) : categories.length === 0 ? (
        <div className="empty-state">Aún no hay categorías.</div>
      ) : (
        categories.map((category) => (
          <div className="admin-list-item" key={category.id}>
            <div className="info">
              {editingId === category.id ? (
                <input
                  className="input"
                  value={editingName}
                  autoFocus
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => handleRename(category)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRename(category)}
                />
              ) : (
                <h3>{category.name}</h3>
              )}
            </div>
            <div className="actions">
              <button
                type="button"
                className="btn-icon btn-icon-outline"
                aria-label={`Editar ${category.name}`}
                onClick={() => {
                  setEditingId(category.id)
                  setEditingName(category.name)
                }}
              >
                <Pencil size={16} strokeWidth={2} />
              </button>
              <button
                type="button"
                className="btn-icon btn-icon-outline"
                aria-label={`Borrar ${category.name}`}
                onClick={() => setDeleteTarget(category)}
              >
                <Trash2 size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        ))
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Borrar categoría"
          message={`¿Seguro que quieres borrar "${deleteTarget.name}"? Los productos que la usan quedarán sin categoría.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          loading={saving}
        />
      )}
    </div>
  )
}
