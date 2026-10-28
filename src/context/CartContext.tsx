import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CartItem } from '@/types/cart'
import type { Product } from '@/types/product'

const STORAGE_KEY = 'dalase-cart'
const NAME_STORAGE_KEY = 'dalase-customer-name'

interface CartState {
  items: CartItem[]
  customerName: string
  total: number
  itemCount: number
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  setCustomerName: (name: string) => void
  clear: () => void
}

const CartContext = createContext<CartState | null>(null)

function readStoredItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

function readStoredName(): string {
  try {
    return localStorage.getItem(NAME_STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readStoredItems)
  const [customerName, setCustomerNameState] = useState<string>(readStoredName)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  useEffect(() => {
    localStorage.setItem(NAME_STORAGE_KEY, customerName)
  }, [customerName])

  function addItem(product: Product) {
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id)
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity: 1,
        },
      ]
    })
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((item) => item.productId !== productId))
  }

  function setQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    setItems((prev) => prev.map((item) => (item.productId === productId ? { ...item, quantity } : item)))
  }

  function clear() {
    setItems([])
  }

  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items])
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])

  const value: CartState = {
    items,
    customerName,
    total,
    itemCount,
    addItem,
    removeItem,
    setQuantity,
    setCustomerName: setCustomerNameState,
    clear,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}
