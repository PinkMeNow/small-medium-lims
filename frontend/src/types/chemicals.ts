export type GHSClass = 'GHS01' | 'GHS02' | 'GHS03' | 'GHS04' | 'GHS05' | 'GHS06' | 'GHS07' | 'GHS08' | 'GHS09'
export type ChemicalUnit = 'g' | 'mg' | 'kg' | 'mL' | 'L' | 'µL' | 'mol' | 'mmol' | 'kom'

export const CHEMICAL_UNITS: ChemicalUnit[] = ['g', 'mg', 'kg', 'mL', 'L', 'µL', 'mol', 'mmol', 'kom']

export const GHS_INFO: Record<GHSClass, { label: string; short: string }> = {
  GHS01: { label: 'Eksploziv',              short: 'GHS01' },
  GHS02: { label: 'Zapaljivo',              short: 'GHS02' },
  GHS03: { label: 'Oksidans',              short: 'GHS03' },
  GHS04: { label: 'Stlačeni plin',         short: 'GHS04' },
  GHS05: { label: 'Korozivno',             short: 'GHS05' },
  GHS06: { label: 'Otrovno',               short: 'GHS06' },
  GHS07: { label: 'Štetno/nadražujuće',    short: 'GHS07' },
  GHS08: { label: 'Zdravstvena opasnost',  short: 'GHS08' },
  GHS09: { label: 'Okolišna opasnost',     short: 'GHS09' },
}

export interface ChemicalUser {
  id: string
  firstName: string
  lastName: string
}

export interface Chemical {
  id: string
  name: string
  casNumber?: string
  manufacturer?: string
  batchNumber?: string
  purchaseDate: string
  expiryDate: string
  quantity: number
  unit: ChemicalUnit
  minQuantity: number
  storageLocation: string
  storageTempMin?: number
  storageTempMax?: number
  ghsClasses: GHSClass[]
  sdsUrl?: string
  notes?: string
  addedBy: ChemicalUser
  createdAt: string
  updatedAt: string
}

export interface ChemicalsPage {
  data: Chemical[]
  meta: { page: number; limit: number; total: number }
}

export type ChemicalStatus = 'expired' | 'expiring_soon' | 'low_stock' | 'ok'

export function getChemicalStatus(c: Chemical): ChemicalStatus {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(c.expiryDate)
  const soon = new Date(today)
  soon.setDate(soon.getDate() + 30)

  if (expiry < today) return 'expired'
  if (expiry <= soon) return 'expiring_soon'
  if (Number(c.quantity) <= Number(c.minQuantity) && Number(c.minQuantity) > 0) return 'low_stock'
  return 'ok'
}

export const CHEMICAL_STATUS_LABELS: Record<ChemicalStatus, string> = {
  expired: 'Istekao',
  expiring_soon: 'Ističe uskoro',
  low_stock: 'Niske zalihe',
  ok: 'Uredu',
}
