import { useState, useEffect } from 'react'
import {
  Button, Spinner,
  ModalRoot, ModalBackdrop, ModalContainer, ModalDialog,
  ModalHeader, ModalHeading, ModalBody, ModalFooter, ModalCloseTrigger,
  CloseButton, TextField, Label, Input,
  useOverlayState,
} from '@heroui/react'
import { useUpdateChemical } from './hooks'
import type { Chemical } from '../../types/chemicals'

interface Props {
  chemical: Chemical | null
  onClose: () => void
}

export default function ChemicalQuantityModal({ chemical, onClose }: Props) {
  const modal = useOverlayState()
  const { mutateAsync, isPending } = useUpdateChemical()
  const [newQty, setNewQty] = useState('')
  const [greška, setGreška] = useState('')

  useEffect(() => {
    if (chemical) {
      setNewQty(String(chemical.quantity))
      setGreška('')
      modal.open()
    }
  }, [chemical])

  async function handleSubmit() {
    const qty = Number(newQty)
    if (isNaN(qty) || qty < 0) { setGreška('Unesite valjanu količinu (≥ 0).'); return }
    if (!chemical) return
    setGreška('')
    try {
      await mutateAsync({ id: chemical.id, body: { quantity: qty } })
      modal.close(); onClose()
    } catch (err: any) {
      setGreška(err?.response?.data?.error?.message ?? 'Greška pri ažuriranju.')
    }
  }

  function handleClose() { modal.close(); onClose() }

  if (!chemical) return null

  const diff = Number(newQty) - chemical.quantity
  const diffLabel = diff === 0 ? '' : diff > 0 ? `+${diff.toFixed(3)}` : diff.toFixed(3)

  return (
    <ModalRoot state={modal}>
      <ModalBackdrop />
      <ModalContainer size="sm" className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <ModalDialog>
          <ModalHeader className="flex items-center justify-between">
            <ModalHeading>Ažuriraj količinu</ModalHeading>
            <ModalCloseTrigger asChild onClick={handleClose}><CloseButton size="sm" /></ModalCloseTrigger>
          </ModalHeader>

          <ModalBody className="flex flex-col gap-4 py-4">
            <div className="p-3 rounded-xl bg-surface-secondary border border-border">
              <p className="text-xs text-muted">Kemikalija</p>
              <p className="text-sm font-medium text-foreground">{chemical.name}</p>
              <p className="text-xs text-muted mt-0.5">Trenutna količina: <span className="text-foreground font-medium">{chemical.quantity} {chemical.unit}</span></p>
            </div>

            <TextField value={newQty} onChange={setNewQty}>
              <Label className="text-sm font-medium text-foreground">
                Nova količina ({chemical.unit})
                {diffLabel && (
                  <span className={`ml-2 text-xs font-normal ${diff > 0 ? 'text-success' : 'text-warning'}`}>
                    {diffLabel} {chemical.unit}
                  </span>
                )}
              </Label>
              <Input type="number" min="0" step="0.001" className="mt-1" />
            </TextField>

            {Number(newQty) <= Number(chemical.minQuantity) && Number(chemical.minQuantity) > 0 && (
              <p className="text-xs text-warning">
                ⚠ Ispod minimalne zalihe ({chemical.minQuantity} {chemical.unit})
              </p>
            )}

            {greška && <p className="text-sm text-danger">{greška}</p>}
          </ModalBody>

          <ModalFooter className="gap-2">
            <Button variant="outline" onClick={handleClose} isDisabled={isPending}>Odustani</Button>
            <Button variant="primary" onClick={handleSubmit} isDisabled={isPending}>
              {isPending ? <Spinner size="sm" /> : 'Spremi'}
            </Button>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </ModalRoot>
  )
}
