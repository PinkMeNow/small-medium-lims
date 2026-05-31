import nodemailer from 'nodemailer'
import { env } from './env'

// Create transporter lazily — only if SMTP is configured
let _transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (_transporter) return _transporter

  if (!env.SMTP_HOST || !env.SMTP_USER) return null

  _transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT ?? 587),
    secure: Number(env.SMTP_PORT) === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  })

  return _transporter
}

export async function sendAlertEmail(opts: {
  to: string
  subject: string
  html: string
}) {
  const t = getTransporter()
  if (!t) {
    console.warn('[email] SMTP nije konfiguriran — email nije poslan.')
    return false
  }
  try {
    await t.sendMail({
      from: `"LIMS Sustav" <${env.SMTP_USER}>`,
      ...opts,
    })
    return true
  } catch (err) {
    console.error('[email] Greška pri slanju:', err)
    return false
  }
}

function chemicalAlertHtml(items: { name: string; reason: string; location: string }[]): string {
  const rows = items
    .map(i => `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee">${i.name}</td><td style="padding:6px 12px;border-bottom:1px solid #eee">${i.reason}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;color:#888">${i.location}</td></tr>`)
    .join('')

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#007BCC">⚗ LIMS — Upozorenja o kemikalijama</h2>
      <p>Sljedeće kemikalije zahtijevaju vašu pažnju:</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <thead>
          <tr style="background:#f5f5f5">
            <th style="padding:8px 12px;text-align:left">Naziv</th>
            <th style="padding:8px 12px;text-align:left">Razlog</th>
            <th style="padding:8px 12px;text-align:left">Lokacija</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="color:#888;font-size:12px;margin-top:24px">
        Generirano automatski — LIMS sustav
      </p>
    </div>
  `
}

export async function sendChemicalAlerts(
  alertItems: { name: string; reason: string; location: string }[],
  recipientEmails: string[],
) {
  if (!alertItems.length || !recipientEmails.length) return

  const html = chemicalAlertHtml(alertItems)
  const subject = `LIMS: ${alertItems.length} kemikalij${alertItems.length === 1 ? 'a' : 'e'} zahtijeva pažnju`

  for (const to of recipientEmails) {
    await sendAlertEmail({ to, subject, html })
  }
}
