import type { Sample } from '../types/samples'
import type { Chemical } from '../types/chemicals'
import type { Protocol, Experiment } from '../types/protocols'

export const MOCK_USER = {
  id: 'user-1',
  email: 'ana@lims.hr',
  firstName: 'Ana',
  lastName: 'Kovač',
  role: 'lab_technician' as const,
}

const ADMIN = { id: 'user-2', firstName: 'Marko', lastName: 'Horvat' }
const ANA   = { id: 'user-1', firstName: 'Ana',   lastName: 'Kovač' }

// ─── Samples ─────────────────────────────────────────────────────────────────

export const MOCK_SAMPLES: Sample[] = [
  { id: 'smp-1', code: 'UZ-2025-0001', type: 'Voda', source: 'Rijeka Sava — most Domovinski', status: 'received',   receivedBy: ANA,   receivedAt: '2025-05-28T08:30:00Z', createdAt: '2025-05-28T08:30:00Z', updatedAt: '2025-05-28T08:30:00Z' },
  { id: 'smp-2', code: 'UZ-2025-0002', type: 'Voda', source: 'Vodoopskrba Zagreb — ulazna točka', status: 'processing', receivedBy: ANA, receivedAt: '2025-05-27T10:00:00Z', createdAt: '2025-05-27T10:00:00Z', updatedAt: '2025-05-27T14:00:00Z' },
  { id: 'smp-3', code: 'UZ-2025-0003', type: 'Tlo',  source: 'Park šuma Maksimir — sektor B', status: 'analysed',   receivedBy: ADMIN, receivedAt: '2025-05-25T09:15:00Z', createdAt: '2025-05-25T09:15:00Z', updatedAt: '2025-05-26T16:00:00Z' },
  { id: 'smp-4', code: 'UZ-2025-0004', type: 'Hrana', source: 'Svježe mlijeko — Dukat d.d.', status: 'archived',   receivedBy: ANA,   receivedAt: '2025-05-20T11:00:00Z', createdAt: '2025-05-20T11:00:00Z', updatedAt: '2025-05-22T09:00:00Z' },
  { id: 'smp-5', code: 'UZ-2025-0005', type: 'Voda', source: 'Bunarska voda — Samobor, zdenac 3', status: 'received', receivedBy: ANA, receivedAt: '2025-05-29T07:45:00Z', createdAt: '2025-05-29T07:45:00Z', updatedAt: '2025-05-29T07:45:00Z' },
  { id: 'smp-6', code: 'UZ-2025-0006', type: 'Zrak', source: 'Mjerenje emisija — industrijska zona Jankomir', status: 'processing', receivedBy: ADMIN, receivedAt: '2025-05-26T13:00:00Z', createdAt: '2025-05-26T13:00:00Z', updatedAt: '2025-05-27T08:00:00Z' },
  { id: 'smp-7', code: 'UZ-2025-0007', type: 'Biološki', source: 'Bris površine — kuhinja, bolnica Rebro', status: 'analysed', receivedBy: ANA, receivedAt: '2025-05-24T14:30:00Z', createdAt: '2025-05-24T14:30:00Z', updatedAt: '2025-05-25T11:00:00Z' },
  { id: 'smp-8', code: 'UZ-2025-0008', type: 'Kemijski', source: 'Otpadna voda — Žitnjak, industr. kanal', status: 'destroyed', receivedBy: ADMIN, receivedAt: '2025-05-15T09:00:00Z', createdAt: '2025-05-15T09:00:00Z', updatedAt: '2025-05-18T10:00:00Z' },
]

