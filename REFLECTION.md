# REFLECTION

*Fill each section after completing the build. 150–400 words each. Be specific — name files, error messages, line numbers. Vague answers score low.*

---

## 1. The hardest bug you hit this week

**What to cover:** What you saw vs what you expected. Hypotheses you formed. What you tried. What the actual cause turned out to be. What you'd do differently.

*Example of specificity level: "The Supabase insert in `app/api/audit/route.ts` was returning `null` for `data` even when `error` was also null. I first assumed it was a RLS policy issue — I checked the Supabase dashboard and confirmed the table had no row-level security enabled. Then I noticed the `.select('id')` chained after `.insert()` requires the table to have `RETURNING *` enabled in Postgres, which Supabase does by default. The actual issue was that I was calling `.single()` on an insert that sometimes inserted zero rows because of a silent validation error in the input shape. Adding `console.log(error)` before the null check revealed the actual Supabase error message I had been swallowing."*

[Write your answer here]

---

## 2. A decision you reversed mid-week

**What to cover:** The original plan, what triggered the reversal, what it cost to switch, and whether it was worth it.

*Example: "I started building the results page as a client component that re-ran the audit engine in the browser from form state passed via URL params. On Day 3 I realized this meant the shareable URL couldn't work — the params would include private data. I switched to saving the audit to Supabase first and fetching by ID. The cost was 4 hours of rework and a more complex API layer. It was absolutely worth it — the shareable URL is one of the six required features and I nearly shipped without it."*

[Write your answer here]

---

## 3. What you'd build in week 2

**What to cover:** Specific features, not vague improvements. Think like a PM prioritizing a sprint.

*Example of specificity: "First: a benchmark mode that shows 'your AI spend per developer is $X — the median for companies your size is $Y', using aggregated data from the first 500 audits. This adds a social comparison element that makes the tool more shareable even for users who are already spending optimally. Second: PDF export, because I found in user interviews that EMs want to send the report to their CFO by email, not a link..."*

[Write your answer here]

---

## 4. How you used AI tools

**What to cover:** Which tools, what tasks, what you didn't trust them with, one specific time the AI was wrong and you caught it.

*Example: "I used Claude (this tool) to help draft the initial structure of auditEngine.ts. I trusted it for boilerplate and type definitions but rewrote all the business logic by hand — the AI version of isOverkill() was checking `seats > 5` for Team plans, which is wrong (the actual threshold depends on the plan's minSeats, not a magic number). I caught this when writing the test for 'Team plan for 1 user' — the test passed when it should have failed, and tracing the logic showed the incorrect hardcoded threshold."*

[Write your answer here]

---

## 5. Self-rating

| Dimension | Score | One-sentence reason |
|---|---|---|
| Discipline | /10 | [Did you work across 7 days consistently, or cram?] |
| Code quality | /10 | [Is the code readable, typed, sensibly abstracted?] |
| Design sense | /10 | [Does the UI look good and communicate clearly?] |
| Problem-solving | /10 | [How did you handle blockers when stuck?] |
| Entrepreneurial thinking | /10 | [Do your GTM/ECONOMICS/METRICS docs reflect real founder thinking?] |
