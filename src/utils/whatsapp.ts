import type { CartItem } from '@/types/cart'
import { formatCOP } from './currency'

export function buildWhatsappMessage(customerName: string, items: CartItem[], total: number): string {
  const lines = [
    `Hola, soy ${customerName || 'un cliente'} y quiero hacer este pedido:`,
    '',
    ...items.map(
      (item) => `• ${item.quantity} x ${item.name} - ${formatCOP(item.price * item.quantity)}`
    ),
    '',
    `Total: ${formatCOP(total)}`,
  ]
  return lines.join('\n')
}

export function buildWhatsappUrl(phoneNumber: string, message: string): string {
  const cleanPhone = phoneNumber.replace(/\D/g, '')
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
}
