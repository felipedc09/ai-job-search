#!/usr/bin/env bun
// Self-contained CLI for searching Torre (https://search.torre.co/opportunities/_search/ (public JSON, POST)).
//
// Personal use only. Keep request volume low, and always apply through the
// portal's own listing URL so the source keeps its attribution/traffic.

import { fetchJobs, type SearchOpts } from "./search.js"
import { renderJobs, writeError, type Format } from "./helpers.js"

interface Flags {
  _: string[]
  [k: string]: string | boolean | string[]
}

function parseFlags(argv: string[]): Flags {
  const flags: Flags = { _: [] }
  const alias: Record<string, string> = { q: "query", n: "limit", c: "category", l: "location" }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith("-")) {
      const key = alias[a.replace(/^-+/, "")] ?? a.replace(/^-+/, "")
      const next = argv[i + 1]
      if (next === undefined || next.startsWith("-")) {
        flags[key] = true
      } else {
        flags[key] = next
        i++
      }
    } else {
      ;(flags._ as string[]).push(a)
    }
  }
  return flags
}

const HELP = `torre-search — search jobs on Torre (remote-first; personal use)\n\nUSAGE\n  bun run src/cli.ts search [flags]\n  bun run src/cli.ts detail <id|url> [--format json|plain]\n\nSEARCH FLAGS\n  --query, -q <text>    Keywords (title/skill/role). AND-matched.\n  --category, -c <slug> Portal category filter (see SKILL.md).\n  --remote <mode>       remote | hybrid | onsite.\n  --location, -l <text> Location hint (portals that support it).\n  --timezone <n>        Keep jobs whose TZ set includes UTC offset n (e.g. -5).\n  --experience <bound>  Torre only: seniority bound (see SKILL.md).\n  --jobage <days>       Posted within N days.\n  --page <n>            1-indexed page.\n  --limit, -n <n>       Cap results (default 20).\n  --format <fmt>        json (default) | table | plain.\n\nEXAMPLES\n  bun run src/cli.ts search -q \"software architect\" --timezone -5 --format table\n\nPersonal use only — keep request volume low; apply via the listing URL.\n`

export function parseIntFlag(name: string, raw: unknown): number | null {
  const val = parseInt(String(raw), 10)
  if (isNaN(val)) {
    writeError(`--${name} must be a number, got "${String(raw)}"`, "BAD_ARG")
    return null
  }
  return val
}

const REMOTE_MODES = ["remote", "hybrid", "onsite"]

async function main(): Promise<number> {
  const argv = process.argv.slice(2)
  const flags = parseFlags(argv)
  const cmd = (flags._ as string[])[0]

  if (!cmd || flags.help || flags.h) {
    process.stdout.write(HELP)
    return cmd ? 0 : 1
  }

  if (cmd !== "search" && cmd !== "detail") {
    writeError(`Unknown command "${cmd}"`, "BAD_CMD")
    return 1
  }

  const fmtRaw = typeof flags.format === "string" ? flags.format : "json"
  const format = (["json", "table", "plain"].includes(fmtRaw) ? fmtRaw : "json") as Format

  for (const numeric of ["limit", "jobage", "page"]) {
    if (flags[numeric] !== undefined) {
      const v = parseIntFlag(numeric, flags[numeric])
      if (v === null) return 1
      flags[numeric] = String(v)
    }
  }

  if (typeof flags.remote === "string" && !REMOTE_MODES.includes(flags.remote.toLowerCase())) {
    writeError(`--remote must be one of ${REMOTE_MODES.join(" | ")}, got "${flags.remote}"`, "BAD_ARG")
    return 1
  }

  if (flags.timezone !== undefined && flags.timezone !== true) {
    const v = parseIntFlag("timezone", flags.timezone)
    if (v === null) return 1
    flags.timezone = String(v)
  }

  const opts: SearchOpts = {
    query: typeof flags.query === "string" ? flags.query : undefined,
    category: typeof flags.category === "string" ? flags.category : undefined,
    remote: typeof flags.remote === "string" ? flags.remote.toLowerCase() : undefined,
    location: typeof flags.location === "string" ? flags.location : undefined,
    experience: typeof flags.experience === "string" ? flags.experience : undefined,
    timezone: typeof flags.timezone === "string" ? parseInt(flags.timezone, 10) : undefined,
    jobage: flags.jobage ? parseInt(flags.jobage as string, 10) : undefined,
    page: flags.page ? Math.max(1, parseInt(flags.page as string, 10)) : 1,
    limit: flags.limit ? parseInt(flags.limit as string, 10) : 20,
  }

  if (cmd === "detail") {
    const id = (flags._ as string[])[1]
    if (!id) {
      writeError("detail requires an <id|url>", "NO_ID")
      return 1
    }
    try {
      // The portal's feed already carries full descriptions, so `detail` resolves
      // against the same source rather than hitting a separate endpoint.
      const jobs = await fetchJobs({ ...opts, query: undefined, limit: 100000 })
      const needle = id.replace(/\/+$/, "")
      const found = jobs.find((j) => j.id === needle || j.url.replace(/\/+$/, "") === needle)
      if (!found) {
        writeError(`No job found for "${id}" in the current feed (it may have expired)`, "NOT_FOUND")
        return 1
      }
      process.stdout.write(
        format === "json"
          ? JSON.stringify(found, null, 2) + "\n"
          : renderJobs([found], "plain"),
      )
      return 0
    } catch (err) {
      writeError(err instanceof Error ? err.message : String(err), "FETCH_FAILED")
      return 1
    }
  }

  try {
    const jobs = await fetchJobs(opts)
    process.stdout.write(renderJobs(jobs, format))
    return 0
  } catch (err) {
    writeError(err instanceof Error ? err.message : String(err), "FETCH_FAILED")
    return 1
  }
}

main().then((code) => process.exit(code))
