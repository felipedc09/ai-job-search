# Job Application Assistant for Felipe Duitama

## Role
This repo is a job application workspace. Claude acts as a career advisor and application assistant for Felipe Duitama, helping with:
1. **Job fit evaluation** - Assess job postings against your profile (skills, experience, behavioral traits)
2. **CV tailoring** - Adapt existing CV templates (LaTeX/moderncv) to target specific roles
3. **Cover letter writing** - Draft targeted cover letters using existing templates (LaTeX)
4. **Interview preparation** - Prepare answers, questions, and talking points for interviews
5. **Career strategy** - Advise on positioning and personal branding

## Candidate Profile

<!-- This section is auto-populated by /setup. You can also fill it in manually. -->

### Identity
- **Name:** Felipe Duitama
- **Location:** Bogotá, Colombia (remote-international / Americas-timezone remote / Bogotá hybrid; not relocating abroad)
- **Languages:** Spanish (native), English (B1–B2, improving toward C1), French (basic)
- **Status:** Employed, open to new opportunities
- **LinkedIn headline:** "Senior Software Engineer | Full Stack & Frontend Architecture | React · TypeScript · AWS"

### Education
- **Systems Engineering** (2011–2020) - Universidad Distrital Francisco José de Caldas
  - Topics: Software engineering, algorithms, systems design

### Professional Experience
- **Software Engineer → Technical Lead** (2013 - Present) - **3D Virtual Environment Solutions** (Bogotá, Colombia — ConstructionTech)
  - Led monolith→microservices migration (vanilla JS → React/TypeScript/Node.js, AWS ECS Fargate/Lambda/API Gateway)
  - Designed a Dijkstra-based pipe auto-routing algorithm over a heat-load-weighted room-grid graph
  - Technical lead over a cross-functional team (engineering, design, data science); owned architecture and CI/CD (GitHub Actions)

### Technical Skills
- **Primary:** React, TypeScript, JavaScript, Node.js, C#/.NET, frontend architecture, AWS microservices
- **Secondary:** Python, Docker/Kubernetes, CI/CD (GitHub Actions), Playwright/Cypress, AI-assisted development (LLM agents, MCP, Claude Code)
- **Domain:** Frontend/cloud architecture, graph algorithms & routing, 3D/AR (Unity, WebGL, HoloLens), BIM/Revit, ConstructionTech
- **Software:** Next.js, Unity 3D, WebGL, Mapbox, Chart.js, MongoDB, MySQL, PostgreSQL, Git, Notion

### Certifications
- **Unity Certified Developer** - completed 2017–2019

### Publications
- None to date.

### Awards
- None recorded.

### Behavioral Profile
- **End-to-end ownership** - Owns architecture through delivery, including infra and coordination
- **Hands-on leadership** - Leads technically while staying deep in the code
- **Strengths:** Autonomy, hard-problem solving, pragmatic architecture, continuous learning
- **Growth areas:** English toward C1; breadth of formal line-management
- **Thrives in:** High-autonomy, complex/greenfield work with cross-functional collaboration

### What Excites You
- Owning architecture and hard technical problems (algorithms, pipelines, 3D/AR)
- Migrations and greenfield/0→1 work; adopting emerging tooling (AI coding agents)

### Target Sectors
- Software product companies (remote-international, Americas timezone)
- ConstructionTech / PropTech / BIM; 3D/AR/spatial computing; developer tooling

### Career Objective
- Reach **Software Architect / Principal Software Engineer** in an international engineering team while staying hands-on.

### Compensation Expectations
- **Target:** 3,500 USD/month (42,000 USD/year), base salary. Open to discussing the full package (equity, benefits) around this anchor.

### Deal-breakers
- Rigid, low-autonomy, or micromanaged environments
- Relocation abroad (not seeking it); pure legacy-maintenance roles with little new development

## Repo Structure
- `cv/` - LaTeX CV variants (moderncv template, banking style)
- `cover_letters/` - LaTeX cover letters (custom cover.cls template)
- `.claude/skills/` - AI skill definitions for the application workflow
- `.agents/skills/` - Job search CLI tools

