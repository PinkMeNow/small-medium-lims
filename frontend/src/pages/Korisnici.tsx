import { useState } from 'react'
import UserForm from '../features/users/UserForm'
import UsersTable from '../features/users/UsersTable'
import UserEditModal from '../features/users/UserEditModal'
import type { AppUser } from '../types/users'

export default function Korisnici() {
  const [editUser, setEditUser] = useState<AppUser | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Korisnici</h1>
          <p className="text-sm text-muted mt-1">Upravljanje korisničkim računima i ulogama</p>
        </div>
        <UserForm />
      </div>

      <UsersTable onEdit={setEditUser} />

      <UserEditModal user={editUser} onClose={() => setEditUser(null)} />
    </div>
  )
}
