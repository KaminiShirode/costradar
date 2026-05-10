# REFLECTION

## 1. The hardest bug you hit this week

The Vercel deployment failures were the most frustrating part of the week. Locally everything worked fine — the app ran, audits saved to Supabase, results showed up. But every time I pushed to Vercel it failed with TypeScript errors on the build step.

The error was: "Object literal may only specify known properties, and 'tools' does not exist in type 'never[]'". Took me a while to understand what was happening. My hypothesis at first was that the Supabase client wasn't initialized correctly on the server. Checked the env vars — they looked fine. Then I thought maybe the import was wrong. Checked that too — fine.

Eventually I realized the issue was that Supabase auto-generates TypeScript types from your database schema, but only if you run their type generation CLI. Since I hadn't done that, it had no idea what my tables looked like and inferred the type as 'never'. Locally TypeScript was more lenient — Vercel's build step runs strict type checking and caught it.

Fix was straightforward once I understood it — cast the Supabase client to 'any' in the routes that do inserts. Added an ESLint suppression comment to acknowledge it's intentional. Not elegant but correct for an MVP where the proper fix would be setting up Supabase type generation.

Second issue on the same day — after fixing TypeScript, the app deployed but threw "Invalid API key" on every audit submission. Spent time checking my code before realizing Supabase now has two key formats — a new publishable key and the legacy anon key. My code uses the legacy format but I had copied the new publishable key into Vercel env variables. Swapped it out and it worked immediately.

---

## 2. A decision you reversed mid-week

Originally I planned to use the new Tailwind v4 syntax since that's what create-next-app scaffolded. The postcss config used @tailwindcss/postcss which is the v4 plugin. Spent time writing component styles assuming v4 would work.

It didn't. Next.js 14.2.3 expects Tailwind v3. The app was rendering with zero styles — just raw HTML with no classes applied. Took me longer than I'd like to admit to figure out this was a version mismatch and not a component issue.

Reversed the decision completely — uninstalled the v4 plugin, installed tailwindcss v3 with autoprefixer, rewrote the postcss config back to the classic format, added tailwind.config.js manually. Cost about 2 hours. Worth it — the
app looks exactly as designed now and Lighthouse scores came back at 100 on performance.

The lesson — don't assume the latest version of a tool is compatible with your framework version. Always check compatibility before starting.

---

## 3. What I would build in week 2

First thing — a benchmark mode. Right now the audit tells you what YOU spend and where you're over. Week 2 I'd add "companies your size spend on average $X per developer on AI tools — you're at $Y." This adds a social comparison element that makes results more shareable even for users who are already spending optimally.

Second - PDF export. Three of my user interview subjects mentioned they'd want to send the report to someone else - a CFO, a co-founder, a manager. A shareable URL works but a PDF feels more official and is easier to attach to a Slack message or email.

Third — a Credex consultation booking embed directly on the results page for high-savings audits. Right now we show a CTA that links to Credex. Week 2 I'd embed a Calendly or Cal.com widget so users can book directly without leaving the page. Every extra click loses conversions.

Fourth — referral codes. If you share the tool and someone runs an audit, both parties get something — maybe a more detailed report or a discount on Credex credits. This would accelerate the viral loop that the shareable URL creates.

---

## 4. How I used AI tools

Used Claude heavily throughout the week. Mainly for:
- Generating the initial project structure and boilerplate
- Drafting the markdown files (GTM, ECONOMICS, ARCHITECTURE)
- Helping debug error messages I hadn't seen before
- Suggesting TypeScript fixes

What I didn't trust AI with:
- The audit engine business logic — I wrote and reviewed every condition myself. The AI version of isOverkill() used hardcoded seat thresholds that didn't match the actual plan definitions. I caught this when writing tests — the test for "Team plan for 1 user" was passing when it shouldn't have been.
- The user interviews — obviously. Those were real conversations.
- The pricing data — I visited every vendor pricing page myself and verified each number. AI knowledge of current pricing is unreliable.

One specific time AI was wrong — Claude suggested using the React plugin in the Vitest config to handle JSX in tests. The tests don't use any JSX — they're pure TypeScript functions testing the audit engine. Including the React plugin caused Vitest to load PostCSS which then failed because @tailwindcss/postcss wasn't compatible with the test environment. Removing the plugin entirely fixed it. The AI assumed I needed React support because the project is a
React app — but tests don't need to render components to test pure functions.

---

## 5. Self-rating

| Dimension | Score | Reason |
|---|---|---|
| Discipline | 7/10 | Worked every day and committed daily but some days were late night sessions rather than planned morning work |
| Code quality | 7/10 | Code is readable and typed but has some any casts that would need proper Supabase type generation in a real product |
| Design sense | 8/10 | Lighthouse scored 100 on performance and 96 on accessibility - the UI is clean and the results page communicates savings clearly |
| Problem-solving | 8/10 | Hit real blockers (Tailwind version, Vercel build, Supabase key format) and resolved all of them without giving up |
| Entrepreneurial thinking | 7/10 | Did real user interviews, wrote defensible GTM and ECONOMICS docs, but could have gone deeper on distribution strategy and the Credex unfair channel |