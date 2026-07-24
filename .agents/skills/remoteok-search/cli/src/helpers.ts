// Shared plumbing for this portal-search CLI. Self-contained by repo convention:
// every skill under .agents/skills/ owns its copy so it runs and typechecks alone.

export interface Job {
  id: string
  title: string
  company: string | null
  location: string | null
  /** ISO-8601 publication date, or null when the portal does not expose one. */
  date: string | null
  url: string
  salary: string | null
  tags: string[]
  /** true/false when the portal states it, null when unknown. */
  remote: boolean | null
  description: string | null
  /** Portal slug, so merged multi-portal result sets stay attributable. */
  source: string
  /** Portal-specific extras (timezones, seniority, modality, ...). */
  extra?: Record<string, unknown>
}

export function writeError(error: string, code: string): void {
  process.stderr.write(JSON.stringify({ error, code }) + "\n")
}

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

interface FetchOpts {
  method?: "GET" | "POST"
  body?: string
  accept?: string
}

/** Fetch with exponential backoff on 429/5xx. Returns "" on 404. */
export async function rawFetch(url: string, opts: FetchOpts = {}): Promise<string> {
  const maxRetries = 5
  let delay = 500
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const headers: Record<string, string> = {
      "User-Agent": UA,
      Accept: opts.accept ?? "application/json,text/plain,*/*",
      "Accept-Language": "en-US,en;q=0.9",
    }
    if (opts.body) headers["Content-Type"] = "application/json"
    const response = await fetch(url, {
      method: opts.method ?? "GET",
      headers,
      body: opts.body,
      redirect: "follow",
    })
    if (response.status === 429 || response.status >= 500) {
      if (attempt === maxRetries) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`)
      }
      const jitter = Math.floor(Math.random() * 500)
      await new Promise((r) => setTimeout(r, delay + jitter))
      delay = Math.min(delay * 2, 8000)
      continue
    }
    if (response.status === 404) return ""
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`)
    }
    return response.text()
  }
  throw new Error("Request failed after max retries")
}

export async function jsonFetch<T>(url: string, opts: FetchOpts = {}): Promise<T> {
  const text = await rawFetch(url, opts)
  if (!text) return [] as unknown as T
  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error("Upstream returned a non-JSON response")
  }
}

function numericEntity(cp: number): string {
  return cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : ""
}

export function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => numericEntity(parseInt(dec, 10)))
    .replace(/&#[xX]([0-9a-fA-F]+);/g, (_, hex) => numericEntity(parseInt(hex, 16)))
    .replace(/&nbsp;/g, " ")
}

/** Strip HTML to readable plain text, preserving block-level line breaks. */
export function htmlToText(html: string | null | undefined): string | null {
  if (!html) return null
  const withBreaks = html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|li|ul|ol|div|h\d|tr)>/gi, "\n")
  const text = decodeEntities(withBreaks.replace(/<[^>]+>/g, " "))
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
  return text || null
}

/** Case-insensitive AND-match of whitespace-separated terms over a job's text. */
export function matchesQuery(job: Job, query: string | undefined): boolean {
  if (!query) return true
  const haystack = [job.title, job.company, job.location, job.description, job.tags.join(" ")]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term))
}

/**
 * True when the job's timezone restrictions include `offset` (e.g. -5 for
 * Bogotá). Jobs whose portal exposes no timezone data pass, mirroring the
 * "unknown dates pass" rule in `withinDays` — check each SKILL.md for whether
 * a portal populates `extra.timezoneOffsets` at all.
 */
export function withinTimezone(job: Job, offset: number | undefined): boolean {
  if (offset === undefined || isNaN(offset)) return true
  const offsets = job.extra?.timezoneOffsets
  if (!Array.isArray(offsets) || offsets.length === 0) return true
  return offsets.some((o) => Number(o) === offset)
}

/** True when the job was published within `days` days. Unknown dates pass. */
export function withinDays(job: Job, days: number | undefined): boolean {
  if (!days || days <= 0 || days >= 9999) return true
  if (!job.date) return true
  const published = Date.parse(job.date)
  if (isNaN(published)) return true
  return published >= Date.now() - days * 86400000
}

export function epochToIso(epoch: unknown): string | null {
  const n = typeof epoch === "string" ? parseInt(epoch, 10) : typeof epoch === "number" ? epoch : NaN
  if (isNaN(n) || n <= 0) return null
  // Tolerate both seconds and milliseconds.
  const ms = n > 1e11 ? n : n * 1000
  return new Date(ms).toISOString()
}

export function formatSalary(
  min: unknown,
  max: unknown,
  currency = "USD",
  period?: string,
): string | null {
  const lo = typeof min === "string" ? parseFloat(min) : typeof min === "number" ? min : NaN
  const hi = typeof max === "string" ? parseFloat(max) : typeof max === "number" ? max : NaN
  const hasLo = !isNaN(lo) && lo > 0
  const hasHi = !isNaN(hi) && hi > 0
  if (!hasLo && !hasHi) return null
  const suffix = period ? `/${period}` : ""
  if (hasLo && hasHi) return `${lo}-${hi} ${currency}${suffix}`
  return `${hasLo ? lo : hi} ${currency}${suffix}`
}

export type Format = "json" | "table" | "plain"

function truncate(text: string, width: number): string {
  return text.length <= width ? text.padEnd(width) : text.slice(0, width - 1) + "…"
}

export function renderJobs(jobs: Job[], format: Format): string {
  if (format === "json") {
    return JSON.stringify({ count: jobs.length, results: jobs }, null, 2) + "\n"
  }
  if (jobs.length === 0) return "No matching jobs found.\n"
  if (format === "table") {
    const header =
      truncate("TITLE", 44) + truncate("COMPANY", 24) + truncate("LOCATION", 22) + "DATE\n"
    const rows = jobs.map(
      (j) =>
        truncate(j.title, 44) +
        truncate(j.company ?? "-", 24) +
        truncate(j.location ?? "-", 22) +
        (j.date ? j.date.slice(0, 10) : "-"),
    )
    return header + rows.join("\n") + "\n"
  }
  return (
    jobs
      .map((j) =>
        [
          `${j.title}${j.company ? ` — ${j.company}` : ""}`,
          `  ${j.url}`,
          `  location: ${j.location ?? "-"}   posted: ${j.date?.slice(0, 10) ?? "-"}${
            j.salary ? `   salary: ${j.salary}` : ""
          }`,
          j.description ? `\n${j.description}\n` : "",
        ].join("\n"),
      )
      .join("\n") + "\n"
  )
}
