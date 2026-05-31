import { http, HttpResponse, delay } from 'msw'
import {
  MOCK_USER, MOCK_SAMPLES, MOCK_SAMPLE_EVENTS,
  MOCK_CHEMICALS, MOCK_PROTOCOLS, MOCK_EXPERIMENTS,
} from './data'
import type { Sample } from '../types/samples'
import type { Chemical } from '../types/chemicals'
import type { Experiment } from '../types/protocols'
import type { AppUser, UserRole } from '../types/users'

const BASE = 'http://localhost:3001/api/v1'

// Mutable copies so mutations update the lists
let samples: Sample[] = [...MOCK_SAMPLES]
let chemicals: Chemical[] = [...MOCK_CHEMICALS]
let experiments: Experiment[] = [...MOCK_EXPERIMENTS]

function paginate<T>(arr: T[], page = 1, limit = 20) {
  const start = (page - 1) * limit
  return { data: arr.slice(start, start + limit), meta: { page, limit, total: arr.length } }
}

function uuid() {
  return crypto.randomUUID()
}

export const handlers = [

  // ─── Auth ─────────────────────────────────────────────────────────────────

  http.post(`${BASE}/auth/refresh`, async () => {
    await delay(200)
    return HttpResponse.json({ accessToken: 'mock-access-token', user: MOCK_USER })
  }),

  http.post(`${BASE}/auth/login`, async ({ request }) => {
    await delay(400)
    const body = await request.json() as any
    if (body.email && body.password) {
      return HttpResponse.json({ accessToken: 'mock-access-token', user: MOCK_USER })
    }
    return HttpResponse.json({ error: { code: 'POGREŠNI_PODACI', message: 'Pogrešan email ili lozinka.' } }, { status: 401 })
  }),

  http.post(`${BASE}/auth/logout`, async () => {
    await delay(200)
    return HttpResponse.json({ poruka: 'Uspješno ste se odjavili.' })
  }),

  http.get(`${BASE}/auth/me`, async () => {
    return HttpResponse.json({ user: MOCK_USER })
  }),

  // ─── Samples ──────────────────────────────────────────────────────────────

  http.get(`${BASE}/samples`, async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() ?? ''
    const status = url.searchParams.get('status') ?? ''
    const page = Number(url.searchParams.get('page') ?? 1)
    const limit = Number(url.searchParams.get('limit') ?? 20)

    let filtered = samples
    if (search) filtered = filtered.filter(s =>
      s.code.toLowerCase().includes(search) ||
      s.source.toLowerCase().includes(search) ||
      s.type.toLowerCase().includes(search)
    )
    if (status) filtered = filtered.filter(s => s.status === status)

    return HttpResponse.json(paginate(filtered, page, limit))
  }),

  http.get(`${BASE}/samples/:id`, async ({ params }) => {
    await delay(200)
    const s = samples.find(x => x.id === params.id)
    if (!s) return HttpResponse.json({ error: { code: 'NIJE_PRONAĐENO', message: 'Uzorak nije pronađen.' } }, { status: 404 })
    return HttpResponse.json({ sample: s, events: MOCK_SAMPLE_EVENTS[s.id] ?? [] })
  }),

  http.post(`${BASE}/samples`, async ({ request }) => {
    await delay(500)
    const body = await request.json() as any
    const newSample: Sample = {
      id: uuid(), code: `UZ-2025-${String(samples.length + 1).padStart(4, '0')}`,
      type: body.type, source: body.source, status: 'received',
      notes: body.notes, receivedBy: { id: MOCK_USER.id, firstName: MOCK_USER.firstName, lastName: MOCK_USER.lastName },
      receivedAt: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
    samples = [newSample, ...samples]
    return HttpResponse.json({ sample: newSample }, { status: 201 })
  }),

  http.patch(`${BASE}/samples/:id/status`, async ({ params, request }) => {
    await delay(400)
    const body = await request.json() as any
    samples = samples.map(s => s.id === params.id ? { ...s, status: body.status, updatedAt: new Date().toISOString() } : s)
    const updated = samples.find(s => s.id === params.id)!
    return HttpResponse.json({ sample: updated })
  }),

  http.post(`${BASE}/samples/:id/biljeska`, async () => {
    await delay(300)
    return HttpResponse.json({ event: { id: uuid(), eventType: 'note_added', createdAt: new Date().toISOString() } }, { status: 201 })
  }),

  http.delete(`${BASE}/samples/:id`, async ({ params }) => {
    await delay(300)
    samples = samples.filter(s => s.id !== params.id)
    return HttpResponse.json({ poruka: 'Uzorak je obrisan.' })
  }),

  // ─── Chemicals ────────────────────────────────────────────────────────────

  http.get(`${BASE}/chemicals`, async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() ?? ''
    const alert = url.searchParams.get('alert') ?? ''
    const page = Number(url.searchParams.get('page') ?? 1)
    const limit = Number(url.searchParams.get('limit') ?? 20)

    const today = new Date(); today.setHours(0,0,0,0)
    const soon = new Date(today); soon.setDate(soon.getDate() + 30)

    let filtered = chemicals
    if (search) filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(search) ||
      (c.casNumber ?? '').toLowerCase().includes(search) ||
      c.storageLocation.toLowerCase().includes(search)
    )
    if (alert === 'expired') filtered = filtered.filter(c => new Date(c.expiryDate) < today)
    else if (alert === 'expiring_soon') filtered = filtered.filter(c => { const d = new Date(c.expiryDate); return d >= today && d <= soon })
    else if (alert === 'low_stock') filtered = filtered.filter(c => Number(c.quantity) <= Number(c.minQuantity) && Number(c.minQuantity) > 0)

    return HttpResponse.json(paginate(filtered, page, limit))
  }),

  http.get(`${BASE}/chemicals/alerts`, async () => {
    await delay(200)
    const today = new Date(); today.setHours(0,0,0,0)
    const soon = new Date(today); soon.setDate(soon.getDate() + 30)
    return HttpResponse.json({
      expired: chemicals.filter(c => new Date(c.expiryDate) < today),
      expiringSoon: chemicals.filter(c => { const d = new Date(c.expiryDate); return d >= today && d <= soon }),
      lowStock: chemicals.filter(c => Number(c.quantity) <= Number(c.minQuantity) && Number(c.minQuantity) > 0),
    })
  }),

  http.get(`${BASE}/chemicals/:id`, async ({ params }) => {
    await delay(200)
    const c = chemicals.find(x => x.id === params.id)
    if (!c) return HttpResponse.json({ error: { code: 'NIJE_PRONAĐENO', message: 'Kemikalija nije pronađena.' } }, { status: 404 })
    return HttpResponse.json({ chemical: c })
  }),

  http.post(`${BASE}/chemicals`, async ({ request }) => {
    await delay(500)
    const body = await request.json() as any
    const newChem: Chemical = {
      id: uuid(), ...body,
      quantity: Number(body.quantity), minQuantity: Number(body.minQuantity ?? 0),
      ghsClasses: body.ghsClasses ?? [], addedBy: { id: MOCK_USER.id, firstName: MOCK_USER.firstName, lastName: MOCK_USER.lastName },
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
    chemicals = [newChem, ...chemicals]
    return HttpResponse.json({ chemical: newChem }, { status: 201 })
  }),

  http.patch(`${BASE}/chemicals/:id`, async ({ params, request }) => {
    await delay(400)
    const body = await request.json() as any
    chemicals = chemicals.map(c => c.id === params.id ? { ...c, ...body, updatedAt: new Date().toISOString() } : c)
    return HttpResponse.json({ chemical: chemicals.find(c => c.id === params.id) })
  }),

  http.delete(`${BASE}/chemicals/:id`, async ({ params }) => {
    await delay(300)
    chemicals = chemicals.filter(c => c.id !== params.id)
    return HttpResponse.json({ poruka: 'Kemikalija je obrisana.' })
  }),

  // ─── Protocols ────────────────────────────────────────────────────────────

  http.get(`${BASE}/protocols`, async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() ?? ''
    const page = Number(url.searchParams.get('page') ?? 1)
    const limit = Number(url.searchParams.get('limit') ?? 20)

    let filtered = MOCK_PROTOCOLS
    if (search) filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(search) ||
      (p.category ?? '').toLowerCase().includes(search)
    )
    return HttpResponse.json(paginate(filtered, page, limit))
  }),

  http.get(`${BASE}/protocols/:id`, async ({ params }) => {
    await delay(200)
    const p = MOCK_PROTOCOLS.find(x => x.id === params.id)
    if (!p) return HttpResponse.json({ error: { code: 'NIJE_PRONAĐENO', message: 'Protokol nije pronađen.' } }, { status: 404 })
    return HttpResponse.json({ protocol: p, versions: MOCK_PROTOCOL_VERSIONS[p.id] ?? [], experiments: experiments.filter(e => e.protocolId === p.id) })
  }),

  http.post(`${BASE}/protocols`, async ({ request }) => {
    await delay(500)
    const body = await request.json() as any
    return HttpResponse.json({
      protocol: { id: uuid(), ...body, currentVersion: '1.0.0', isActive: true, createdBy: { id: MOCK_USER.id, firstName: MOCK_USER.firstName, lastName: MOCK_USER.lastName }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), experimentCount: 0 },
      version: { id: uuid(), version: '1.0.0', steps: body.steps, createdAt: new Date().toISOString() },
    }, { status: 201 })
  }),

  http.post(`${BASE}/protocols/:id/versions`, async () => {
    await delay(400)
    return HttpResponse.json({ version: { id: uuid(), version: '1.2.0', createdAt: new Date().toISOString() } }, { status: 201 })
  }),

  // ─── Experiments ──────────────────────────────────────────────────────────

  http.get(`${BASE}/experiments`, async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const status = url.searchParams.get('status') ?? ''
    const page = Number(url.searchParams.get('page') ?? 1)
    const limit = Number(url.searchParams.get('limit') ?? 20)

    let filtered = experiments
    if (status) filtered = filtered.filter(e => e.status === status)
    return HttpResponse.json(paginate(filtered, page, limit))
  }),

  http.post(`${BASE}/experiments`, async ({ request }) => {
    await delay(500)
    const body = await request.json() as any
    const proto = MOCK_PROTOCOLS.find(p => p.id === body.protocolId)
    const newExp: Experiment = {
      id: uuid(), protocolId: body.protocolId, protocolVersionId: uuid(),
      title: body.title, status: 'in_progress',
      operator: { id: MOCK_USER.id, firstName: MOCK_USER.firstName, lastName: MOCK_USER.lastName },
      startedAt: new Date().toISOString(), notes: body.notes,
      createdAt: new Date().toISOString(),
      protocolName: proto?.name, protocolVersion: proto?.currentVersion,
    }
    experiments = [newExp, ...experiments]
    return HttpResponse.json({ experiment: newExp }, { status: 201 })
  }),

  http.patch(`${BASE}/experiments/:id/complete`, async ({ params, request }) => {
    await delay(400)
    const body = await request.json() as any
    experiments = experiments.map(e => e.id === params.id
      ? { ...e, status: 'completed' as const, results: body.results, completedAt: new Date().toISOString() }
      : e
    )
    return HttpResponse.json({ experiment: experiments.find(e => e.id === params.id) })
  }),

  http.patch(`${BASE}/experiments/:id/cancel`, async ({ params }) => {
    await delay(300)
    experiments = experiments.map(e => e.id === params.id ? { ...e, status: 'cancelled' as const } : e)
    return HttpResponse.json({ experiment: experiments.find(e => e.id === params.id) })
  }),

  // ─── Reports ──────────────────────────────────────────────────────────────

  http.get(`${BASE}/reports/samples`, async () => {
    await delay(400)
    const summary: Record<string, number> = {}
    samples.forEach(s => { summary[s.status] = (summary[s.status] ?? 0) + 1 })
    return HttpResponse.json({
      rows: samples.map(s => ({
        ...s, firstName: s.receivedBy.firstName, lastName: s.receivedBy.lastName,
      })),
      summary, total: samples.length,
    })
  }),

  http.get(`${BASE}/reports/chemicals`, async () => {
    await delay(400)
    const today = new Date(); today.setHours(0,0,0,0)
    const soon = new Date(today); soon.setDate(soon.getDate() + 30)
    return HttpResponse.json({
      rows: chemicals.map(c => ({ ...c, firstName: c.addedBy.firstName, lastName: c.addedBy.lastName })),
      summary: {
        total: chemicals.length,
        expired: chemicals.filter(c => new Date(c.expiryDate) < today).length,
        expiringSoon: chemicals.filter(c => { const d = new Date(c.expiryDate); return d >= today && d <= soon }).length,
        lowStock: chemicals.filter(c => Number(c.quantity) <= Number(c.minQuantity) && Number(c.minQuantity) > 0).length,
      },
    })
  }),

  http.get(`${BASE}/reports/experiments`, async () => {
    await delay(400)
    const summary: Record<string, number> = {}
    experiments.forEach(e => { summary[e.status] = (summary[e.status] ?? 0) + 1 })
    return HttpResponse.json({
      rows: experiments.map(e => ({
        ...e, operatorFirst: e.operator.firstName, operatorLast: e.operator.lastName,
      })),
      summary, total: experiments.length,
    })
  }),

  http.get(`${BASE}/reports/chain-of-custody/:sampleId`, async ({ params }) => {
    await delay(300)
    const s = samples.find(x => x.id === params.sampleId)
    if (!s) return HttpResponse.json({ error: { code: 'NIJE_PRONAĐENO', message: 'Uzorak nije pronađen.' } }, { status: 404 })
    return HttpResponse.json({
      sample: { ...s, receivedBy: `${s.receivedBy.firstName} ${s.receivedBy.lastName}` },
      events: (MOCK_SAMPLE_EVENTS[s.id] ?? []).map((e: any) => ({
        ...e, user: `${e.user.firstName} ${e.user.lastName}`,
      })),
    })
  }),

  // ─── Users (admin only) ──────────────────────────────────────────────────

  http.get(`${BASE}/users`, async () => {
    await delay(300)
    return HttpResponse.json(mockUsers)
  }),

  http.post(`${BASE}/users`, async ({ request }) => {
    await delay(500)
    const body = await request.json() as any
    const newUser: AppUser = {
      id: uuid(), firstName: body.firstName, lastName: body.lastName,
      email: body.email, role: body.role as UserRole,
      isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
    mockUsers = [newUser, ...mockUsers]
    return HttpResponse.json({ user: newUser }, { status: 201 })
  }),

  http.patch(`${BASE}/users/:id/toggle-active`, async ({ params }) => {
    await delay(300)
    mockUsers = mockUsers.map(u => u.id === params.id ? { ...u, isActive: !u.isActive, updatedAt: new Date().toISOString() } : u)
    return HttpResponse.json({ user: mockUsers.find(u => u.id === params.id) })
  }),

  http.patch(`${BASE}/users/:id`, async ({ params, request }) => {
    await delay(400)
    const body = await request.json() as any
    mockUsers = mockUsers.map(u => u.id === params.id ? { ...u, ...body, updatedAt: new Date().toISOString() } : u)
    return HttpResponse.json({ user: mockUsers.find(u => u.id === params.id) })
  }),

  // ─── Dashboard ────────────────────────────────────────────────────────────

  http.get(`${BASE}/dashboard/stats`, async () => {
    await delay(300)
    const today = new Date(); today.setHours(0,0,0,0)
    const soon = new Date(today); soon.setDate(soon.getDate() + 30)
    return HttpResponse.json({
      samplesInProgress: samples.filter(s => s.status === 'processing').length,
      samplesTotal: samples.length,
      chemicalsAlerts: chemicals.filter(c => {
        const exp = new Date(c.expiryDate)
        return exp <= soon || (Number(c.quantity) <= Number(c.minQuantity) && Number(c.minQuantity) > 0)
      }).length,
      activeProtocols: MOCK_PROTOCOLS.length,
      experimentsThisMonth: experiments.filter(e => {
        const d = new Date(e.startedAt)
        const now = new Date()
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      }).length,
    })
  }),

  http.get(`${BASE}/dashboard/activity`, async () => {
    await delay(250)
    const allEvents = Object.entries(MOCK_SAMPLE_EVENTS).flatMap(([sampleId, events]) => {
      const sample = samples.find(s => s.id === sampleId)
      return events.map((e: any) => ({
        ...e,
        sampleCode: sample?.code,
        sampleType: sample?.type,
        user: `${e.user.firstName} ${e.user.lastName}`,
      }))
    })
    allEvents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return HttpResponse.json(allEvents.slice(0, 8))
  }),
]

