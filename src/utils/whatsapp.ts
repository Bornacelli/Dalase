import type { CartItem } from '@/types/cart'
import { formatCOP } from './currency'

export function buildWhatsappMessage(
  customerName: string,
  storeName: string,
  items: CartItem[],
  total: number
): string {
  const greeting = storeName
    ? `Hola, soy ${customerName || 'un cliente'} de la tienda ${storeName} y quiero hacer este pedido:`
    : `Hola, soy ${customerName || 'un cliente'} y quiero hacer este pedido:`
  const lines = [
    greeting,
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
