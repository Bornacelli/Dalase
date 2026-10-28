import { Link } from 'react-router-dom'
import { Search, ShoppingCart } from 'lucide-react'
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
          <ShoppingCart size={20} strokeWidth={2.2} />
          {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
        </Link>
      </div>
      <div className="search-bar">
        <Search size={16} strokeWidth={2.2} />
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
