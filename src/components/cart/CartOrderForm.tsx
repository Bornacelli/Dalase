import { useCart } from '@/context/CartContext'
import { formatCOP } from '@/utils/currency'
import { buildWhatsappMessage, buildWhatsappUrl } from '@/utils/whatsapp'

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER as string

export function CartOrderForm() {
  const { items, customerName, setCustomerName, total, clear } = useCart()

  function handleSendOrder() {
    const message = buildWhatsappMessage(customerName, items, total)
    const url = buildWhatsappUrl(WHATSAPP_NUMBER, message)
    window.open(url, '_blank')
    clear()
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
        💬 Enviar pedido por WhatsApp
      </button>
      <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 8 }}>
        Se abre WhatsApp con tu pedido listo
      </p>
    </>
  )
}
