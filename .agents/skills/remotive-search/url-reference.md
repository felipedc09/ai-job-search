# Remotive — API reference (recon)

- **Endpoint:** `GET https://remotive.com/api/remote-jobs?search=<q>&category=<slug>&limit=<n>` → `{ jobs: [...] }`.
- **robots.txt:** empty (no restrictions).
- **ToS (0-legal-notice):** don't republish Remotive jobs to third-party sites (Jooble/Google Jobs/LinkedIn etc.); link back + credit Remotive; listings delayed ~24h; **max ~4 calls/day** advised, excessive requests blocked. Personal shortlist use is fine.
- **Fields:** `id`, `title`, `company_name`, `candidate_required_location`, `url`, `publication_date` (ISO), `salary` (free text), `tags[]`, `job_type`, `category`, `description` (HTML).
- **Server filters DON'T work on the free API:** `search`, `category` and `limit` are ignored — the endpoint returns a fixed recent feed (~35 jobs) regardless (confirmed in recon). The CLI therefore filters `--query`/`--category`/`--jobage` **client-side**.
