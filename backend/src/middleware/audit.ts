import { db } from '../db/index'
import { auditLog } from '../db/schema/index'

export async function writeAuditLog(opts: {
  userId?: string
  action: string
  tableName: string
  recordId?: string
  oldValue?: unknown
  newValue?: unknown
  ipAddress?: string
}) {
  await db.insert(auditLog).values({
    userId: opts.userId,
    action: opts.action,
    tableName: opts.tableName,
    recordId: opts.recordId,
    oldValue: opts.oldValue as any,
    newValue: opts.newValue as any,
    ipAddress: opts.ipAddress,
  })
}
