import { test, expect, describe } from "bun:test"
import {
  slugify,
  relativeDateToAgeDays,
  parseJobCards,
  parseJobDetail,
} from "../src/helpers.js"

describe("slugify", () => {
  test("lowercases and hyphenates", () => {
    expect(slugify("Full Stack")).toBe("full-stack")
  })
  test("strips accents", () => {
    expect(slugify("Medellín")).toBe("medellin")
    expect(slugify("Bogotá D.C.")).toBe("bogota-d-c")
  })
  test("collapses and trims separators", () => {
    expect(slugify("  React /  Node  ")).toBe("react-node")
  })
})

describe("relativeDateToAgeDays", () => {
  test("Hoy / hours -> 0", () => {
    expect(relativeDateToAgeDays("Hoy")).toBe(0)
    expect(relativeDateToAgeDays("Hace 5 horas")).toBe(0)
  })
  test("Ayer -> 1", () => {
    expect(relativeDateToAgeDays("Ayer")).toBe(1)
  })
  test("Hace N días -> N", () => {
    expect(relativeDateToAgeDays("Hace 3 días")).toBe(3)
    expect(relativeDateToAgeDays("Hace 12 dias")).toBe(12)
  })
  test("más de 30 días -> 31", () => {
    expect(relativeDateToAgeDays("Hace más de 30 días")).toBe(31)
  })
  test("unknown -> null", () => {
    expect(relativeDateToAgeDays("qué?")).toBeNull()
    expect(relativeDateToAgeDays(null)).toBeNull()
  })
})

const CARD_FIXTURE = `
<article class="box_offer sel " data-id='1BCA529EDA05AB9E61373E686DCF3405' data-blind="false" id="1BCA529EDA05AB9E61373E686DCF3405">
  <h2 class="fs18 fwB prB">
    <a class="js-o-link fc_base" href="/ofertas-de-trabajo/oferta-de-trabajo-de-desarrollador-full-stack-python-react-en-medellin-1BCA529EDA05AB9E61373E686DCF3405#lc=ListOffers-Score4-0">
      Desarrollador Full Stack: Python, React
    </a>
  </h2>
  <p class="dFlex vm_fx fs16 fc_base mt5">
    <a class="fc_base t_ellipsis" href="https://co.computrabajo.com/empresas/xyz" target='_blank' offer-grid-article-company-url>
      Lutcorp Colombia Ltda
    </a>
  </p>
  <p class="fs16 fc_base mt5">
    <span class="mr10">Medell&#xED;n, Antioquia</span>
  </p>
  <div class="fs13 mt15">
    <span class="dIB mr10"><span class="icon i_home"></span> Remoto </span>
  </div>
  <p class="fs13 fc_aux mt15">Ayer</p>
</article>
`

describe("parseJobCards", () => {
  const cards = parseJobCards(CARD_FIXTURE)
  test("parses one card", () => {
    expect(cards.length).toBe(1)
  })
  test("extracts all fields", () => {
    const c = cards[0]
    expect(c.id).toBe("1BCA529EDA05AB9E61373E686DCF3405")
    expect(c.title).toBe("Desarrollador Full Stack: Python, React")
    expect(c.company).toBe("Lutcorp Colombia Ltda")
    expect(c.location).toBe("Medellín, Antioquia")
    expect(c.workMode).toBe("Remoto")
    expect(c.date).toBe("Ayer")
    expect(c.ageDays).toBe(1)
    expect(c.url).toBe(
      "https://co.computrabajo.com/ofertas-de-trabajo/oferta-de-trabajo-de-desarrollador-full-stack-python-react-en-medellin-1BCA529EDA05AB9E61373E686DCF3405",
    )
  })
  test("handles a confidential (company-less) card without crashing", () => {
    const noCompany = CARD_FIXTURE.replace(
      /<a class="fc_base t_ellipsis"[\s\S]*?<\/a>/,
      "",
    )
    const parsed = parseJobCards(noCompany)
    expect(parsed.length).toBe(1)
    expect(parsed[0].company).toBeNull()
    expect(parsed[0].title).toBe("Desarrollador Full Stack: Python, React")
  })
})

const DETAIL_FIXTURE = `
<html><head>
<script type="application/ld+json">
{ "@graph": [
  { "@type": "WebPage", "name": "x" },
  { "@type": "JobPosting", "title": "Desarrollador Full Stack",
    "description": "<p>Buscamos un <b>desarrollador</b>.</p><ul><li>React</li><li>Node</li></ul>",
    "datePosted": "2026-07-09", "validThrough": "2026-08-09", "employmentType": "FULL_TIME",
    "hiringOrganization": { "@type": "Organization", "name": "Lutcorp Colombia Ltda" },
    "jobLocation": { "@type": "Place", "address": { "addressLocality": "Medellín", "addressRegion": "Antioquia", "addressCountry": "CO" } } }
] }
</script></head><body></body></html>
`

describe("parseJobDetail", () => {
  const url =
    "https://co.computrabajo.com/ofertas-de-trabajo/oferta-de-trabajo-de-x-1BCA529EDA05AB9E61373E686DCF3405"
  const job = parseJobDetail(DETAIL_FIXTURE, url)
  test("reads JobPosting fields from ld+json @graph", () => {
    expect(job.title).toBe("Desarrollador Full Stack")
    expect(job.company).toBe("Lutcorp Colombia Ltda")
    expect(job.location).toBe("Medellín, Antioquia, CO")
    expect(job.employmentType).toBe("FULL_TIME")
    expect(job.datePosted).toBe("2026-07-09")
    expect(job.validThrough).toBe("2026-08-09")
  })
  test("strips HTML from the description", () => {
    expect(job.description).toContain("desarrollador")
    expect(job.description).not.toContain("<")
  })
})
