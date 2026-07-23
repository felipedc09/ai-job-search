import { jsonFetch, matchesQuery, withinDays, withinTimezone, formatSalary, htmlToText } from "./helpers.js"
import type { Job } from "./helpers.js"

export interface SearchOpts {
  query?: string
  category?: string
  remote?: string
  location?: string
  experience?: string
  timezone?: number
  jobage?: number
  page: number
  limit: number
}

const API = "https://search.torre.co/opportunities/_search/"

interface RawOrg { name?: string }
interface RawComp {
  data?: { currency?: string; minAmount?: number; maxAmount?: number; periodicity?: string }
}
interface RawResult {
  id?: string
  objective?: string
  tagline?: string
  slug?: string
  organizations?: RawOrg[]
  locations?: string[]
  timezones?: string[]
  remote?: boolean
  created?: string
  deadline?: string
  commitment?: string
  compensation?: RawComp
}
interface RawResponse {
  results?: RawResult[]
  total?: number
}

/** "GMT-06:00" -> -6 ; "GMT+05:30" -> 5 (hour part only, for a coarse overlap check). */
export function tzToOffset(tz: string): number | null {
  const m = tz.match(/GMT([+-])(\d{1,2})/)
  if (!m) return null
  const sign = m[1] === "-" ? -1 : 1
  return sign * parseInt(m[2], 10)
}

export function mapJobs(raw: unknown): Job[] {
  const list = Array.isArray(raw) ? (raw as RawResult[]) : ((raw as RawResponse)?.results ?? [])
  const jobs: Job[] = []
  for (const r of list) {
    if (!r || !r.objective || !r.id) continue
    const comp = r.compensation?.data
    const offsets = Array.isArray(r.timezones)
      ? r.timezones.map(tzToOffset).filter((o): o is number => o !== null)
      : []
    jobs.push({
      id: r.id,
      title: r.objective,
      company: r.organizations?.[0]?.name ?? null,
      location: Array.isArray(r.locations) && r.locations.length
        ? r.locations.join(", ")
        : r.remote ? "Remote" : "-",
      date: r.created ?? null,
      url: `https://torre.ai/post/${r.id}`,
      salary: comp
        ? formatSalary(comp.minAmount, comp.maxAmount, comp.currency || "USD", comp.periodicity)
        : null,
      tags: r.commitment ? [r.commitment] : [],
      remote: typeof r.remote === "boolean" ? r.remote : null,
      description: htmlToText(r.tagline ?? null),
      source: "torre-search",
      extra: { timezoneOffsets: offsets, deadline: r.deadline },
    })
  }
  return jobs
}

export async function fetchJobs(opts: SearchOpts): Promise<Job[]> {
  // Torre's search requires a skill/role text plus an `experience` bound;
  // "potential-to-develop" is the broadest (includes junior-through-senior).
  // Torre ranks broadly and its text match spills into unrelated roles, so we
  // over-fetch (up to the API's size cap of ~30) and then apply a client-side
  // relevance guard on the query terms.
  const size = 25
  const body = JSON.stringify({
    "skill/role": {
      text: opts.query || "software engineer",
      experience: opts.experience || "potential-to-develop",
    },
  })
  const url = `${API}?size=${size}&aggregate=false&offset=${(opts.page - 1) * size}`
  const raw = await jsonFetch<RawResponse>(url, { method: "POST", body })
  let jobs = mapJobs(raw)
  jobs = jobs.filter((j) => matchesQuery(j, opts.query))
  if (opts.remote === "remote") jobs = jobs.filter((j) => j.remote !== false)
  else if (opts.remote === "onsite") jobs = jobs.filter((j) => j.remote === false)
  jobs = jobs.filter((j) => withinDays(j, opts.jobage))
  jobs = jobs.filter((j) => withinTimezone(j, opts.timezone))
  return jobs.slice(0, opts.limit)
}
