import { and, isNull, sql } from 'drizzle-orm'
import { db } from '../db/index'
import { chemicals, users } from '../db/schema/index'
import { sendChemicalAlerts } from './email'
import { env } from './env'

async function runAlertCheck() {
  if (!env.SMTP_HOST || !env.ALERT_RECIPIENTS) {
    return // Email not configured — skip silently
  }

  const recipients = env.ALERT_RECIPIENTS.split(',').map(e => e.trim()).filter(Boolean)
  if (!recipients.length) return

  try {
    const alertRows = await db
      .select({
        name: chemicals.name,
        unit: chemicals.unit,
        quantity: chemicals.quantity,
        minQuantity: chemicals.minQuantity,
        expiryDate: chemicals.expiryDate,
        storageLocation: chemicals.storageLocation,
      })
      .from(chemicals)
      .where(
        and(
          isNull(chemicals.deletedAt),
          sql`(
            ${chemicals.expiryDate}::date <= CURRENT_DATE + INTERVAL '7 days'
            OR (${chemicals.quantity}::numeric <= ${chemicals.minQuantity}::numeric AND ${chemicals.minQuantity}::numeric > 0)
          )`,
        ),
      )

    if (!alertRows.length) return

    const today = new Date(); today.setHours(0, 0, 0, 0)

    const alertItems = alertRows.map(r => {
      const daysLeft = Math.ceil((new Date(r.expiryDate).getTime() - today.getTime()) / 86_400_000)
      const isExpired = daysLeft < 0
      const isLowStock = Number(r.quantity) <= Number(r.minQuantity) && Number(r.minQuantity) > 0

      const reasons: string[] = []
      if (isExpired) reasons.push(`Istekao ${Math.abs(daysLeft)} dana`)
      else if (daysLeft <= 7) reasons.push(`Ističe za ${daysLeft} dan${daysLeft === 1 ? '' : 'a'}`)
      if (isLowStock) reasons.push(`Niske zalihe: ${r.quantity} ${r.unit} (min. ${r.minQuantity})`)

      return { name: r.name, reason: reasons.join(' · '), location: r.storageLocation }
    })

    await sendChemicalAlerts(alertItems, recipients)
    console.log(`[alerts] Poslan email upozorenja za ${alertItems.length} kemikalij${alertItems.length === 1 ? 'u' : 'e'}.`)
  } catch (err) {
    console.error('[alerts] Greška pri provjeri:', err)
  }
}

export function startAlertScheduler() {
  const intervalMs = env.ALERT_INTERVAL_HOURS * 3_600_000

  // Run once at startup (after 10s delay)
  setTimeout(runAlertCheck, 10_000)

  // Then repeat on interval
  setInterval(runAlertCheck, intervalMs)

  console.log(`[alerts] Scheduler pokrenut — provjera svakih ${env.ALERT_INTERVAL_HOURS}h`)
}
