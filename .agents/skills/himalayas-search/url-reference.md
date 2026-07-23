# Himalayas — API reference (recon)

- **Endpoint:** `GET https://himalayas.app/jobs/api?limit=<n>&offset=<o>` → `{ totalCount, jobs: [...] }`.
- **robots.txt:** `Allow: /` except `/apply`. API path allowed.
- **No server-side text search** — pull a page, filter locally.
- **Fields:** `title`, `companyName`, `employmentType`, `minSalary`/`maxSalary`/`currency`/`salaryPeriod`, `seniority[]`, `locationRestrictions[]`, `timezoneRestrictions[]` (UTC hour offsets), `categories[]`, `description` (HTML), `pubDate` (epoch s), `applicationLink`/`guid`.
- **Timezone filter:** `timezoneRestrictions` powers `--timezone -5` (Bogotá overlap).
