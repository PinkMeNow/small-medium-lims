# LIMS — Laboratorijski informacijski sustav

Pristupačan LIMS za male laboratorije — škole, fakultetske praktikume, male privatne laboratorije i startup laboratorije.

## Sadržaj

- [Funkcionalnosti](#funkcionalnosti)
- [Razvoj u VSCode-u](#razvoj-u-vscode-u)
- [Brzi početak s Dockerom](#brzi-početak-docker)
- [Deploy na produkcijski VPS (Ubuntu)](#deploy-na-produkcijski-vps-ubuntu)
- [Environment varijable](#environment-varijable)
- [Tech stack](#tech-stack)

---

## Funkcionalnosti

| Modul | Opis |
|---|---|
| **Uzorci** | Registracija s QR kodom, status lifecycle, audit trail |
| **Kemikalije** | GHS klasifikacija, praćenje rokova, alertovi |
| **Protokoli** | SOP predlošci s verzioniranjem, eksperimenti |
| **Izvještaji** | CSV export, PDF ispis, sljedivost uzorka |
| **Korisnici** | Admin, laborant, promatrač |

---

## Razvoj u VSCode-u

### Preduvjeti

- [Node.js 22 LTS](https://nodejs.org/) — provjeri s `node -v`
- [Git](https://git-scm.com/)
- [VSCode](https://code.visualstudio.com/)

### Preporučeni VSCode dodaci

Instaliraj putem Extensions panela (`Ctrl+Shift+X`):

| Dodatak | ID | Zašto |
|---|---|---|
| ESLint | `dbaeumer.vscode-eslint` | Linting u realnom vremenu |
| Prettier | `esbenp.prettier-vscode` | Automatsko formatiranje |
| Tailwind CSS IntelliSense | `bradlc.vscode-tailwindcss` | Autocomplete za Tailwind klase |
| TypeScript Importer | `pmneo.tsimporter` | Auto-import TypeScript tipova |
| Thunder Client | `rangav.vscode-thunder-client` | Testiranje API endpointa |

### Koraci za postavljanje

**1. Kloniraj repozitorij i otvori u VSCode-u**

```bash
git clone https://github.com/PinkMeNow/small-medium-lims.git
cd small-medium-lims
code .
```

**2. Otvori dva terminala** (`Ctrl+` ` `, zatim klikni `+` za novi tab)

**Terminal 1 — Frontend (obavezno):**
```bash
cd frontend
npm install
npm run dev
```

Otvori `http://localhost:5173` u browseru.

> **Bez backsenda radi odmah!** Frontend automatski koristi MSW (Mock Service Worker) koji simulira backend s testnim podacima. Sve funkcionalnosti su dostupne bez PostgreSQL-a.

**Terminal 2 — Backend (opcionalno, samo ako trebaš pravi backend):**
```bash
cd backend
cp .env.example .env
# Uredi .env — vidi sekciju Environment varijable
npm install
npm run db:push    # Kreira tablice u PostgreSQL bazi
npm run db:seed    # Kreira admin@lims.hr / Admin123!
npm run dev
```

### Korisni VSCode shortcuti

| Akcija | Shortcut |
|---|---|
| Otvori terminal | `Ctrl+` ` |
| Split terminal | `Ctrl+Shift+5` |
| Go to file | `Ctrl+P` |
| Go to symbol | `Ctrl+Shift+O` |
| Format document | `Shift+Alt+F` |
| TypeScript check | Terminal: `npx tsc --noEmit` |

### Struktura projekta u VSCode Explorer-u

```
small-medium-lims/
├── frontend/src/
│   ├── components/     ← Shared UI (sidebar, avatar, quick actions)
│   ├── features/       ← Modularne komponente po domeni
│   │   ├── samples/    ← Uzorci
│   │   ├── chemicals/  ← Kemikalije
│   │   ├── protocols/  ← Protokoli
│   │   └── users/      ← Korisnici
│   ├── pages/          ← Stranice (route-level komponente)
│   ├── mocks/          ← MSW mock handleri i testni podaci
│   └── types/          ← TypeScript tipovi
└── backend/src/
    ├── features/       ← API rute i servisi
    ├── db/             ← Drizzle schema i migracije
    └── lib/            ← Utilities (email, alertovi)
```

---

## Brzi početak (Docker)

Potrebno: [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
git clone https://github.com/PinkMeNow/small-medium-lims.git
cd small-medium-lims

cp backend/.env.example backend/.env
# Uredi .env: postavi JWT_SECRET i JWT_REFRESH_SECRET (min 32 znaka)

docker compose up -d
docker compose exec backend npm run db:push
docker compose exec backend npm run db:seed
```

Otvori `http://localhost` — prijava: `admin@lims.hr` / `Admin123!`

---

## Deploy na produkcijski VPS (Ubuntu)

### Preduvjeti na serveru

- Ubuntu 22.04 LTS ili noviji
- Minimalno 1 GB RAM, 10 GB disk
- Domain koji pokazuje na IP servera (za HTTPS)

### 1. Postavljanje servera

```bash
# Spoji se na server
ssh user@vaš-server.hr

# Ažuriraj sustav
sudo apt update && sudo apt upgrade -y

# Instaliraj Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker

# Instaliraj Docker Compose (plugin)
sudo apt install -y docker-compose-plugin

# Provjeri instalaciju
docker --version
docker compose version
```

### 2. Kloniraj projekt na server

```bash
# Na serveru
cd /opt
sudo git clone https://github.com/PinkMeNow/small-medium-lims.git lims
sudo chown -R $USER:$USER /opt/lims
cd /opt/lims
```

### 3. Postavi environment varijable

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

Uredi `.env` — **obavezno postavi ove vrijednosti:**

```env
DATABASE_URL=postgresql://lims:SIGURNA_LOZINKA@db:5432/lims
JWT_SECRET=generiraj-32-znaka-random-string-ovdje
JWT_REFRESH_SECRET=drugi-32-znaka-random-string-ovdje
NODE_ENV=production
PORT=3001

# Opcijalno — SMTP za email alertove
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=lab@vaš-domain.hr
SMTP_PASS=app-password
ALERT_RECIPIENTS=admin@vaš-domain.hr
```

> **Generiraj sigurne secretne:** `openssl rand -base64 48`

### 4. Postavi domensko ime u Nginx konfiguraciji

```bash
# Uredi nginx.conf u frontend folderu
nano frontend/nginx.conf
```

Promijeni `server_name _;` u `server_name vaš-domain.hr www.vaš-domain.hr;`

### 5. Pokreni aplikaciju

```bash
# Build i pokretanje svih servisa
docker compose up -d --build

# Provjeri status
docker compose ps

# Kreiranje tablica u bazi
docker compose exec backend npm run db:push

# Seed inicijalnog admin korisnika
docker compose exec backend npm run db:seed
```

Aplikacija je dostupna na `http://vaš-server-ip`

### 6. Postavljanje HTTPS-a (Let's Encrypt)

```bash
# Instaliraj Certbot
sudo apt install -y certbot

# Zaustavi nginx container privremeno
docker compose stop frontend

# Dohvati SSL certifikat
sudo certbot certonly --standalone -d vaš-domain.hr -d www.vaš-domain.hr

# Certifikati su na: /etc/letsencrypt/live/vaš-domain.hr/
```

Uredi `docker-compose.yml` — dodaj volume za SSL certifikate u frontend servis:

```yaml
frontend:
  volumes:
    - /etc/letsencrypt:/etc/letsencrypt:ro
```

Uredi `frontend/nginx.conf` — dodaj HTTPS blok:

```nginx
server {
    listen 80;
    server_name vaš-domain.hr www.vaš-domain.hr;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name vaš-domain.hr www.vaš-domain.hr;

    ssl_certificate /etc/letsencrypt/live/vaš-domain.hr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vaš-domain.hr/privkey.pem;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

```bash
# Rebuild frontend s novom konfiguracijom
docker compose up -d --build frontend
```

**Auto-obnova certifikata:**
```bash
# Dodaj cron job za automatsku obnovu
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && docker compose -f /opt/lims/docker-compose.yml restart frontend") | crontab -
```

### 7. Auto-start pri ponovnom pokretanju servera

```bash
# Kreiraj systemd service
sudo nano /etc/systemd/system/lims.service
```

```ini
[Unit]
Description=LIMS Docker Compose
Requires=docker.service
After=docker.service network.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/lims
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable lims
sudo systemctl start lims
```

### 8. Korisne naredbe za upravljanje

```bash
# Pregled logova u realnom vremenu
docker compose logs -f

# Samo backend logovi
docker compose logs -f backend

# Restart jednog servisa
docker compose restart backend

# Ažuriranje na novu verziju
cd /opt/lims
git pull
docker compose up -d --build
docker compose exec backend npm run db:push   # ako ima novih migracija

# Backup baze podataka
docker compose exec db pg_dump -U lims lims > backup_$(date +%Y%m%d_%H%M).sql

# Provjera zauzetosti diska
docker system df
```

### 9. Inicijalna provjera

Nakon deploya otvori `https://vaš-domain.hr` i:

1. Prijavi se s `admin@lims.hr` / `Admin123!`
2. **Odmah promijeni lozinku** → Korisnici → ✏ uredi admin korisnika
3. Kreiraj laboratorijske korisnike (Korisnici → + Novi korisnik)
4. Konfiguriraj email alertove u `backend/.env` ako su potrebni

---

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

---

## Tech stack

- **Frontend:** React 19 + Vite + TypeScript + HeroUI/Pro + TanStack Query + Zustand
- **Backend:** Node.js 22 + Express 5 + TypeScript + Drizzle ORM
- **Baza:** PostgreSQL 16
- **Auth:** JWT (access 15min + refresh 7d, httpOnly cookie)
- **Infra:** Docker + Docker Compose + Nginx + Let's Encrypt
