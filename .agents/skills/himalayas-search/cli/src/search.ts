import { jsonFetch, matchesQuery, withinDays, withinTimezone, formatSalary, epochToIso, htmlToText } from "./helpers.js"
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

const API = "https://himalayas.app/jobs/api"

interface RawJob {
  title?: string
  excerpt?: string
  companyName?: string
  companySlug?: string
  employmentType?: string
  minSalary?: string | number
  maxSalary?: string | number
  salaryPeriod?: string
  currency?: string
  seniority?: string[]
  locationRestrictions?: string[]
  timezoneRestrictions?: number[]
  categories?: string[]
  description?: string
  pubDate?: string | number
  applicationLink?: string
  guid?: string
}

interface RawResponse {
  jobs?: RawJob[]
  totalCount?: number
}

function idFromGuid(guid: string | undefined): string {
  if (!guid) return ""
  const parts = guid.replace(/\/+$/, "").split("/")
  return parts.slice(-2).join("/") || guid
}

export function mapJobs(raw: unknown): Job[] {
  const list = Array.isArray(raw) ? (raw as RawJob[]) : ((raw as RawResponse)?.jobs ?? [])
  const jobs: Job[] = []
  for (const r of list) {
    if (!r || !r.title) continue
    const url = r.applicationLink || r.guid || ""
    if (!url) continue
    const loc = Array.isArray(r.locationRestrictions) && r.locationRestrictions.length
      ? r.locationRestrictions.join(", ")
      : "Remote"
    jobs.push({
      id: idFromGuid(r.guid || r.applicationLink),
      title: r.title,
      company: r.companyName ?? null,
      location: loc,
      date: epochToIso(r.pubDate),
      url,
      salary: formatSalary(r.minSalary, r.maxSalary, r.currency || "USD", r.salaryPeriod),
      tags: Array.isArray(r.categories) ? r.categories : [],
      remote: true,
      description: htmlToText(r.description ?? r.excerpt ?? null),
      source: "himalayas-search",
      extra: {
        seniority: r.seniority ?? [],
        employmentType: r.employmentType,
        timezoneOffsets: Array.isArray(r.timezoneRestrictions) ? r.timezoneRestrictions : [],
      },
    })
  }
  return jobs
}

export async function fetchJobs(opts: SearchOpts): Promise<Job[]> {
  // Himalayas' feed API is limit/offset only (no server text search), so we
  // pull a page and filter client-side.
  const pageSize = 100
  const params = new URLSearchParams({
    limit: String(pageSize),
    offset: String((opts.page - 1) * pageSize),
  })
  const raw = await jsonFetch<RawResponse>(`${API}?${params.toString()}`)
  let jobs = mapJobs(raw)
  if (opts.remote === "onsite") return []
  jobs = jobs.filter((j) => matchesQuery(j, opts.query))
  jobs = jobs.filter((j) => withinDays(j, opts.jobage))
  jobs = jobs.filter((j) => withinTimezone(j, opts.timezone))
  return jobs.slice(0, opts.limit)
}
