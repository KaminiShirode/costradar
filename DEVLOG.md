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