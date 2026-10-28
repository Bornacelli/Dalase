import { useEffect, useState } from 'react'
import { subscribeCategories } from '@/firebase/categories'
import type { Category } from '@/types/category'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribeCategories((cats) => {
      setCategories(cats)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  return { categories, loading }
}
