import { auth } from '@/firebase/config'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string

export interface CloudinaryUploadResult {
  url: string
  publicId: string
}

/** Sube una imagen directo desde el navegador con un upload preset sin firma. */
export async function uploadProductImage(file: File): Promise<CloudinaryUploadResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  // La carpeta ya queda fijada por el "Asset Folder" configurado en el preset de Cloudinary.

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('No se pudo subir la imagen. Intenta de nuevo.')
  }

  const data = await response.json()
  return { url: data.secure_url as string, publicId: data.public_id as string }
}

/** Inserta transformaciones de Cloudinary (ancho, auto-format, auto-calidad) en una URL ya generada. */
export function withTransform(url: string, transform: string): string {
  if (!url.includes('/upload/')) return url
  return url.replace('/upload/', `/upload/${transform}/`)
}

export function thumbnailUrl(url: string): string {
  return withTransform(url, 'w_300,c_fill,f_auto,q_auto')
}

export function detailUrl(url: string): string {
  return withTransform(url, 'w_900,c_limit,f_auto,q_auto')
}

/**
 * Borra una imagen en Cloudinary vía la función serverless /api/delete-image
 * (requiere API secret, por eso no se hace desde el navegador directamente).
 * Si falla, no se interrumpe el flujo del usuario: solo queda una imagen
 * huérfana en Cloudinary que se puede limpiar luego.
 */
export async function deleteProductImage(publicId: string): Promise<void> {
  if (!publicId) return
  try {
    const idToken = await auth.currentUser?.getIdToken()
    if (!idToken) return
    await fetch('/api/delete-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ publicId }),
    })
  } catch {
    // Falla silenciosa: no bloquea la operación principal del usuario.
  }
}
