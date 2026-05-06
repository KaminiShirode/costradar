# PROMPTS

## AI Summary — used in `app/api/summary/route.ts`

### Final prompt

```
You are a CFO advisor. Write an 80–100 word paragraph — no bullet points, no hedging language.

Context:
- Team: {teamSize} people, primary use case: {useCase}
- Current monthly AI spend: ${totalMonthlySpend}
- Potential monthly savings: ${totalMonthlySavings}
- Top recommendations: {topActions}

Rules:
- Be direct and specific — use the exact dollar figures above
- Sound like a CFO, not a chatbot (no "you might consider", no "it could potentially")
- End with the annual savings figure
- Never use bullet points
```

### Why each part exists

**"CFO advisor" persona** — Without a persona, the default Claude voice hedges ("you might want to consider", "it could be beneficial to"). A CFO gives direct instructions. This single change was responsible for the biggest quality jump between prompt versions.

**"80–100 word paragraph"** — Shorter outputs felt thin (40 words = one sentence); longer ones felt like a report rather than a summary. 80–100 hits the right density for a results page panel. The hard constraint also prevents the model from rambling.

**"No bullet points"** — The results page already has a per-tool breakdown in bullet/card format. The AI summary must feel *different* — a human narrative, not more structured data. Without this rule, the model frequently added an implicit list structure even inside a paragraph.

**"No hedging language"** — Explicitly naming the phrases to avoid ("you might consider", "it could potentially") worked better than vague instructions like "be confident". Naming specific phrases gives the model something concrete to avoid.

**"End with the annual savings figure"** — The annual number ($X,XXX/year) is the most emotionally resonant figure in the audit. Anchoring the summary on it gives the paragraph a strong, memorable close.

### Version history

**V1 — too generic:**
```
Summarize this CostRadar in 100 words.
```
Output: "Your team could potentially save money by reviewing your current AI tool subscriptions. Consider evaluating whether each plan is appropriate for your team size." Zero numbers, zero specifics.

**V2 — better structure, still robotic:**
```
Write a 100-word summary with: 1) current spend, 2) opportunity, 3) top recommendation.
```
Output used the right data but read like a structured form, not a paragraph. The numbered instruction created implicit section breaks.

**V3 — final (above)** — Adding the CFO persona, the anti-hedging rule, and the word count constraint in combination produced summaries that read like genuine advisor output.

### Fallback behavior

If the Anthropic API call fails for any reason (timeout, rate limit, 5xx), `app/api/summary/route.ts` catches the error and returns a template-generated summary with identical data. The page renders normally — the user never sees an error state. The `source` field in the response (`'api'` vs `'fallback'`) is logged server-side for monitoring but not shown to users.
