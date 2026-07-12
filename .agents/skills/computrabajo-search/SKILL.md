---
name: computrabajo-search
version: 1.0.0
description: >
  Use this skill whenever the user wants to search for jobs in Colombia, find
  Colombian job listings, or look up a posting on Computrabajo — even if they
  don't mention computrabajo.com explicitly. Covers Colombia's largest general
  job board (co.computrabajo.com), across all sectors and cities, including
  remote (remoto) and hybrid (híbrido) roles. Trigger phrases include:
  computrabajo, empleos colombia, trabajo en colombia, buscar trabajo colombia,
  ofertas de trabajo, ofertas de empleo, vacantes colombia, empleo bogota,
  trabajo bogota, empleos medellin, trabajo cali, trabajo barranquilla,
  trabajo remoto colombia, empleo remoto, desarrollador colombia, ingeniero
  de software colombia, trabajo medio tiempo, tiempo completo, practicante,
  jobs in colombia, colombian jobs, find job colombia, software jobs colombia,
  developer jobs bogota, remote jobs colombia, hiring colombia.
context: fork
allowed-tools: Bash(bun run .agents/skills/computrabajo-search/cli/src/cli.ts *)
---

# Computrabajo Search Skill

Search live job listings from **[Computrabajo Colombia](https://co.computrabajo.com)** —
Colombia's largest general job board. Reads the site's public listing pages; no
authentication, no API key, and **zero runtime dependencies** — it runs with just `bun`.

> ⚠️ **Personal use only.** This reads Computrabajo's public pages. Keep volume low
> (a handful of requests, not a crawl), do not use it commercially or for bulk data
> collection, and run it on your own responsibility. The CLI only requests the base
> search and detail paths that `robots.txt` permits for `User-agent: *`; it never
> touches the disallowed CV, `/Ajax/`, `/_services/`, or filter-parameter endpoints.

## What it does

- Search job openings in Colombia by keyword, optionally narrowed to a city/region.
- Filter by recency (posted within N days) — applied client-side, since Computrabajo
  exposes no `robots.txt`-allowed recency parameter.
- Look up a single posting's full description, employer, employment type, and dates.

## Commands

### Search job listings

```bash
bun run .agents/skills/computrabajo-search/cli/src/cli.ts search --query "<keywords>" [flags]
```

Key flags:
- `--query <text>` / `-q <text>` — **required.** Keyword search (title, skill, role),
  e.g. `"React"`, `"Full Stack"`, `"Software Architect"`.
- `--location <text>` / `-l <text>` — optional Colombian city/region, e.g.
  `"Bogotá D.C."`, `"Medellín"`, `"Cali"`. Appended to the URL as `-en-<slug>`.
- `--jobage <days>` — posted within N days: `1`, `7`, `14`, `30`. Applied **client-side**
  against each card's relative date (`Hoy`, `Ayer`, `Hace N días`); cards with an
  unparseable date are kept rather than dropped. Omit for all postings.
- `--page <n>` — 1-indexed page (20 results/page). Default 1.
- `--limit <n>` / `-n <n>` — cap total results emitted (client-side).
- `--format json|table|plain` — default `json`.

### Look up one posting

```bash
bun run .agents/skills/computrabajo-search/cli/src/cli.ts detail <url> [--format json|plain]
```

`detail` takes the **full offer URL** from a search result's `url` field. A bare
hash id cannot be used — Computrabajo's detail URLs require the full slug, and the
hash alone returns 404.

## Usage examples

```bash
# React roles anywhere in Colombia, as a table
bun run .agents/skills/computrabajo-search/cli/src/cli.ts search -q "React" --format table

# Full-stack roles in Bogotá posted in the last 14 days
bun run .agents/skills/computrabajo-search/cli/src/cli.ts search -q "Full Stack" -l "Bogotá D.C." --jobage 14 --format table

# Software architect roles in Medellín (JSON for piping)
bun run .agents/skills/computrabajo-search/cli/src/cli.ts search -q "Software Architect" -l "Medellín" --format json

# Frontend roles, recent, capped at 10, human-readable
bun run .agents/skills/computrabajo-search/cli/src/cli.ts search -q "desarrollador frontend" --jobage 7 --limit 10 --format plain

# Full detail of one posting (URL comes from a search result)
bun run .agents/skills/computrabajo-search/cli/src/cli.ts detail "https://co.computrabajo.com/ofertas-de-trabajo/oferta-de-trabajo-de-...HASH" --format plain
```

## Output format

| Format  | Use |
|---------|-----|
| `json`  | Default — programmatic use. `{ "meta": { count, page }, "results": [...] }`; each result has `id`, `title`, `company`, `location`, `workMode`, `date`, `ageDays`, `url`. Missing values are `null`. |
| `table` | Quick scan in the terminal. |
| `plain` | Human-readable blocks. |

Errors are written to **stderr** as `{ "error": "...", "code": "..." }` with exit code `1`.

## Notes (portal quirks)

- **No recency URL parameter.** Computrabajo's `pubdate=` filter is disallowed by
  `robots.txt`, so `--jobage` filters client-side on each card's relative Spanish date.
- **Relative dates.** Cards show `Hoy`, `Ayer`, `Hace N días`, `Hace más de 30 días` —
  the CLI derives an `ageDays` integer from these (`Hoy`/hours → 0, `Ayer` → 1, etc.).
- **Confidential employers.** Some cards omit the company; `company` comes back `null`.
- **Detail needs the full URL.** The 32-char hash id does not resolve on its own.
- **Location slug.** `--location` is slugified (accents stripped, spaces → `-`), so
  `"Bogotá D.C."` becomes `-en-bogota-d-c`.
- Search returns ~20 cards per page; use `--page` to go deeper.
