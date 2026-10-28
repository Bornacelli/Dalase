/** Minúsculas, sin tildes/diacríticos, sin espacios extra. */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const MIN_TOKEN_LENGTH = 2

/**
 * Genera los prefijos (>= 2 caracteres) de cada palabra del nombre, para
 * poder buscar por "empieza con" usando un solo índice array-contains en
 * Firestore. Ej: "Aceite vegetal" -> ac, ace, acei, ..., ve, veg, vege, ...
 */
export function buildSearchTokens(name: string): string[] {
  const normalized = normalizeText(name)
  const words = normalized.split(' ').filter(Boolean)
  const tokens = new Set<string>()

  for (const word of words) {
    if (word.length < MIN_TOKEN_LENGTH) {
      tokens.add(word)
      continue
    }
    for (let end = MIN_TOKEN_LENGTH; end <= word.length; end++) {
      tokens.add(word.slice(0, end))
    }
  }

  return Array.from(tokens)
}
