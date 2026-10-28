export type UserRole = 'duena' | 'admin'

export interface AppUser {
  id: string
  email: string
  role: UserRole
  createdAt: number
  updatedAt: number
}
