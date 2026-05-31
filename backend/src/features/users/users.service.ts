import bcrypt from 'bcryptjs'
import { eq, isNull, and, ne, count } from 'drizzle-orm'
import { db } from '../../db/index'
import { users } from '../../db/schema/index'
import { AppError } from '../../middleware/error'
import { writeAuditLog } from '../../middleware/audit'
import type { CreateUserInput, UpdateUserInput } from './users.schema'

function mapUser(u: typeof users.$inferSelect) {
  return {
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }
}

export async function list() {
  const rows = await db
    .select()
    .from(users)
    .orderBy(users.lastName, users.firstName)
  return rows.map(mapUser)
}

export async function getById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  if (!user) throw new AppError(404, 'NIJE_PRONAĐENO', 'Korisnik nije pronađen.')
  return mapUser(user)
}

export async function create(input: CreateUserInput, requesterId: string, ip?: string) {
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, input.email)).limit(1)
  if (existing) throw new AppError(409, 'DUPLIKAT', 'Korisnik s tim emailom već postoji.')

  const passwordHash = await bcrypt.hash(input.password, 12)
  const [user] = await db.insert(users).values({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    passwordHash,
    role: input.role,
  }).returning()

  await writeAuditLog({ userId: requesterId, action: 'INSERT', tableName: 'users', recordId: user.id, newValue: { email: user.email, role: user.role }, ipAddress: ip })
  return mapUser(user)
}

export async function update(id: string, input: UpdateUserInput, requesterId: string, ip?: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  if (!user) throw new AppError(404, 'NIJE_PRONAĐENO', 'Korisnik nije pronađen.')

  if (input.email && input.email !== user.email) {
    const [dup] = await db.select({ id: users.id }).from(users)
      .where(and(eq(users.email, input.email), ne(users.id, id))).limit(1)
    if (dup) throw new AppError(409, 'DUPLIKAT', 'Email je već u upotrebi.')
  }

  const updateData: Partial<typeof users.$inferInsert> = { updatedAt: new Date() }
  if (input.firstName !== undefined) updateData.firstName = input.firstName
  if (input.lastName !== undefined) updateData.lastName = input.lastName
  if (input.email !== undefined) updateData.email = input.email
  if (input.role !== undefined) updateData.role = input.role
  if (input.isActive !== undefined) updateData.isActive = input.isActive
  if (input.password) updateData.passwordHash = await bcrypt.hash(input.password, 12)

  const [updated] = await db.update(users).set(updateData).where(eq(users.id, id)).returning()
  await writeAuditLog({ userId: requesterId, action: 'UPDATE', tableName: 'users', recordId: id, newValue: { role: updated.role, isActive: updated.isActive }, ipAddress: ip })
  return mapUser(updated)
}

export async function toggleActive(id: string, requesterId: string, ip?: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  if (!user) throw new AppError(404, 'NIJE_PRONAĐENO', 'Korisnik nije pronađen.')
  if (id === requesterId) throw new AppError(400, 'GREŠKA', 'Ne možete deaktivirati vlastiti račun.')

  const [updated] = await db.update(users)
    .set({ isActive: !user.isActive, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning()

  await writeAuditLog({ userId: requesterId, action: 'UPDATE', tableName: 'users', recordId: id, newValue: { isActive: updated.isActive }, ipAddress: ip })
  return mapUser(updated)
}
