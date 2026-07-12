import {
  HOST,
  htmlFetch,
  parseJobCards,
  slugify,
  writeError,
  type JobCard,
} from "../helpers.js"

export interface SearchOpts {
  query: string
  location?: string
  jobage: number
  page: number
  limit?: number
  format: "json" | "table" | "plain"
}

/**
 * Build the Computrabajo listing URL. Keyword drives the path
 * (/trabajo-de-<kw>), with an optional -en-<location> suffix, and ?p=<page>
 * pagination. NOTE: recency is NOT a URL parameter — the pubdate= filter is
 * disallowed by robots.txt — so --jobage is applied client-side in runSearch.
 */
export function buildUrl(opts: SearchOpts): string {
  let slug = `trabajo-de-${slugify(opts.query)}`
  if (opts.location) slug += `-en-${slugify(opts.location)}`
  const qp = opts.page > 1 ? `?p=${opts.page}` : ""
  return `${HOST}/${slug}${qp}`
}

function renderTable(cards: JobCard[]): string {
  if (cards.length === 0) return "No results."
  const rows = cards.map((c) => {
    const title = (c.title || "").slice(0, 40).padEnd(40)
    const company = (c.company || "—").slice(0, 24).padEnd(24)
    const loc = (c.location || "—").slice(0, 22).padEnd(22)
    const mode = (c.workMode || "—").slice(0, 10).padEnd(10)
    const date = c.date || "—"
    return `${c.id.slice(0, 12).padEnd(12)} ${title} ${company} ${loc} ${mode} ${date}`
  })
  const header =
    "ID".padEnd(12) +
    " " +
    "TITLE".padEnd(40) +
    " " +
    "COMPANY".padEnd(24) +
    " " +
    "LOCATION".padEnd(22) +
    " " +
    "MODE".padEnd(10) +
    " DATE"
  return [header, "-".repeat(header.length), ...rows].join("\n")
}

export async function runSearch(opts: SearchOpts): Promise<number> {
  try {
    const html = await htmlFetch(buildUrl(opts))
    let cards = parseJobCards(html)

    // Client-side recency filter (portal has no robots-allowed recency param).
    // Keep cards whose known age is within jobage; cards with an unknown age are
    // kept so a parsing miss never silently drops a fresh posting.
    if (opts.jobage > 0 && opts.jobage < 9999) {
      cards = cards.filter((c) => c.ageDays === null || c.ageDays <= opts.jobage)
    }

    if (opts.limit !== undefined && opts.limit >= 0) cards = cards.slice(0, opts.limit)

    if (opts.format === "table") {
      process.stdout.write(renderTable(cards) + "\n")
    } else if (opts.format === "plain") {
      process.stdout.write(
        cards
          .map(
            (c) =>
              `${c.title}\n  ${c.company || "—"} · ${c.location || "—"}${c.workMode ? " · " + c.workMode : ""} · ${c.date || "—"}\n  id: ${c.id}\n  ${c.url}`,
          )
          .join("\n\n") + "\n",
      )
    } else {
      process.stdout.write(
        JSON.stringify(
          { meta: { count: cards.length, page: opts.page }, results: cards },
          null,
          2,
        ) + "\n",
      )
    }
    return 0
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "SEARCH_FAILED")
    return 1
  }
}
