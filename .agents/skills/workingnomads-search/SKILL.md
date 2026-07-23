---
name: workingnomads-search
version: 1.0.0
description: >
  Search live remote job listings from Working Nomads (Curated remote job feed). Best for Felipe's
  remote-international / Americas-timezone software roles. Trigger phrases:
  find jobs, job search, search jobs, remote jobs, Working Nomads jobs, new positions,
  /scrape.
context: fork
allowed-tools: Bash(bun run .agents/skills/workingnomads-search/cli/src/cli.ts *)
---

# Working Nomads Search Skill

Search live job listings from **Working Nomads** via its public API — no authentication,
no API key, zero runtime dependencies (just `bun`). Part of this fork's job-portal
skill set; built with `/add-portal` against the recon in `url-reference.md`.

## ⚠️ Personal use only

Uses Working Nomads's public API. **Keep request volume low** (a couple of calls a day is
plenty — the data barely changes faster than that) and always **apply through the
job's own listing URL** so Working Nomads keeps its attribution and referral traffic. Do
**not** republish these listings to third-party sites. Your own responsibility.

## When to use this skill

- Find remote software openings matching a query (title, stack, seniority)
- Feed the `/scrape` pipeline as one portal among several
- Look up one listing's full detail from a previous search result

## Commands

### Search
```bash
bun run .agents/skills/workingnomads-search/cli/src/cli.ts search [flags]
```
Key flags: `--query/-q` (client-side filter), `--category/-c`
(matched against the portal's `category_name`, e.g. `development`), `--jobage`,
`--limit/-n`, `--format`.

### Detail
```bash
bun run .agents/skills/workingnomads-search/cli/src/cli.ts detail <id|url> [--format json|plain]
```
Resolves an `id`/`url` from a prior `search` against the same live feed and prints
its full record (the feed already carries descriptions, so there is no separate
detail endpoint to hit).

## Usage examples
```bash
bun run src/cli.ts search -q "react" -c development --format table
```

## Output

`--format json` (default) emits `{ "count": N, "results": [ ... ] }`; each result
has `id, title, company, location, date, url, salary, tags, remote, description,
source`, plus `extra.category`. `table` and `plain` are for human scanning. Errors go to
**stderr** as `{ "error": "...", "code": "..." }` with exit code 1.

## Notes
- The feed is a single curated snapshot; filter with `--query`/`--category` locally.
- No salary or timezone data exposed.
- All listings are remote.
