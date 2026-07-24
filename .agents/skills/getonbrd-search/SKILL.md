---
name: getonbrd-search
version: 1.0.0
description: >
  Search live remote job listings from Get on Board (LATAM tech board (Spanish/English), USD pay bands). Best for Felipe's
  remote-international / Americas-timezone software roles. Trigger phrases:
  find jobs, job search, search jobs, remote jobs, Get on Board jobs, new positions,
  /scrape.
context: fork
allowed-tools: Bash(bun run .agents/skills/getonbrd-search/cli/src/cli.ts *)
---

# Get on Board Search Skill

Search live job listings from **Get on Board** via its public API — no authentication,
no API key, zero runtime dependencies (just `bun`). Part of this fork's job-portal
skill set; built with `/add-portal` against the recon in `url-reference.md`.

## ⚠️ Personal use only

Uses Get on Board's public API. **Keep request volume low** (a couple of calls a day is
plenty — the data barely changes faster than that) and always **apply through the
job's own listing URL** so Get on Board keeps its attribution and referral traffic. Do
**not** republish these listings to third-party sites. Your own responsibility.

## When to use this skill

- Find remote software openings matching a query (title, stack, seniority)
- Feed the `/scrape` pipeline as one portal among several
- Look up one listing's full detail from a previous search result

## Commands

### Search
```bash
bun run .agents/skills/getonbrd-search/cli/src/cli.ts search [flags]
```
Key flags: `--query/-q` (server-side search), `--category/-c <slug>`
(`programming`, `sysadmin-devops-qa`, `design-ux`, ...), `--remote remote|onsite`,
`--jobage`, `--page`, `--limit/-n`, `--format`.

### Detail
```bash
bun run .agents/skills/getonbrd-search/cli/src/cli.ts detail <id|url> [--format json|plain]
```
Resolves an `id`/`url` from a prior `search` against the same live feed and prints
its full record (the feed already carries descriptions, so there is no separate
detail endpoint to hit).

## Usage examples
```bash
bun run src/cli.ts search -q "react" -c programming --remote remote --format table
```

## Output

`--format json` (default) emits `{ "count": N, "results": [ ... ] }`; each result
has `id, title, company, location, date, url, salary, tags, remote, description,
source`, plus `extra.modality` and `extra.category`. `table` and `plain` are for human scanning. Errors go to
**stderr** as `{ "error": "...", "code": "..." }` with exit code 1.

## Notes
- LATAM-focused; many postings are Spanish (`--query` terms match either language in title/description).
- Pay bands are USD/month.
- `expand[]=company` is always sent so the employer name is populated.
