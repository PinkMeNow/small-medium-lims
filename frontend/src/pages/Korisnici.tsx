import UserForm from '../features/users/UserForm'
import UsersTable from '../features/users/UsersTable'

export default function Korisnici() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Korisnici</h1>
          <p className="text-sm text-muted mt-1">Upravljanje korisničkim računima i ulogama</p>
        </div>
        <UserForm />
      </div>
      <UsersTable />
    </div>
  )
}
