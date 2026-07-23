# Torre — API reference (recon)

- **Endpoint:** `POST https://search.torre.co/opportunities/_search/?size=<n>&aggregate=false&offset=<o>` with JSON body `{ "skill/role": { "text": "<q>", "experience": "<bound>" } }` → `{ total, size, offset, results: [...] }`.
- **Required:** `experience` must be present (`potential-to-develop` [broadest], `1-plus-year`, `2-plus-years`, `3-plus-years`, `5-plus-years`); omitting it 500s.
- **robots.txt:** `search.torre.co` serves none (API host). `torre.ai` public listing pages `/post/<id>` are the apply URLs (200 OK).
- **Fields:** `id`, `objective`→title, `tagline`, `organizations[].name`, `locations[]`, `timezones[]` (e.g. `"GMT-06:00"` → offset -6), `remote` (bool), `created`/`deadline` (ISO), `commitment`, `compensation.data.{currency,minAmount,maxAmount,periodicity}`.
- **Listing URL:** `https://torre.ai/post/<id>`.
