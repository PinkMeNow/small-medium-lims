import { useState } from 'react'
import {
  Button, Spinner,
  ModalRoot, ModalBackdrop, ModalContainer, ModalDialog,
  ModalHeader, ModalHeading, ModalBody, ModalFooter, ModalCloseTrigger,
  CloseButton, TextField, Label, Input, useOverlayState,
} from '@heroui/react'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { useCreateProtocol } from './hooks'
import { PROTOCOL_CATEGORIES } from '../../types/protocols'
import type { ProtocolStep } from '../../types/protocols'

const inputCls = 'w-full px-3 py-2 rounded-xl bg-field-background border border-field-border text-field-foreground text-sm focus:outline-none focus:border-accent placeholder:text-field-placeholder'

function emptyStep(n: number): ProtocolStep {
  return { stepNumber: n, title: '', description: '' }
}

export default function ProtocolForm() {
  const modal = useOverlayState()
  const { mutateAsync, isPending } = useCreateProtocol()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [steps, setSteps] = useState<ProtocolStep[]>([emptyStep(1)])
  const [materials, setMaterials] = useState('')
  const [equipment, setEquipment] = useState('')
  const [expectedResults, setExpectedResults] = useState('')
  const [notes, setNotes] = useState('')
  const [greška, setGreška] = useState('')

  function reset() {
    setName(''); setDescription(''); setCategory('')
    setSteps([emptyStep(1)]); setMaterials(''); setEquipment('')
    setExpectedResults(''); setNotes(''); setGreška('')
  }

  function addStep() {
    setSteps((prev) => [...prev, emptyStep(prev.length + 1)])
  }

  function removeStep(i: number) {
    setSteps((prev) =>
      prev.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, stepNumber: idx + 1 })),
    )
  }

  function updateStep(i: number, field: 'title' | 'description', value: string) {
    setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)))
  }

  function parseLines(text: string): string[] {
    return text.split('\n').map((l) => l.trim()).filter(Boolean)
  }

  async function handleSubmit() {
    if (!name.trim()) { setGreška('Naziv protokola je obavezan.'); return }
    if (steps.some((s) => !s.title.trim() || !s.description.trim())) {
      setGreška('Svaki korak mora imati naslov i opis.'); return
    }
    setGreška('')
    try {
      await mutateAsync({
        name: name.trim(), description: description.trim() || undefined,
        category: category || undefined, steps,
        requiredMaterials: parseLines(materials),
        requiredEquipment: parseLines(equipment),
        expectedResults: expectedResults.trim() || undefined,
        notes: notes.trim() || undefined,
      })
      reset(); modal.close()
    } catch (err: any) {
      setGreška(err?.response?.data?.error?.message ?? 'Greška pri spremanju.')
    }
  }

  return (
    <>
      <Button variant="primary" onClick={modal.open}>
        <Plus size={16} />
        Novi protokol
      </Button>

      <ModalRoot state={modal}>
        <ModalBackdrop />
        <ModalContainer size="lg" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <ModalDialog className="w-full max-w-2xl">
            <ModalHeader className="flex items-center justify-between">
              <ModalHeading>Novi SOP protokol</ModalHeading>
              <ModalCloseTrigger asChild><CloseButton size="sm" /></ModalCloseTrigger>
            </ModalHeader>

            <ModalBody className="overflow-y-auto max-h-[68vh] flex flex-col gap-5 py-4">

              {/* Osnovni podaci */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField value={name} onChange={setName}>
                  <Label className="text-sm font-medium text-foreground">Naziv protokola</Label>
                  <Input placeholder="npr. Analiza pH vrijednosti vode" className="mt-1" />
                </TextField>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-foreground">Kategorija</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${inputCls} mt-1`}>
                    <option value="">— Odaberi —</option>
                    {PROTOCOL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-foreground">Opis <span className="text-muted font-normal">(neobavezno)</span></label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="Kratki opis svrhe ovog protokola..." />
              </div>

              {/* Koraci */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground">Koraci postupka</label>
                  <Button variant="outline" size="sm" onClick={addStep}>
                    <Plus size={14} /> Dodaj korak
                  </Button>
                </div>
                <div className="flex flex-col gap-3">
                  {steps.map((step, i) => (
                    <div key={i} className="flex gap-3 p-4 rounded-xl bg-surface-secondary border border-border">
                      <div className="flex items-start pt-2 text-muted shrink-0">
                        <GripVertical size={16} />
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-semibold text-accent bg-accent-soft px-2 py-0.5 rounded-md shrink-0">
                            {step.stepNumber}
                          </span>
                          <input
                            value={step.title}
                            onChange={(e) => updateStep(i, 'title', e.target.value)}
                            placeholder="Naslov koraka"
                            className="flex-1 px-2 py-1 rounded-lg bg-field-background border border-field-border text-sm text-foreground focus:outline-none focus:border-accent"
                          />
                        </div>
                        <textarea
                          value={step.description}
                          onChange={(e) => updateStep(i, 'description', e.target.value)}
                          rows={2}
                          placeholder="Detaljni opis koraka..."
                          className={`${inputCls} resize-none text-xs`}
                        />
                      </div>
                      {steps.length > 1 && (
                        <button onClick={() => removeStep(i)} className="text-danger hover:text-danger-hover shrink-0 pt-1">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Materijali i oprema */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-foreground">Potrebni materijali <span className="text-muted font-normal">(jedan po retku)</span></label>
                  <textarea value={materials} onChange={(e) => setMaterials(e.target.value)} rows={3} className={`${inputCls} resize-none text-xs`} placeholder="npr. HCl 0.1M&#10;pH metar&#10;Odmjerna tikvica 100mL" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-foreground">Potrebna oprema <span className="text-muted font-normal">(jedan po retku)</span></label>
                  <textarea value={equipment} onChange={(e) => setEquipment(e.target.value)} rows={3} className={`${inputCls} resize-none text-xs`} placeholder="npr. Analitička vaga&#10;Spektrofotometar" />
                </div>
              </div>

              {/* Očekivani rezultati */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-foreground">Očekivani rezultati <span className="text-muted font-normal">(neobavezno)</span></label>
                <textarea value={expectedResults} onChange={(e) => setExpectedResults(e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="Što treba dobiti nakon uspješno provedenog protokola..." />
              </div>

              {greška && <p className="text-sm text-danger">{greška}</p>}
            </ModalBody>

            <ModalFooter className="gap-2">
              <Button variant="outline" onClick={() => { reset(); modal.close() }} isDisabled={isPending}>Odustani</Button>
              <Button variant="primary" onClick={handleSubmit} isDisabled={isPending}>
                {isPending ? <Spinner size="sm" /> : 'Spremi protokol'}
              </Button>
            </ModalFooter>
          </ModalDialog>
        </ModalContainer>
      </ModalRoot>
    </>
  )
}
