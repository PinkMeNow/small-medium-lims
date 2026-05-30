import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../lib/env'
import { AppError } from './error'
import type { User } from '../db/schema/index'

export type AuthUser = Pick<User, 'id' | 'role' | 'email' | 'firstName' | 'lastName'>

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    throw new AppError(401, 'NIJE_AUTORIZIRAN', 'Niste prijavljeni.')
  }
  try {
    req.user = jwt.verify(header.slice(7), env.JWT_SECRET) as AuthUser
    next()
  } catch {
    throw new AppError(401, 'NEVAŽEĆI_TOKEN', 'Token je nevažeći ili je istekao.')
  }
}

export function requireRole(...roles: User['role'][]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError(403, 'NEDOZVOLJENO', 'Nemate ovlasti za ovu radnju.')
    }
    next()
  }
}
