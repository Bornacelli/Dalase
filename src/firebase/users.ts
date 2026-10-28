import { collection, doc, getDoc, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore'
import { db, auth } from './config'
import type { AppUser } from '@/types/user'

const USERS_COLLECTION = 'users'

export async function getUserRole(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, USERS_COLLECTION, uid))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    id: snap.id,
    email: data.email,
    role: data.role,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : Date.now(),
  }
}

/** Solo la dueña puede leer la lista completa (reglas de Firestore lo exigen). */
export function subscribeUsers(onChange: (users: AppUser[]) => void): () => void {
  const q = query(collection(db, USERS_COLLECTION), orderBy('email'))
  return onSnapshot(q, (snap) => {
    const users = snap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        email: data.email,
        role: data.role,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : Date.now(),
      } as AppUser
    })
    onChange(users)
  })
}

async function callAdminApi(path: string, body: unknown): Promise<void> {
  const idToken = await auth.currentUser?.getIdToken()
  if (!idToken) throw new Error('No hay sesión activa.')

  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? 'No se pudo completar la operación.')
  }
}

export async function createAdminUser(email: string, password: string, role: 'admin' | 'duena') {
  await callAdminApi('/api/admin-create-user', { email, password, role })
}

export async function deleteAdminUser(uid: string) {
  await callAdminApi('/api/admin-delete-user', { uid })
}
