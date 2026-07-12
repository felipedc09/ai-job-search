import { HOST, htmlFetch, parseJobDetail, writeError } from "../helpers.js"

export interface DetailOpts {
  id: string
  format: "json" | "plain"
}

/**
 * Accept a full Computrabajo offer URL or path. A bare hash id is NOT
 * resolvable: Computrabajo detail URLs require the full slug (the hash alone
 * 404s), so callers must pass the `url` field returned by `search`.
 */
function toUrl(input: string): string | { error: string } {
  if (/^https?:\/\//i.test(input)) return input.split("#")[0]
  if (input.startsWith("/ofertas-de-trabajo/")) return HOST + input.split("#")[0]
  if (/^[A-Fa-f0-9]{16,}$/.test(input)) {
    return {
      error:
        "Computrabajo needs the full offer URL, not a bare id — the hash 404s without its slug. Pass the `url` field from the search results.",
    }
  }
  return { error: `Could not parse a Computrabajo offer URL from "${input}"` }
}

export async function runDetail(opts: DetailOpts): Promise<number> {
  const resolved = toUrl(opts.id)
  if (typeof resolved !== "string") {
    writeError(resolved.error, "BAD_ID")
    return 1
  }
  const url = resolved
  try {
    const html = await htmlFetch(url)
    if (!html) {
      writeError("Job not found", "NOT_FOUND")
      return 1
    }
    const job = parseJobDetail(html, url)

    if (opts.format === "plain") {
      const lines = [
        job.title,
        `${job.company || "—"} · ${job.location || "—"}`,
        "",
        job.employmentType ? `Employment: ${job.employmentType}` : "",
        job.datePosted ? `Posted: ${job.datePosted}` : "",
        job.validThrough ? `Valid through: ${job.validThrough}` : "",
        "",
        job.description || "(no description)",
        "",
        `URL: ${job.url}`,
      ].filter((l) => l !== "")
      process.stdout.write(lines.join("\n") + "\n")
    } else {
      process.stdout.write(JSON.stringify(job, null, 2) + "\n")
    }
    return 0
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "DETAIL_FAILED")
    return 1
  }
}
