import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from './config'
import type { Category, CategoryInput } from '@/types/category'

const CATEGORIES_COLLECTION = 'categories'

/** Las categorías son pocas (decenas), así que se escuchan en vivo completas. */
export function subscribeCategories(onChange: (categories: Category[]) => void): () => void {
  const q = query(collection(db, CATEGORIES_COLLECTION), orderBy('order'))
  return onSnapshot(q, (snap) => {
    const categories = snap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        name: data.name,
        order: data.order ?? 0,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : Date.now(),
      } as Category
    })
    onChange(categories)
  })
}

export async function createCategory(input: CategoryInput): Promise<string> {
  const ref = doc(collection(db, CATEGORIES_COLLECTION))
  await setDoc(ref, { ...input, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  return ref.id
}

export async function updateCategory(id: string, input: CategoryInput): Promise<void> {
  await updateDoc(doc(db, CATEGORIES_COLLECTION, id), { ...input, updatedAt: serverTimestamp() })
}

export async function deleteCategoryDoc(id: string): Promise<void> {
  await deleteDoc(doc(db, CATEGORIES_COLLECTION, id))
}