// Mock users state (mutable)
let mockUsers: AppUser[] = [
  { id: 'user-2', firstName: 'Marko', lastName: 'Horvat', email: 'marko@lims.hr', role: 'admin', isActive: true, createdAt: '2025-01-01T09:00:00Z', updatedAt: '2025-01-01T09:00:00Z' },
  { id: 'user-1', firstName: 'Ana', lastName: 'Kovač', email: 'ana@lims.hr', role: 'lab_technician', isActive: true, createdAt: '2025-01-15T10:00:00Z', updatedAt: '2025-01-15T10:00:00Z' },
  { id: 'user-3', firstName: 'Petra', lastName: 'Šimić', email: 'petra@lims.hr', role: 'viewer', isActive: true, createdAt: '2025-02-01T09:00:00Z', updatedAt: '2025-02-01T09:00:00Z' },
]

// Mock protocol versions with actual steps
const MOCK_PROTOCOL_VERSIONS: Record<string, any[]> = {
  'prot-1': [{
    id: 'pv-1a', protocolId: 'prot-1', version: '1.1.0',
    steps: [
      { stepNumber: 1, title: 'Kalibracija pH elektrode', description: 'Kalibrirati pH elektrodu s certificiranim puferima pH 4.00 i pH 7.00 na temperaturi 25°C ± 0.5°C. Isprati elektrodu destiliranom vodom između pufera.' },
      { stepNumber: 2, title: 'Kondicioniranje uzorka', description: 'Uzorak temperirati na 25°C ± 0.5°C u termostatu. Izmjeriti temperaturu uzorka termometrom i evidentirati u protokolnom listu.' },
      { stepNumber: 3, title: 'Mjerenje pH vrijednosti', description: 'Uroniti elektrodu u uzorak (dubina min. 3 cm). Pričekati stabilizaciju očitanja (promjena < 0.01 pH/min). Očitati i evidentirati pH vrijednost.' },
      { stepNumber: 4, title: 'Ispiranje i pohrana', description: 'Isprati elektrodu destiliranom vodom. Pohraniti elektrodu u pufer pH 7.00 ili KCl otopinu prema uputama proizvođača.' },
    ],
    requiredMaterials: ['Pufer pH 4.00 (certificiran)', 'Pufer pH 7.00 (certificiran)', 'Destilirana voda', 'KCl otopina za pohranu'],
    requiredEquipment: ['pH metar (rezolucija 0.01 pH)', 'Termometar', 'Termostat', 'Čaše 100 mL'],
    expectedResults: 'pH vrijednost s preciznošću ±0.05 pH jedinice. MDK za pitku vodu: 6.5–9.5. MDK za površinske vode: 6.0–9.0.',
    createdAt: '2025-04-01T10:00:00Z',
  }],
  'prot-2': [{
    id: 'pv-2a', protocolId: 'prot-2', version: '1.0.0',
    steps: [
      { stepNumber: 1, title: 'Priprema AgNO₃ otopine', description: 'Pripremiti standardnu otopinu AgNO₃ c(AgNO₃) = 0.1000 mol/L. Standardizirati otopinu prema NaCl standardu. Evidentirati faktor otopine f.' },
      { stepNumber: 2, title: 'Priprema uzorka', description: 'Oduzeti 100.0 mL uzorka u Erlenmeyerovu tikvicu od 250 mL. Ako je uzorak obojen ili zamućen, razrijediti destiliranom vodom. Podesiti pH na 7-10 NaOH ili HNO₃.' },
      { stepNumber: 3, title: 'Dodatak indikatora', description: 'Dodati 1 mL otopine K₂CrO₄ (5% m/V) kao indikator. Otopina postaje žuta boja.' },
      { stepNumber: 4, title: 'Titracija', description: 'Biretom dodavati AgNO₃ otopinu uz konstantno miješanje. Titrirati do pojave prvih trajnih smeđecrvenih taloga Ag₂CrO₄ (promjena boje žuta → smeđecrvena). Evidentirati volumen V(AgNO₃) u mL.' },
      { stepNumber: 5, title: 'Izračun', description: 'w(Cl⁻) [mg/L] = V(AgNO₃) × f × c(AgNO₃) × M(Cl) × 1000 / V(uzorka) = V(AgNO₃) × f × 0.1000 × 35.45 × 1000 / 100.0' },
    ],
    requiredMaterials: ['AgNO₃ 0.1 mol/L (standardizirano)', 'K₂CrO₄ 5% otopina', 'NaCl standard', 'Destilirana voda', 'HNO₃ razrij. / NaOH razrij.'],
    requiredEquipment: ['Bireta 25 mL (razd. 0.05 mL)', 'Erlenmeyerova tikvica 250 mL', 'Volumetrijska pipeta 100 mL', 'Analitička vaga'],
    expectedResults: 'Masena koncentracija klorida [mg/L]. MDK za pitku vodu: 250 mg/L (HRN EN ISO 10304). Metoda: Mohr, ISO 9297.',
    createdAt: '2025-02-15T09:00:00Z',
  }],
}
