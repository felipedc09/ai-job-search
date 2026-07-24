---
name: himalayas-search
version: 1.0.0
description: >
  Search live remote job listings from Himalayas (Global remote board with timezone data). Best for Felipe's
  remote-international / Americas-timezone software roles. Trigger phrases:
  find jobs, job search, search jobs, remote jobs, Himalayas jobs, new positions,
  /scrape.
context: fork
allowed-tools: Bash(bun run .agents/skills/himalayas-search/cli/src/cli.ts *)
---

# Himalayas Search Skill

Search live job listings from **Himalayas** via its public API — no authentication,
no API key, zero runtime dependencies (just `bun`). Part of this fork's job-portal
skill set; built with `/add-portal` against the recon in `url-reference.md`.

## ⚠️ Personal use only

Uses Himalayas's public API. **Keep request volume low** (a couple of calls a day is
plenty — the data barely changes faster than that) and always **apply through the
job's own listing URL** so Himalayas keeps its attribution and referral traffic. Do
**not** republish these listings to third-party sites. Your own responsibility.

## When to use this skill

- Find remote software openings matching a query (title, stack, seniority)
- Feed the `/scrape` pipeline as one portal among several
- Look up one listing's full detail from a previous search result

## Commands

### Search
```bash
bun run .agents/skills/himalayas-search/cli/src/cli.ts search [flags]
```
Key flags: `--query/-q` (client-side filter over a live page),
`--timezone <n>` (keep jobs whose allowed timezones include UTC offset `n`, e.g. `-5`
for Bogotá), `--jobage`, `--limit/-n`, `--format`.

### Detail
```bash
bun run .agents/skills/himalayas-search/cli/src/cli.ts detail <id|url> [--format json|plain]
```
Resolves an `id`/`url` from a prior `search` against the same live feed and prints
its full record (the feed already carries descriptions, so there is no separate
detail endpoint to hit).

## Usage examples
```bash
bun run src/cli.ts search -q "software engineer" --timezone -5 --format table
```

## Output

`--format json` (default) emits `{ "count": N, "results": [ ... ] }`; each result
has `id, title, company, location, date, url, salary, tags, remote, description,
source`, plus `extra.timezoneOffsets`, `extra.seniority`, `extra.employmentType`. `table` and `plain` are for human scanning. Errors go to
**stderr** as `{ "error": "...", "code": "..." }` with exit code 1.

## Notes
- No server-side text search: the CLI pulls a live page (100 jobs) and filters locally, so widen `--limit`/`--page` for broad sweeps.
- `--timezone` uses the portal's own `timezoneRestrictions`; jobs with none stated pass.
- All listings are remote.
