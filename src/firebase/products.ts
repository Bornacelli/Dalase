import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit as fbLimit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  serverTimestamp,
  setDoc,
  startAfter,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore'
import { getCountFromServer, getDocs } from 'firebase/firestore'
import { db } from './config'
import type { Product, ProductInput } from '@/types/product'
import { buildSearchTokens, normalizeText } from '@/utils/normalizeText'

const PRODUCTS_COLLECTION = 'products'
const PAGE_SIZE = 20

function fromDoc(snap: QueryDocumentSnapshot<DocumentData>): Product {
  const data = snap.data()
  return {
    id: snap.id,
    name: data.name,
    nameNormalized: data.nameNormalized,
    searchTokens: data.searchTokens ?? [],
    description: data.description ?? '',
    price: data.price ?? 0,
    categoryId: data.categoryId ?? '',
    imageUrl: data.imageUrl ?? '',
    imagePublicId: data.imagePublicId ?? '',
    visible: data.visible ?? false,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : Date.now(),
  }
}

export interface ProductsPageParams {
  categoryId?: string | null
  searchTerm?: string
  cursor?: QueryDocumentSnapshot<DocumentData> | null
  onlyVisible: boolean
}

export interface ProductsPageResult {
  products: Product[]
  lastDoc: QueryDocumentSnapshot<DocumentData> | null
  hasMore: boolean
}

/**
 * Trae una página de productos. Estrategia de búsqueda: usa un único
 * array-contains sobre `searchTokens` con la primera palabra escrita
 * (indexado, no requiere traer todo el catálogo); si el usuario escribió
 * más palabras, se filtran en cliente dentro de los resultados ya traídos.
 */
export async function getProductsPage({
  categoryId,
  searchTerm,
  cursor,
  onlyVisible,
}: ProductsPageParams): Promise<ProductsPageResult> {
  const normalizedSearch = searchTerm ? normalizeText(searchTerm) : ''
  const searchWords = normalizedSearch.split(' ').filter(Boolean)
  const firstWordToken = searchWords[0]

  const constraints = []
  if (onlyVisible) constraints.push(where('visible', '==', true))
  if (categoryId) constraints.push(where('categoryId', '==', categoryId))
  if (firstWordToken) constraints.push(where('searchTokens', 'array-contains', firstWordToken))
  constraints.push(orderBy('nameNormalized'))
  if (cursor) constraints.push(startAfter(cursor))
  constraints.push(fbLimit(PAGE_SIZE))

  const q = query(collection(db, PRODUCTS_COLLECTION), ...constraints)
  const snap = await getDocs(q)

  let products = snap.docs.map(fromDoc)

  if (searchWords.length > 1) {
    const restWords = searchWords.slice(1)
    products = products.filter((p) => restWords.every((w) => p.nameNormalized.includes(w)))
  }

  return {
    products,
    lastDoc: snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null,
    hasMore: snap.docs.length === PAGE_SIZE,
  }
}

/** Conteo agregado (1 sola lectura) del total de productos visibles, para mostrarlo en el buscador. */
export async function getVisibleProductsCount(): Promise<number> {
  const q = query(collection(db, PRODUCTS_COLLECTION), where('visible', '==', true))
  const snap = await getCountFromServer(q)
  return snap.data().count
}

export async function getProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, PRODUCTS_COLLECTION, id))
  if (!snap.exists()) return null
  return fromDoc(snap as QueryDocumentSnapshot<DocumentData>)
}

export async function createProduct(input: ProductInput): Promise<string> {
  const ref = doc(collection(db, PRODUCTS_COLLECTION))
  const nameNormalized = normalizeText(input.name)
  await setDoc(ref, {
    ...input,
    nameNormalized,
    searchTokens: buildSearchTokens(input.name),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateProduct(id: string, input: ProductInput): Promise<void> {
  const nameNormalized = normalizeText(input.name)
  await updateDoc(doc(db, PRODUCTS_COLLECTION, id), {
    ...input,
    nameNormalized,
    searchTokens: buildSearchTokens(input.name),
    updatedAt: serverTimestamp(),
  })
}

export async function deleteProductDoc(id: string): Promise<void> {
  await deleteDoc(doc(db, PRODUCTS_COLLECTION, id))
}
