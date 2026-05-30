import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { eq, and, gt } from 'drizzle-orm'
import { db } from '../../db/index'
import { users, refreshTokens } from '../../db/schema/index'
import { env } from '../../lib/env'
import { AppError } from '../../middleware/error'
import type { AuthUser } from '../../middleware/auth'
import type { LoginInput } from './auth.schema'

const ACCESS_TTL = '15m'
const REFRESH_TTL_DAYS = 7

function signAccess(payload: AuthUser) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: ACCESS_TTL })
}

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function login(input: LoginInput) {
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, input.email), eq(users.isActive, true)))
    .limit(1)

  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AppError(401, 'POGREŠNI_PODACI', 'Pogrešan email ili lozinka.')
  }

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  }

  const accessToken = signAccess(authUser)
  const rawRefresh = crypto.randomBytes(64).toString('hex')
  const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 86_400_000)

  await db.insert(refreshTokens).values({
    userId: user.id,
    tokenHash: hashToken(rawRefresh),
    expiresAt,
  })

  return { accessToken, refreshToken: rawRefresh, user: authUser }
}

export async function refresh(rawToken: string) {
  const [stored] = await db
    .select({ id: refreshTokens.id, userId: refreshTokens.userId })
    .from(refreshTokens)
    .where(
      and(
        eq(refreshTokens.tokenHash, hashToken(rawToken)),
        gt(refreshTokens.expiresAt, new Date()),
      ),
    )
    .limit(1)

  if (!stored) throw new AppError(401, 'NEVAŽEĆI_TOKEN', 'Token je nevažeći ili je istekao.')

  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, stored.userId), eq(users.isActive, true)))
    .limit(1)

  if (!user) throw new AppError(401, 'NEVAŽEĆI_TOKEN', 'Korisnički račun nije pronađen.')

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  }

  return { accessToken: signAccess(authUser), user: authUser }
}

export async function logout(rawToken: string) {
  await db
    .delete(refreshTokens)
    .where(eq(refreshTokens.tokenHash, hashToken(rawToken)))
}
