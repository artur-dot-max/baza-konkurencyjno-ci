# Baza Konkurencyjności Funduszu Sprawiedliwości

Portal do publikowania i prowadzenia postępowań zakupowych. Zawiera publiczną wyszukiwarkę ogłoszeń, panel organizacji, pytania i odpowiedzi, rozstrzygnięcia, panel administratora, dziennik audytowy, załączniki oraz odzyskiwanie hasła.

## Wymagania

- Node.js 20+
- PostgreSQL 16+
- npm

## Uruchomienie lokalne

```powershell
Copy-Item .env.example .env
npm ci
npm run db:deploy
npm run db:seed
npm run dev
```

Serwer developerski używa katalogu `.next-dev`, więc można równolegle wykonywać kompilację produkcyjną w `.next`.

Konta tworzone przez seed służą wyłącznie do lokalnego developmentu:

- `admin@fs.gov.pl` / `Admin123!`
- `org1@example.com`, `org2@example.com`, `org3@example.com` / `Haslo123!`

Na produkcji administratora utwórz osobnym poleceniem:

```powershell
$env:ADMIN_EMAIL="administrator@example.org"
$env:ADMIN_PASSWORD="silne-haslo-minimum-12-znakow"
npm run admin:create
```

## Konfiguracja

Skopiuj `.env.example` do `.env`. W środowisku produkcyjnym ustaw co najmniej:

- `DATABASE_URL` — połączenie z PostgreSQL,
- `AUTH_SECRET` i `CRON_SECRET` — niezależne, losowe sekrety,
- `AUTH_URL` oraz `NEXT_PUBLIC_APP_URL` — publiczny adres HTTPS,
- `SMTP_*`, `MAIL_FROM` i `CONTACT_EMAIL` — wysyłka resetów hasła, aktywacji i formularza kontaktowego,
- `UPLOAD_DIR` — trwały katalog załączników,
- `TRUST_PROXY=true` tylko gdy zaufany reverse proxy nadpisuje `X-Forwarded-For`.

Kolejka e-mail jest trwała w bazie. Poza Dockerem uruchom obok aplikacji `npm run mail:worker` jako oddzielną usługę systemową.

## Docker

Ustaw bezpieczne wartości w `.env`, szczególnie `POSTGRES_PASSWORD`, `AUTH_SECRET` i `CRON_SECRET`, a następnie:

```powershell
docker compose up -d --build
```

Kontener `migrate` stosuje migracje przed startem aplikacji. PostgreSQL nie publikuje portu na hoście. Dane bazy i załączniki są zapisane w osobnych wolumenach. Stan aplikacji jest dostępny pod `/api/health`.

## Kopie zapasowe

Kopia bazy w formacie PostgreSQL custom:

```powershell
./scripts/backup-postgres.ps1
```

Domyślna retencja wynosi 30 dni. Załączniki znajdują się w wolumenie `uploads_data`; należy je objąć niezależną kopią na poziomie infrastruktury. Odtworzenie bazy jest operacją administracyjną:

```powershell
./scripts/restore-postgres.ps1 -BackupFile ./backups/baza-konkurencyjnosci-YYYYMMDD-HHMMSS.dump
```

Po odtworzeniu należy sprawdzić `/api/health`, logowanie i możliwość pobrania istniejącego załącznika.

## Kontrole jakości

```powershell
npm run check
npm run build
npm run test:e2e
npm audit --omit=dev
```

Testy E2E wymagają osobnej bazy, której nazwa kończy się `_test`. Domyślnie używają `postgresql://postgres@127.0.0.1:55432/bk_test`; alternatywny adres podaj przez `TEST_DATABASE_URL`. Testy czyszczą wskazaną bazę.

## Wdrożenie bez Dockera

1. Wykonaj `npm ci` i `npm run db:deploy`.
2. Zbuduj aplikację przez `npm run build`.
3. Uruchom `npm start` oraz `npm run mail:worker` jako dwie usługi systemowe.
4. Skieruj Nginx do portu aplikacji, ustaw HTTPS i nadpisuj nagłówki proxy.
5. Zaplanuj kopie PostgreSQL oraz katalogu `UPLOAD_DIR` i regularnie testuj odtwarzanie.

## Najważniejsze skrypty

- `npm run dev` — serwer developerski,
- `npm run build` / `npm start` — kompilacja i start produkcyjny,
- `npm run db:deploy` — migracje produkcyjne,
- `npm run db:seed` — dane developerskie,
- `npm run mail:worker` — wysyłka kolejki e-mail,
- `npm run check` — lint, typy i testy jednostkowe,
- `npm run test:e2e` — pełny proces w przeglądarce.

## Licencja

MIT
