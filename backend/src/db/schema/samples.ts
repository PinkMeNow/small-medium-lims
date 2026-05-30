import { pgTable, uuid, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './users'

export const sampleStatusEnum = pgEnum('sample_status', [
  'received',
  'processing',
  'analysed',
  'archived',
  'destroyed',
])

export const samples = pgTable('samples', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  type: varchar('type', { length: 100 }).notNull(),
  source: varchar('source', { length: 255 }).notNull(),
  status: sampleStatusEnum('status').notNull().default('received'),
  notes: text('notes'),
  receivedById: uuid('received_by_id').notNull().references(() => users.id),
  receivedAt: timestamp('received_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
})

export const sampleEvents = pgTable('sample_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  sampleId: uuid('sample_id').notNull().references(() => samples.id),
  userId: uuid('user_id').references(() => users.id),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  oldStatus: sampleStatusEnum('old_status'),
  newStatus: sampleStatusEnum('new_status'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type Sample = typeof samples.$inferSelect
export type NewSample = typeof samples.$inferInsert
export type SampleStatus = (typeof sampleStatusEnum.enumValues)[number]
export type SampleEvent = typeof sampleEvents.$inferSelect
