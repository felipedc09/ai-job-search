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

const API = "https://www.workingnomads.com/api/exposed_jobs/"

interface RawJob {
  url?: string
  title?: string
  description?: string
  company_name?: string
  category_name?: string
  tags?: string
  location?: string
  pub_date?: string
}

function idFromUrl(url: string | undefined): string {
  if (!url) return ""
  const m = url.match(/\/job\/[a-z]+\/(\d+)/i) || url.match(/(\d{4,})/)
  return m ? m[1] : url.replace(/\/+$/, "").split("/").pop() || url
}

export function mapJobs(raw: unknown): Job[] {
  if (!Array.isArray(raw)) return []
  const jobs: Job[] = []
  for (const r of raw as RawJob[]) {
    if (!r || !r.title || !r.url) continue
    jobs.push({
      id: idFromUrl(r.url),
      title: r.title,
      company: r.company_name ?? null,
      location: r.location || "Remote",
      date: r.pub_date ?? null,
      url: r.url,
      salary: null,
      tags: r.tags ? r.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      remote: true,
      description: htmlToText(r.description ?? null),
      source: "workingnomads-search",
      extra: { category: r.category_name },
    })
  }
  return jobs
}

export async function fetchJobs(opts: SearchOpts): Promise<Job[]> {
  const raw = await jsonFetch<unknown>(API)
  let jobs = mapJobs(raw)
  if (opts.remote === "onsite") return []
  if (opts.category) {
    const c = opts.category.toLowerCase()
    jobs = jobs.filter((j) => String(j.extra?.category ?? "").toLowerCase().includes(c))
  }
  jobs = jobs.filter((j) => matchesQuery(j, opts.query))
  jobs = jobs.filter((j) => withinDays(j, opts.jobage))
  return jobs.slice(0, opts.limit)
}
