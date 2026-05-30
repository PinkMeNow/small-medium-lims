import { eq, and, isNull, ilike, or, count, desc } from 'drizzle-orm'
import { db } from '../../db/index'
import { samples, sampleEvents, users } from '../../db/schema/index'
import { AppError } from '../../middleware/error'
import { writeAuditLog } from '../../middleware/audit'
import type { CreateSampleInput, UpdateStatusInput, ListSamplesInput } from './samples.schema'
import type { SampleStatus } from '../../db/schema/samples'

const ALLOWED_TRANSITIONS: Record<SampleStatus, SampleStatus[]> = {
  received: ['processing'],
  processing: ['analysed'],
  analysed: ['archived', 'destroyed'],
  archived: [],
  destroyed: [],
}

async function generateCode(): Promise<string> {
  const year = new Date().getFullYear()
  const [result] = await db
    .select({ count: count() })
    .from(samples)
    .where(eq(db.$with('y').as(db.select().from(samples)), samples.id))
  // Simple sequential: count all + 1
  const [{ total }] = await db.select({ total: count() }).from(samples)
  const seq = Number(total) + 1
  return `UZ-${year}-${String(seq).padStart(4, '0')}`
}

export async function list(input: ListSamplesInput, _requesterId: string) {
  const offset = (input.page - 1) * input.limit

  const conditions = [isNull(samples.deletedAt)]
  if (input.status) conditions.push(eq(samples.status, input.status))
  if (input.search) {
    conditions.push(
      or(
        ilike(samples.code, `%${input.search}%`),
        ilike(samples.source, `%${input.search}%`),
        ilike(samples.type, `%${input.search}%`),
      )!,
    )
  }

  const where = and(...conditions)

  const [{ total }] = await db.select({ total: count() }).from(samples).where(where)

  const rows = await db
    .select({
      id: samples.id,
      code: samples.code,
      type: samples.type,
      source: samples.source,
      status: samples.status,
      notes: samples.notes,
      receivedAt: samples.receivedAt,
      createdAt: samples.createdAt,
      updatedAt: samples.updatedAt,
      receivedById: samples.receivedById,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(samples)
    .leftJoin(users, eq(samples.receivedById, users.id))
    .where(where)
    .orderBy(desc(samples.receivedAt))
    .limit(input.limit)
    .offset(offset)

  const data = rows.map((r) => ({
    id: r.id,
    code: r.code,
    type: r.type,
    source: r.source,
    status: r.status,
    notes: r.notes,
    receivedAt: r.receivedAt,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    receivedBy: { id: r.receivedById, firstName: r.firstName ?? '', lastName: r.lastName ?? '' },
  }))

  return { data, meta: { page: input.page, limit: input.limit, total: Number(total) } }
}

export async function getById(id: string) {
  const [row] = await db
    .select({
      id: samples.id,
      code: samples.code,
      type: samples.type,
      source: samples.source,
      status: samples.status,
      notes: samples.notes,
      receivedAt: samples.receivedAt,
      createdAt: samples.createdAt,
      updatedAt: samples.updatedAt,
      receivedById: samples.receivedById,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(samples)
    .leftJoin(users, eq(samples.receivedById, users.id))
    .where(and(eq(samples.id, id), isNull(samples.deletedAt)))
    .limit(1)

  if (!row) throw new AppError(404, 'NIJE_PRONAĐENO', 'Uzorak nije pronađen.')

  const events = await db
    .select({
      id: sampleEvents.id,
      sampleId: sampleEvents.sampleId,
      eventType: sampleEvents.eventType,
      oldStatus: sampleEvents.oldStatus,
      newStatus: sampleEvents.newStatus,
      notes: sampleEvents.notes,
      createdAt: sampleEvents.createdAt,
      userId: sampleEvents.userId,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(sampleEvents)
    .leftJoin(users, eq(sampleEvents.userId, users.id))
    .where(eq(sampleEvents.sampleId, id))
    .orderBy(desc(sampleEvents.createdAt))

  return {
    sample: {
      id: row.id,
      code: row.code,
      type: row.type,
      source: row.source,
      status: row.status,
      notes: row.notes,
      receivedAt: row.receivedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      receivedBy: { id: row.receivedById, firstName: row.firstName ?? '', lastName: row.lastName ?? '' },
    },
    events: events.map((e) => ({
      id: e.id,
      sampleId: e.sampleId,
      eventType: e.eventType,
      oldStatus: e.oldStatus,
      newStatus: e.newStatus,
      notes: e.notes,
      createdAt: e.createdAt,
      user: e.userId
        ? { id: e.userId, firstName: e.firstName ?? '', lastName: e.lastName ?? '' }
        : undefined,
    })),
  }
}

export async function create(input: CreateSampleInput, userId: string, ip?: string) {
  const code = await generateCode()

  const [sample] = await db
    .insert(samples)
    .values({ code, type: input.type, source: input.source, notes: input.notes, receivedById: userId })
    .returning()

  await db.insert(sampleEvents).values({
    sampleId: sample.id,
    userId,
    eventType: 'created',
    newStatus: 'received',
    notes: input.notes,
  })

  await writeAuditLog({ userId, action: 'INSERT', tableName: 'samples', recordId: sample.id, newValue: sample, ipAddress: ip })

  return sample
}

export async function updateStatus(
  id: string,
  input: UpdateStatusInput,
  userId: string,
  ip?: string,
) {
  const [sample] = await db
    .select()
    .from(samples)
    .where(and(eq(samples.id, id), isNull(samples.deletedAt)))
    .limit(1)

  if (!sample) throw new AppError(404, 'NIJE_PRONAĐENO', 'Uzorak nije pronađen.')

  const allowed = ALLOWED_TRANSITIONS[sample.status]
  if (!allowed.includes(input.status as SampleStatus)) {
    throw new AppError(
      400,
      'NEVAŽEĆI_PRIJELAZ',
      `Nije moguće promijeniti status iz "${sample.status}" u "${input.status}".`,
    )
  }

  const [updated] = await db
    .update(samples)
    .set({ status: input.status as SampleStatus, updatedAt: new Date() })
    .where(eq(samples.id, id))
    .returning()

  await db.insert(sampleEvents).values({
    sampleId: id,
    userId,
    eventType: 'status_change',
    oldStatus: sample.status,
    newStatus: input.status as SampleStatus,
    notes: input.notes,
  })

  await writeAuditLog({
    userId, action: 'UPDATE', tableName: 'samples', recordId: id,
    oldValue: { status: sample.status }, newValue: { status: input.status }, ipAddress: ip,
  })

  return updated
}

export async function addNote(id: string, notes: string, userId: string) {
  const [sample] = await db
    .select({ id: samples.id })
    .from(samples)
    .where(and(eq(samples.id, id), isNull(samples.deletedAt)))
    .limit(1)

  if (!sample) throw new AppError(404, 'NIJE_PRONAĐENO', 'Uzorak nije pronađen.')

  const [event] = await db
    .insert(sampleEvents)
    .values({ sampleId: id, userId, eventType: 'note_added', notes })
    .returning()

  return event
}

export async function softDelete(id: string, userId: string, ip?: string) {
  const [sample] = await db
    .select({ id: samples.id })
    .from(samples)
    .where(and(eq(samples.id, id), isNull(samples.deletedAt)))
    .limit(1)

  if (!sample) throw new AppError(404, 'NIJE_PRONAĐENO', 'Uzorak nije pronađen.')

  await db.update(samples).set({ deletedAt: new Date() }).where(eq(samples.id, id))
  await writeAuditLog({ userId, action: 'DELETE', tableName: 'samples', recordId: id, ipAddress: ip })
}
