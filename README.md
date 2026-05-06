# CostRadar

**Free AI tool spend auditor for startup teams.**

Enter what your team pays for Cursor, ChatGPT, Claude, GitHub Copilot, and five others — get an instant, defensible breakdown of where you're overspending and how much you could save annually. No login required to see results.

Built as a lead-generation tool for [Credex](https://credex.rocks), which sources discounted AI credits for startups.

**Live:** [your-app.vercel.app](https://your-app.vercel.app)

---

## Screenshots

> Add 3 screenshots here once the app is deployed, or a Loom recording link.

---

## Quick Start

```bash
git clone https://github.com/yourusername/costradar
cd costradar
npm install
cp .env.example .env.local
# Fill in your keys (Supabase, Resend, Anthropic)
npm run dev
```

**Run tests:**
```bash
npm run test
```

**Supabase setup** — run this SQL in your Supabase project's SQL editor:

```sql
create table audits (
  id                  uuid    default gen_random_uuid() primary key,
  created_at          timestamptz default now(),
  tools               jsonb   not null,
  team_size           int,
  use_case            text,
  total_monthly_spend numeric,
  total_monthly_savings numeric,
  total_annual_savings  numeric,
  recommendations     jsonb,
  show_credex         boolean,
  is_already_optimal  boolean,
  ai_summary          text
);

create table leads (
  id            uuid    default gen_random_uuid() primary key,
  created_at    timestamptz default now(),
  audit_id      uuid    references audits(id),
  email         text    not null,
  company_name  text,
  role          text,
  team_size     int,
  monthly_savings numeric
);
```

---

## Decisions

**1. Hardcoded audit rules, not AI**

The audit engine is pure TypeScript — no LLM involved. This was a deliberate choice: a finance person reading the recommendations should be able to verify every number against the vendor's pricing page. LLM output isn't auditable in that way. AI is used only for the narrative summary, where some variation is acceptable and even desirable.

**2. Email captured after results, never before**

Every pattern that gates value behind an email produces lower-quality leads and worse UX. We show the full audit first, then ask for email if the user wants the report sent to them. This matches how the brief explicitly required it, and it means every email we capture is from someone who has already seen value.

**3. Honeypot + IP rate limiting over hCaptcha**

hCaptcha adds a visible challenge that hurts conversion for the technical audience this tool targets (engineers find CAPTCHAs irritating). A hidden honeypot field silently catches automated submissions; IP rate limiting at 5 requests/hour handles brute force. The tradeoff: slightly less protection than a proper CAPTCHA, but meaningfully better UX for the 99.9% of users who are human.

**4. Next.js App Router with server components for the shareable page**

The `/audit/[id]` page is a React Server Component. This is the only correct way to get Open Graph meta tags server-rendered in Next.js 14 — which is required for Twitter/LinkedIn link previews to work. If this page were client-rendered, the crawler would see an empty shell and generate a blank preview card.

**5. Supabase over a custom Postgres on Render**

Both would work. Supabase's free tier is generous enough for an MVP, its SDK handles connection pooling, and its built-in table view gives Credex a zero-setup way to view and export leads without building an admin UI. The tradeoff is vendor lock-in on some Supabase-specific APIs — acceptable at this stage.

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | Server components for OG tags; Vercel deploy |
| Language | TypeScript | Required for typed audit engine logic |
| Styling | Tailwind CSS | Fast iteration, no class collisions |
| Database | Supabase (Postgres) | Free tier, built-in dashboard, RLS |
| Email | Resend | Simplest transactional email API |
| AI | Anthropic Claude Sonnet | Preferred by brief; best quality/latency ratio |
| Deploy | Vercel | Zero-config Next.js, auto-deploy on push |
| Tests | Vitest | Faster than Jest, native ESM, same API |
| CI | GitHub Actions | Green checks gating merges to main |
