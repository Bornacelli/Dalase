const formatter = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })

/** Formatea un entero de pesos colombianos como "$15.900". */
export function formatCOP(value: number): string {
  return `$${formatter.format(Math.round(value))}`
}
