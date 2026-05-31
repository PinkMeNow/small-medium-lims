import { useState, useEffect } from 'react'
import {
  Button, Spinner,
  ModalRoot, ModalBackdrop, ModalContainer, ModalDialog,
  ModalHeader, ModalHeading, ModalBody, ModalFooter, ModalCloseTrigger,
  CloseButton, TextField, Label, Input, TextArea, useOverlayState,
} from '@heroui/react'
import { useCreateExperiment } from './hooks'
import type { Protocol } from '../../types/protocols'

const inputCls = 'w-full px-3 py-2 rounded-xl bg-field-background border border-field-border text-field-foreground text-sm focus:outline-none focus:border-accent placeholder:text-field-placeholder'

interface Props {
  protocol: Protocol | null
  onClose: () => void
}

export default function ExperimentModal({ protocol, onClose }: Props) {
  const modal = useOverlayState()
  const { mutateAsync, isPending } = useCreateExperiment()

  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [greška, setGreška] = useState('')

  useEffect(() => {
    if (protocol) {
      setTitle(`${protocol.name} — ${new Date().toLocaleDateString('hr')}`)
      setNotes('')
      setGreška('')
      modal.open()
    }
  }, [protocol])

  async function handleSubmit() {
    if (!protocol) return
    if (!title.trim()) { setGreška('Naslov je obavezan.'); return }
    setGreška('')
    try {
      await mutateAsync({ protocolId: protocol.id, title: title.trim(), notes: notes.trim() || undefined })
      modal.close()
      onClose()
    } catch (err: any) {
      setGreška(err?.response?.data?.error?.message ?? 'Greška pri pokretanju.')
    }
  }

  return (
    <ModalRoot state={modal}>
      <ModalBackdrop />
      <ModalContainer size="md" className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <ModalDialog>
          <ModalHeader className="flex items-center justify-between">
            <ModalHeading>Pokreni eksperiment</ModalHeading>
            <ModalCloseTrigger asChild><CloseButton size="sm" /></ModalCloseTrigger>
          </ModalHeader>

          <ModalBody className="flex flex-col gap-4 py-4">
            {protocol && (
              <div className="p-3 rounded-xl bg-accent-soft border border-accent/20">
                <p className="text-xs text-muted">Protokol</p>
                <p className="text-sm font-medium text-foreground">{protocol.name}</p>
                <p className="text-xs text-accent">verzija {protocol.currentVersion}</p>
              </div>
            )}

            <TextField value={title} onChange={setTitle}>
              <Label className="text-sm font-medium text-foreground">Naslov eksperimenta</Label>
              <Input className="mt-1" />
            </TextField>

            <TextField value={notes} onChange={setNotes}>
              <Label className="text-sm font-medium text-foreground">Bilješka <span className="text-muted font-normal">(neobavezno)</span></Label>
              <TextArea rows={3} placeholder="Početne napomene..." className="mt-1" />
            </TextField>

            {greška && <p className="text-sm text-danger">{greška}</p>}
          </ModalBody>

          <ModalFooter className="gap-2">
            <Button variant="outline" onClick={() => { modal.close(); onClose() }} isDisabled={isPending}>Odustani</Button>
            <Button variant="primary" onClick={handleSubmit} isDisabled={isPending}>
              {isPending ? <Spinner size="sm" /> : 'Pokreni eksperiment'}
            </Button>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </ModalRoot>
  )
}
