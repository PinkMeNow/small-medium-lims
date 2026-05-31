import { useState, useEffect } from 'react'
import {
  Button, Spinner,
  ModalRoot, ModalBackdrop, ModalContainer, ModalDialog,
  ModalHeader, ModalHeading, ModalBody, ModalFooter,
  TextField, Label, TextArea,
  useOverlayState,
} from '@heroui/react'
import { Plus, Trash2, GripVertical , X } from 'lucide-react'
import { addProtocolVersion } from '../../api/protocols.api'
import { useQueryClient } from '@tanstack/react-query'
import { PROTOCOLS_KEY } from './hooks'
import type { Protocol, ProtocolStep } from '../../types/protocols'

interface Props {
  protocol: Protocol | null
  onClose: () => void
}

function emptyStep(n: number): ProtocolStep {
  return { stepNumber: n, title: '', description: '' }
}

export default function NewVersionModal({ protocol, onClose }: Props) {
  const modal = useOverlayState()
  const qc = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const [steps, setSteps] = useState<ProtocolStep[]>([emptyStep(1)])
  const [materials, setMaterials] = useState('')
  const [equipment, setEquipment] = useState('')
  const [expectedResults, setExpectedResults] = useState('')
  const [greška, setGreška] = useState('')

  useEffect(() => {
    if (protocol) {
      setSteps([emptyStep(1)])
      setMaterials('')
      setEquipment('')
      setExpectedResults('')
      setGreška('')
      modal.open()
    }
  }, [protocol])

  function addStep() { setSteps(p => [...p, emptyStep(p.length + 1)]) }
  function removeStep(i: number) {
    setSteps(p => p.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, stepNumber: idx + 1 })))
  }
  function updateStep(i: number, field: 'title' | 'description', v: string) {
    setSteps(p => p.map((s, idx) => idx === i ? { ...s, [field]: v } : s))
  }

  async function handleSubmit() {
    if (steps.some(s => !s.title.trim() || !s.description.trim())) {
      setGreška('Svaki korak mora imati naslov i opis.'); return
    }
    if (!protocol) return
    setGreška('')
    setIsPending(true)
    try {
      await addProtocolVersion(protocol.id, {
        steps,
        requiredMaterials: materials.split('\n').map(l => l.trim()).filter(Boolean),
        requiredEquipment: equipment.split('\n').map(l => l.trim()).filter(Boolean),
        expectedResults: expectedResults.trim() || undefined,
      })
      qc.invalidateQueries({ queryKey: [PROTOCOLS_KEY] })
      modal.close(); onClose()
    } catch (err: any) {
      setGreška(err?.response?.data?.error?.message ?? 'Greška pri kreiranju verzije.')
    } finally {
      setIsPending(false)
    }
  }

  function handleClose() { modal.close(); onClose() }

  if (!protocol) return null

  const inputCls = 'w-full px-3 py-2 rounded-xl bg-field-background border border-field-border text-field-foreground text-sm focus:outline-none focus:border-accent placeholder:text-field-placeholder'

  return (
    <ModalRoot state={modal}>
      <ModalBackdrop />
      <ModalContainer size="lg" className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <ModalDialog className="w-full max-w-2xl">
          <ModalHeader className="flex items-center justify-between">
            <div className="min-w-0">
              <ModalHeading>Nova verzija protokola</ModalHeading>
              <p className="text-xs text-muted mt-0.5 truncate">{protocol.name} — trenutna: v{protocol.currentVersion}</p>
            </div>
            <Button variant="ghost" isIconOnly size="sm" onClick={handleClose} aria-label="Zatvori"><X size={16} /></Button>
          </ModalHeader>

          <ModalBody className="overflow-y-auto max-h-[68vh] flex flex-col gap-5 py-4">
            <div className="p-3 rounded-xl bg-accent-soft border border-accent/20 text-sm text-accent">
              Nova verzija: <strong>v{bumpMinor(protocol.currentVersion)}</strong> — prethodna ostaje sačuvana.
            </div>

            {/* Koraci */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">Koraci postupka</label>
                <Button variant="outline" size="sm" onClick={addStep}>
                  <Plus size={14} /> Dodaj korak
                </Button>
              </div>
              {steps.map((step, i) => (
                <div key={i} className="flex gap-3 p-4 rounded-xl bg-surface-secondary border border-border">
                  <div className="flex items-start pt-2 text-muted shrink-0"><GripVertical size={16} /></div>
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-accent bg-accent-soft px-2 py-0.5 rounded-md shrink-0">{step.stepNumber}</span>
                      <input
                        value={step.title}
                        onChange={e => updateStep(i, 'title', e.target.value)}
                        placeholder="Naslov koraka"
                        className="flex-1 px-2 py-1 rounded-lg bg-field-background border border-field-border text-sm text-foreground focus:outline-none focus:border-accent w-full"
                      />
                    </div>
                    <textarea
                      value={step.description}
                      onChange={e => updateStep(i, 'description', e.target.value)}
                      rows={2}
                      placeholder="Detaljni opis koraka..."
                      className={`${inputCls} resize-none text-xs`}
                    />
                  </div>
                  {steps.length > 1 && (
                    <Button variant="ghost" isIconOnly size="sm" color="danger" onClick={() => removeStep(i)} className="shrink-0 mt-1">
                      <Trash2 size={15} />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Materijali i oprema */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField value={materials} onChange={setMaterials}>
                <Label className="text-sm font-medium text-foreground">Potrebni materijali <span className="text-muted font-normal">(jedan po retku)</span></Label>
                <TextArea rows={3} placeholder={'npr. HCl 0.1M\npH metar'} className="mt-1 text-xs" />
              </TextField>
              <TextField value={equipment} onChange={setEquipment}>
                <Label className="text-sm font-medium text-foreground">Potrebna oprema <span className="text-muted font-normal">(jedan po retku)</span></Label>
                <TextArea rows={3} placeholder={'npr. Analitička vaga\nSpektrofotometar'} className="mt-1 text-xs" />
              </TextField>
            </div>

            <TextField value={expectedResults} onChange={setExpectedResults}>
              <Label className="text-sm font-medium text-foreground">Očekivani rezultati <span className="text-muted font-normal">(neobavezno)</span></Label>
              <TextArea rows={2} placeholder="Kriterij prihvatljivosti, tipičan raspon..." className="mt-1" />
            </TextField>

            {greška && <p className="text-sm text-danger">{greška}</p>}
          </ModalBody>

          <ModalFooter className="gap-2">
            <Button variant="outline" onClick={handleClose} isDisabled={isPending}>Odustani</Button>
            <Button variant="primary" onClick={handleSubmit} isDisabled={isPending}>
              {isPending ? <Spinner size="sm" /> : `Objavi v${bumpMinor(protocol.currentVersion)}`}
            </Button>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </ModalRoot>
  )
}

function bumpMinor(version: string): string {
  const [major, minor] = version.split('.').map(Number)
  return `${major}.${(minor ?? 0) + 1}.0`
}
