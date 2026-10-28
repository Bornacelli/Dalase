export interface Product {
  id: string
  name: string
  nameNormalized: string
  searchTokens: string[]
  description: string
  price: number
  categoryId: string
  imageUrl: string
  imagePublicId: string
  visible: boolean
  createdAt: number
  updatedAt: number
}

export type ProductInput = Pick<
  Product,
  'name' | 'description' | 'price' | 'categoryId' | 'imageUrl' | 'imagePublicId' | 'visible'
>
