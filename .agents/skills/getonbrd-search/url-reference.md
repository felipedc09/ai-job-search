# Get on Board — API reference (recon)

- **Endpoint:** `GET https://www.getonbrd.com/api/v0/search/jobs?query=<q>&category=<slug>&per_page=<n>&page=<p>&expand[]=company` → JSON:API `{ data: [{ id, attributes, links }], meta }`.
- **robots.txt:** `Allow: /` (blocks only AI crawler UAs like GPTBot/ClaudeBot; a normal browser UA is fine).
- **Company name:** requires `expand[]=company` (note the `[]` — `expand=company` 500s); read `attributes.company.data.attributes.name`.
- **Fields (attributes):** `title`, `description` (HTML, often Spanish), `remote`/`remote_modality`, `countries[]`, `category_name`, `min_salary`/`max_salary` (USD/month), `published_at` (epoch s), `seniority`. `id` (slug) at top level; `links.public_url` is the listing URL.
- **Categories:** `/api/v0/categories` (e.g. `programming`, `sysadmin-devops-qa`, `design-ux`, `cybersecurity`).
