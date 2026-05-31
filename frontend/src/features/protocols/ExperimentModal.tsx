import { useEffect } from 'react'
import {
  Button, Spinner,
  ModalRoot, ModalBackdrop, ModalContainer, ModalDialog,
  ModalHeader, ModalHeading, ModalBody, ModalFooter,
  TextField, Label, Input, TextArea, useOverlayState,
} from '@heroui/react'
import { useState } from 'react'
import { useCreateExperiment } from './hooks'
import type { Protocol } from '../../types/protocols'

interface Props {
  protocol: Protocol
  onClose: () => void
}

export default function ExperimentModal({ protocol, onClose }: Props) {
  const modal = useOverlayState()
  const { mutateAsync, isPending } = useCreateExperiment()

  const [title, setTitle] = useState(`${protocol.name} — ${new Date().toLocaleDateString('hr')}`)
  const [notes, setNotes] = useState('')
  const [greška, setGreška] = useState('')

  // Open immediately on mount
  useEffect(() => { modal.open() }, [])

  function handleClose() {
    modal.close()
    // Wait for close animation then call onClose
    setTimeout(onClose, 150)
  }

  async function handleSubmit() {
    if (!title.trim()) { setGreška('Naslov je obavezan.'); return }
    setGreška('')
    try {
      await mutateAsync({ protocolId: protocol.id, title: title.trim(), notes: notes.trim() || undefined })
      handleClose()
    } catch (err: any) {
      setGreška(err?.response?.data?.error?.message ?? 'Greška pri pokretanju.')
    }
  }

  return (
    <ModalRoot state={modal}>
      <ModalBackdrop />
      <ModalContainer size="md" className="fixed inset-0 z-50 overflow-y-auto flex flex-col p-2 sm:p-4">
        <ModalDialog>
          <ModalHeader>
            <ModalHeading>Pokreni eksperiment</ModalHeading>
          </ModalHeader>

          <ModalBody className="flex flex-col gap-4 py-4">
            <div className="p-3 rounded-xl bg-accent-soft border border-accent/20">
              <p className="text-xs text-muted">Protokol</p>
              <p className="text-sm font-medium text-foreground">{protocol.name}</p>
              <p className="text-xs text-accent">verzija {protocol.currentVersion}</p>
            </div>

            <TextField value={title} onChange={setTitle}>
              <Label className="text-sm font-medium text-foreground">Naslov eksperimenta</Label>
              <Input className="mt-1" />
            </TextField>

            <TextField value={notes} onChange={setNotes}>
              <Label className="text-sm font-medium text-foreground">
                Bilješka <span className="text-muted font-normal">(neobavezno)</span>
              </Label>
              <TextArea rows={3} placeholder="Početne napomene..." className="mt-1" />
            </TextField>

            {greška && <p className="text-sm text-danger">{greška}</p>}
          </ModalBody>

          <ModalFooter className="gap-2">
            <Button variant="outline" onClick={handleClose} isDisabled={isPending}>Odustani</Button>
            <Button variant="primary" onClick={handleSubmit} isDisabled={isPending}>
              {isPending ? <Spinner size="sm" /> : 'Pokreni eksperiment'}
            </Button>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </ModalRoot>
  )
}
