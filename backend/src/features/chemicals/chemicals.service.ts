import { eq, and, isNull, ilike, or, count, desc, lte, sql } from 'drizzle-orm'
import { db } from '../../db/index'
import { chemicals, users } from '../../db/schema/index'
import { AppError } from '../../middleware/error'
import { writeAuditLog } from '../../middleware/audit'
import type { CreateChemicalInput, UpdateChemicalInput, ListChemicalsInput } from './chemicals.schema'

function mapRow(r: any) {
  return {
    id: r.id,
    name: r.name,
    casNumber: r.casNumber ?? undefined,
    manufacturer: r.manufacturer ?? undefined,
    batchNumber: r.batchNumber ?? undefined,
    purchaseDate: r.purchaseDate,
    expiryDate: r.expiryDate,
    quantity: Number(r.quantity),
    unit: r.unit,
    minQuantity: Number(r.minQuantity),
    storageLocation: r.storageLocation,
    storageTempMin: r.storageTempMin ?? undefined,
    storageTempMax: r.storageTempMax ?? undefined,
    ghsClasses: r.ghsClasses ?? [],
    sdsUrl: r.sdsUrl ?? undefined,
    notes: r.notes ?? undefined,
    addedBy: { id: r.addedById, firstName: r.firstName ?? '', lastName: r.lastName ?? '' },
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

const baseSelect = {
  id: chemicals.id,
  name: chemicals.name,
  casNumber: chemicals.casNumber,
  manufacturer: chemicals.manufacturer,
  batchNumber: chemicals.batchNumber,
  purchaseDate: chemicals.purchaseDate,
  expiryDate: chemicals.expiryDate,
  quantity: chemicals.quantity,
  unit: chemicals.unit,
  minQuantity: chemicals.minQuantity,
  storageLocation: chemicals.storageLocation,
  storageTempMin: chemicals.storageTempMin,
  storageTempMax: chemicals.storageTempMax,
  ghsClasses: chemicals.ghsClasses,
  sdsUrl: chemicals.sdsUrl,
  notes: chemicals.notes,
  createdAt: chemicals.createdAt,
  updatedAt: chemicals.updatedAt,
  addedById: chemicals.addedById,
  firstName: users.firstName,
  lastName: users.lastName,
}

export async function list(input: ListChemicalsInput) {
  const offset = (input.page - 1) * input.limit

  const conditions = [isNull(chemicals.deletedAt)]

  if (input.search) {
    conditions.push(
      or(
        ilike(chemicals.name, `%${input.search}%`),
        ilike(chemicals.casNumber, `%${input.search}%`),
        ilike(chemicals.storageLocation, `%${input.search}%`),
      )!,
    )
  }

  if (input.alert === 'expired') {
    conditions.push(sql`${chemicals.expiryDate}::date < CURRENT_DATE`)
  } else if (input.alert === 'expiring_soon') {
    conditions.push(
      sql`${chemicals.expiryDate}::date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'`,
    )
  } else if (input.alert === 'low_stock') {
    conditions.push(sql`${chemicals.quantity}::numeric <= ${chemicals.minQuantity}::numeric AND ${chemicals.minQuantity}::numeric > 0`)
  }

  const where = and(...conditions)

  const [{ total }] = await db.select({ total: count() }).from(chemicals).where(where)

  const rows = await db
    .select(baseSelect)
    .from(chemicals)
    .leftJoin(users, eq(chemicals.addedById, users.id))
    .where(where)
    .orderBy(desc(chemicals.createdAt))
    .limit(input.limit)
    .offset(offset)

  return { data: rows.map(mapRow), meta: { page: input.page, limit: input.limit, total: Number(total) } }
}

export async function getById(id: string) {
  const [row] = await db
    .select(baseSelect)
    .from(chemicals)
    .leftJoin(users, eq(chemicals.addedById, users.id))
    .where(and(eq(chemicals.id, id), isNull(chemicals.deletedAt)))
    .limit(1)

  if (!row) throw new AppError(404, 'NIJE_PRONAĐENO', 'Kemikalija nije pronađena.')
  return { chemical: mapRow(row) }
}

export async function create(input: CreateChemicalInput, userId: string, ip?: string) {
  const [chemical] = await db
    .insert(chemicals)
    .values({
      name: input.name,
      casNumber: input.casNumber,
      manufacturer: input.manufacturer,
      batchNumber: input.batchNumber,
      purchaseDate: input.purchaseDate,
      expiryDate: input.expiryDate,
      quantity: String(input.quantity),
      unit: input.unit,
      minQuantity: String(input.minQuantity ?? 0),
      storageLocation: input.storageLocation,
      storageTempMin: input.storageTempMin as number | undefined,
      storageTempMax: input.storageTempMax as number | undefined,
      ghsClasses: input.ghsClasses,
      sdsUrl: input.sdsUrl,
      notes: input.notes,
      addedById: userId,
    })
    .returning()

  await writeAuditLog({ userId, action: 'INSERT', tableName: 'chemicals', recordId: chemical.id, newValue: chemical, ipAddress: ip })
  return chemical
}

export async function update(id: string, input: UpdateChemicalInput, userId: string, ip?: string) {
  const [existing] = await db
    .select({ id: chemicals.id })
    .from(chemicals)
    .where(and(eq(chemicals.id, id), isNull(chemicals.deletedAt)))
    .limit(1)

  if (!existing) throw new AppError(404, 'NIJE_PRONAĐENO', 'Kemikalija nije pronađena.')

  const updateData: Record<string, unknown> = { updatedAt: new Date() }
  if (input.name !== undefined) updateData.name = input.name
  if (input.casNumber !== undefined) updateData.casNumber = input.casNumber
  if (input.manufacturer !== undefined) updateData.manufacturer = input.manufacturer
  if (input.batchNumber !== undefined) updateData.batchNumber = input.batchNumber
  if (input.purchaseDate !== undefined) updateData.purchaseDate = input.purchaseDate
  if (input.expiryDate !== undefined) updateData.expiryDate = input.expiryDate
  if (input.quantity !== undefined) updateData.quantity = String(input.quantity)
  if (input.unit !== undefined) updateData.unit = input.unit
  if (input.minQuantity !== undefined) updateData.minQuantity = String(input.minQuantity)
  if (input.storageLocation !== undefined) updateData.storageLocation = input.storageLocation
  if (input.storageTempMin !== undefined) updateData.storageTempMin = input.storageTempMin
  if (input.storageTempMax !== undefined) updateData.storageTempMax = input.storageTempMax
  if (input.ghsClasses !== undefined) updateData.ghsClasses = input.ghsClasses
  if (input.sdsUrl !== undefined) updateData.sdsUrl = input.sdsUrl
  if (input.notes !== undefined) updateData.notes = input.notes

  const [updated] = await db
    .update(chemicals)
    .set(updateData as any)
    .where(eq(chemicals.id, id))
    .returning()

  await writeAuditLog({ userId, action: 'UPDATE', tableName: 'chemicals', recordId: id, newValue: updated, ipAddress: ip })
  return updated
}

export async function softDelete(id: string, userId: string, ip?: string) {
  const [existing] = await db
    .select({ id: chemicals.id })
    .from(chemicals)
    .where(and(eq(chemicals.id, id), isNull(chemicals.deletedAt)))
    .limit(1)

  if (!existing) throw new AppError(404, 'NIJE_PRONAĐENO', 'Kemikalija nije pronađena.')

  await db.update(chemicals).set({ deletedAt: new Date() }).where(eq(chemicals.id, id))
  await writeAuditLog({ userId, action: 'DELETE', tableName: 'chemicals', recordId: id, ipAddress: ip })
}

export async function getAlerts() {
  const [expiredRows, expiringSoonRows, lowStockRows] = await Promise.all([
    db.select(baseSelect).from(chemicals).leftJoin(users, eq(chemicals.addedById, users.id))
      .where(and(isNull(chemicals.deletedAt), sql`${chemicals.expiryDate}::date < CURRENT_DATE`))
      .orderBy(chemicals.expiryDate),
    db.select(baseSelect).from(chemicals).leftJoin(users, eq(chemicals.addedById, users.id))
      .where(and(isNull(chemicals.deletedAt), sql`${chemicals.expiryDate}::date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'`))
      .orderBy(chemicals.expiryDate),
    db.select(baseSelect).from(chemicals).leftJoin(users, eq(chemicals.addedById, users.id))
      .where(and(isNull(chemicals.deletedAt), sql`${chemicals.quantity}::numeric <= ${chemicals.minQuantity}::numeric AND ${chemicals.minQuantity}::numeric > 0`)),
  ])

  return {
    expired: expiredRows.map(mapRow),
    expiringSoon: expiringSoonRows.map(mapRow),
    lowStock: lowStockRows.map(mapRow),
  }
}
