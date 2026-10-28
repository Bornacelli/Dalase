import type { VercelRequest, VercelResponse } from '@vercel/node'
import { v2 as cloudinary } from 'cloudinary'
import { getCallerFromRequest } from './_lib/firebaseAdmin'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido.' })
    return
  }

  const caller = await getCallerFromRequest(req.headers.authorization)
  if (!caller || (caller.role !== 'admin' && caller.role !== 'duena')) {
    res.status(403).json({ error: 'No tienes permiso para borrar imágenes.' })
    return
  }

  const { publicId } = req.body ?? {}
  if (!publicId || typeof publicId !== 'string') {
    res.status(400).json({ error: 'Falta publicId.' })
    return
  }

  try {
    await cloudinary.uploader.destroy(publicId)
    res.status(200).json({ ok: true })
  } catch {
    res.status(500).json({ error: 'No se pudo borrar la imagen en Cloudinary.' })
  }
}
