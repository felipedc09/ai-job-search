import { test, expect, describe } from "bun:test"
import { runCLI, parseJSON } from "./helpers.js"

interface SearchResult {
  meta: { count: number; page: number }
  results: Array<{
    id: string
    title: string
    company: string | null
    location: string | null
    url: string
    date: string | null
  }>
}

// Live smoke test — hits Computrabajo Colombia's public pages. Kept low-volume
// (one request). If the network is unavailable, this will fail loudly rather
// than silently pass.
describe("live search", () => {
  test('search -q "React" returns real results with required fields', async () => {
    const r = await runCLI(["search", "-q", "React", "--limit", "5"])
    const data = parseJSON<SearchResult>(r)
    expect(Array.isArray(data.results)).toBe(true)
    expect(data.results.length).toBeGreaterThan(0)

    const first = data.results[0]
    expect(first.id).toBeTruthy()
    expect(first.title).toBeTruthy()
    expect(first.url).toContain("computrabajo.com")
    // title must be text, not a leftover HTML fragment
    expect(first.title).not.toContain("<")
  }, 30000)
})
