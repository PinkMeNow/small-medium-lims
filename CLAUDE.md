# small-medium-lims — Claude Code Guide

## Project overview

**LIMS** (Laboratory Information Management System) for small laboratories — schools, university practicals, small private labs, startup labs. Commercial alternatives (LabWare, STARLIMS, Benchling) cost thousands of euros/year and are over-engineered for this audience. This system is affordable, simple to deploy, and covers the four core needs: sample tracking, chemical inventory, experiment protocols, and compliance reporting.

**Collaborators:** IT student (full technical implementation) + Chemistry student (domain knowledge, validation rules, UX testing, user docs).

---

## Repository structure

```
small-medium-lims/
├── CLAUDE.md
├── README.md
├── docker-compose.yml          # Orchestrates all services
├── docker-compose.dev.yml      # Dev overrides (hot reload, exposed ports)
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── api/                # API client (axios instances, typed fetch)
│   │   ├── components/         # Shared UI components
│   │   ├── features/           # Feature-scoped modules
│   │   │   ├── samples/
│   │   │   ├── chemicals/
│   │   │   ├── protocols/
│   │   │   └── reports/
│   │   ├── hooks/              # Shared React hooks
│   │   ├── lib/                # Utilities, helpers
│   │   ├── pages/              # Route-level components
│   │   ├── stores/             # Zustand stores
│   │   └── types/              # Shared TypeScript types
│   ├── package.json
│   └── vite.config.ts
└── backend/                    # Node.js REST API
    ├── src/
    │   ├── db/                 # Drizzle schema + migrations
    │   ├── features/           # Feature-scoped routers + services
    │   │   ├── samples/
    │   │   ├── chemicals/
    │   │   ├── protocols/
    │   │   └── reports/
    │   ├── middleware/         # Auth, error handling, audit log
    │   └── lib/                # Shared utilities
    ├── package.json
    └── tsconfig.json
```

---

## Tech stack

### Frontend
| Concern | Choice | Reason |
|---|---|---|
| Framework | React 19 + Vite + TypeScript | Fast dev server, strong ecosystem |
| UI library | **HeroUI** + **HeroUI Pro** | Polished accessible components, lab-appropriate density |
| Routing | React Router v7 | Standard, file-or-code routing |
| Server state | TanStack Query v5 | Caching, background refetch, optimistic updates |
| Client state | Zustand | Minimal boilerplate for auth/UI state |
| Forms | React Hook Form + Zod | Performance forms with schema validation |
| Charts | Recharts | Lightweight, composable |
| PDF export | react-pdf / @react-pdf/renderer | Client-side PDF generation for reports |
| Date/time | date-fns | Tree-shakeable, no Moment bloat |
| i18n | react-i18next | Croatian + English out of the box |

### Backend
| Concern | Choice | Reason |
|---|---|---|
| Runtime | Node.js 22 LTS + TypeScript | Shared types with frontend possible |
| Framework | Express 5 | Minimal, well-understood |
| ORM | Drizzle ORM | Type-safe, PostgreSQL-first, fast migrations |
| Auth | JWT (access 15 min + refresh 7 days) + bcrypt | Stateless, supports RBAC |
| Validation | Zod | Schema sharing between FE and BE |
| Email | Nodemailer | Expiry/low-stock alerts |
| File storage | Local FS (dev) → S3-compatible (prod) | SDS PDF attachments |

### Database
| Concern | Choice |
|---|---|
| Engine | PostgreSQL 16 |
| Audit trail | Trigger-based `audit_log` table (who, when, before/after JSON) |
| Migrations | Drizzle Kit (`drizzle-kit push` dev, `drizzle-kit migrate` prod) |

### Infrastructure
| Concern | Choice |
|---|---|
| Containerisation | Docker + Docker Compose |
| Reverse proxy | Nginx (prod) |
| CI | GitHub Actions |
| Secrets | `.env` files (never committed) |

---

## Modules

### Module 1 — Sample management
- Unique ID auto-generated (UUID v4 → printed as QR/barcode)
- Status lifecycle: `RECEIVED → PROCESSING → ANALYSED → ARCHIVED | DESTROYED`
- Full audit trail per sample (immutable event log)
- Search/filter by type, status, date range, responsible person

