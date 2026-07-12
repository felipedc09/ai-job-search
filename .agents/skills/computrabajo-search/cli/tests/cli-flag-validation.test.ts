import { test, expect, describe } from "bun:test"
import { runCLI } from "./helpers.js"

describe("flag validation", () => {
  test("search without --query exits 1 with a JSON error on stderr", async () => {
    const r = await runCLI(["search"])
    expect(r.exitCode).toBe(1)
    const err = JSON.parse(r.stderr)
    expect(err.code).toBe("NO_QUERY")
    expect(r.stdout).toBe("")
  })

  test("non-numeric --jobage exits 1 with BAD_ARG", async () => {
    const r = await runCLI(["search", "-q", "react", "--jobage", "soon"])
    expect(r.exitCode).toBe(1)
    expect(JSON.parse(r.stderr).code).toBe("BAD_ARG")
  })

  test("detail without an id exits 1 with NO_ID", async () => {
    const r = await runCLI(["detail"])
    expect(r.exitCode).toBe(1)
    expect(JSON.parse(r.stderr).code).toBe("NO_ID")
  })

  test("detail with a bare hash id exits 1 with BAD_ID (needs full URL)", async () => {
    const r = await runCLI(["detail", "1BCA529EDA05AB9E61373E686DCF3405"])
    expect(r.exitCode).toBe(1)
    expect(JSON.parse(r.stderr).code).toBe("BAD_ID")
  })

  test("unknown command exits 1 with BAD_CMD", async () => {
    const r = await runCLI(["frobnicate"])
    expect(r.exitCode).toBe(1)
    expect(JSON.parse(r.stderr).code).toBe("BAD_CMD")
  })

  test("no command prints help and exits 1", async () => {
    const r = await runCLI([])
    expect(r.exitCode).toBe(1)
    expect(r.stdout).toContain("USAGE")
  })
})
