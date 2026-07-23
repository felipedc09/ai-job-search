import { expect, test, describe } from "bun:test"
import { mapJobs } from "../src/search.js"
import { matchesQuery, withinDays, withinTimezone, formatSalary, epochToIso, htmlToText } from "../src/helpers.js"
import type { Job } from "../src/helpers.js"

const base: Job = {
  id: "1",
  title: "Senior React Engineer",
  company: "Acme",
  location: "Remote",
  date: new Date().toISOString(),
  url: "https://example.com/1",
  salary: null,
  tags: ["react", "typescript"],
  remote: true,
  description: "Build things with AWS",
  source: "himalayas-search",
}

describe("query matching", () => {
  test("matches all terms across title, tags and description", () => {
    expect(matchesQuery(base, "react")).toBe(true)
    expect(matchesQuery(base, "senior react")).toBe(true)
    expect(matchesQuery(base, "aws")).toBe(true)
    expect(matchesQuery(base, "typescript")).toBe(true)
  })

  test("is AND-semantics, not OR", () => {
    expect(matchesQuery(base, "react golang")).toBe(false)
  })

  test("an empty query matches everything", () => {
    expect(matchesQuery(base, undefined)).toBe(true)
  })
})

describe("recency filter", () => {
  test("keeps recent jobs and drops stale ones", () => {
    const old = { ...base, date: new Date(Date.now() - 60 * 86400000).toISOString() }
    expect(withinDays(base, 14)).toBe(true)
    expect(withinDays(old, 14)).toBe(false)
  })

  test("unknown or unparseable dates are kept, not silently dropped", () => {
    expect(withinDays({ ...base, date: null }, 14)).toBe(true)
    expect(withinDays({ ...base, date: "not-a-date" }, 14)).toBe(true)
  })
})

describe("shared formatting helpers", () => {
  test("formatSalary handles ranges, single bounds and absent values", () => {
    expect(formatSalary(1000, 2000, "USD")).toBe("1000-2000 USD")
    expect(formatSalary(1000, 0, "USD")).toBe("1000 USD")
    expect(formatSalary(0, 0, "USD")).toBeNull()
    expect(formatSalary(null, null)).toBeNull()
  })

  test("epochToIso tolerates seconds, milliseconds and junk", () => {
    expect(epochToIso(1784667115)).toBe("2026-07-21T20:51:55.000Z")
    expect(epochToIso(1784667115000)).toBe("2026-07-21T20:51:55.000Z")
    expect(epochToIso("0")).toBeNull()
    expect(epochToIso(undefined)).toBeNull()
  })

  test("htmlToText strips markup, decodes entities and keeps block breaks", () => {
    expect(htmlToText("<p>Hello</p><p>World &amp; more</p>")).toBe("Hello\nWorld & more")
    expect(htmlToText("")).toBeNull()
    expect(htmlToText(null)).toBeNull()
  })
})

describe("mapJobs", () => {
  test("maps the portal fixture into the shared Job shape", () => {
    const jobs = mapJobs(FIXTURE)
    expect(jobs.length).toBeGreaterThan(0)
    for (const j of jobs) {
      expect(typeof j.id).toBe("string")
      expect(j.id.length).toBeGreaterThan(0)
      expect(typeof j.title).toBe("string")
      expect(j.title.length).toBeGreaterThan(0)
      expect(j.url).toMatch(/^https?:\/\//)
      expect(j.source).toBe("himalayas-search")
      expect(Array.isArray(j.tags)).toBe(true)
    }
  })

  test("tolerates malformed entries without throwing", () => {
    expect(() => mapJobs(EMPTY_FIXTURE)).not.toThrow()
  })

    test("exposes timezone offsets so a Bogotá (-5) filter can match", () => {
    const jobs = mapJobs(FIXTURE)
    expect(jobs[0].extra?.timezoneOffsets).toContain(-5)
    expect(withinTimezone(jobs[0], -5)).toBe(true)
    expect(withinTimezone(jobs[0], 2)).toBe(false)
  })
})

const FIXTURE: any = { "totalCount": 1, "jobs": [
  { "title": "Staff Software Engineer", "companyName": "Initech", "employmentType": "Full Time",
    "minSalary": "120000", "maxSalary": "160000", "salaryPeriod": "annual", "currency": "USD",
    "seniority": ["Senior"], "locationRestrictions": ["Americas"], "timezoneRestrictions": [-5, -6, -7],
    "categories": ["Software-Engineering"], "description": "<p>Backend + infra.</p>", "pubDate": 1784586352,
    "applicationLink": "https://himalayas.app/companies/initech/jobs/staff-software-engineer",
    "guid": "https://himalayas.app/companies/initech/jobs/staff-software-engineer" }
] }

const EMPTY_FIXTURE: any = { "jobs": [ { "excerpt": "no title" } ] }
