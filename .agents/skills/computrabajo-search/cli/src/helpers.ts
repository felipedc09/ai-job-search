// Data source: Computrabajo Colombia (co.computrabajo.com) public listing pages.
// No authentication required. The search page server-renders a list of job cards
// (<article class="box_offer" data-id=HASH>), and each detail page embeds a
// schema.org JobPosting node inside an ld+json @graph block. We parse both with
// regex — the markup is shallow and stable, and a full DOM parser is unnecessary.
//
// robots.txt (User-agent: *) allows the base search path (/trabajo-de-<kw>) and
// detail pages, and disallows CV pages, /Ajax/, /_services/, and the filter-param
// variants under /ofertas-de-trabajo/*<param>= (dis=, cont=, pubdate=, sal=, ...).
// This CLI only ever hits the allowed base paths.

export const HOST = "https://co.computrabajo.com"

export function writeError(error: string, code: string): void {
  process.stderr.write(JSON.stringify({ error, code }) + "\n")
}

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

/** Fetch HTML with exponential backoff on 429/5xx. Returns "" on a 404. */
export async function htmlFetch(url: string): Promise<string> {
  const maxRetries = 6
  let delay = 500
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "es-CO,es;q=0.9,en;q=0.8",
      },
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

export interface JobCard {
  id: string
  title: string
  company: string | null
  location: string | null
  workMode: string | null
  date: string | null
  /** Age in days derived from the relative Spanish date; null when unknown. */
  ageDays: number | null
  url: string
}

export interface JobDetail extends JobCard {
  description: string | null
  employmentType: string | null
  datePosted: string | null
  validThrough: string | null
}

function numericEntity(cp: number): string {
  return cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : ""
}

export function decodeHtmlEntities(text: string): string {
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

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

function clean(html: string): string {
  return decodeHtmlEntities(stripTags(html))
}

/**
 * Slugify a keyword or location the way Computrabajo builds its paths:
 * lowercase, strip accents, non-alphanumerics to hyphens, collapse and trim.
 * e.g. "Full Stack" -> "full-stack", "Bogotá D.C." -> "bogota-d-c".
 */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
}

/**
 * Convert a relative Spanish date ("Hoy", "Ayer", "Hace 3 días", "Hace 2 horas",
 * "Hace más de 30 días") to an age in days. Returns null when unrecognized.
 */
export function relativeDateToAgeDays(raw: string | null): number | null {
  if (!raw) return null
  const t = raw.toLowerCase().trim()
  if (/hoy|momento|minuto|segundo|hora/.test(t)) return 0
  if (/\bayer\b/.test(t)) return 1
  if (/m[aá]s de\s+(\d+)/.test(t)) {
    const m = t.match(/m[aá]s de\s+(\d+)/)
    return m ? parseInt(m[1], 10) + 1 : null
  }
  const d = t.match(/hace\s+(\d+)\s+d[ií]a/)
  if (d) return parseInt(d[1], 10)
  const w = t.match(/hace\s+(\d+)\s+semana/)
  if (w) return parseInt(w[1], 10) * 7
  const mo = t.match(/hace\s+(\d+)\s+mes/)
  if (mo) return parseInt(mo[1], 10) * 30
  return null
}

/**
 * Parse the search results page: a list of <article class="box_offer" ...> cards.
 * We split on the card boundary and parse each chunk independently so one
 * malformed card cannot break the rest.
 */