export const MOCK_SAMPLE_EVENTS: Record<string, any[]> = {
  'smp-1': [{ id: 'ev-1', sampleId: 'smp-1', eventType: 'created', newStatus: 'received', notes: null, createdAt: '2025-05-28T08:30:00Z', user: ANA }],
  'smp-2': [
    { id: 'ev-2', sampleId: 'smp-2', eventType: 'created', newStatus: 'received', notes: null, createdAt: '2025-05-27T10:00:00Z', user: ANA },
    { id: 'ev-3', sampleId: 'smp-2', eventType: 'status_change', oldStatus: 'received', newStatus: 'processing', notes: 'Krenula analiza pH i kloridnih iona.', createdAt: '2025-05-27T14:00:00Z', user: ANA },
  ],
  'smp-3': [
    { id: 'ev-4', sampleId: 'smp-3', eventType: 'created', newStatus: 'received', notes: null, createdAt: '2025-05-25T09:15:00Z', user: ADMIN },
    { id: 'ev-5', sampleId: 'smp-3', eventType: 'status_change', oldStatus: 'received', newStatus: 'processing', notes: null, createdAt: '2025-05-25T11:00:00Z', user: ANA },
    { id: 'ev-6', sampleId: 'smp-3', eventType: 'status_change', oldStatus: 'processing', newStatus: 'analysed', notes: 'Analiza završena. Rezultati u normi.', createdAt: '2025-05-26T16:00:00Z', user: ANA },
  ],
}

// ─── Chemicals ────────────────────────────────────────────────────────────────

const today = new Date()
const d = (days: number) => { const t = new Date(today); t.setDate(t.getDate() + days); return t.toISOString().slice(0,10) }

export const MOCK_CHEMICALS: Chemical[] = [
  {
    id: 'chem-1', name: 'Klorovodična kiselina 37%', casNumber: '7647-01-0',
    manufacturer: 'Sigma-Aldrich', batchNumber: 'SZBD1234', purchaseDate: '2025-01-15',
    expiryDate: d(365), quantity: 2.5, unit: 'L', minQuantity: 0.5,
    storageLocation: 'Ormar K-1, polica 2', storageTempMin: 2, storageTempMax: 25,
    ghsClasses: ['GHS05', 'GHS07'], sdsUrl: undefined,
    addedBy: ADMIN, createdAt: '2025-01-15T09:00:00Z', updatedAt: '2025-01-15T09:00:00Z',
  },
  {
    id: 'chem-2', name: 'Natrijev hidroksid peletice', casNumber: '1310-73-2',
    manufacturer: 'Kemika', batchNumber: 'KM-5678', purchaseDate: '2025-02-10',
    expiryDate: d(200), quantity: 0.08, unit: 'kg', minQuantity: 0.1,
    storageLocation: 'Ormar K-1, polica 3', storageTempMin: undefined, storageTempMax: 25,
    ghsClasses: ['GHS05', 'GHS07'], sdsUrl: undefined,
    addedBy: ANA, createdAt: '2025-02-10T10:00:00Z', updatedAt: '2025-02-10T10:00:00Z',
  },
  {
    id: 'chem-3', name: 'Kalijev permanganat', casNumber: '7722-64-7',
    manufacturer: 'Merck', batchNumber: 'M-9012', purchaseDate: '2025-03-01',
    expiryDate: d(500), quantity: 250, unit: 'g', minQuantity: 50,
    storageLocation: 'Ormar O-2 (oksidansi)', storageTempMin: undefined, storageTempMax: 30,
    ghsClasses: ['GHS03', 'GHS06', 'GHS09'], sdsUrl: undefined,
    addedBy: ADMIN, createdAt: '2025-03-01T09:00:00Z', updatedAt: '2025-03-01T09:00:00Z',
  },
  {
    id: 'chem-4', name: 'Srebrov nitrat', casNumber: '7761-88-8',
    manufacturer: 'Sigma-Aldrich', batchNumber: 'SL-3456', purchaseDate: '2025-03-15',
    expiryDate: d(12), quantity: 15, unit: 'g', minQuantity: 5,
    storageLocation: 'Ormar T-1 (tamno)', storageTempMin: undefined, storageTempMax: 25,
    ghsClasses: ['GHS03', 'GHS05', 'GHS07', 'GHS09'], sdsUrl: undefined,
    addedBy: ADMIN, createdAt: '2025-03-15T09:00:00Z', updatedAt: '2025-03-15T09:00:00Z',
  },
  {
    id: 'chem-5', name: 'Sumporova kiselina 96%', casNumber: '7664-93-9',
    manufacturer: 'Panreac', batchNumber: 'PR-7890', purchaseDate: '2025-04-01',
    expiryDate: d(730), quantity: 1, unit: 'L', minQuantity: 0.2,
    storageLocation: 'Ormar K-2 (kiseline)', storageTempMin: 2, storageTempMax: 30,
    ghsClasses: ['GHS05', 'GHS07', 'GHS08'], sdsUrl: undefined,
    addedBy: ANA, createdAt: '2025-04-01T10:00:00Z', updatedAt: '2025-04-01T10:00:00Z',
  },
  {
    id: 'chem-6', name: 'Puferska otopina pH 7.00', casNumber: undefined,
    manufacturer: 'Hanna Instruments', batchNumber: 'HI-2024', purchaseDate: '2024-11-01',
    expiryDate: d(-10), quantity: 250, unit: 'mL', minQuantity: 50,
    storageLocation: 'Polica P-3 (calibranti)', storageTempMin: 2, storageTempMax: 25,
    ghsClasses: [], sdsUrl: undefined,
    addedBy: ANA, createdAt: '2024-11-01T09:00:00Z', updatedAt: '2024-11-01T09:00:00Z',
  },
]

