import {
  Button, Spinner, Chip,
  TableRoot, TableContent, TableHeader, TableBody, TableRow, TableColumn, TableCell,
} from '@heroui/react'
import { UserCheck, UserX, Pencil } from 'lucide-react'
import { useUsers, useToggleUserActive } from './hooks'
import { ROLE_LABELS } from '../../types/users'
import type { UserRole, AppUser } from '../../types/users'
import { useAuthStore } from '../../stores/auth.store'
import { format } from 'date-fns'
import { hr } from 'date-fns/locale'

const ROLE_COLOR: Record<UserRole, 'primary' | 'warning' | 'default'> = {
  admin: 'primary',
  lab_technician: 'warning',
  viewer: 'default',
}

interface Props { onEdit?: (user: AppUser) => void }

export default function UsersTable({ onEdit }: Props) {
  const { data, isLoading, isError } = useUsers()
  const toggleActive = useToggleUserActive()
  const currentUser = useAuthStore(s => s.user)

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface-secondary">
      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
      ) : isError ? (
        <div className="py-16 text-center">
          <p className="text-sm text-danger">Greška pri učitavanju korisnika.</p>
          <p className="text-xs text-muted mt-1">Provjerite je li backend pokrenut.</p>
        </div>
      ) : (
        <TableRoot className="w-full min-w-[640px]">
          <TableContent aria-label="Lista korisnika">
            <TableHeader>
              <TableColumn id="name" className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Korisnik</TableColumn>
              <TableColumn id="email" className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Email</TableColumn>
              <TableColumn id="role" className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Uloga</TableColumn>
              <TableColumn id="status" className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Status</TableColumn>
              <TableColumn id="createdAt" className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Kreiran</TableColumn>
              <TableColumn id="actions" className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider"></TableColumn>
            </TableHeader>
            <TableBody>
              {(data ?? []).map(u => (
                <TableRow key={u.id} id={u.id}>
                  <TableCell className="px-4 py-3">
                    <p className="font-medium text-foreground">{u.firstName} {u.lastName}</p>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-muted text-sm">{u.email}</TableCell>
                  <TableCell className="px-4 py-3">
                    <Chip color={ROLE_COLOR[u.role]} variant="soft" className="text-xs px-2.5 py-0.5">{ROLE_LABELS[u.role]}</Chip>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Chip color={u.isActive ? 'success' : 'default'} variant="soft" className="text-xs px-2.5 py-0.5">
                      {u.isActive ? 'Aktivan' : 'Neaktivan'}
                    </Chip>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-muted text-xs whitespace-nowrap">
                    {format(new Date(u.createdAt), 'd. MMM yyyy.', { locale: hr })}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" isIconOnly onClick={() => onEdit?.(u)} title="Uredi">
                        <Pencil size={15} className="text-muted" />
                      </Button>
                    {u.id !== currentUser?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        isIconOnly
                        color={u.isActive ? 'danger' : 'success'}
                        onClick={() => toggleActive.mutate(u.id)}
                        title={u.isActive ? 'Deaktiviraj' : 'Aktiviraj'}
                      >
                        {u.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                      </Button>
                    )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableContent>
        </TableRoot>
      )}
    </div>
  )
}
