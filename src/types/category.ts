export interface Category {
  id: string
  name: string
  order: number
  createdAt: number
  updatedAt: number
}

export type CategoryInput = Pick<Category, 'name' | 'order'>
