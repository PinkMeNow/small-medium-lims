import { eq, and, isNull, ilike, or, count, desc } from 'drizzle-orm'
import { db } from '../../db/index'
import { protocols, protocolVersions, experiments, users } from '../../db/schema/index'
import { AppError } from '../../middleware/error'
import { writeAuditLog } from '../../middleware/audit'
import type {
  CreateProtocolInput, NewVersionInput, CreateExperimentInput,
  CompleteExperimentInput, ListProtocolsInput, ListExperimentsInput,
} from './protocols.schema'

function bumpMinor(version: string): string {
  const [major, minor] = version.split('.').map(Number)
  return `${major}.${(minor ?? 0) + 1}.0`
}

// ─── Protocols ───────────────────────────────────────────────────────────────

export async function listProtocols(input: ListProtocolsInput) {
  const offset = (input.page - 1) * input.limit
  const conditions = [isNull(protocols.deletedAt), eq(protocols.isActive, true)]
  if (input.search) {
    conditions.push(or(ilike(protocols.name, `%${input.search}%`), ilike(protocols.category, `%${input.search}%`))!)
  }
  if (input.category) conditions.push(ilike(protocols.category, `%${input.category}%`))
  const where = and(...conditions)

  const [{ total }] = await db.select({ total: count() }).from(protocols).where(where)

  const rows = await db
    .select({
      id: protocols.id,
      name: protocols.name,
      description: protocols.description,
      category: protocols.category,
      currentVersion: protocols.currentVersion,
      isActive: protocols.isActive,
      createdAt: protocols.createdAt,
      updatedAt: protocols.updatedAt,
      createdById: protocols.createdById,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(protocols)
    .leftJoin(users, eq(protocols.createdById, users.id))
    .where(where)
    .orderBy(desc(protocols.createdAt))
    .limit(input.limit)
    .offset(offset)

  // Get experiment counts per protocol
  const ids = rows.map((r) => r.id)
  const expCounts: Record<string, number> = {}
  if (ids.length > 0) {
    const counts = await db
      .select({ protocolId: experiments.protocolId, cnt: count() })
      .from(experiments)
      .where(and(...ids.map((id) => eq(experiments.protocolId, id))))
      .groupBy(experiments.protocolId)
    counts.forEach((c) => { expCounts[c.protocolId] = Number(c.cnt) })
  }

  const data = rows.map((r) => ({
    id: r.id, name: r.name, description: r.description ?? undefined,
    category: r.category ?? undefined, currentVersion: r.currentVersion,
    isActive: r.isActive, createdAt: r.createdAt, updatedAt: r.updatedAt,
    createdBy: { id: r.createdById, firstName: r.firstName ?? '', lastName: r.lastName ?? '' },
    experimentCount: expCounts[r.id] ?? 0,
  }))

  return { data, meta: { page: input.page, limit: input.limit, total: Number(total) } }
}

export async function getProtocolById(id: string) {
  const [row] = await db
    .select({
      id: protocols.id, name: protocols.name, description: protocols.description,
      category: protocols.category, currentVersion: protocols.currentVersion,
      isActive: protocols.isActive, createdAt: protocols.createdAt, updatedAt: protocols.updatedAt,
      createdById: protocols.createdById, firstName: users.firstName, lastName: users.lastName,
    })
    .from(protocols)
    .leftJoin(users, eq(protocols.createdById, users.id))
    .where(and(eq(protocols.id, id), isNull(protocols.deletedAt)))
    .limit(1)

  if (!row) throw new AppError(404, 'NIJE_PRONAĐENO', 'Protokol nije pronađen.')

  const versions = await db
    .select()
    .from(protocolVersions)
    .where(eq(protocolVersions.protocolId, id))
    .orderBy(desc(protocolVersions.createdAt))

  const exps = await db
    .select({
      id: experiments.id, protocolId: experiments.protocolId,
      protocolVersionId: experiments.protocolVersionId,
      title: experiments.title, status: experiments.status,
      startedAt: experiments.startedAt, completedAt: experiments.completedAt,
      results: experiments.results, notes: experiments.notes, createdAt: experiments.createdAt,
      operatorId: experiments.operatorId, firstName: users.firstName, lastName: users.lastName,
    })
    .from(experiments)
    .leftJoin(users, eq(experiments.operatorId, users.id))
    .where(eq(experiments.protocolId, id))
    .orderBy(desc(experiments.createdAt))

  return {
    protocol: {
      id: row.id, name: row.name, description: row.description ?? undefined,
      category: row.category ?? undefined, currentVersion: row.currentVersion,
      isActive: row.isActive, createdAt: row.createdAt, updatedAt: row.updatedAt,
      createdBy: { id: row.createdById, firstName: row.firstName ?? '', lastName: row.lastName ?? '' },
    },
    versions,
    experiments: exps.map((e) => ({
      ...e,
      operator: { id: e.operatorId, firstName: e.firstName ?? '', lastName: e.lastName ?? '' },
    })),
  }
}

export async function createProtocol(input: CreateProtocolInput, userId: string, ip?: string) {
  const [protocol] = await db
    .insert(protocols)
    .values({ name: input.name, description: input.description, category: input.category, createdById: userId })
    .returning()

  const [version] = await db
    .insert(protocolVersions)
    .values({
      protocolId: protocol.id,
      version: '1.0.0',
      steps: input.steps,
      requiredMaterials: input.requiredMaterials,
      requiredEquipment: input.requiredEquipment,
      expectedResults: input.expectedResults,
      notes: input.notes,
      createdById: userId,
    })
    .returning()

  await writeAuditLog({ userId, action: 'INSERT', tableName: 'protocols', recordId: protocol.id, newValue: protocol, ipAddress: ip })
  return { protocol, version }
}

export async function addVersion(id: string, input: NewVersionInput, userId: string, ip?: string) {
  const [protocol] = await db
    .select()
    .from(protocols)
    .where(and(eq(protocols.id, id), isNull(protocols.deletedAt)))
    .limit(1)

  if (!protocol) throw new AppError(404, 'NIJE_PRONAĐENO', 'Protokol nije pronađen.')

  const newVersion = bumpMinor(protocol.currentVersion)

  const [version] = await db
    .insert(protocolVersions)
    .values({ protocolId: id, version: newVersion, steps: input.steps, requiredMaterials: input.requiredMaterials, requiredEquipment: input.requiredEquipment, expectedResults: input.expectedResults, notes: input.notes, createdById: userId })
    .returning()

  await db.update(protocols).set({ currentVersion: newVersion, updatedAt: new Date() }).where(eq(protocols.id, id))
  await writeAuditLog({ userId, action: 'UPDATE', tableName: 'protocols', recordId: id, newValue: { version: newVersion }, ipAddress: ip })

  return version
}

// ─── Experiments ─────────────────────────────────────────────────────────────

export async function listExperiments(input: ListExperimentsInput) {
  const offset = (input.page - 1) * input.limit
  const conditions: any[] = []
  if (input.protocolId) conditions.push(eq(experiments.protocolId, input.protocolId))
  if (input.status) conditions.push(eq(experiments.status, input.status as any))
  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [{ total }] = await db.select({ total: count() }).from(experiments).where(where)

  const rows = await db
    .select({
      id: experiments.id, protocolId: experiments.protocolId,
      protocolVersionId: experiments.protocolVersionId,
      title: experiments.title, status: experiments.status,
      startedAt: experiments.startedAt, completedAt: experiments.completedAt,
      results: experiments.results, notes: experiments.notes, createdAt: experiments.createdAt,
      operatorId: experiments.operatorId,
      firstName: users.firstName, lastName: users.lastName,
      protocolName: protocols.name, protocolVersion: protocolVersions.version,
    })
    .from(experiments)
    .leftJoin(users, eq(experiments.operatorId, users.id))
    .leftJoin(protocols, eq(experiments.protocolId, protocols.id))
    .leftJoin(protocolVersions, eq(experiments.protocolVersionId, protocolVersions.id))
    .where(where)
    .orderBy(desc(experiments.createdAt))
    .limit(input.limit)
    .offset(offset)

  const data = rows.map((r) => ({
    id: r.id, protocolId: r.protocolId, protocolVersionId: r.protocolVersionId,
    title: r.title, status: r.status, startedAt: r.startedAt,
    completedAt: r.completedAt ?? undefined, results: r.results ?? undefined,
    notes: r.notes ?? undefined, createdAt: r.createdAt,
    operator: { id: r.operatorId, firstName: r.firstName ?? '', lastName: r.lastName ?? '' },
    protocolName: r.protocolName ?? undefined, protocolVersion: r.protocolVersion ?? undefined,
  }))

  return { data, meta: { page: input.page, limit: input.limit, total: Number(total) } }
}

export async function createExperiment(input: CreateExperimentInput, userId: string) {
  const [protocol] = await db
    .select({ id: protocols.id, currentVersion: protocols.currentVersion })
    .from(protocols)
    .where(and(eq(protocols.id, input.protocolId), isNull(protocols.deletedAt)))
    .limit(1)

  if (!protocol) throw new AppError(404, 'NIJE_PRONAĐENO', 'Protokol nije pronađen.')

  const [currentVersionRecord] = await db
    .select({ id: protocolVersions.id })
    .from(protocolVersions)
    .where(and(eq(protocolVersions.protocolId, input.protocolId), eq(protocolVersions.version, protocol.currentVersion)))
    .limit(1)

  if (!currentVersionRecord) throw new AppError(500, 'GREŠKA', 'Verzija protokola nije pronađena.')

  const [experiment] = await db
    .insert(experiments)
    .values({ protocolId: input.protocolId, protocolVersionId: currentVersionRecord.id, title: input.title, notes: input.notes, operatorId: userId })
    .returning()

  return experiment
}

export async function completeExperiment(id: string, input: CompleteExperimentInput, userId: string) {
  const [exp] = await db.select().from(experiments).where(eq(experiments.id, id)).limit(1)
  if (!exp) throw new AppError(404, 'NIJE_PRONAĐENO', 'Eksperiment nije pronađen.')
  if (exp.status === 'completed') throw new AppError(400, 'GREŠKA', 'Eksperiment je već završen.')

  const [updated] = await db
    .update(experiments)
    .set({ status: 'completed', results: input.results, notes: input.notes ?? exp.notes, completedAt: new Date(), updatedAt: new Date() })
    .where(eq(experiments.id, id))
    .returning()

  await writeAuditLog({ userId, action: 'UPDATE', tableName: 'experiments', recordId: id, newValue: { status: 'completed' } })
  return updated
}

export async function cancelExperiment(id: string, userId: string) {
  const [exp] = await db.select({ id: experiments.id, status: experiments.status }).from(experiments).where(eq(experiments.id, id)).limit(1)
  if (!exp) throw new AppError(404, 'NIJE_PRONAĐENO', 'Eksperiment nije pronađen.')
  if (exp.status === 'completed') throw new AppError(400, 'GREŠKA', 'Završen eksperiment se ne može otkazati.')

  const [updated] = await db.update(experiments).set({ status: 'cancelled', updatedAt: new Date() }).where(eq(experiments.id, id)).returning()
  await writeAuditLog({ userId, action: 'UPDATE', tableName: 'experiments', recordId: id, newValue: { status: 'cancelled' } })
  return updated
}
