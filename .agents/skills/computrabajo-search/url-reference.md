# Computrabajo Colombia — endpoint & parsing reference

Maintenance notes for `computrabajo-search`. If the portal changes its markup,
update the anchors below (they are the regexes in `cli/src/helpers.ts`).

**Host:** `https://co.computrabajo.com` (Colombia. Other Computrabajo markets use
the same pattern under a different subdomain, e.g. `www.computrabajo.com.mx`.)

## robots.txt (checked 2026-07)

`User-agent: *` — base search and detail paths are allowed. Disallowed paths this
CLI never touches:
- `/hojas-de-vida/*`, `/curriculums/*` (candidate CVs)
- `/ofertas-de-trabajo/*<param>=` filter variants: `dis=`, `cont=`, `pubdate=`,
  `sal=`, `by=`, `emp=`, and the `em*` combinations
- `/empresas/*city=`, `*cat=`, `*prov=`, `*t=`
- `/Ajax/*`, `/_services/*`, `/ofertas-de-trabajo/Detail/Print.aspx`

Because `pubdate=` is disallowed, recency (`--jobage`) is filtered **client-side**,
not via the URL.

## Search

**URL:** `GET /trabajo-de-<keyword-slug>[-en-<location-slug>][?p=<page>]`

- `<keyword-slug>` — `--query` slugified: NFD-normalized, accents stripped,
  lowercased, non-alphanumerics → `-`, collapsed/trimmed. `"Full Stack"` → `full-stack`.
- `-en-<location-slug>` — optional, from `--location`. `"Bogotá D.C."` → `bogota-d-c`.
- `?p=<n>` — 1-indexed pagination, 20 results/page. Omitted for page 1.

**Response:** server-rendered HTML. Results are `<article class="box_offer ...">`
cards. Split on `<article class="box_offer` and parse each chunk independently.

Per-card anchors:

| Field | Anchor |
|-------|--------|
| `id` | `data-id='<32-hex>'` on the `<article>` |
| `title` + `url` | first `<a class="js-o-link ..." href="<path>">Title</a>`; strip the `#lc=...` fragment, prefix host |
| `company` | `<a ... offer-grid-article-company-url>Company</a>` (absent for confidential → `null`) |
| `location` | plain `<span class="mr10">City, Region</span>` (the work-mode span is `class="dIB mr10"` and holds an icon) |
| `workMode` | icon span `i_home` (Remoto) / `i_building` (Presencial) / `i_zone` (Híbrido) followed by its label |
| `date` | `<p class="fs13 fc_aux ...">Ayer</p>` — relative Spanish |

Relative-date → `ageDays`: `Hoy`/`Hace N horas` → 0, `Ayer` → 1, `Hace N días` → N,
`Hace N semanas` → N×7, `Hace N meses` → N×30, `Hace más de 30 días` → 31, else `null`.

## Detail

**URL:** the full offer URL from a search result's `url` field, i.e.
`GET /ofertas-de-trabajo/oferta-de-trabajo-de-<slug>-<32-hex>`. The bare hash id
does **not** resolve (404) — the full slug is required.

**Response:** HTML embedding one `<script type="application/ld+json">` with an
`@graph` array. Find the node with `"@type": "JobPosting"` and read:

| Field | ld+json path |
|-------|--------------|
| `title` | `.title` |
| `company` | `.hiringOrganization.name` |
| `location` | `.jobLocation.address` → `addressLocality, addressRegion, addressCountry` |
| `description` | `.description` (HTML → stripped to text) |
| `employmentType` | `.employmentType` |
| `datePosted` | `.datePosted` |
| `validThrough` | `.validThrough` |

Fallbacks if the ld+json is missing/partial: title from
`<h1 class="... box_detail ...">`, description from `class="description_offer"`.

## Fetching

Browser `User-Agent`, `Accept-Language: es-CO`. Exponential backoff with jitter on
429/5xx (max 6 retries); `""` on 404 (→ `NOT_FOUND`). No cookies or auth needed.
