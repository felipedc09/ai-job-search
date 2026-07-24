---
name: torre-search
version: 1.0.0
description: >
  Search live remote job listings from Torre (LATAM-strong global talent marketplace). Best for Felipe's
  remote-international / Americas-timezone software roles. Trigger phrases:
  find jobs, job search, search jobs, remote jobs, Torre jobs, new positions,
  /scrape.
context: fork
allowed-tools: Bash(bun run .agents/skills/torre-search/cli/src/cli.ts *)
---

# Torre Search Skill

Search live job listings from **Torre** via its public API — no authentication,
no API key, zero runtime dependencies (just `bun`). Part of this fork's job-portal
skill set; built with `/add-portal` against the recon in `url-reference.md`.

## ⚠️ Personal use only

Uses Torre's public API. **Keep request volume low** (a couple of calls a day is
plenty — the data barely changes faster than that) and always **apply through the
job's own listing URL** so Torre keeps its attribution and referral traffic. Do
**not** republish these listings to third-party sites. Your own responsibility.

## When to use this skill

- Find remote software openings matching a query (title, stack, seniority)
- Feed the `/scrape` pipeline as one portal among several
- Look up one listing's full detail from a previous search result

## Commands

### Search
```bash
bun run .agents/skills/torre-search/cli/src/cli.ts search [flags]
```
Key flags: `--query/-q` (skill/role text — defaults to "software engineer"),
`--experience <bound>` (`potential-to-develop` [default, broadest], `1-plus-year`,
`3-plus-years`, `5-plus-years`), `--timezone <n>` (e.g. `-5`), `--remote`, `--jobage`,
`--page`, `--limit/-n`, `--format`.

### Detail
```bash
bun run .agents/skills/torre-search/cli/src/cli.ts detail <id|url> [--format json|plain]
```
Resolves an `id`/`url` from a prior `search` against the same live feed and prints
its full record (the feed already carries descriptions, so there is no separate
detail endpoint to hit).

## Usage examples
```bash
bun run src/cli.ts search -q "software architect" --timezone -5 --format table
```

## Output

`--format json` (default) emits `{ "count": N, "results": [ ... ] }`; each result
has `id, title, company, location, date, url, salary, tags, remote, description,
source`, plus `extra.timezoneOffsets` and `extra.deadline`. `table` and `plain` are for human scanning. Errors go to
**stderr** as `{ "error": "...", "code": "..." }` with exit code 1.

## Notes
- Search is a POST with a required `experience` bound; the CLI defaults to the broadest.
- `remote` and `timezones` come straight from the opportunity; `--timezone -5` keeps Bogotá-overlapping roles.
- Compensation currency/period is whatever the poster set (often USD/monthly for LATAM).
