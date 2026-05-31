import { useState } from 'react'
import {
  Button, Spinner, Chip,
  ModalRoot, ModalBackdrop, ModalContainer, ModalDialog,
  ModalHeader, ModalHeading, ModalBody, ModalFooter, ModalCloseTrigger,
  CloseButton, TextField, Label, Input,
  Select, SelectTrigger, SelectValue, SelectIndicator, SelectPopover,
  ListBox, ListBoxItem,
  useOverlayState,
} from '@heroui/react'
import { Plus , X } from 'lucide-react'
import { useCreateUser } from './hooks'
import { ROLE_OPTIONS } from '../../types/users'
import type { UserRole } from '../../types/users'

export default function UserForm() {
  const modal = useOverlayState()
  const { mutateAsync, isPending } = useCreateUser()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('viewer')
  const [greška, setGreška] = useState('')

  function reset() {
    setFirstName(''); setLastName(''); setEmail(''); setPassword(''); setRole('viewer'); setGreška('')
  }

  async function handleSubmit() {
    if (!firstName.trim()) { setGreška('Ime je obavezno.'); return }
    if (!lastName.trim()) { setGreška('Prezime je obavezno.'); return }
    if (!email.trim()) { setGreška('Email je obavezan.'); return }
    if (password.length < 8) { setGreška('Lozinka mora imati najmanje 8 znakova.'); return }
    setGreška('')
    try {
      await mutateAsync({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), password, role })
      reset(); modal.close()
    } catch (err: any) {
      setGreška(err?.response?.data?.error?.message ?? 'Greška pri kreiranju.')
    }
  }

  return (
    <>
      <Button variant="primary" onClick={modal.open}>
        <Plus size={16} /> Novi korisnik
      </Button>

      <ModalRoot state={modal}>
        <ModalBackdrop />
        <ModalContainer size="md" className="fixed inset-0 z-50 overflow-y-auto flex flex-col p-2 sm:p-4">
          <ModalDialog>
            <ModalHeader className="flex items-center justify-between">
              <ModalHeading>Novi korisnik</ModalHeading>
              <Button variant="ghost" isIconOnly size="sm" onClick={modal.close} aria-label="Zatvori"><X size={16} /></Button>
            </ModalHeader>

            <ModalBody className="flex flex-col gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <TextField value={firstName} onChange={setFirstName}>
                  <Label className="text-sm font-medium text-foreground">Ime</Label>
                  <Input placeholder="Ana" className="mt-1" />
                </TextField>
                <TextField value={lastName} onChange={setLastName}>
                  <Label className="text-sm font-medium text-foreground">Prezime</Label>
                  <Input placeholder="Kovač" className="mt-1" />
                </TextField>
              </div>

              <TextField value={email} onChange={setEmail}>
                <Label className="text-sm font-medium text-foreground">Email</Label>
                <Input type="email" placeholder="korisnik@lims.hr" className="mt-1" />
              </TextField>

              <TextField value={password} onChange={setPassword}>
                <Label className="text-sm font-medium text-foreground">Lozinka</Label>
                <Input type="password" placeholder="Najmanje 8 znakova" className="mt-1" />
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
              <Button variant="outline" onClick={() => { reset(); modal.close() }} isDisabled={isPending}>Odustani</Button>
              <Button variant="primary" onClick={handleSubmit} isDisabled={isPending}>
                {isPending ? <Spinner size="sm" /> : 'Kreiraj korisnika'}
              </Button>
            </ModalFooter>
          </ModalDialog>
        </ModalContainer>
      </ModalRoot>
    </>
  )
}
