# LIMS — Laboratorijski informacijski sustav

Pristupačan LIMS za male laboratorije — škole, fakultetske praktikume, male privatne laboratorije i startup laboratorije.

## Funkcionalnosti

| Modul | Opis |
|---|---|
| **Uzorci** | Registracija s QR kodom, status lifecycle, audit trail |
| **Kemikalije** | GHS klasifikacija, praćenje rokova, alertovi |
| **Protokoli** | SOP predlošci s verzioniranjem, eksperimenti |
| **Izvještaji** | CSV export, PDF ispis, sljedivost uzorka |
| **Korisnici** | Admin, laborant, promatrač |

## Brzi početak (Docker)

```bash
git clone https://github.com/PinkMeNow/small-medium-lims.git
cd small-medium-lims

cp backend/.env.example backend/.env
# Uredite backend/.env s JWT secretima

docker compose up -d
docker compose exec backend npm run db:push
docker compose exec backend npm run db:seed
```

Otvorite `http://localhost` — prijava: `admin@lims.hr` / `Admin123!`

## Lokalni razvoj

```bash
# Backend
cd backend && cp .env.example .env
npm install && npm run db:push && npm run db:seed && npm run dev

# Frontend (u novom terminalu)
cd frontend && cp .env.example .env
npm install && npm run dev
```

Frontend bez backsenda automatski koristi MSW mock s testnim podacima.

## Environment varijable (backend/.env)

| Varijabla | Opis | Obavezno |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Da |
| `JWT_SECRET` | Secret za access token (min 32 znaka) | Da |
| `JWT_REFRESH_SECRET` | Secret za refresh token (min 32 znaka) | Da |
| `SMTP_HOST` | SMTP server za email alertove | Ne |
| `SMTP_USER` / `SMTP_PASS` | SMTP auth | Ne |
| `ALERT_RECIPIENTS` | Primatelji alertova (comma-separated) | Ne |
| `ALERT_INTERVAL_HOURS` | Frekvencija provjere (default: 24) | Ne |

## Tech stack

- **Frontend:** React 19 + Vite + TypeScript + HeroUI/Pro + TanStack Query + Zustand
- **Backend:** Node.js 22 + Express 5 + TypeScript + Drizzle ORM
- **Baza:** PostgreSQL 16
- **Auth:** JWT (access 15min + refresh 7d, httpOnly cookie)
- **Infra:** Docker + Docker Compose + Nginx
