# Working Nomads — API reference (recon)

- **Endpoint:** `GET https://www.workingnomads.com/api/exposed_jobs/` → JSON array (single curated snapshot).
- **robots.txt:** `Disallow:` empty → everything allowed.
- **Fields:** `url`, `title`, `description` (HTML), `company_name`, `category_name`, `tags` (comma string), `location`, `pub_date` (ISO).
- **No id field:** derive from `/job/go/<n>/` in the URL. No salary/timezone data.
- **Filtering:** all client-side (`--query`, `--category`, `--jobage`).
