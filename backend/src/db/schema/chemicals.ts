import { pgTable, uuid, varchar, text, numeric, date, timestamp, boolean, integer } from 'drizzle-orm/pg-core'
import { users } from './users'

export const chemicals = pgTable('chemicals', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  casNumber: varchar('cas_number', { length: 20 }),
  manufacturer: varchar('manufacturer', { length: 255 }),
  batchNumber: varchar('batch_number', { length: 100 }),
  purchaseDate: date('purchase_date').notNull(),
  expiryDate: date('expiry_date').notNull(),
  quantity: numeric('quantity', { precision: 10, scale: 3 }).notNull(),
  unit: varchar('unit', { length: 20 }).notNull(),
  minQuantity: numeric('min_quantity', { precision: 10, scale: 3 }).notNull().default('0'),
  storageLocation: varchar('storage_location', { length: 255 }).notNull(),
  storageTempMin: integer('storage_temp_min'),
  storageTempMax: integer('storage_temp_max'),
  ghsClasses: text('ghs_classes').array(),
  sdsUrl: varchar('sds_url', { length: 500 }),
  notes: text('notes'),
  addedById: uuid('added_by_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
})

export type Chemical = typeof chemicals.$inferSelect
export type NewChemical = typeof chemicals.$inferInsert
