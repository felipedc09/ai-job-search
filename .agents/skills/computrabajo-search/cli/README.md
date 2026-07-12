# computrabajo-cli

Zero-dependency CLI for searching **Computrabajo Colombia** (co.computrabajo.com)
public job listings. Runs on `bun` alone. Personal use only.

## Setup

```bash
cd .agents/skills/computrabajo-search/cli
bun install      # dev types only (no runtime dependencies)
```

## Commands

```bash
# Search (‑‑query is required)
bun run src/cli.ts search -q "React" --format table
bun run src/cli.ts search -q "Full Stack" -l "Bogotá D.C." --jobage 14 --format table

# Detail (pass the full offer URL from a search result's "url" field)
bun run src/cli.ts detail "https://co.computrabajo.com/ofertas-de-trabajo/oferta-de-trabajo-de-...HASH" --format plain
```

See `../SKILL.md` for the full flag reference and `../url-reference.md` for the
endpoint/parsing map (what to update if the portal changes its markup).

## Contract

- Commands: `search`, `detail <url>`.
- JSON output: `{ "meta": { count, page }, "results": [...] }`; each result has
  `id`, `title`, `company`, `location`, `workMode`, `date`, `ageDays`, `url`
  (missing values are `null`).
- Errors: `{ "error", "code" }` on **stderr**, exit code `1`.

## Develop

```bash
bun run typecheck   # tsc --noEmit
bun run test        # unit (parsing, flags) + one live search smoke test
```

The live test in `tests/search.test.ts` hits the real site (one low-volume request).
Unit tests in `tests/parsing.test.ts` use inline HTML fixtures and need no network.
