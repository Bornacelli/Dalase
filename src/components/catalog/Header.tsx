import { Link } from 'react-router-dom'
import logo from '@/assets/logo.png'
import { useCart } from '@/context/CartContext'

interface HeaderProps {
  searchValue: string
  onSearchChange: (value: string) => void
  totalProducts?: number
}

export function Header({ searchValue, onSearchChange, totalProducts }: HeaderProps) {
  const { itemCount } = useCart()

  return (
    <header className="header">
      <div className="header-top">
        <img src={logo} alt="Distribuciones Dalase" className="header-logo" />
        <div className="header-titles">
          <h1>Distribuciones Dalase</h1>
          <p>Catálogo virtual</p>
        </div>
        <Link to="/carrito" className="cart-button" aria-label="Ver carrito">
          🛒
          {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
        </Link>
      </div>
      <div className="search-bar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          placeholder={totalProducts ? `Buscar entre ${totalProducts} productos` : 'Buscar productos'}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </header>
  )
}
