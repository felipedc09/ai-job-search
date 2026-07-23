# RemoteOK — API reference (recon)

- **Endpoint:** `GET https://remoteok.com/api` — returns a JSON array.
- **robots.txt:** `User-agent: * / Allow: /` with `Crawl-delay: 1`. Public API path is allowed.
- **ToS (from element[0].legal):** link back to the RemoteOK listing URL and credit RemoteOK; don't reuse the logo. Personal shortlist use is fine; no republishing.
- **Quirk:** element `[0]` is a legal notice with no `position` — skip it.
- **Fields:** `id`, `position`→title, `company`, `location`, `date` (ISO), `url`, `salary_min`/`salary_max` (annual USD, `0`=absent), `tags[]`, `description` (HTML).
- **Recency/paging:** no server params; filter `date` and slice client-side.
