export interface HelpArticle {
  id: string
  categoryId: string
  title: string
  content: string
  keywords: string[]
}

export interface HelpCategory {
  id: string
  title: string
  icon: string
}

export const HELP_CATEGORIES: HelpCategory[] = [
  { id: 'uvod', title: 'Uvod', icon: '📖' },
  { id: 'uzorci', title: 'Uzorci', icon: '🔬' },
  { id: 'kemikalije', title: 'Kemikalije', icon: '⚗️' },
  { id: 'protokoli', title: 'Protokoli i eksperimenti', icon: '📋' },
  { id: 'izvjestaji', title: 'Izvještaji', icon: '📊' },
  { id: 'korisnici', title: 'Korisnici i uloge', icon: '👤' },
  { id: 'admin', title: 'Administracija', icon: '⚙️' },
]

export const HELP_ARTICLES: HelpArticle[] = [
  // ─── Uvod ────────────────────────────────────────────────────────────────────
  {
    id: 'uvod-sto-je-lims',
    categoryId: 'uvod',
    title: 'Što je LIMS?',
    keywords: ['lims', 'uvod', 'opis', 'sustav'],
    content: `LIMS (Laboratory Information Management System) je softver za upravljanje radom laboratorija. Sustav omogućuje evidenciju uzoraka, praćenje kemikalija, standardizaciju postupaka putem protokola i generiranje izvještaja za reviziju.

Ovaj LIMS namijenjen je malim laboratorijima — školskim kabinetima, fakultetskim praktikumima, malim privatnim laboratorijima i startup laboratorijima koji ne mogu priuštiti skupa komercijalna rješenja.

Ključne prednosti:
• Besplatno za korištenje (open source)
• Jednostavna instalacija putem Dockera
• Sučelje na hrvatskom jeziku
• Prilagođeno malim timovima (1–20 korisnika)
• Radi na svim uređajima (desktop, tablet, mobitel)`,
  },
  {
    id: 'uvod-navigacija',
    categoryId: 'uvod',
    title: 'Navigacija po sustavu',
    keywords: ['navigacija', 'izbornik', 'sidebar', 'stranice'],
    content: `Sustav se sastoji od pet glavnih modula dostupnih u lijevom izborniku:

🔬 Uzorci — registracija i praćenje laboratorijskih uzoraka
⚗ Kemikalije — inventar reagensa s GHS klasifikacijom
📋 Protokoli — SOP predlošci i evidencija eksperimenata
📊 Izvještaji — generiranje i izvoz podataka
👤 Korisnici — upravljanje računima (samo admin)

Na mobilnim uređajima, izbornik se otvara klikom na hamburgenu ikonu (☰) u gornjem lijevom kutu.

Tamni/svijetli način rada mijenja se klikom na ikonu sunca/mjeseca u gornjem desnom kutu.`,
  },
  {
    id: 'uvod-uloge',
    categoryId: 'uvod',
    title: 'Korisničke uloge',
    keywords: ['uloge', 'admin', 'laborant', 'promatrač', 'ovlasti'],
    content: `Sustav ima tri korisničke uloge:

Administrator — ima sve ovlasti uključujući upravljanje korisnicima i pristup svim modulima.

Laborant — može kreirati i ažurirati uzorke, kemikalije i eksperimente, ali ne može mijenjati konfiguraciju sustava niti upravljati korisnicima.

Promatrač — može samo pregledavati podatke bez mogućnosti izmjene. Prikladno za voditelje koji trebaju uvid u rad laboratorija.

Svaki korisnik vidi samo funkcionalnosti dostupne svojoj ulozi. Gumb "Korisnici" u izborniku vidljiv je samo administratorima.`,
  },

  // ─── Uzorci ──────────────────────────────────────────────────────────────────
  {
    id: 'uzorci-registracija',
    categoryId: 'uzorci',
    title: 'Registracija uzorka',
    keywords: ['registracija', 'novi uzorak', 'zaprimanje', 'kodiranje'],
    content: `Svaki uzorak koji dolazi u laboratorij potrebno je registrirati u sustavu.

Kako registrirati uzorak:
1. Kliknite gumb "+ Novi uzorak" u gornjem desnom kutu stranice Uzorci
2. Odaberite vrstu uzorka (Voda, Tlo, Hrana, Zrak, Biološki, Kemijski, Ostalo)
3. Unesite izvor uzorka — što preciznije to bolje (npr. "Rijeka Sava — most Domovinski, uzorkovanje na obali")
4. Po potrebi dodajte bilješku
5. Kliknite "Registriraj uzorak"

Sustav automatski generira jedinstveni kod uzorka u formatu UZ-YYYY-NNNN (npr. UZ-2025-0001). Ovaj kod se koristi za praćenje uzorka i ispis QR naljepnice.`,
  },
  {
    id: 'uzorci-status',
    categoryId: 'uzorci',
    title: 'Životni ciklus uzorka',
    keywords: ['status', 'zaprimljen', 'obrada', 'analiziran', 'arhiviran', 'uništen'],
    content: `Svaki uzorak prolazi kroz sljedeće faze:

Zaprimljen → U obradi → Analiziran → Arhiviran ili Uništen

Zaprimljen — uzorak je registriran i čeka obradu.
U obradi — uzorak je predan na analizu.
Analiziran — analiza je završena, rezultati su dostupni.
Arhiviran — uzorak je pohranjen za buduće potrebe.
Uništen — uzorak je zbrinut sukladno propisima.

Kako promijeniti status:
U tablici uzoraka, u stupcu "Akcija" kliknite padajući izbornik "Promijeni →" i odaberite novi status. Promjena statusa bilježi se u historiji uzorka s vremenskom oznakom i imenom operatera.

Nije moguće "vraćati" status unazad — svaki prijelaz je jednosmjeran.`,
  },
  {
    id: 'uzorci-detalji',
    categoryId: 'uzorci',
    title: 'Pregled detalja i historije uzorka',
    keywords: ['detalji', 'historija', 'audit trail', 'qr kod', 'ispis naljepnice'],
    content: `Kliknite ikonu ℹ u tablici uzoraka da otvorite detaljni pregled uzorka.

Prikazuje se:
• Metapodaci uzorka (vrsta, izvor, zaprimio/la, datum)
• QR kod s kodom uzorka, tipom i datumom — kliknite "Ispiši" za ispis naljepnice
• Kompletna historija svih događaja (audit trail)

QR naljepnica:
Svaki uzorak dobiva QR kod koji se može zalijepiti na posudu. Naljepnica sadrži skenirajući QR kod i čitljiv tekst (kod, tip, datum). Ispiše se klikom na gumb "Ispiši" u modalnom prozoru detalja uzorka.

Historija:
Svaka promjena statusa, bilješka i registracija bilježi se automatski s imenom operatera i vremenskom oznakom. Ova evidencija nepromjenjiva je i služi za potrebe revizije.`,
  },
  {
    id: 'uzorci-pretraga',
    categoryId: 'uzorci',
    title: 'Pretraga i filtriranje uzoraka',
    keywords: ['pretraga', 'filtriranje', 'sortiranje', 'bulk akcija'],
    content: `Pretraga:
Unesite tekst u polje za pretragu i kliknite "Traži". Pretraga pretražuje kod uzorka, izvor i vrstu uzorka.

Filtriranje po statusu:
Padajući izbornik "Svi statusi" omogućuje filtriranje po: Zaprimljeni, U obradi, Analizirani, Arhivirani, Uništeni.

Sortiranje:
Kliknite na naslov stupca (Kod, Vrsta, Zaprimljeno) da sortirate uzorke uzlazno ili silazno.

Bulk akcije (masovne akcije):
Kliknite na retke u tablici da ih odaberete (pojavljuje se zeleni checkmark). Kad je jedan ili više redaka odabrano, prikazuje se traka s bulk akcijama — možete promijeniti status svim odabranim uzorcima odjednom.`,
  },

  // ─── Kemikalije ──────────────────────────────────────────────────────────────
  {
    id: 'kemikalije-dodavanje',
    categoryId: 'kemikalije',
    title: 'Dodavanje kemikalije',
    keywords: ['dodavanje', 'nova kemikalija', 'cas broj', 'inventar'],
    content: `Kako dodati kemikaliju u inventar:
1. Kliknite "+ Nova kemikalija"
2. Unesite naziv kemikalije (obavezno)
3. CAS broj — Chemical Abstracts Service broj u formatu XXXXXXX-YY-Z (npr. 7647-01-0 za HCl). Nije obavezan, ali preporučuje se radi jednoznačne identifikacije.
4. Proizvođač i broj serije — za sljedivost
5. Datum nabave i rok trajanja — obavezno za alertove
6. Količina i jedinica — unijeti trenutnu stanju zaliha
7. Minimalna zaliha — prag ispod kojeg sustav šalje upozorenje (0 = bez upozorenja)
8. Lokacija skladištenja — što preciznije (npr. "Ormar K-1, polica 2")
9. Temperatura skladištenja — min/max u °C ako je relevantno
10. GHS klasifikacija — označite sve primjenjive piktograme
11. SDS URL — poveznica na sigurnosno-tehnički list`,
  },
  {
    id: 'kemikalije-ghs',
    categoryId: 'kemikalije',
    title: 'GHS klasifikacija',
    keywords: ['ghs', 'opasnost', 'piktogrami', 'sigurnost', 'sds'],
    content: `GHS (Globally Harmonized System) je međunarodni sustav klasifikacije kemikalija. Svaka kemikalija može imati jednu ili više GHS oznaka:

GHS01 — Eksploziv (bombe)
GHS02 — Zapaljivo (plamen)
GHS03 — Oksidans (plamen nad kругom)
GHS04 — Stlačeni plin (boca)
GHS05 — Korozivno (kapanje na ruku/površinu)
GHS06 — Otrovno/Smrtonosno (lubanja)
GHS07 — Štetno/Nadražujuće (uskličnik)
GHS08 — Zdravstvena opasnost (zdravlje)
GHS09 — Okolišna opasnost (drvo i riba)

Oznake se prikazuju kao obojeni badge u tablici kemikalija.

SDS (Safety Data Sheet / Sigurnosno-tehnički list):
U polje SDS URL unesite poveznicu na PDF sigurnosno-tehničkog lista. Gumb za otvaranje SDS-a pojavljuje se u tablici kemikalija. SDS možete pronaći na web stranici proizvođača ili na sigurnosno-tehničkim bazama podataka.`,
  },
  {
    id: 'kemikalije-alertovi',
    categoryId: 'kemikalije',
    title: 'Upozorenja i alertovi',
    keywords: ['upozorenje', 'alert', 'rok trajanja', 'niske zalihe', 'isteklo'],
    content: `Sustav automatski prati stanje kemikalija i prikazuje upozorenja.

Vrste upozorenja:
• Istekao — rok trajanja je prošao (prikazano crvenom bojom)
• Ističe uskoro — rok trajanja je unutar 30 dana (prikazano narančastom bojom)
• Niske zalihe — količina je ispala ispod minimalne zalihe (prikazano narančastom bojom)

Pregled upozorenja:
Na nadzornoj ploči (Dashboard) kartica "Kemikalije — upozorenja" prikazuje ukupan broj kemikalija s upozorenjima.

U tablici kemikalija koristite filtar u gornjem desnom uglu:
• "Istekli" — prikazuje samo kemikalije kojima je istekao rok
• "Ističu uskoro" — prikazuje kemikalije koje ističu unutar 30 dana
• "Niske zalihe" — prikazuje kemikalije ispod minimalne zalihe

Email alertovi:
Ako je konfiguriran SMTP server (vidi tehničku dokumentaciju), sustav svaki dan šalje email sa popisom kemikalija koje ističu unutar 7 dana ili imaju niske zalihe.`,
  },
  {
    id: 'kemikalije-kolicina',
    categoryId: 'kemikalije',
    title: 'Ažuriranje količine',
    keywords: ['količina', 'trošenje', 'ažuriranje', 'zaliha'],
    content: `Nakon svake upotrebe kemikalije potrebno je ažurirati njezinu količinu u sustavu.

Kako ažurirati količinu:
1. U tablici kemikalija kliknite ikonu ⚗ (tikvica) u retku kemikalije
2. Otvara se modal koji prikazuje trenutnu količinu
3. Unesite novu količinu
4. Diff (razlika) prikazuje se automatski — pozitivna (+) ili negativna (-)
5. Ako je nova količina ispod minimalne zalihe, prikazuje se upozorenje
6. Kliknite "Spremi"

Savjet: Preporučuje se ažurirati količinu odmah nakon upotrebe, a ne na kraju smjene, radi točnosti podataka.`,
  },

  // ─── Protokoli ───────────────────────────────────────────────────────────────
  {
    id: 'protokoli-kreiranje',
    categoryId: 'protokoli',
    title: 'Kreiranje SOP protokola',
    keywords: ['protokol', 'sop', 'standardni operativni postupak', 'koraci', 'kreiranje'],
    content: `SOP (Standard Operating Procedure) je standardiziran opis laboratorijskog postupka koji osigurava konzistentnost rezultata.

Kako kreirati protokol:
1. Kliknite "+ Novi protokol"
2. Unesite naziv protokola (npr. "Određivanje pH vrijednosti vode")
3. Odaberite kategoriju (Analiza vode, Kemijska analiza, itd.)
4. Dodajte opis — kratki sažetak svrhe protokola
5. Dodajte korake klikom na "+ Dodaj korak". Svaki korak ima:
   • Naslov (kratko, akcijsko ime)
   • Opis (detaljan postupak, uključujući koncentracije, temperature, vremena)
6. Navedite potrebne materijale (jedan po retku)
7. Navedite potrebnu opremu (jedan po retku)
8. Dodajte očekivane rezultate — kriterij prihvatljivosti ili tipičan raspon

Verzioniranje:
Svaki protokol automatski dobiva verziju 1.0.0. Kad izmijenite protokol, starija verzija ostaje sačuvana a broj verzije se povećava (1.1.0, 1.2.0...). Eksperimenti ostaju vezani uz verziju protokola po kojoj su izvedeni.`,
  },
  {
    id: 'protokoli-eksperiment',
    categoryId: 'protokoli',
    title: 'Pokretanje i završetak eksperimenta',
    keywords: ['eksperiment', 'pokretanje', 'završetak', 'rezultati', 'evidencija'],
    content: `Eksperiment je konkretno provođenje protokola na specifičnom uzorku ili skupu uzoraka.

Pokretanje eksperimenta:
1. U tablici protokola kliknite "Pokreni" za željeni protokol
2. Naslov se automatski popunjava (naziv protokola + datum)
3. Dodajte početne napomene ako je potrebno
4. Kliknite "Pokreni eksperiment"

Eksperiment se bilježi kao "U tijeku". Vidljiv je u sekciji Eksperimenti na stranici Protokoli.

Završetak eksperimenta:
1. U sekciji Eksperimenti pronađite eksperiment "U tijeku"
2. Kliknite "Završi"
3. Unesite rezultate — obavezno (npr. "pH = 7.42 ± 0.05, unutar MDK")
4. Dodajte zaključnu napomenu ako je potrebno
5. Kliknite "Završi eksperiment"

Eksperiment se bilježi s datumom završetka i potpunim rezultatima. Ovi podaci su dostupni u izvještajima.`,
  },
  {
    id: 'protokoli-pregled',
    categoryId: 'protokoli',
    title: 'Pregled SOP koraka',
    keywords: ['koraci', 'pregled', 'sop', 'detalji protokola'],
    content: `Za pregled detalja protokola kliknite ikonu ℹ u tablici protokola.

Prikazuje se:
• Naziv, kategorija, verzija, kreator, broj izvedenih eksperimenata
• Opis protokola
• Numerirana lista koraka s naslovima i detaljnim opisima
• Popis potrebnih materijala
• Popis potrebne opreme
• Očekivani rezultati / kriterij prihvatljivosti

Savjet: Preporučuje se ispisati korake SOP-a i imati ih dostupne u laboratoriju za vrijeme provođenja eksperimenta.`,
  },

  // ─── Izvještaji ──────────────────────────────────────────────────────────────
  {
    id: 'izvjestaji-pregled',
    categoryId: 'izvjestaji',
    title: 'Pregled dostupnih izvještaja',
    keywords: ['izvještaj', 'csv', 'ispis', 'pdf', 'export'],
    content: `Modul Izvještaji nudi četiri vrste izvještaja:

📊 Uzorci — pregled svih uzoraka s filterima po datumu i statusu. Uključuje statistiku po statusima.

⚗ Kemikalije — trenutačni inventar s označenim isteklim i kemikalijama s niskim zalihama.

🔬 Eksperimenti — dnevnik svih eksperimenata s filterima po datumu.

🔍 Sljedivost (CoC) — kompletna lanac skrbništva za konkretni uzorak. Unesite ID uzorka da vidite punu historiju.

Izvoz podataka:
• CSV — preuzimanje u Excel-kompatibilnom formatu (UTF-8 s BOM za ispravne znakove)
• Ispiši — otvaranje prozora za ispis ili PDF izvoz

Kada su dostupni gumbi CSV i Ispiši:
Gumbi se pojavljuju automatski čim se podaci učitaju (nakon klika "Generiraj" za filtrirane izvještaje, ili odmah za Kemikalije).`,
  },
  {
    id: 'izvjestaji-sljedivost',
    categoryId: 'izvjestaji',
    title: 'Izvještaj o sljedivosti uzorka (CoC)',
    keywords: ['sljedivost', 'coc', 'chain of custody', 'audit', 'inspekcija'],
    content: `Izvještaj o sljedivosti (Chain of Custody — CoC) prikazuje kompletnu historiju uzorka od zaprimanja do trenutnog stanja.

Kako generirati CoC izvještaj:
1. Kliknite karticu "Sljedivost" u modulu Izvještaji
2. Unesite ID uzorka (UUID format)
3. ID uzorka možete pronaći klikom na ℹ u tablici uzoraka
4. Kliknite "Pretraži"

Izvještaj prikazuje:
• Metapodatke uzorka (kod, vrsta, izvor, zaprimio/la)
• Kronološku listu svih događaja s operaterima i vremenskim oznakama
• Sve promjene statusa s bilješkama

Ovaj izvještaj prikladan je za inspekcije, akreditacijske postupke (ISO 17025) i interne revizije.`,
  },

  // ─── Korisnici ───────────────────────────────────────────────────────────────
  {
    id: 'korisnici-upravljanje',
    categoryId: 'korisnici',
    title: 'Upravljanje korisnicima',
    keywords: ['korisnici', 'dodavanje', 'uloga', 'aktivacija', 'deaktivacija'],
    content: `Upravljanje korisnicima dostupno je samo administratorima (gumb "Korisnici" u lijevom izborniku).

Dodavanje korisnika:
1. Kliknite "+ Novi korisnik"
2. Unesite ime, prezime, email i lozinku (min. 8 znakova)
3. Odaberite ulogu: Administrator, Laborant ili Promatrač
4. Kliknite "Kreiraj korisnika"

Korisnik može odmah pristupiti sustavu s unesenim podacima.

Uređivanje korisnika:
Kliknite ikonu ✏ u tablici korisnika da uredite ime, prezime, email ili ulogu.

Deaktivacija/aktivacija:
Kliknite ikonu u stupcu "Akcija" da deaktivirate ili aktivirate korisnika. Deaktivirani korisnici ne mogu se prijaviti u sustav, ali njihovi podaci ostaju sačuvani.

Napomena: Vlastiti račun nije moguće deaktivirati — gumb nije vidljiv za prijavljenog korisnika.`,
  },
  {
    id: 'korisnici-lozinka',
    categoryId: 'korisnici',
    title: 'Promjena lozinke',
    keywords: ['lozinka', 'promjena', 'sigurnost'],
    content: `Administratori mogu resetirati lozinku bilo kojeg korisnika:
1. Kliknite ✏ u tablici korisnika
2. Unesite novu lozinku u polje "Nova lozinka" (min. 8 znakova)
3. Kliknite "Spremi promjene"

Lozinka se pohranjuje kriptirana algoritmom bcrypt (12 rundi soli) — nikad u čitljivom obliku.

Inicijalna lozinka admina (ako koristite seed skriptu): Admin123! — promijenite je odmah!

Preporuke za sigurnu lozinku:
• Minimum 12 znakova
• Kombinacija slova, brojeva i znakova
• Različita lozinka za svaki sustav`,
  },

  // ─── Admin ───────────────────────────────────────────────────────────────────
  {
    id: 'admin-email-alertovi',
    categoryId: 'admin',
    title: 'Konfiguracija email alertova',
    keywords: ['email', 'smtp', 'alertovi', 'notifikacije', 'konfiguracija'],
    content: `Sustav može automatski slati email upozorenja za kemikalije koje ističu ili imaju niske zalihe.

Konfiguracija (u backend/.env):

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=vaš.email@gmail.com
SMTP_PASS=application-password
ALERT_RECIPIENTS=lab@primjer.hr,voditelj@primjer.hr
ALERT_INTERVAL_HOURS=24

Gmail napomena: Koristite "App Password" umjesto standardne lozinke. Generirajte je u Google račun → Sigurnost → Lozinke za aplikacije.

Alertovi se šalju za:
• Kemikalije kojima rok ističe unutar 7 dana
• Kemikalije ispod minimalne zalihe

Provjera se izvodi svakih ALERT_INTERVAL_HOURS sati (default: 24h). Prva provjera izvodi se 10 sekundi po pokretanju backsenda.`,
  },
  {
    id: 'admin-backup',
    categoryId: 'admin',
    title: 'Sigurnosno kopiranje podataka',
    keywords: ['backup', 'kopiranje', 'baza podataka', 'restore', 'postgresql'],
    content: `Svi podaci pohranjeni su u PostgreSQL bazi podataka.

Ručni backup:
docker exec lims-db pg_dump -U lims lims > backup_$(date +%Y%m%d).sql

Automatski backup (primjer cronjob):
0 2 * * * docker exec lims-db pg_dump -U lims lims > /backups/lims_$(date +%Y%m%d).sql

Restore:
cat backup_20250601.sql | docker exec -i lims-db psql -U lims lims

Preporuke:
• Backup svaki dan, čuvati min. 30 dana
• Testirati restore postupak jednom mjesečno
• Pohraniti backupe na odvojenoj lokaciji (cloud storage, NAS)

Napomena: MSW mock podaci (testni podaci koji se koriste bez backsenda) nisu potrebiti za backup — generirani su pri svakom pokretanju.`,
  },
  {
    id: 'admin-docker',
    categoryId: 'admin',
    title: 'Docker upravljanje',
    keywords: ['docker', 'pokretanje', 'zaustavljanje', 'ažuriranje', 'logs'],
    content: `Korisne Docker Compose naredbe:

Pokretanje servisa:
docker compose up -d

Zaustavljanje:
docker compose down

Pregled logova:
docker compose logs -f backend
docker compose logs -f frontend

Ažuriranje na novu verziju:
git pull
docker compose build
docker compose up -d

Status servisa:
docker compose ps

Pristup bazi podataka:
docker compose exec db psql -U lims

Drizzle Studio (vizualni editor baze):
cd backend && npm run db:studio`,
  },
]
