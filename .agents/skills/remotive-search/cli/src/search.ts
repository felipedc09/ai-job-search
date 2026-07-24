import { jsonFetch, matchesQuery, withinDays, htmlToText } from "./helpers.js"
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

const API = "https://remotive.com/api/remote-jobs"

interface RawJob {
  id?: string | number
  title?: string
  company_name?: string
  candidate_required_location?: string
  url?: string
  publication_date?: string
  salary?: string
  tags?: string[]
  job_type?: string
  category?: string
  description?: string
}

interface RawResponse {
  jobs?: RawJob[]
}

export function mapJobs(raw: unknown): Job[] {
  const list = Array.isArray(raw)
    ? (raw as RawJob[])
    : ((raw as RawResponse)?.jobs ?? [])
  const jobs: Job[] = []
  for (const r of list) {
    if (!r || !r.title || r.id === undefined) continue
    jobs.push({
      id: String(r.id),
      title: r.title,
      company: r.company_name ?? null,
      location: r.candidate_required_location || "Remote",
      date: r.publication_date ?? null,
      url: r.url ?? "",
      salary: r.salary && r.salary.trim() ? r.salary.trim() : null,
      tags: Array.isArray(r.tags) ? r.tags : [],
      remote: true,
      description: htmlToText(r.description ?? null),
      source: "remotive-search",
      extra: { category: r.category, jobType: r.job_type },
    })
  }
  return jobs.filter((j) => j.url)
}

export async function fetchJobs(opts: SearchOpts): Promise<Job[]> {
  // Remotive's free API returns a fixed recent feed and ignores server-side
  // `search`/`category`/`limit` params (confirmed during recon), so we pull the
  // feed and filter client-side.
  const raw = await jsonFetch<RawResponse>(API)
  let jobs = mapJobs(raw)
  if (opts.remote === "onsite") return []
  jobs = jobs.filter((j) => matchesQuery(j, opts.query))
  if (opts.category) {
    const c = opts.category.toLowerCase()
    jobs = jobs.filter((j) => String(j.extra?.category ?? "").toLowerCase().includes(c))
  }
  jobs = jobs.filter((j) => withinDays(j, opts.jobage))
  const start = (opts.page - 1) * opts.limit
  return jobs.slice(start, start + opts.limit)
}
