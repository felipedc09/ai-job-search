import { jsonFetch, matchesQuery, withinDays, formatSalary, epochToIso, htmlToText } from "./helpers.js"
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

const API = "https://www.getonbrd.com/api/v0/search/jobs"

interface RawCompany {
  data?: { attributes?: { name?: string } }
}
interface RawAttrs {
  title?: string
  description?: string
  remote?: boolean | string
  remote_modality?: string
  countries?: string[]
  category_name?: string
  min_salary?: string | number
  max_salary?: string | number
  published_at?: string | number
  seniority?: unknown
  company?: RawCompany
}
interface RawJob {
  id?: string
  attributes?: RawAttrs
  links?: { public_url?: string }
}
interface RawResponse {
  data?: RawJob[]
  meta?: { page?: number; per_page?: number; total_pages?: number }
}

function isRemote(a: RawAttrs): boolean | null {
  const v = a.remote
  if (v === true || v === "true" || v === "True") return true
  if (v === false || v === "false" || v === "False") {
    return a.remote_modality === "hybrid" ? true : false
  }
  return null
}

export function mapJobs(raw: unknown): Job[] {
  const list = Array.isArray(raw) ? (raw as RawJob[]) : ((raw as RawResponse)?.data ?? [])
  const jobs: Job[] = []
  for (const r of list) {
    const a = r?.attributes
    if (!r || !a || !a.title || !r.id) continue
    jobs.push({
      id: r.id,
      title: a.title,
      company: a.company?.data?.attributes?.name ?? null,
      location: Array.isArray(a.countries) && a.countries.length
        ? a.countries.join(", ")
        : "Remote / LATAM",
      date: epochToIso(a.published_at),
      url: r.links?.public_url || `https://www.getonbrd.com/jobs/${r.id}`,
      // Get on Board pay bands are quoted in USD.
      salary: formatSalary(a.min_salary, a.max_salary, "USD", "month"),
      tags: a.category_name ? [a.category_name] : [],
      remote: isRemote(a),
      description: htmlToText(a.description ?? null),
      source: "getonbrd-search",
      extra: { modality: a.remote_modality, category: a.category_name },
    })
  }
  return jobs
}

export async function fetchJobs(opts: SearchOpts): Promise<Job[]> {
  // Server-side full-text `query`; `expand[]=company` resolves the employer name.
  const perPage = Math.min(Math.max(opts.limit, 10), 50)
  const params = new URLSearchParams()
  if (opts.query) params.set("query", opts.query)
  if (opts.category) params.set("category", opts.category)
  params.set("per_page", String(perPage))
  params.set("page", String(opts.page))
  params.append("expand[]", "company")
  const raw = await jsonFetch<RawResponse>(`${API}?${params.toString()}`)
  let jobs = mapJobs(raw)
  if (opts.remote === "remote") jobs = jobs.filter((j) => j.remote !== false)
  else if (opts.remote === "onsite") jobs = jobs.filter((j) => j.remote === false)
  jobs = jobs.filter((j) => withinDays(j, opts.jobage))
  return jobs.slice(0, opts.limit)
}