### Module 2 — Chemical inventory
- Attributes: name, CAS number, manufacturer, purchase date, expiry, current quantity, storage location, GHS classes, SDS file link
- Auto-alerts: low stock (configurable threshold), approaching expiry (30/7/1 day)
- Incompatibility matrix (chemistry student defines rules): warns if incompatible chemicals assigned to same storage location
- GHS pictograms rendered inline

### Module 3 — Protocols & experiments
- SOP templates with step-by-step instructions, required materials, expected outcomes
- Protocol versioning (semver-style) — old experiments stay pinned to the version that ran them
- Experiment records link: protocol version + samples used + chemicals consumed + operator + timestamps + results + notes

### Module 4 — Reports & compliance
- Exportable as PDF and CSV
- Report types: sample throughput, chemical consumption, experiment log, full sample chain-of-custody
- Audit-ready: every data change has timestamp + user

---

## User roles (RBAC)

| Role | Permissions |
|---|---|
| `admin` | All operations + user management + system config |
| `lab_technician` | CRUD on samples, chemicals, experiments; read protocols |
| `viewer` | Read-only across all modules |

---

## Key domain rules (chemistry)

- pH must be 0–14
- Concentration must be > 0
- Temperature range depends on chemical class (set per chemical record)
- GHS incompatibility rules defined in `chemicals/compatibility.ts` (backend) — validated on every storage-location assignment
- Expiry date must be in the future at time of entry
- CAS number format: `XXXXXXX-YY-Z` (validated via regex)

---

## API conventions

- Base URL: `/api/v1`
- Auth: `Authorization: Bearer <access_token>` header
- All timestamps: ISO 8601 UTC
- Pagination: `?page=1&limit=20` → response includes `{ data, meta: { page, limit, total } }`
- Errors: `{ error: { code, message, details? } }`
- Soft deletes: records get `deleted_at` timestamp, never hard-deleted (audit requirement)

---

## HeroUI Pro MCP server

The project ships a `.mcp.json` that registers the HeroUI Pro MCP server. Claude Code picks it up automatically when opened in this directory.

### Available MCP tools

| Tool | What it does |
|---|---|
| `list_components` | Lists every component in both `@heroui-pro/react` and `@heroui/react` |
| `get_component_docs` | Full docs + props + usage examples for any component (Pro or OSS) |
| `get_css` | BEM CSS classes for a component — use when overriding default styles |
| `get_docs` | Pulls guide pages; Pro paths start with `/pro/docs/`, OSS with `/docs/` |
| `get_component_source_code` | OSS component source (Pro source not exposed) |
| `get_theme_variables` | Theme tokens + Pro theme variants: `default`, `brutalism`, `glass`, `mouve` |

### Usage pattern

Before building any UI piece, call `list_components` to see what's available, then `get_component_docs` on the relevant component before writing code. This avoids reimplementing things that already exist in HeroUI Pro (data tables, auth pages, dashboards, sidebars, etc.).

---

## Git workflow

All work is committed and pushed to `main` as features are completed. There are no long-lived feature branches unless a change is large and experimental.

### Commit convention

```
<type>(<scope>): <short description>

Types: feat | fix | chore | refactor | docs | style | test
Scope: frontend | backend | db | infra | docs
```

Examples:
```
feat(frontend): add sample registration form with QR preview
feat(backend): implement chemical inventory CRUD endpoints
fix(frontend): correct pH validation range in chemical form
chore(infra): add docker-compose.dev.yml with hot reload
docs: update CLAUDE.md with MCP server setup
```

### Version bumping

