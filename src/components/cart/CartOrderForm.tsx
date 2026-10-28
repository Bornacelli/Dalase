import { MessageCircle } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { formatCOP } from '@/utils/currency'
import { buildWhatsappMessage, buildWhatsappUrl } from '@/utils/whatsapp'

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER as string

export function CartOrderForm() {
  const { items, customerName, setCustomerName, storeName, setStoreName, total } = useCart()

  function handleSendOrder() {
    const message = buildWhatsappMessage(customerName, storeName, items, total)
    const url = buildWhatsappUrl(WHATSAPP_NUMBER, message)
    window.open(url, '_blank')
  }

  return (
    <>
      <div className="field">
        <label htmlFor="customer-name">Tu nombre</label>
        <input
          id="customer-name"
          className="input"
          placeholder="María Pérez"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="store-name">Nombre de la tienda</label>
        <input
          id="store-name"
          className="input"
          placeholder="Tienda La Esquina"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
        />
      </div>
      <div className="cart-total-row">
        <span>Total</span>
        <span className="amount">{formatCOP(total)}</span>
      </div>
      <button
        type="button"
        className="btn btn-whatsapp"
        disabled={items.length === 0}
        onClick={handleSendOrder}
      >
        <MessageCircle size={20} strokeWidth={2.2} />
        Enviar pedido por WhatsApp
      </button>
      <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 8 }}>
        Se abre WhatsApp con tu pedido listo
      </p>
    </>
  )
}
