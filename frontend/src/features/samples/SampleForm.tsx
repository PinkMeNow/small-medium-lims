import { useState } from 'react'
import {
  Button, Spinner,
  ModalRoot, ModalBackdrop, ModalContainer, ModalDialog,
  ModalHeader, ModalHeading, ModalBody, ModalFooter, ModalCloseTrigger,
  CloseButton, TextField, Label, Input,
  useOverlayState,
} from '@heroui/react'
import { Plus } from 'lucide-react'
import { useCreateSample } from './hooks'
import { SAMPLE_TYPES } from '../../types/samples'

export default function SampleForm() {
  const modal = useOverlayState()
  const { mutateAsync, isPending } = useCreateSample()

  const [type, setType] = useState(SAMPLE_TYPES[0])
  const [source, setSource] = useState('')
  const [notes, setNotes] = useState('')
  const [greška, setGreška] = useState('')

  function resetForm() {
    setType(SAMPLE_TYPES[0])
    setSource('')
    setNotes('')
    setGreška('')
  }

  async function handleSubmit() {
    if (!source.trim()) {
      setGreška('Izvor uzorka je obavezan.')
      return
    }
    setGreška('')
    try {
      await mutateAsync({ type, source: source.trim(), notes: notes.trim() || undefined })
      resetForm()
      modal.close()
    } catch (err: any) {
      setGreška(err?.response?.data?.error?.message ?? 'Greška pri spremanju.')
    }
  }

  return (
    <>
      <Button variant="primary" onClick={modal.open}>
        <Plus size={16} />
        Novi uzorak
      </Button>

      <ModalRoot state={modal}>
        <ModalBackdrop />
        <ModalContainer
          size="md"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <ModalDialog>
            <ModalHeader className="flex items-center justify-between">
              <ModalHeading>Registracija uzorka</ModalHeading>
              <ModalCloseTrigger asChild>
                <CloseButton size="sm" />
              </ModalCloseTrigger>
            </ModalHeader>

            <ModalBody className="flex flex-col gap-4 py-4">
              {/* Vrsta */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-foreground">Vrsta uzorka</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-field-background border border-field-border text-field-foreground text-sm focus:outline-none focus:border-accent"
                >
                  {SAMPLE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Izvor */}
              <TextField value={source} onChange={setSource}>
                <Label className="text-sm font-medium text-foreground">Izvor uzorka</Label>
                <Input
                  placeholder="npr. Rijeka Sava — most Jankomir"
                  className="mt-1"
                />
              </TextField>

              {/* Bilješka */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-foreground">
                  Bilješka <span className="text-muted font-normal">(neobavezno)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Dodatne informacije o uzorku..."
                  className="w-full px-3 py-2 rounded-xl bg-field-background border border-field-border text-field-foreground text-sm resize-none focus:outline-none focus:border-accent"
                />
              </div>

              {greška && <p className="text-sm text-danger">{greška}</p>}
            </ModalBody>

            <ModalFooter className="gap-2">
              <Button variant="outline" onClick={modal.close} isDisabled={isPending}>
                Odustani
              </Button>
              <Button variant="primary" onClick={handleSubmit} isDisabled={isPending}>
                {isPending ? <Spinner size="sm" /> : 'Registriraj uzorak'}
              </Button>
            </ModalFooter>
          </ModalDialog>
        </ModalContainer>
      </ModalRoot>
    </>
  )
}