Versions follow [semver](https://semver.org/). Both `frontend/package.json` and `backend/package.json` are bumped together when a meaningful milestone is reached:
- `patch` (0.0.x) — bug fixes, small polish
- `minor` (0.x.0) — new module or significant feature complete
- `major` (x.0.0) — production-ready release

Claude bumps versions and pushes to main after each completed feature unless told otherwise.

---

## Running locally

```bash
# Copy env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start everything
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# Or run individually:
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev

# Re-install HeroUI Pro artifacts after a fresh npm install
# (CI/CD token required — set HEROUI_AUTH_TOKEN in your environment)
HEROUI_AUTH_TOKEN=<ci-cd-token> npx heroui-pro@latest install react -y
```

---

## Environment variables

### Backend (`backend/.env`)
```
DATABASE_URL=postgresql://lims:lims@localhost:5432/lims
JWT_SECRET=change-me-in-prod
JWT_REFRESH_SECRET=change-me-in-prod
PORT=3001
NODE_ENV=development
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:3001/api/v1
```

---

## HeroUI v3 API — confirmed patterns

**Package:** `@heroui/react@3.1.0` — completely redesigned API from v2.

| v2 (old) | v3 (correct) | Notes |
|---|---|---|
| `HeroUIProvider` | *(removed)* | No provider needed |
| `CardBody` | `CardContent` | Also: `CardHeader`, `CardFooter`, `CardTitle`, `CardDescription` |
| `Divider` | `Separator` | Props: `orientation`, `variant`, `className` |
| `Button color="primary"` | `Button variant="primary"` | Variants: `primary`, `secondary`, `tertiary`, `outline`, `ghost`, `danger` |
| `Button onPress` | `Button onClick` | Standard DOM handler |
| `Button isLoading` | *(removed)* | Wrap children: `{loading ? <Spinner size="sm" /> : 'Label'}` |
| `Button startContent` | *(removed)* | Put icons directly in children |
| `Input label="x" onValueChange` | `TextField` + `Label` + `Input` | React Aria compound — `TextField onChange` gives string directly |
| `Tooltip content="x"` | `TooltipRoot` + `TooltipTrigger` + `TooltipContent` | Compound pattern |

**Form fields (React Aria pattern):**
```tsx
<TextField value={val} onChange={setVal}>  {/* onChange: (s: string) => void */}
  <Label>Naziv</Label>
  <Input type="text" />
</TextField>
```

**Tooltip:**
```tsx
<TooltipRoot>
  <TooltipTrigger className="block">{triggerElement}</TooltipTrigger>
  <TooltipContent side="right">Tekst</TooltipContent>
</TooltipRoot>
```

**Separator** (replaces Divider):
```tsx
<Separator className="my-2" />                    {/* horizontal */}
<Separator orientation="vertical" className="h-4" /> {/* vertical */}
```

---

## Design system

Full token reference lives in [DESIGN.md](DESIGN.md). Key rules for writing UI code:

- **Font:** Figtree (loaded via Google Fonts in `index.html`). Inter is also loaded as a secondary option.
- **Colors:** Always use semantic tokens — `bg-background`, `text-foreground`, `text-muted`, `bg-surface`, `bg-accent`, `text-danger`, etc. Never put raw hex in component code.
- **Accent:** `#007BCC` (oklch `56.93% 0.1536 248.08`) — primary brand blue used for key actions and chart-3.
- **Spacing:** 4px base unit. Stick to the 4/8px rhythm using Tailwind utilities (`gap-4`, `p-6`, `space-y-2`).
- **Radius:** `rounded-lg` (8px) for surfaces/buttons, `rounded-xl` (12px) for form fields.
- **Elevation:** Use HeroUI's built-in surface/overlay shadows — do not add custom box-shadow on top of Card or Modal.
- **Charts:** Use `--chart-1` through `--chart-5` for series colors (blue ramp, chart-3 = accent).
- **Dark mode:** HeroUI handles it via `[data-theme="dark"]`. Toggle via `HeroUIProvider` — no manual color branching in components.

## Code conventions

- **No comments** unless WHY is non-obvious
- Feature-first folder structure (not layer-first) — keep samples code together
- Zod schemas are the single source of truth for validation — share between FE/BE where possible via a future `packages/shared` workspace
- All DB mutations go through service functions, never raw SQL in route handlers
- Audit logging is middleware — never call it manually inside business logic
- Drizzle schema file per feature (`samples.schema.ts`, `chemicals.schema.ts`, etc.)

---

## Monetisation (future)
1. **Freemium** — free up to 100 samples/month, paid for higher volume
2. **Self-hosted licence** — one-time purchase for on-premise
3. **SaaS subscription** — monthly/annual cloud hosting
4. **Professional services** — custom integrations, instrument connectivity, training
