import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import {
  Button, Spinner,
  ModalRoot, ModalBackdrop, ModalContainer, ModalDialog,
  ModalHeader, ModalHeading, ModalBody, ModalFooter, ModalCloseTrigger,
  CloseButton, TextField, Label, Input, TextArea,
  Select, SelectTrigger, SelectValue, SelectIndicator, SelectPopover,
  ListBox, ListBoxItem,
  CheckboxGroup, Checkbox, CheckboxControl, CheckboxContent,
  useOverlayState,
} from '@heroui/react'
import FieldTooltip from '../../components/FieldTooltip'
import { useUpdateChemical } from './hooks'
import { CHEMICAL_UNITS, GHS_INFO } from '../../types/chemicals'
import type { Chemical, GHSClass } from '../../types/chemicals'

const GHS_CODES = Object.keys(GHS_INFO) as GHSClass[]

interface Props {
  chemical: Chemical | null
  onClose: () => void
}

export default function ChemicalEditModal({ chemical, onClose }: Props) {
  const modal = useOverlayState()
  const { mutateAsync, isPending } = useUpdateChemical()

  const [form, setForm] = useState({
    name: '', casNumber: '', manufacturer: '', batchNumber: '',
    purchaseDate: '', expiryDate: '',
    quantity: '', unit: 'g', minQuantity: '0',
    storageLocation: '', storageTempMin: '', storageTempMax: '',
    sdsUrl: '', notes: '',
  })
  const [ghsClasses, setGhsClasses] = useState<GHSClass[]>([])
  const [greška, setGreška] = useState('')

  useEffect(() => {
    if (chemical) {
      setForm({
        name: chemical.name,
        casNumber: chemical.casNumber ?? '',
        manufacturer: chemical.manufacturer ?? '',
        batchNumber: chemical.batchNumber ?? '',
        purchaseDate: chemical.purchaseDate,
        expiryDate: chemical.expiryDate,
        quantity: String(chemical.quantity),
        unit: chemical.unit,
        minQuantity: String(chemical.minQuantity),
        storageLocation: chemical.storageLocation,
        storageTempMin: chemical.storageTempMin != null ? String(chemical.storageTempMin) : '',
        storageTempMax: chemical.storageTempMax != null ? String(chemical.storageTempMax) : '',
        sdsUrl: chemical.sdsUrl ?? '',
        notes: chemical.notes ?? '',
      })
      setGhsClasses(chemical.ghsClasses as GHSClass[])
      setGreška('')
      modal.open()
    }
  }, [chemical])

  function set(key: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit() {
    if (!form.name.trim()) { setGreška('Naziv je obavezan.'); return }
    if (!form.purchaseDate) { setGreška('Datum nabave je obavezan.'); return }
    if (!form.expiryDate) { setGreška('Rok trajanja je obavezan.'); return }
    if (!form.quantity || Number(form.quantity) <= 0) { setGreška('Količina mora biti pozitivna.'); return }
    if (!form.storageLocation.trim()) { setGreška('Lokacija je obavezna.'); return }
    if (!chemical) return
    setGreška('')
    try {
      await mutateAsync({
        id: chemical.id,
        body: {
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
        },
      })
      modal.close(); onClose()
    } catch (err: any) {
      setGreška(err?.response?.data?.error?.message ?? 'Greška pri ažuriranju.')
    }
  }

  const inputCls = 'w-full px-3 py-2 rounded-xl bg-field-background border border-field-border text-field-foreground text-sm focus:outline-none focus:border-accent placeholder:text-field-placeholder'

  if (!chemical) return null

  return (
    <ModalRoot state={modal}>
      <ModalBackdrop />
      <ModalContainer size="lg" className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <ModalDialog className="w-full max-w-2xl">
          <ModalHeader className="flex items-center justify-between">
            <ModalHeading>Uredi kemikaliju</ModalHeading>
            <Button variant="ghost" isIconOnly size="sm" onClick={() => { modal.close(); onClose() }} aria-label="Zatvori"><X size={16} /></Button>
          </ModalHeader>

          <ModalBody className="overflow-y-auto max-h-[65vh] sm:max-h-[65vh] flex flex-col gap-5 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField value={form.name} onChange={v => set('name', v)}>
                <Label className="text-sm font-medium text-foreground">Naziv</Label>
                <Input className="mt-1" />
              </TextField>
              <TextField value={form.casNumber} onChange={v => set('casNumber', v)}>
                <Label className="text-sm font-medium text-foreground flex items-center gap-1">
                  CAS broj <span className="text-muted font-normal">(neoob.)</span>
                  <FieldTooltip text="Chemical Abstracts Service registarski broj. Format: XXXXXXX-YY-Z" />
                </Label>
                <Input placeholder="XXXXXXX-YY-Z" className="mt-1" />
              </TextField>
              <TextField value={form.manufacturer} onChange={v => set('manufacturer', v)}>
                <Label className="text-sm font-medium text-foreground">Proizvođač <span className="text-muted font-normal">(neoob.)</span></Label>
                <Input className="mt-1" />
              </TextField>
              <TextField value={form.batchNumber} onChange={v => set('batchNumber', v)}>
                <Label className="text-sm font-medium text-foreground">Broj serije <span className="text-muted font-normal">(neoob.)</span></Label>
                <Input className="mt-1" />
              </TextField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <TextField value={form.purchaseDate} onChange={v => set('purchaseDate', v)}>
                <Label className="text-sm font-medium text-foreground">Datum nabave</Label>
                <Input type="date" className="mt-1" />
              </TextField>
              <TextField value={form.expiryDate} onChange={v => set('expiryDate', v)}>
                <Label className="text-sm font-medium text-foreground">Rok trajanja</Label>
                <Input type="date" className="mt-1" />
              </TextField>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <TextField value={form.quantity} onChange={v => set('quantity', v)}>
                <Label className="text-sm font-medium text-foreground">Količina</Label>
                <Input type="number" min="0" step="0.001" className="mt-1" />
              </TextField>
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium text-foreground">Jedinica</Label>
                <Select selectedKey={form.unit} onSelectionChange={key => set('unit', String(key))}>
                  <SelectTrigger className="mt-1 w-full"><SelectValue /><SelectIndicator /></SelectTrigger>
                  <SelectPopover>
                    <ListBox>{CHEMICAL_UNITS.map(u => <ListBoxItem key={u} id={u}>{u}</ListBoxItem>)}</ListBox>
                  </SelectPopover>
                </Select>
              </div>
              <TextField value={form.minQuantity} onChange={v => set('minQuantity', v)}>
                <Label className="text-sm font-medium text-foreground flex items-center gap-1">
                  Min. zaliha <span className="text-muted font-normal">(neoob.)</span>
                  <FieldTooltip text="Prag ispod kojeg sustav šalje upozorenje. Ostavite 0 za bez upozorenja." />
                </Label>
                <Input type="number" min="0" step="0.001" className="mt-1" />
              </TextField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <TextField value={form.storageLocation} onChange={v => set('storageLocation', v)}>
                  <Label className="text-sm font-medium text-foreground">Lokacija</Label>
                  <Input placeholder="npr. Ormar A-3" className="mt-1" />
                </TextField>
              </div>
              <TextField value={form.storageTempMin} onChange={v => set('storageTempMin', v)}>
                <Label className="text-sm font-medium text-foreground">Temp. min (°C) <span className="text-muted font-normal">(neoob.)</span></Label>
                <Input type="number" placeholder="-20" className="mt-1" />
              </TextField>
              <TextField value={form.storageTempMax} onChange={v => set('storageTempMax', v)}>
                <Label className="text-sm font-medium text-foreground">Temp. max (°C) <span className="text-muted font-normal">(neoob.)</span></Label>
                <Input type="number" placeholder="25" className="mt-1" />
              </TextField>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground flex items-center gap-1">
                GHS klasifikacija <span className="text-muted font-normal">(neoob.)</span>
                <FieldTooltip text="Globalno usklađeni sustav klasifikacije opasnih kemikalija. Označite sve primjenjive kategorije opasnosti." />
              </Label>
              <CheckboxGroup value={ghsClasses} onChange={vals => setGhsClasses(vals as GHSClass[])}>
                <div className="grid grid-cols-3 gap-1 mt-1">
                  {GHS_CODES.map(code => (
                    <Checkbox key={code} value={code} className="p-2 rounded-lg hover:bg-default transition-colors">
                      <CheckboxControl />
                      <CheckboxContent className="text-xs text-foreground">{GHS_INFO[code].label}</CheckboxContent>
                    </Checkbox>
                  ))}
                </div>
              </CheckboxGroup>
            </div>

            <TextField value={form.sdsUrl} onChange={v => set('sdsUrl', v)}>
              <Label className="text-sm font-medium text-foreground flex items-center gap-1">
                SDS URL <span className="text-muted font-normal">(neoob.)</span>
                <FieldTooltip text="Sigurnosno-tehnički list (Safety Data Sheet) — pronaći na web stranici proizvođača." />
              </Label>
              <Input type="url" placeholder="https://..." className="mt-1" />
            </TextField>

            <TextField value={form.notes} onChange={v => set('notes', v)}>
              <Label className="text-sm font-medium text-foreground">Bilješka <span className="text-muted font-normal">(neoob.)</span></Label>
              <TextArea rows={2} className="mt-1" />
            </TextField>

            {greška && <p className="text-sm text-danger">{greška}</p>}
          </ModalBody>

          <ModalFooter className="gap-2">
            <Button variant="outline" onClick={() => { modal.close(); onClose() }} isDisabled={isPending}>Odustani</Button>
            <Button variant="primary" onClick={handleSubmit} isDisabled={isPending}>
              {isPending ? <Spinner size="sm" /> : 'Spremi promjene'}
            </Button>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </ModalRoot>
  )
}
