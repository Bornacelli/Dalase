import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0]!
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
    }),
  })
}

export const adminAuth = getAuth(getAdminApp())
export const adminDb = getFirestore(getAdminApp())

export interface CallerInfo {
  uid: string
  email: string | undefined
  role: 'duena' | 'admin' | null
}

/** Verifica el ID token de Firebase enviado en el header Authorization y lee su rol. */
export async function getCallerFromRequest(authorizationHeader: string | undefined): Promise<CallerInfo | null> {
  if (!authorizationHeader?.startsWith('Bearer ')) return null
  const idToken = authorizationHeader.slice('Bearer '.length)

  try {
    const decoded = await adminAuth.verifyIdToken(idToken)
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get()
    const role = userDoc.exists ? (userDoc.data()?.role ?? null) : null
    return { uid: decoded.uid, email: decoded.email, role }
  } catch {
    return null
  }
}
