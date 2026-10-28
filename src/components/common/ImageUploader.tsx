import { useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import { uploadProductImage, thumbnailUrl } from '@/utils/cloudinary'

interface ImageUploaderProps {
  imageUrl: string
  onUploaded: (result: { url: string; publicId: string }) => void
}

const MAX_SIZE_MB = 5

export function ImageUploader({ imageUrl, onUploaded }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Elige un archivo de imagen.')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`La imagen debe pesar menos de ${MAX_SIZE_MB}MB.`)
      return
    }
    setError(null)
    setUploading(true)
    try {
      const result = await uploadProductImage(file)
      onUploaded(result)
    } catch {
      setError('No se pudo subir la imagen. Intenta de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        className="image-uploader"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {imageUrl && <img src={thumbnailUrl(imageUrl)} alt="Foto del producto" />}
        <div className="overlay-label" style={{ position: imageUrl ? 'absolute' : 'relative' }}>
          <Camera size={26} strokeWidth={1.8} />
          <span>{uploading ? 'Subiendo...' : imageUrl ? 'Cambiar foto' : 'Subir foto'}</span>
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && <p style={{ color: 'var(--color-danger)', fontSize: '0.82rem' }}>{error}</p>}
    </div>
  )
}
