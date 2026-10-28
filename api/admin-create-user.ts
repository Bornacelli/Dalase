import type { VercelRequest, VercelResponse } from '@vercel/node'
import { adminAuth, adminDb, getCallerFromRequest } from './_lib/firebaseAdmin.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido.' })
    return
  }

  const caller = await getCallerFromRequest(req.headers.authorization)
  if (!caller || caller.role !== 'duena') {
    res.status(403).json({ error: 'Solo la dueña puede agregar administradores.' })
    return
  }

  const { email, password, role } = req.body ?? {}
  if (typeof email !== 'string' || typeof password !== 'string' || !['admin', 'duena'].includes(role)) {
    res.status(400).json({ error: 'Datos inválidos.' })
    return
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' })
    return
  }

  try {
    const newUser = await adminAuth.createUser({ email, password })
    const now = new Date()
    await adminDb.collection('users').doc(newUser.uid).set({
      email,
      role,
      createdAt: now,
      updatedAt: now,
    })
    res.status(200).json({ ok: true, uid: newUser.uid })
  } catch (err: unknown) {
    const message =
      err && typeof err === 'object' && 'code' in err && err.code === 'auth/email-already-exists'
        ? 'Ese correo ya tiene una cuenta.'
        : 'No se pudo crear el usuario.'
    res.status(400).json({ error: message })
  }
}
