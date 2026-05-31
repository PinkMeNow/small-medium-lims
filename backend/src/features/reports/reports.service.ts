import { eq, and, isNull, gte, lte, desc } from 'drizzle-orm'
import { db } from '../../db/index'
import { samples, sampleEvents, chemicals, experiments, protocols, protocolVersions, users } from '../../db/schema/index'

export async function samplesReport(from?: string, to?: string, status?: string) {
  const conditions = [isNull(samples.deletedAt)]
  if (from) conditions.push(gte(samples.receivedAt, new Date(from)))
  if (to) {
    const toDate = new Date(to)
    toDate.setHours(23, 59, 59, 999)
    conditions.push(lte(samples.receivedAt, toDate))
  }
  if (status) conditions.push(eq(samples.status, status as any))

  const rows = await db
    .select({
      id: samples.id, code: samples.code, type: samples.type,
      source: samples.source, status: samples.status, notes: samples.notes,
      receivedAt: samples.receivedAt,
      firstName: users.firstName, lastName: users.lastName,
    })
    .from(samples)
    .leftJoin(users, eq(samples.receivedById, users.id))
    .where(and(...conditions))
    .orderBy(desc(samples.receivedAt))

  const summary: Record<string, number> = {}
  rows.forEach((r) => { summary[r.status] = (summary[r.status] ?? 0) + 1 })

  return { rows, summary, total: rows.length }
}

export async function chemicalsReport() {
  const rows = await db
    .select({
      id: chemicals.id, name: chemicals.name, casNumber: chemicals.casNumber,
      manufacturer: chemicals.manufacturer, quantity: chemicals.quantity,
      unit: chemicals.unit, minQuantity: chemicals.minQuantity,
      storageLocation: chemicals.storageLocation, expiryDate: chemicals.expiryDate,
      ghsClasses: chemicals.ghsClasses,
      firstName: users.firstName, lastName: users.lastName,
    })
    .from(chemicals)
    .leftJoin(users, eq(chemicals.addedById, users.id))
    .where(isNull(chemicals.deletedAt))
    .orderBy(chemicals.name)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const soon = new Date(today)
  soon.setDate(soon.getDate() + 30)

  const summary = {
    total: rows.length,
    expired: rows.filter((r) => new Date(r.expiryDate) < today).length,
    expiringSoon: rows.filter((r) => {
      const d = new Date(r.expiryDate)
      return d >= today && d <= soon
    }).length,
    lowStock: rows.filter((r) => Number(r.quantity) <= Number(r.minQuantity) && Number(r.minQuantity) > 0).length,
  }

  return { rows, summary }
}

export async function experimentsReport(from?: string, to?: string, protocolId?: string) {
  const conditions: any[] = []
  if (from) conditions.push(gte(experiments.startedAt, new Date(from)))
  if (to) {
    const toDate = new Date(to)
    toDate.setHours(23, 59, 59, 999)
    conditions.push(lte(experiments.startedAt, toDate))
  }
  if (protocolId) conditions.push(eq(experiments.protocolId, protocolId))

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const rows = await db
    .select({
      id: experiments.id, title: experiments.title, status: experiments.status,
      startedAt: experiments.startedAt, completedAt: experiments.completedAt,
      results: experiments.results, notes: experiments.notes,
      operatorFirst: users.firstName, operatorLast: users.lastName,
      protocolName: protocols.name, protocolVersion: protocolVersions.version,
    })
    .from(experiments)
    .leftJoin(users, eq(experiments.operatorId, users.id))
    .leftJoin(protocols, eq(experiments.protocolId, protocols.id))
    .leftJoin(protocolVersions, eq(experiments.protocolVersionId, protocolVersions.id))
    .where(where)
    .orderBy(desc(experiments.startedAt))

  const summary: Record<string, number> = {}
  rows.forEach((r) => { summary[r.status] = (summary[r.status] ?? 0) + 1 })

  return { rows, summary, total: rows.length }
}

export async function chainOfCustody(sampleId: string) {
  const [sampleRow] = await db
    .select({
      id: samples.id, code: samples.code, type: samples.type,
      source: samples.source, status: samples.status, notes: samples.notes,
      receivedAt: samples.receivedAt, createdAt: samples.createdAt,
      firstName: users.firstName, lastName: users.lastName,
    })
    .from(samples)
    .leftJoin(users, eq(samples.receivedById, users.id))
    .where(eq(samples.id, sampleId))
    .limit(1)

  if (!sampleRow) return null

  const events = await db
    .select({
      id: sampleEvents.id, eventType: sampleEvents.eventType,
      oldStatus: sampleEvents.oldStatus, newStatus: sampleEvents.newStatus,
      notes: sampleEvents.notes, createdAt: sampleEvents.createdAt,
      firstName: users.firstName, lastName: users.lastName,
    })
    .from(sampleEvents)
    .leftJoin(users, eq(sampleEvents.userId, users.id))
    .where(eq(sampleEvents.sampleId, sampleId))
    .orderBy(sampleEvents.createdAt)

  return {
    sample: {
      ...sampleRow,
      receivedBy: `${sampleRow.firstName ?? ''} ${sampleRow.lastName ?? ''}`.trim(),
    },
    events: events.map((e) => ({
      ...e,
      user: `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim() || '—',
    })),
  }
}
