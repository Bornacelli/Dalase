import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '@/firebase/config'
import { getUserRole } from '@/firebase/users'
import type { UserRole } from '@/types/user'

interface AuthState {
  user: User | null
  role: UserRole | null
  loading: boolean
}

const AuthContext = createContext<AuthState>({ user: null, role: null, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, role: null, loading: true })

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ user: null, role: null, loading: false })
        return
      }
      const profile = await getUserRole(user.uid)
      setState({ user, role: profile?.role ?? null, loading: false })
    })
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
