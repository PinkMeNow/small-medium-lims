import { eq, and, isNull, sql, desc, count } from 'drizzle-orm'
import { db } from '../../db/index'
import { samples, sampleEvents, chemicals, protocols, experiments, users } from '../../db/schema/index'

export async function getStats() {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const soon = new Date(today); soon.setDate(soon.getDate() + 30)
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  const [
    [{ samplesInProgress }],
    [{ samplesTotal }],
    [{ chemicalsAlerts }],
    [{ activeProtocols }],
    [{ experimentsThisMonth }],
  ] = await Promise.all([
    db.select({ samplesInProgress: count() }).from(samples)
      .where(and(isNull(samples.deletedAt), eq(samples.status, 'processing'))),
    db.select({ samplesTotal: count() }).from(samples)
      .where(isNull(samples.deletedAt)),
    db.select({ chemicalsAlerts: count() }).from(chemicals)
      .where(and(
        isNull(chemicals.deletedAt),
        sql`(
          ${chemicals.expiryDate}::date <= CURRENT_DATE + INTERVAL '30 days'
          OR (${chemicals.quantity}::numeric <= ${chemicals.minQuantity}::numeric AND ${chemicals.minQuantity}::numeric > 0)
        )`,
      )),
    db.select({ activeProtocols: count() }).from(protocols)
      .where(and(isNull(protocols.deletedAt), eq(protocols.isActive, true))),
    db.select({ experimentsThisMonth: count() }).from(experiments)
      .where(sql`${experiments.startedAt} >= ${monthStart.toISOString()}`),
  ])

  return {
    samplesInProgress: Number(samplesInProgress),
    samplesTotal: Number(samplesTotal),
    chemicalsAlerts: Number(chemicalsAlerts),
    activeProtocols: Number(activeProtocols),
    experimentsThisMonth: Number(experimentsThisMonth),
  }
}

export async function getRecentActivity() {
  const events = await db
    .select({
      id: sampleEvents.id,
      sampleId: sampleEvents.sampleId,
      eventType: sampleEvents.eventType,
      oldStatus: sampleEvents.oldStatus,
      newStatus: sampleEvents.newStatus,
      notes: sampleEvents.notes,
      createdAt: sampleEvents.createdAt,
      sampleCode: samples.code,
      sampleType: samples.type,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(sampleEvents)
    .leftJoin(samples, eq(sampleEvents.sampleId, samples.id))
    .leftJoin(users, eq(sampleEvents.userId, users.id))
    .orderBy(desc(sampleEvents.createdAt))
    .limit(8)

  return events.map(e => ({
    id: e.id,
    sampleId: e.sampleId,
    sampleCode: e.sampleCode,
    sampleType: e.sampleType,
    eventType: e.eventType,
    oldStatus: e.oldStatus,
    newStatus: e.newStatus,
    notes: e.notes,
    createdAt: e.createdAt,
    user: e.firstName ? `${e.firstName} ${e.lastName}` : '—',
  }))
}