export function parseJobCards(html: string): JobCard[] {
  const results: JobCard[] = []
  const chunks = html.split(/<article class="box_offer/).slice(1)

  for (const chunk of chunks) {
    const idMatch = chunk.match(/\bdata-id=['"]([A-Fa-f0-9]{16,})['"]/)
    if (!idMatch) continue
    const id = idMatch[1]

    // Title + detail URL live in the first js-o-link anchor.
    const link = chunk.match(/class="js-o-link[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i)
    if (!link) continue
    const href = decodeHtmlEntities(link[1]).split("#")[0]
    const url = href.startsWith("http") ? href : HOST + href
    const title = clean(link[2])
    if (!title) continue

    // Company: the anchor flagged offer-grid-article-company-url (absent when
    // the employer is confidential).
    let company: string | null = null
    const comp = chunk.match(/offer-grid-article-company-url[^>]*>([\s\S]*?)<\/a>/i)
    if (comp) company = clean(comp[1]) || null

    // Location: a plain <span class="mr10"> (the work-mode span is class="dIB mr10").
    let location: string | null = null
    const loc = chunk.match(/class="mr10">\s*([^<]+?)\s*<\/span>/i)
    if (loc) location = clean(loc[1]) || null

    // Work mode: Remoto / Presencial / Híbrido, shown in the fs13 block.
    let workMode: string | null = null
    const modeMatch = chunk.match(/i_(home|building|zone)[^>]*><\/span>\s*([^<]+?)\s*<\/span>/i)
    if (modeMatch) workMode = clean(modeMatch[2]) || null

    // Relative date, e.g. "Ayer", "Hace 3 días".
    let date: string | null = null
    const dt = chunk.match(/class="fs13 fc_aux[^"]*">\s*([\s\S]*?)<\/p>/i)
    if (dt) date = clean(dt[1]) || null

    results.push({
      id,
      title,
      company,
      location,
      workMode,
      date,
      ageDays: relativeDateToAgeDays(date),
      url,
    })
  }

  return results
}

/** Pull the schema.org JobPosting node out of the ld+json @graph block. */
function extractJobPostingLd(html: string): Record<string, unknown> | null {
  const blocks = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)
  if (!blocks) return null
  for (const block of blocks) {
    const jsonText = block.replace(/<script[^>]*>/i, "").replace(/<\/script>/i, "").trim()
    let data: unknown
    try {
      data = JSON.parse(jsonText)
    } catch {
      continue
    }
    const nodes: unknown[] = []
    if (data && typeof data === "object") {
      const graph = (data as Record<string, unknown>)["@graph"]
      if (Array.isArray(graph)) nodes.push(...graph)
      else nodes.push(data)
    }
    for (const node of nodes) {
      if (node && typeof node === "object" && (node as Record<string, unknown>)["@type"] === "JobPosting") {
        return node as Record<string, unknown>
      }
    }
  }
  return null
}

function htmlToText(html: string): string {
  const withBreaks = html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|li|ul|ol|div|h\d)>/gi, "\n")
  return decodeHtmlEntities(stripTags(withBreaks)).replace(/\n{3,}/g, "\n\n").trim()
}

/** Parse a single job's detail page, preferring the ld+json JobPosting node. */
export function parseJobDetail(html: string, url: string): JobDetail {
  const idFromUrl = url.match(/([A-Fa-f0-9]{16,})(?:[/?#]|$)/)
  const id = idFromUrl ? idFromUrl[1] : url

  const ld = extractJobPostingLd(html)

  let title: string | null = null
  let company: string | null = null
  let location: string | null = null
  let description: string | null = null
  let employmentType: string | null = null
  let datePosted: string | null = null
  let validThrough: string | null = null

  if (ld) {
    title = typeof ld.title === "string" ? decodeHtmlEntities(ld.title) : null
    const org = ld.hiringOrganization as Record<string, unknown> | undefined
    if (org && typeof org.name === "string") company = decodeHtmlEntities(org.name)
    const jobLoc = ld.jobLocation as Record<string, unknown> | Array<Record<string, unknown>> | undefined
    const firstLoc = Array.isArray(jobLoc) ? jobLoc[0] : jobLoc
    const addr = firstLoc?.address as Record<string, unknown> | undefined
    if (addr) {
      const parts = [addr.addressLocality, addr.addressRegion, addr.addressCountry]
        .filter((p): p is string => typeof p === "string")
      location = parts.length ? parts.join(", ") : null
    }
    if (typeof ld.description === "string") description = htmlToText(ld.description) || null
    if (typeof ld.employmentType === "string") employmentType = ld.employmentType
    if (typeof ld.datePosted === "string") datePosted = ld.datePosted
    if (typeof ld.validThrough === "string") validThrough = ld.validThrough
  }

  // Fallbacks from the visible page if the ld+json was missing or partial.
  if (!title) {
    const h1 = html.match(/<h1[^>]*class="[^"]*box_detail[^"]*"[^>]*>([\s\S]*?)<\/h1>/i)
    if (h1) title = clean(h1[1]) || null
  }
  if (!description) {
    const desc = html.match(/class="description_offer"[^>]*>([\s\S]*?)<\/div>/i)
    if (desc) description = htmlToText(desc[1]) || null
  }

  return {
    id,
    title: title ?? "(untitled)",
    company,
    location,
    workMode: null,
    date: datePosted,
    ageDays: null,
    url,
    description,
    employmentType,
    datePosted,
    validThrough,
  }
}
