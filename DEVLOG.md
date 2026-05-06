## Day 1 — 2025-05-07
**Hours worked:** 4
**What I did:** Got the assignment at 6:29 PM. Read the brief twice 
before touching code. Set up Next.js 14 with TypeScript and Tailwind. 
Hit a Node version issue — v25 breaks Next.js, switched to v20 via 
Homebrew. Copied all project files, installed deps. Fixed vitest config 
— was pulling in PostCSS which broke pure Node tests. 12/13 tests 
passing. Named the product CostRadar. First commit pushed to GitHub.
**What I learned:** Next.js 14 needs Node 18 or 20 — found this out 
the hard way. Vitest doesn't need the React plugin if tests don't 
touch any UI code.
**Blockers / what I'm stuck on:** Still need Supabase, Resend, and 
Anthropic keys — app won't work end to end without them. One test 
still failing (Claude Pro optimal detection — logic issue to fix).
**Plan for tomorrow:** Supabase setup, get all API keys, .env.local, 
deploy to Vercel.