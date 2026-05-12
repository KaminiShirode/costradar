## Day 1 — 2025-05-07
**Hours worked:** 4

**What I did:** Got the assignment at 6:29 PM. Read the brief twice before touching code. Set up Next.js 14 with TypeScript and Tailwind. Hit a Node version issue — v25 breaks Next.js, switched to v20 via Homebrew. Copied all project files, installed deps. Fixed vitest config  — was pulling in PostCSS which broke pure Node tests. 12/13 tests passing. Named the product CostRadar. First commit pushed to GitHub.

**What I learned:** Next.js 14 needs Node 18 or 20 — found this out the hard way. Vitest doesn't need the React plugin if tests don't touch any UI code.

**Blockers / what I'm stuck on:** Still need Supabase, Resend, and Anthropic keys — app won't work end to end without them. One test still failing (Claude Pro optimal detection — logic issue to fix).

**Plan for tomorrow:** Supabase setup, get all API keys, .env.local, deploy to Vercel.

## Day 2 — 2025-05-08
**Hours worked:** 5

**What I did:** Fixed Tailwind CSS — was using v4 syntax but Next.js 14 needs v3. Switched postcss config. Created Supabase project, ran SQL to create audits and leads tables. Connected .env.local with all API keys — Supabase, Resend, Anthropic. Full audit flow working end to end locally — form → results → shareable URL. Fixed Supabase  TypeScript type error in audit route using type cast. CI pipeline  now green on GitHub. Started Vercel deploy — hit project name conflict, will resolve tomorrow.

**What I learned:** Next.js 14 needs Tailwind v3 not v4. Supabase generated types can conflict with insert operations — casting to any is acceptable for MVP. Vercel auto-deploys on every git push.

**Blockers / what I'm stuck on:** Vercel deploy not complete yet — project name conflict. Will fix tomorrow.

**Plan for tomorrow:** Complete Vercel deploy, get live URL, update NEXT_PUBLIC_BASE_URL, test full flow on production.

## Day 3 — 2025-05-08
**Hours worked:** 4

**What I did:** Fixed Vercel deployment — was failing due to Supabase TypeScript type errors on build. Cast supabase client to any in audit and leads routes. Fixed invalid API key error — Supabase anon key was incorrect in Vercel env vars, replaced with correct legacy key. App is now fully live at https://costradar-nu.vercel.app. Full flow working on production.

**What I learned:** Vercel build is stricter than local dev — TypeScript errors that don't break locally will fail the build. Supabase has new and legacy API keys — our code needs the legacy anon key format.

**Blockers / what I'm stuck on:** Need to do user interviews — haven't started yet.

**Plan for tomorrow:** User interviews, fix failing test, Lighthouse scores, polish UI.

## Day 4 — 2025-05-09
**Hours worked:** 3

**What I did:** Conducted 3 user interviews today. Talked to Aniket (developer at Globant), Tejas (senior dev at Reval Analytics), and Bhushan (team lead at Accionlab). All 10-15 minute conversations over WhatsApp or in person. Key insight — individual developers at large companies don't feel AI cost pain at all since company pays. Target user is clearly team leads and founders at startups who see the bill. Tejas surprised me — he wants to spend smarter not less, would pay for a tool that 2-3x his velocity. Bhushan knows they overspend on Claude Code but has no time to research alternatives — exactly the problem CostRadar solves. Wrote up all 3 interviews in USER_INTERVIEWS.md.

**What I learned:** The pain point is not just saving money — it's saving time on researching alternatives. Target user is much clearer now after talking to real people.

**Blockers / what I'm stuck on:** One test still failing. Lighthouse not run yet. README needs screenshots.

**Plan for tomorrow:** Fix failing test, run Lighthouse on live URL, take 3 screenshots for README, start REFLECTION.md.

## Day 5 — 2025-05-10
**Hours worked:** 3

**What I did:** All 13 tests passing - no fixes needed. Ran Lighthouse on live URL via PageSpeed Insights - scored 100/96/100/100 on mobile, exceeding all requirements. Took screenshots of landing page, results page, and Lighthouse
scores for README. Will add screenshots to repo tomorrow.

**What I learned:** PageSpeed Insights is easier than Chrome DevTools for Lighthouse on Mac Safari. Perfect scores on first try - Next.js and Tailwind are well optimized by default.

**Blockers / what I'm stuck on:** Screenshots not added to README yet - doing tomorrow. REFLECTION.md still needs filling.

**Plan for tomorrow:** Add screenshots to README, write REFLECTION.md, review all markdown files before submission.

## Day 6 — 2025-05-11
**Hours worked:** 4

**What I did:** Went through the complete project today - reviewed every file and thought about what could be improved or enhanced. Looked at the audit engine logic, the API routes, and the component structure to see if anything felt off. Rewrote the README to reflect real work - went through a few iterations to get the tone right and  away from AI-sounding language. Added 3 live screenshots to the README - landing page, audit results showing real savings, and Lighthouse scores (100/96/100/100 on mobile).

**What I learned:** Reviewing your own code with fresh eyes shows things you missed while building. The audit engine logic is solid but the Supabase type casting could be cleaner with proper type generation set up.

**Blockers / what I'm stuck on:** Nothing blocking - everything is in place for submission tomorrow.

**Plan for tomorrow:** Write Day 7 DEVLOG, run commit count check, submit Google Form.

## Day 7 — 2025-05-12
**Hours worked:** 2

**What I did:** Submission day. Started with a final check on everything - ran the commit count, verified all markdown files are present, tested the live URL end to end. While reviewing the GitHub repo noticed the screenshots weren't displaying - turned out the file names had an extra .page in them which didn't match the paths written in README. Renamed the files and pushed the fix, screenshots now show correctly. Confirmed all 6 MVP features are working on production - form, results, AI summary, email capture, shareable URL, Supabase saving. All 13 tests passing, CI green, Lighthouse 100/96/100/100. Submitted the Google Form with repo and live URL.

**What I learned:** It's always worth double checking every detail to not miss any important work.

**Blockers / what I'm stuck on:** None - all checks passed, assignment submitted.

**Plan for tomorrow:** Waiting to hear back on Round 2.