## Workflow for New Job Applications
1. User provides a job posting (URL or text)
2. **Always evaluate fit first**: skills match, experience match, behavioral/culture match. Present this assessment to the user before proceeding.
3. If good fit: create targeted CV (`cv/main_<company>.tex`) and cover letter (`cover_letters/cover_<company>_<role>.tex`)
4. **Verify both documents** (see Verification Checklist below)
5. Prepare interview talking points based on the role requirements and your strengths

**Important:** When mentioning agentic coding or AI tooling in CVs/cover letters, explicitly reference **Claude Code** by name.

## Verification Checklist
After creating or updating a CV or cover letter, re-read the generated file and verify **all** of the following before presenting to the user. Report the results as a pass/fail checklist.

### Factual accuracy
- [ ] All claims match actual profile (CLAUDE.md / candidate profile) - no fabricated skills, experience, or achievements
- [ ] Job titles, dates, company names, and locations are correct
- [ ] Contact details are correct
- [ ] All company-specific claims (partnerships, products, technology, expansions) have been independently verified via WebFetch/WebSearch - do not trust reviewer agent research without verification

### Targeting
- [ ] Profile statement / opening paragraph is tailored to the specific role (not generic)
- [ ] Skills and experience bullets are reframed to match the job requirements
- [ ] Key job requirements are addressed (with gaps acknowledged where relevant)
- [ ] Nice-to-have requirements are highlighted where there is a match

### Consistency
- [ ] CV follows the standard 2-page moderncv/banking format
- [ ] Cover letter uses cover.cls template and established structure
- [ ] Tone is consistent across CV and cover letter
- [ ] No contradictions between CV and cover letter content

### Quality
- [ ] No LaTeX syntax errors (balanced braces, correct commands)
- [ ] No spelling or grammar errors
- [ ] Agentic coding / AI tooling references mention **Claude Code** by name
- [ ] Cover letter is addressed to the correct person (or "Dear Hiring Manager" if unknown)
- [ ] Cover letter fits approximately one page

### Compiled PDF verification (MANDATORY - never skip)
Both documents MUST be compiled and visually inspected via the Read tool on the PDF output. "Looks fine in the .tex" is not acceptable - LaTeX page-break decisions are unpredictable. Iterate until these all pass:
- [ ] CV compiled with **lualatex** (pdflatex often fails on modern MiKTeX with fontawesome5 font-expansion errors). Cover letter compiled with **xelatex** (cover.cls requires fontspec).
- [ ] **CV is exactly 2 pages** - not 1, not 3
- [ ] **No orphaned `\cventry` titles** - a job/education title must never sit at the bottom of a page with its bullets spilling to the next page. Use `\needspace{5\baselineskip}` before each `\cventry` to prevent this, and `\enlargethispage{2-3\baselineskip}` to rescue a trailing section that just barely spills
- [ ] **Cover letter is exactly 1 page** - signature block must fit with the body, never overflow
- [ ] **Cover letter bullet font matches body font** - `\lettercontent{}` must not wrap `\begin{itemize}...\end{itemize}` (the command's trailing `\\` errors on `\end{itemize}`, and moving itemize outside loses the Raleway font). Standard pattern: close `\lettercontent{}`, then wrap the list in `{\raggedright\fontspec[Path = OpenFonts/fonts/raleway/]{Raleway-Medium}\fontsize{11pt}{13pt}\selectfont \begin{itemize}...\end{itemize}\par}`

### ATS & keyword verification (CV)
ATS parsers read the PDF's embedded text layer, not the rendered page. Extract it with `pdftotext -layout` and verify what a parser sees. `pdftotext` (poppler) is optional - if missing, skip the parseability items with a warning and check keyword coverage from the visual PDF read instead.
- [ ] CV text layer extracts cleanly - no `(cid:*)` markers, `�` replacement characters, or text visible in the PDF but absent from the extraction
- [ ] Email and phone appear as **literal text** in the extraction (icon-glyph noise like `MOBILE-ALT`/`Envelope` is harmless, but a contact detail carried only by an icon or hyperlink is invisible to ATS)
- [ ] Reading order of the extracted text matches the visual order (single-column stock template is safe; multi-column custom templates are where this breaks)
- [ ] Posting keywords covered or honestly absent - synonym-only matches tightened to the posting's exact term where truthfully applicable, keywords the profile genuinely supports added to experience bullets, genuine gaps left visible and **never stuffed**
