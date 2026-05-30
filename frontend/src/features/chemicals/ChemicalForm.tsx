import { useState } from 'react'
import {
  Button, Spinner,
  ModalRoot, ModalBackdrop, ModalContainer, ModalDialog,
  ModalHeader, ModalHeading, ModalBody, ModalFooter, ModalCloseTrigger,
  CloseButton, TextField, Label, Input,
  useOverlayState,
} from '@heroui/react'
import { Plus } from 'lucide-react'
import { useCreateChemical } from './hooks'
import { CHEMICAL_UNITS, GHS_INFO } from '../../types/chemicals'
import type { GHSClass } from '../../types/chemicals'

const GHS_CODES = Object.keys(GHS_INFO) as GHSClass[]

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-foreground">
        {label}{optional && <span className="text-muted font-normal ml-1">(neobavezno)</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2 rounded-xl bg-field-background border border-field-border text-field-foreground text-sm focus:outline-none focus:border-accent placeholder:text-field-placeholder'

export default function ChemicalForm() {
  const modal = useOverlayState()
  const { mutateAsync, isPending } = useCreateChemical()

  const [form, setForm] = useState({
    name: '', casNumber: '', manufacturer: '', batchNumber: '',
    purchaseDate: '', expiryDate: '',
    quantity: '', unit: 'g', minQuantity: '0',
    storageLocation: '', storageTempMin: '', storageTempMax: '',
    sdsUrl: '', notes: '',
  })
  const [ghsClasses, setGhsClasses] = useState<GHSClass[]>([])
  const [greška, setGreška] = useState('')

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function toggleGHS(code: GHSClass) {
    setGhsClasses((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    )
  }

  function reset() {
    setForm({ name: '', casNumber: '', manufacturer: '', batchNumber: '', purchaseDate: '', expiryDate: '', quantity: '', unit: 'g', minQuantity: '0', storageLocation: '', storageTempMin: '', storageTempMax: '', sdsUrl: '', notes: '' })
    setGhsClasses([])
    setGreška('')
  }

  async function handleSubmit() {
    if (!form.name.trim()) { setGreška('Naziv je obavezan.'); return }
    if (!form.purchaseDate) { setGreška('Datum nabave je obavezan.'); return }
    if (!form.expiryDate) { setGreška('Rok trajanja je obavezan.'); return }
    if (!form.quantity || Number(form.quantity) <= 0) { setGreška('Količina mora biti pozitivna.'); return }
    if (!form.storageLocation.trim()) { setGreška('Lokacija je obavezna.'); return }

    setGreška('')
    try {
      await mutateAsync({
        name: form.name.trim(),
        casNumber: form.casNumber.trim() || undefined,
        manufacturer: form.manufacturer.trim() || undefined,
        batchNumber: form.batchNumber.trim() || undefined,
        purchaseDate: form.purchaseDate,
        expiryDate: form.expiryDate,
        quantity: Number(form.quantity),
        unit: form.unit,
        minQuantity: Number(form.minQuantity) || 0,
        storageLocation: form.storageLocation.trim(),
        storageTempMin: form.storageTempMin ? Number(form.storageTempMin) : undefined,
        storageTempMax: form.storageTempMax ? Number(form.storageTempMax) : undefined,
        ghsClasses,
        sdsUrl: form.sdsUrl.trim() || undefined,
        notes: form.notes.trim() || undefined,
      })
      reset()
      modal.close()
    } catch (err: any) {
      setGreška(err?.response?.data?.error?.message ?? 'Greška pri spremanju.')
    }
  }

  return (
    <>
      <Button variant="primary" onClick={modal.open}>
        <Plus size={16} />
        Nova kemikalija
      </Button>

      <ModalRoot state={modal}>
        <ModalBackdrop />
        <ModalContainer size="lg" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <ModalDialog className="w-full max-w-2xl">
            <ModalHeader className="flex items-center justify-between">
              <ModalHeading>Dodaj kemikaliju</ModalHeading>
              <ModalCloseTrigger asChild><CloseButton size="sm" /></ModalCloseTrigger>
            </ModalHeader>

            <ModalBody className="overflow-y-auto max-h-[65vh] flex flex-col gap-5 py-4">
              {/* Osnovni podaci */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField value={form.name} onChange={(v) => set('name', v)}>
                  <Label className="text-sm font-medium text-foreground">Naziv</Label>
                  <Input placeholder="npr. Klorovodična kiselina" className="mt-1" />
                </TextField>
                <TextField value={form.casNumber} onChange={(v) => set('casNumber', v)}>
                  <Label className="text-sm font-medium text-foreground">CAS broj <span className="text-muted font-normal">(neoob.)</span></Label>
                  <Input placeholder="XXXXXXX-YY-Z" className="mt-1" />
                </TextField>
                <TextField value={form.manufacturer} onChange={(v) => set('manufacturer', v)}>
                  <Label className="text-sm font-medium text-foreground">Proizvođač <span className="text-muted font-normal">(neoob.)</span></Label>
                  <Input placeholder="npr. Sigma-Aldrich" className="mt-1" />
                </TextField>
                <TextField value={form.batchNumber} onChange={(v) => set('batchNumber', v)}>
                  <Label className="text-sm font-medium text-foreground">Broj serije <span className="text-muted font-normal">(neoob.)</span></Label>
                  <Input placeholder="npr. BCFH1234" className="mt-1" />
                </TextField>
              </div>

              {/* Datumi */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Datum nabave">
                  <input type="date" value={form.purchaseDate} onChange={(e) => set('purchaseDate', e.target.value)} className={`${inputCls} mt-1`} />
                </Field>
                <Field label="Rok trajanja">
                  <input type="date" value={form.expiryDate} onChange={(e) => set('expiryDate', e.target.value)} className={`${inputCls} mt-1`} />
                </Field>
              </div>

              {/* Količina */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <Field label="Količina">
                    <input type="number" min="0" step="0.001" value={form.quantity} onChange={(e) => set('quantity', e.target.value)} className={`${inputCls} mt-1`} placeholder="0.000" />
                  </Field>
                </div>
                <div className="col-span-1">
                  <Field label="Jedinica">
                    <select value={form.unit} onChange={(e) => set('unit', e.target.value)} className={`${inputCls} mt-1`}>
                      {CHEMICAL_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </Field>
                </div>
                <div className="col-span-1">
                  <Field label="Min. zaliha" optional>
                    <input type="number" min="0" step="0.001" value={form.minQuantity} onChange={(e) => set('minQuantity', e.target.value)} className={`${inputCls} mt-1`} placeholder="0" />
                  </Field>
                </div>
              </div>

              {/* Skladištenje */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <TextField value={form.storageLocation} onChange={(v) => set('storageLocation', v)}>
                    <Label className="text-sm font-medium text-foreground">Lokacija</Label>
                    <Input placeholder="npr. Ormar A-3" className="mt-1" />
                  </TextField>
                </div>
                <div className="col-span-1">
                  <Field label="Temp. min (°C)" optional>
                    <input type="number" value={form.storageTempMin} onChange={(e) => set('storageTempMin', e.target.value)} className={`${inputCls} mt-1`} placeholder="-20" />
                  </Field>
                </div>
                <div className="col-span-1">
                  <Field label="Temp. max (°C)" optional>
                    <input type="number" value={form.storageTempMax} onChange={(e) => set('storageTempMax', e.target.value)} className={`${inputCls} mt-1`} placeholder="25" />
                  </Field>
                </div>
              </div>

              {/* GHS klase */}
              <Field label="GHS klasifikacija" optional>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {GHS_CODES.map((code) => (
                    <label key={code} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-default transition-colors">
                      <input
                        type="checkbox"
                        checked={ghsClasses.includes(code)}
                        onChange={() => toggleGHS(code)}
                        className="accent-accent"
                      />
                      <span className="text-xs text-foreground">{GHS_INFO[code].label}</span>
                    </label>
                  ))}
                </div>
              </Field>

              {/* SDS URL */}
              <TextField value={form.sdsUrl} onChange={(v) => set('sdsUrl', v)}>
                <Label className="text-sm font-medium text-foreground">SDS URL <span className="text-muted font-normal">(neoob.)</span></Label>
                <Input type="url" placeholder="https://..." className="mt-1" />
              </TextField>

              {/* Bilješka */}
              <Field label="Bilješka" optional>
                <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} className={`${inputCls} resize-none mt-1`} placeholder="Dodatne informacije..." />
              </Field>

              {greška && <p className="text-sm text-danger">{greška}</p>}
            </ModalBody>

            <ModalFooter className="gap-2">
              <Button variant="outline" onClick={() => { reset(); modal.close() }} isDisabled={isPending}>Odustani</Button>
              <Button variant="primary" onClick={handleSubmit} isDisabled={isPending}>
                {isPending ? <Spinner size="sm" /> : 'Dodaj kemikaliju'}
              </Button>
            </ModalFooter>
          </ModalDialog>
        </ModalContainer>
      </ModalRoot>
    </>
  )
}
