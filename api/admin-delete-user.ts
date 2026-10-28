import type { VercelRequest, VercelResponse } from '@vercel/node'
import { adminAuth, adminDb, getCallerFromRequest } from './_lib/firebaseAdmin.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido.' })
    return
  }

  const caller = await getCallerFromRequest(req.headers.authorization)
  if (!caller || caller.role !== 'duena') {
    res.status(403).json({ error: 'Solo la dueña puede quitar administradores.' })
    return
  }

  const { uid } = req.body ?? {}
  if (typeof uid !== 'string' || !uid) {
    res.status(400).json({ error: 'Falta uid.' })
    return
  }
  if (uid === caller.uid) {
    res.status(400).json({ error: 'No puedes quitarte tu propio acceso.' })
    return
  }

  try {
    await adminAuth.deleteUser(uid)
    await adminDb.collection('users').doc(uid).delete()
    res.status(200).json({ ok: true })
  } catch {
    res.status(500).json({ error: 'No se pudo eliminar el usuario.' })
  }
}
