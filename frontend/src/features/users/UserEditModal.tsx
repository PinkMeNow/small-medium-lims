import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import {
  Button, Spinner,
  ModalRoot, ModalBackdrop, ModalContainer, ModalDialog,
  ModalHeader, ModalHeading, ModalBody, ModalFooter, ModalCloseTrigger,
  CloseButton, TextField, Label, Input,
  Select, SelectTrigger, SelectValue, SelectIndicator, SelectPopover,
  ListBox, ListBoxItem,
  useOverlayState,
} from '@heroui/react'
import { useUpdateUser } from './hooks'
import { ROLE_OPTIONS } from '../../types/users'
import type { AppUser, UserRole } from '../../types/users'

interface Props {
  user: AppUser | null
  onClose: () => void
}

export default function UserEditModal({ user, onClose }: Props) {
  const modal = useOverlayState()
  const { mutateAsync, isPending } = useUpdateUser()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('viewer')
  const [greška, setGreška] = useState('')

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName)
      setLastName(user.lastName)
      setEmail(user.email)
      setRole(user.role)
      setGreška('')
      modal.open()
    }
  }, [user])

  async function handleSubmit() {
    if (!firstName.trim() || !lastName.trim()) { setGreška('Ime i prezime su obavezni.'); return }
    if (!email.trim()) { setGreška('Email je obavezan.'); return }
    if (!user) return
    setGreška('')
    try {
      await mutateAsync({ id: user.id, body: { firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), role } })
      modal.close(); onClose()
    } catch (err: any) {
      setGreška(err?.response?.data?.error?.message ?? 'Greška pri ažuriranju.')
    }
  }

  function handleClose() { modal.close(); onClose() }

  if (!user) return null

  return (
    <ModalRoot state={modal}>
      <ModalBackdrop />
      <ModalContainer size="md" className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <ModalDialog>
          <ModalHeader className="flex items-center justify-between">
            <ModalHeading>Uredi korisnika</ModalHeading>
            <Button variant="ghost" isIconOnly size="sm" onClick={handleClose} aria-label="Zatvori"><X size={16} /></Button>
          </ModalHeader>

          <ModalBody className="flex flex-col gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <TextField value={firstName} onChange={setFirstName}>
                <Label className="text-sm font-medium text-foreground">Ime</Label>
                <Input className="mt-1" />
              </TextField>
              <TextField value={lastName} onChange={setLastName}>
                <Label className="text-sm font-medium text-foreground">Prezime</Label>
                <Input className="mt-1" />
              </TextField>
            </div>

            <TextField value={email} onChange={setEmail}>
              <Label className="text-sm font-medium text-foreground">Email</Label>
              <Input type="email" className="mt-1" />
            </TextField>

            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium text-foreground">Uloga</Label>
              <Select selectedKey={role} onSelectionChange={(key) => setRole(key as UserRole)}>
                <SelectTrigger className="mt-1 w-full"><SelectValue /><SelectIndicator /></SelectTrigger>
                <SelectPopover>
                  <ListBox>
                    {ROLE_OPTIONS.map(o => <ListBoxItem key={o.id} id={o.id}>{o.label}</ListBoxItem>)}
                  </ListBox>
                </SelectPopover>
              </Select>
            </div>

            {greška && <p className="text-sm text-danger">{greška}</p>}
          </ModalBody>

          <ModalFooter className="gap-2">
            <Button variant="outline" onClick={handleClose} isDisabled={isPending}>Odustani</Button>
            <Button variant="primary" onClick={handleSubmit} isDisabled={isPending}>
              {isPending ? <Spinner size="sm" /> : 'Spremi promjene'}
            </Button>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </ModalRoot>
  )
}
