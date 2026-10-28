// Importación masiva de productos desde productos.json a Firestore.
// Uso: node --env-file=.env.local scripts/import-products.mjs
import { readFileSync } from 'node:fs'
import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const PRODUCTS_FILE = new URL('../productos.json', import.meta.url)
const BATCH_SIZE = 450

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildSearchTokens(name) {
  const normalized = normalizeText(name)
  const words = normalized.split(' ').filter(Boolean)
  const tokens = new Set()
  for (const word of words) {
    if (word.length < 2) {
      tokens.add(word)
      continue
    }
    for (let end = 2; end <= word.length; end++) {
      tokens.add(word.slice(0, end))
    }
  }
  return Array.from(tokens)
}

function titleCase(text) {
  return text
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
  }),
})
const db = getFirestore(app)

async function main() {
  const raw = JSON.parse(readFileSync(PRODUCTS_FILE, 'utf-8'))
  console.log(`Leídos ${raw.length} productos del JSON.`)

  const items = raw.filter((p) => typeof p.valor === 'number' && p.valor > 0 && p.descripcion?.trim())
  const skipped = raw.length - items.length
  console.log(`Se importarán ${items.length} productos (se omiten ${skipped} con precio $0 o sin nombre).`)

  // --- 1. Resolver/crear categorías (normalizando mayúsculas/tildes) ---
  const existingSnap = await db.collection('categories').get()
  const categoryByNormalized = new Map()
  let maxOrder = -1
  existingSnap.forEach((doc) => {
    const data = doc.data()
    categoryByNormalized.set(normalizeText(data.name), { id: doc.id, name: data.name })
    if (typeof data.order === 'number' && data.order > maxOrder) maxOrder = data.order
  })
  console.log(`Categorías existentes en Firestore: ${categoryByNormalized.size}`)

  const rawCategoryNames = new Map()
  for (const item of items) {
    const raw = (item.categoria ?? '').toString().trim()
    if (!raw) continue
    const key = normalizeText(raw)
    if (!rawCategoryNames.has(key)) rawCategoryNames.set(key, raw)
  }

  for (const [key, raw] of rawCategoryNames) {
    if (categoryByNormalized.has(key)) continue
    const displayName = titleCase(raw)
    const ref = db.collection('categories').doc()
    maxOrder += 1
    await ref.set({
      name: displayName,
      order: maxOrder,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
    categoryByNormalized.set(key, { id: ref.id, name: displayName })
    console.log(`+ Categoría creada: "${displayName}"`)
  }

  // --- 2. Crear productos en lotes ---
  let batch = db.batch()
  let opsInBatch = 0
  let totalCreated = 0
  const countByCategory = new Map()

  for (const item of items) {
    const name = item.descripcion.trim()
    const rawCategory = (item.categoria ?? '').toString().trim()
    const categoryEntry = rawCategory ? categoryByNormalized.get(normalizeText(rawCategory)) : undefined
    const categoryId = categoryEntry?.id ?? ''

    const ref = db.collection('products').doc()
    batch.set(ref, {
      name,
      nameNormalized: normalizeText(name),
      searchTokens: buildSearchTokens(name),
      description: '',
      price: item.valor,
      categoryId,
      imageUrl: '',
      imagePublicId: '',
      visible: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
    opsInBatch++
    totalCreated++
    countByCategory.set(categoryEntry?.name ?? 'Sin categoría', (countByCategory.get(categoryEntry?.name ?? 'Sin categoría') ?? 0) + 1)

    if (opsInBatch >= BATCH_SIZE) {
      await batch.commit()
      console.log(`... ${totalCreated}/${items.length} productos creados`)
      batch = db.batch()
      opsInBatch = 0
    }
  }

  if (opsInBatch > 0) {
    await batch.commit()
  }

  console.log(`\nListo. ${totalCreated} productos creados.`)
  console.log('\nPor categoría:')
  for (const [name, count] of [...countByCategory.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${name}: ${count}`)
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error en la importación:', err)
    process.exit(1)
  })
