# Search Queries for Job Scraper

<!-- Configured for Felipe Duitama: Senior/Principal software engineer, Bogotá-based,
     targeting remote-international, Americas-timezone remote, and Bogotá hybrid roles.
     Update with `/setup --section search`. -->

## Search Sites

Installed portal CLIs (in `.agents/skills/`, run via `bun`) — all cover Colombia /
remote / international:
- **linkedin-search** — LinkedIn jobs for any location; pass `--location "Colombia"`,
  `"Bogotá, Colombia"`, or `"Remote"`, plus `--remote remote|hybrid` and `--jobage 14`.
- **freehire-search** — aggregator across ~50 ATS platforms; use `--region latam`,
  `--country CO`, `--seniority senior,staff,principal`, `--category frontend,fullstack`.
- **computrabajo-search** — Computrabajo Colombia (local board); `--query` required,
  optional `--location "Bogotá D.C."`/`"Medellín"`, `--jobage 14`. Best for on-site/
  hybrid Colombian roles. `detail` needs the full offer URL from a search result.

The four Denmark-only CLIs (Jobindex, Jobbank, Jobdanmark, Jobnet) were **removed** —
they don't apply to this search. Add more local boards as native CLIs with `/add-portal`.

Additional sources (via WebSearch `site:` fallback, or scaffold with `/add-portal`):
- **getonbrd.com** (Get on Board) — LATAM tech board; needs a free API token (not scaffolded).
- **weworkremotely.com**, **remoteok.com**, **remote.co** — remote-first boards.
- Direct Google `site:` searches for known target companies' career pages.

## Query Categories

Queries are grouped by priority. Combine each with location/remote terms
("remote", "Colombia", "Latin America", "Bogotá") where the site supports it.

### Priority 1: Senior / Principal / Staff Engineering (primary direction)

```
site:linkedin.com/jobs "Principal Software Engineer" (remote OR Colombia OR "Latin America")
site:linkedin.com/jobs "Staff Software Engineer" remote
site:linkedin.com/jobs "Software Architect" (remote OR Bogotá)
site:linkedin.com/jobs "Senior Software Engineer" React TypeScript remote
site:getonbrd.com ("staff engineer" OR "principal engineer" OR "software architect")
```

### Priority 2: Frontend / Full-Stack Architecture (core strength)

```
site:linkedin.com/jobs "Senior Frontend Engineer" React TypeScript remote
site:linkedin.com/jobs "Frontend Architect" (React OR TypeScript) remote
site:linkedin.com/jobs "Senior Full Stack Engineer" (React OR Node) remote
site:weworkremotely.com (frontend OR "full stack") (React OR TypeScript)
site:getonbrd.com (frontend OR fullstack) React TypeScript
```

### Priority 3: Full Stack Developer / Cloud & Node (broader IC roles)

```
site:linkedin.com/jobs "Full Stack Developer" (React OR "Node.js") remote
site:linkedin.com/jobs "Full Stack Engineer" AWS Node remote
site:remoteok.com fullstack (react OR node OR typescript)
site:linkedin.com/jobs ("Node.js" OR ".NET") developer remote Colombia
```

### Priority 4: Adjacent / Specialist (3D, AR, ConstructionTech — wider net)

```
site:linkedin.com/jobs ("3D" OR WebGL OR "Three.js") "software engineer" remote
site:linkedin.com/jobs (Unity OR "augmented reality" OR AR) engineer remote
site:linkedin.com/jobs (ConstructionTech OR PropTech OR BIM) "software engineer" remote
site:linkedin.com/jobs "Tech Lead" (React OR TypeScript OR Node) remote
```

## Location Filter

Felipe is based in Bogotá and is **not** relocating abroad. Acceptable arrangements:
- **Remote — international** (any HQ location): PASS
- **Remote — Americas / US / LATAM timezone**: PASS (preferred overlap)
- **Bogotá — hybrid or on-site**: PASS
- **Remote — core Europe/Asia hours only (little Americas overlap)**: BORDERLINE — flag for discussion
- **Requires relocation outside Colombia**: TOO FAR — skip

## Date Filter

Only include jobs posted within the last 14 days, or with an application deadline that has
not yet passed. If a posting date cannot be determined, include it but flag as "date unknown".

## Adapting Queries

If the user specifies a focus area, select queries from the matching category and also
generate 2-3 custom queries for that focus. For example:
- "/scrape frontend" -> Priority 2 queries + custom frontend-specific queries
- "/scrape remote" -> tighten every query with `remote` and prioritize the remote-first boards
