import { rawFetch, matchesQuery, withinDays, htmlToText, decodeEntities } from "./helpers.js"
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

const FEEDS: Record<string, string> = {
  programming: "remote-programming-jobs",
  "full-stack": "remote-full-stack-programming-jobs",
  "front-end": "remote-front-end-programming-jobs",
  "back-end": "remote-back-end-programming-jobs",
  devops: "remote-devops-sysadmin-jobs",
  design: "remote-design-jobs",
}
const BASE = "https://weworkremotely.com/categories"

export interface RssItem {
  title?: string
  region?: string
  category?: string
  description?: string
  pubDate?: string
  link?: string
  guid?: string
}

function tag(block: string, name: string): string | null {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"))
  if (!m) return null
  return m[1].replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim() || null
}

/** Split a raw RSS document into its <item> blocks. */
export function parseRssItems(xml: string): RssItem[] {
  const items: RssItem[] = []
  const blocks = xml.split(/<item>/i).slice(1)
  for (const b of blocks) {
    const block = b.split(/<\/item>/i)[0]
    items.push({
      title: tag(block, "title") ?? undefined,
      region: tag(block, "region") ?? undefined,
      category: tag(block, "category") ?? undefined,
      description: tag(block, "description") ?? undefined,
      pubDate: tag(block, "pubDate") ?? undefined,
      link: tag(block, "link") ?? undefined,
      guid: tag(block, "guid") ?? undefined,
    })
  }
  return items
}

function idFromLink(link: string | undefined): string {
  if (!link) return ""
  return link.replace(/\/+$/, "").split("/").pop() || link
}

export function mapJobs(raw: unknown): Job[] {
  const items = typeof raw === "string" ? parseRssItems(raw) : (raw as RssItem[])
  if (!Array.isArray(items)) return []
  const jobs: Job[] = []
  for (const it of items) {
    if (!it || !it.title || !it.link) continue
    // WWR titles are "Company: Role".
    const rawTitle = decodeEntities(it.title)
    const idx = rawTitle.indexOf(":")
    const company = idx > 0 ? rawTitle.slice(0, idx).trim() : null
    const title = idx > 0 ? rawTitle.slice(idx + 1).trim() : rawTitle
    jobs.push({
      id: idFromLink(it.link || it.guid),
      title,
      company,
      location: it.region ? decodeEntities(it.region) : "Remote",
      date: it.pubDate ? new Date(it.pubDate).toISOString() : null,
      url: it.link,
      salary: null,
      tags: it.category ? [decodeEntities(it.category)] : [],
      remote: true,
      description: htmlToText(it.description ?? null),
      source: "weworkremotely-search",
    })
  }
  return jobs
}

export async function fetchJobs(opts: SearchOpts): Promise<Job[]> {
  if (opts.remote === "onsite") return []
  const feed = FEEDS[(opts.category || "programming").toLowerCase()] || FEEDS.programming
  const xml = await rawFetch(`${BASE}/${feed}.rss`, { accept: "application/rss+xml,application/xml" })
  let jobs = mapJobs(xml)
  jobs = jobs.filter((j) => matchesQuery(j, opts.query))
  jobs = jobs.filter((j) => withinDays(j, opts.jobage))
  return jobs.slice(0, opts.limit)
}