// ─── Protocols ────────────────────────────────────────────────────────────────

export const MOCK_PROTOCOLS: Protocol[] = [
  {
    id: 'prot-1', name: 'Određivanje pH vrijednosti vode', description: 'Elektrokemijsko mjerenje pH metodom prema HRN EN ISO 10523:2012.',
    category: 'Analiza vode', currentVersion: '1.1.0', isActive: true,
    createdBy: ADMIN, createdAt: '2025-01-10T09:00:00Z', updatedAt: '2025-04-01T10:00:00Z',
    experimentCount: 2,
  },
  {
    id: 'prot-2', name: 'Određivanje kloridnih iona (argentometrija)', description: 'Titrimetrijska metoda određivanja klorida prema Mohr-u.',
    category: 'Analiza vode', currentVersion: '1.0.0', isActive: true,
    createdBy: ANA, createdAt: '2025-02-15T09:00:00Z', updatedAt: '2025-02-15T09:00:00Z',
    experimentCount: 1,
  },
]

// ─── Experiments ──────────────────────────────────────────────────────────────

export const MOCK_EXPERIMENTS: Experiment[] = [
  {
    id: 'exp-1', protocolId: 'prot-1', protocolVersionId: 'pv-1a',
    title: 'pH analiza — Rijeka Sava 28.05.2025.', status: 'completed',
    operator: ANA, startedAt: '2025-05-28T09:00:00Z', completedAt: '2025-05-28T11:30:00Z',
    results: 'pH = 7.42 ± 0.05. Vrijednost unutar MDK za površinske vode (6.5–8.5). Uzorak zadovoljava.', notes: null, createdAt: '2025-05-28T09:00:00Z',
    protocolName: 'Određivanje pH vrijednosti vode', protocolVersion: '1.1.0',
  },
  {
    id: 'exp-2', protocolId: 'prot-1', protocolVersionId: 'pv-1a',
    title: 'pH analiza — Vodoopskrba Zagreb 27.05.2025.', status: 'in_progress',
    operator: ANA, startedAt: '2025-05-27T14:30:00Z', completedAt: undefined,
    results: undefined, notes: 'Uzorak u obradi, čeka se termostatizacija.', createdAt: '2025-05-27T14:30:00Z',
    protocolName: 'Određivanje pH vrijednosti vode', protocolVersion: '1.1.0',
  },
  {
    id: 'exp-3', protocolId: 'prot-2', protocolVersionId: 'pv-2a',
    title: 'Kloridni ioni — Park Maksimir, tlo, 25.05.2025.', status: 'completed',
    operator: ADMIN, startedAt: '2025-05-25T10:00:00Z', completedAt: '2025-05-25T13:00:00Z',
    results: 'Sadržaj klorida: 42.3 mg/kg s.m. Unutar propisanih granica za urbano tlo.', notes: null, createdAt: '2025-05-25T10:00:00Z',
    protocolName: 'Određivanje kloridnih iona (argentometrija)', protocolVersion: '1.0.0',
  },
]
