import { pgTable, uuid, varchar, text, boolean, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './users'

export interface ProtocolStep {
  stepNumber: number
  title: string
  description: string
}

export const experimentStatusEnum = pgEnum('experiment_status', [
  'planned',
  'in_progress',
  'completed',
  'cancelled',
])

export const protocols = pgTable('protocols', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }),
  currentVersion: varchar('current_version', { length: 20 }).notNull().default('1.0.0'),
  isActive: boolean('is_active').notNull().default(true),
  createdById: uuid('created_by_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
})

export const protocolVersions = pgTable('protocol_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  protocolId: uuid('protocol_id').notNull().references(() => protocols.id),
  version: varchar('version', { length: 20 }).notNull(),
  steps: jsonb('steps').notNull().$type<ProtocolStep[]>(),
  requiredMaterials: text('required_materials').array(),
  requiredEquipment: text('required_equipment').array(),
  expectedResults: text('expected_results'),
  notes: text('notes'),
  createdById: uuid('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const experiments = pgTable('experiments', {
  id: uuid('id').primaryKey().defaultRandom(),
  protocolId: uuid('protocol_id').notNull().references(() => protocols.id),
  protocolVersionId: uuid('protocol_version_id').notNull().references(() => protocolVersions.id),
  title: varchar('title', { length: 255 }).notNull(),
  status: experimentStatusEnum('status').notNull().default('in_progress'),
  operatorId: uuid('operator_id').notNull().references(() => users.id),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
  results: text('results'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type Protocol = typeof protocols.$inferSelect
export type ProtocolVersion = typeof protocolVersions.$inferSelect
export type Experiment = typeof experiments.$inferSelect
export type ExperimentStatus = (typeof experimentStatusEnum.enumValues)[number]
