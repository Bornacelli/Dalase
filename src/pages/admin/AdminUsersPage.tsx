import { useEffect, useState, type FormEvent } from 'react'
import { subscribeUsers, createAdminUser, deleteAdminUser } from '@/firebase/users'
import { useAuth } from '@/context/AuthContext'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import type { AppUser, UserRole } from '@/types/user'

export function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<AppUser[]>([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('admin')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null)

  useEffect(() => subscribeUsers(setUsers), [])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email.trim() || password.length < 6) {
      setError('Escribe un correo válido y una contraseña de al menos 6 caracteres.')
      return
    }
    setSaving(true)
    try {
      await createAdminUser(email.trim(), password, role)
      setEmail('')
      setPassword('')
      setRole('admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el usuario.')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setSaving(true)
    try {
      await deleteAdminUser(deleteTarget.id)
      setDeleteTarget(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el usuario.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleCreate} className="admin-list-item" style={{ display: 'block', padding: 16 }}>
        <div className="form-row">
          <div className="field">
            <label htmlFor="new-user-email">Correo</label>
            <input
              id="new-user-email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="new-user-password">Contraseña</label>
            <input
              id="new-user-password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <div className="form-row" style={{ alignItems: 'flex-end' }}>
          <div className="field">
            <label htmlFor="new-user-role">Rol</label>
            <select
              id="new-user-role"
              className="select"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <option value="admin">Admin</option>
              <option value="duena">Dueña</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginBottom: 16 }}>
            + Agregar usuario
          </button>
        </div>
        {error && <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem' }}>{error}</p>}
      </form>

      {users.map((user) => (
        <div className="admin-list-item" key={user.id}>
          <div className="info">
            <h3>{user.email}</h3>
            <span>{user.role === 'duena' ? 'Dueña' : 'Admin'}</span>
          </div>
          {user.id !== currentUser?.uid && (
            <div className="actions">
              <button
                type="button"
                className="btn-icon btn-icon-outline"
                aria-label={`Quitar a ${user.email}`}
                onClick={() => setDeleteTarget(user)}
              >
                🗑
              </button>
            </div>
          )}
        </div>
      ))}

      {deleteTarget && (
        <ConfirmDialog
          title="Quitar administrador"
          message={`¿Seguro que quieres quitar el acceso de "${deleteTarget.email}"?`}
          confirmLabel="Quitar"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          loading={saving}
        />
      )}
    </div>
  )
}
