import type { Category } from '@/types/category'

interface CategoryFilterProps {
  categories: Category[]
  activeId: string | null
  onSelect: (id: string | null) => void
}

/** Chips horizontales en celular, visibles hasta 1024px; en escritorio se oculta vía CSS. */
export function CategoryChips({ categories, activeId, onSelect }: CategoryFilterProps) {
  return (
    <div className="category-chips">
      <button type="button" className="chip" data-active={activeId === null} onClick={() => onSelect(null)}>
        Todos
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          className="chip"
          data-active={activeId === cat.id}
          onClick={() => onSelect(cat.id)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}

/** Barra lateral, visible desde 1024px (ver CSS). */
export function CategorySidebar({ categories, activeId, onSelect }: CategoryFilterProps) {
  return (
    <nav className="category-sidebar">
      <h2>Categorías</h2>
      <button type="button" data-active={activeId === null} onClick={() => onSelect(null)}>
        Todos
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          data-active={activeId === cat.id}
          onClick={() => onSelect(cat.id)}
        >
          {cat.name}
        </button>
      ))}
    </nav>
  )
}
