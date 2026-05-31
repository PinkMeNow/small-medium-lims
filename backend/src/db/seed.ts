import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { users } from './schema/index'
import * as schema from './schema/index'

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const db = drizzle(pool, { schema })

  console.log('🌱 Pokretanje seeda...')

  const passwordHash = await bcrypt.hash('Admin123!', 12)

  const [admin] = await db.insert(users).values({
    firstName: 'Admin',
    lastName: 'LIMS',
    email: 'admin@lims.hr',
    passwordHash,
    role: 'admin',
    isActive: true,
  }).onConflictDoNothing().returning()

  if (admin) {
    console.log('✅ Admin korisnik kreiran:')
    console.log('   Email:   admin@lims.hr')
    console.log('   Lozinka: Admin123!')
    console.log('   ⚠  Promijenite lozinku pri prvom prijavljuju!')
  } else {
    console.log('ℹ  Admin korisnik već postoji (preskočeno).')
  }

  await pool.end()
}

seed().catch((err) => { console.error('❌ Seed greška:', err); process.exit(1) })
