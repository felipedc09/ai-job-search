import { jsonFetch, matchesQuery, withinDays, formatSalary, htmlToText } from "./helpers.js"
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

const API = "https://remoteok.com/api"

interface RawJob {
  id?: string | number
  slug?: string
  position?: string
  company?: string
  location?: string
  date?: string
  epoch?: string | number
  apply_url?: string
  url?: string
  salary_min?: string | number
  salary_max?: string | number
  tags?: string[]
  description?: string
}

export function mapJobs(raw: unknown): Job[] {
  if (!Array.isArray(raw)) return []
  const jobs: Job[] = []
  for (const r of raw as RawJob[]) {
    // The first array element is a legal/ToS notice with no `position` — skip it.
    if (!r || typeof r !== "object" || !r.position || !r.id) continue
    const id = String(r.id)
    jobs.push({
      id,
      title: r.position,
      company: r.company ?? null,
      location: r.location || "Remote",
      date: r.date ?? null,
      url: r.url || r.apply_url || `https://remoteok.com/remote-jobs/${r.slug ?? id}`,
      salary: formatSalary(r.salary_min, r.salary_max, "USD", "year"),
      tags: Array.isArray(r.tags) ? r.tags : [],
      remote: true,
      description: htmlToText(r.description ?? null),
      source: "remoteok-search",
    })
  }
  return jobs
}

export async function fetchJobs(opts: SearchOpts): Promise<Job[]> {
  const raw = await jsonFetch<unknown>(API)
  let jobs = mapJobs(raw)
  if (opts.remote === "onsite") return []
  jobs = jobs.filter((j) => matchesQuery(j, opts.query))
  jobs = jobs.filter((j) => withinDays(j, opts.jobage))
  const start = (opts.page - 1) * opts.limit
  return jobs.slice(start, start + opts.limit)
}
