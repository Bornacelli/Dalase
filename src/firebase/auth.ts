import { signInWithEmailAndPassword, signOut as fbSignOut } from 'firebase/auth'
import { auth } from './config'

export async function signIn(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

export async function signOut() {
  await fbSignOut(auth)
}
