# Interview Preparation Guide

<!-- SETUP: STAR examples are personalized by running /setup based on your actual experience -->

## STAR Format

Structure answers as: **Situation** (context), **Task** (your responsibility), **Action** (what you did), **Result** (outcome).

Keep answers to 1-2 minutes. Be specific. End with what you learned or would do differently.

## Ready-Made STAR Examples

<!-- Drafted from Felipe's actual experience. Sharpen the Result lines with real
     numbers (%, time saved, users) where you can before an interview. -->

### 1. Monolith → Microservices Migration (Architecture & Technical Leadership)
**S:** The ARAS/BIMEP HVAC platform had grown into a vanilla-JS monolith with compute-intensive algorithms bottlenecking the whole system, and runtime errors were slowing the team down.
**T:** As technical lead, I owned re-architecting the platform to make it maintainable and independently scalable.
**A:** Led the migration to React + TypeScript + Node.js (establishing component-reuse patterns and static typing to cut runtime errors), then architected a microservices model on AWS (ECS Fargate, EC2, API Gateway, CloudWatch, load balancers), decomposing the heavy algorithms into independently scalable services. Built a lightweight custom message broker to coordinate Node.js services with Python algorithms on AWS Lambda, and set up CI/CD via GitHub Actions.
**R:** Compute-heavy algorithms became independently scalable, runtime errors dropped after the TypeScript migration, and the team could deploy services independently. *(Add concrete numbers if available.)*
**Use for:** "Tell me about a complex system you designed", "Describe a time you led a technical transformation", "How do you approach architecture decisions?"

### 2. Dijkstra Pipe Auto-Routing Algorithm (Algorithm Design & Problem-Solving)
**S:** HVAC pipe layouts across building floors were being planned manually — slow and error-prone, and they had to respect heat-load constraints.
**T:** Design an algorithm to automate layout-aware pipe distribution.
**A:** Modeled each floor as a room-grid graph where edge weights encode HVAC heat load, then implemented a Dijkstra-based routing algorithm to compute optimal pipe paths automatically. Decomposed it into an independently scalable service so it wouldn't block the rest of the platform.
**R:** Automated a previously manual, expert-dependent task and produced layout-aware routing that respected engineering constraints. *(Quantify time saved if possible.)*
**Use for:** "Describe a hard technical problem you solved", "Tell me about applying CS fundamentals in production", "When did you build something from scratch?"

### 3. Browser-Native 3D Model Viewer Pipeline (Full-Stack Ownership & Performance)
**S:** Teams needed to view large BIM/3D models in the browser without heavy desktop tools or login friction.
**T:** Own delivery of an end-to-end pipeline from file conversion to in-browser rendering.
**A:** Designed a file-conversion pipeline (Revit RVT and LAS → XKT) with a server-side processing queue and WebSocket-based progress notifications, then integrated interactive viewer tools (measurements, camera controls, model transforms) with WebGL. For the HoloLens AR variant, streamed 3D assets from a file server to stay within device memory limits, which required deep geometry optimization.
**R:** Teams could load and inspect BIM models directly in the browser with live progress feedback and no login friction.
**Use for:** "Tell me about an end-to-end project you owned", "Describe a performance/optimization challenge", "How do you handle full-stack delivery?"

### 4. Growing from Engineer to Technical Lead (Leadership & Cross-Functional Coordination)
**S:** Over 11 years at a ConstructionTech company, the products and team grew and needed more structured technical direction.
**T:** Step up from frontend engineer to technical lead during the algorithm-integration phase without losing hands-on delivery.
**A:** Owned infrastructure and architecture decisions, ran planning sessions, managed the backlog in Notion, and coordinated a cross-functional team across engineering, design, and data science — while staying deep in the code myself.
**R:** Delivered the integrated platform across multiple products and grew into an ownership role trusted with architecture and coordination.
**Use for:** "Tell me about your leadership style", "Describe leading a cross-functional team", "How do you balance leading and staying hands-on?"

<!-- Add more STAR examples as needed. Aim for 4-6 covering different competencies. -->

## Common Tough Questions

### "Why did you leave [previous company]?"
> [PREPARE YOUR ANSWER - be honest, forward-looking, no negativity about former employer]

### "You don't have [specific skill/experience]."
> [PREPARE YOUR ANSWER - acknowledge the gap, bridge to adjacent experience, show willingness to learn]

### "Where do you see yourself in 5 years?"
> [PREPARE YOUR ANSWER - show ambition aligned with the role's growth path]

### "What's your biggest weakness?"
> [PREPARE YOUR ANSWER - genuine weakness with concrete mitigation strategy]

### "Why this company specifically?"
> Customize per company. Must reference: specific projects, company values, market position, or team structure. Never give a generic answer.

## Questions You Should Ask Interviewers

### About the Role
- "What does a typical week look like in this role?"
- "What would success look like in the first 6 months?"
- "What's the biggest challenge the team is facing right now?"

### About the Team
- "How big is the team, and how do you divide work?"
- "What does the development/project lifecycle look like, from idea to production?"
- "How do you onboard new team members?"

### About Tech & Growth
- "What's your current tech stack for [relevant area]?"
- "Is there room to grow into more architectural or strategic decisions?"
- "How does the team stay current with new tools and methods?"

### About Culture (use these to prevent disappointment)
- "How would you describe the team culture?"
- "What does professional development look like here?"
- "Is there flexibility for remote/hybrid work?"
- "What's the balance between development/new projects and maintenance work?"
- "How would you describe the leadership style in this team?"
- "What do people who thrive here have in common?"

## Phone/Video Interview Tips
- Have STAR examples written out (use this file)
- Keep a glass of water nearby
- Smile when speaking (it changes your tone)
- Ask for clarification if a question is vague
- It's OK to take 5 seconds to think before answering
- End with: "Is there anything else you'd like to know about my background?"

## After the Application (Best Practice)

### Follow-Up Etiquette
- **Don't call to "stand out"** or to learn more about the role post-submission - this risks a negative impression
- If the employer specified a timeline, respect it and wait
- If no timeline was given and significant time has passed (2+ weeks), a brief call to ask about status is acceptable
- If you have genuinely new, relevant information to share, a short follow-up is fine

### Thank-You Notes
- When you receive any update (interview invitation, rejection, or status update), send a brief thank-you message
- Express appreciation for their time and the process
- Keep it short (2-3 sentences)

## Roleplay Guidelines
When the user asks for interview practice:
1. Ask which role/company to simulate
2. Start with easy warm-up questions ("Tell me about yourself")
3. Progress to role-specific technical questions
4. Include 1-2 behavioral questions using the competencies from the job posting
5. End with a tough question or curveball
6. After each answer, give brief feedback: what worked, what to sharpen
7. Suggest which STAR example would work best for each question
