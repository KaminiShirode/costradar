# ARCHITECTURE

## System Diagram

```mermaid
graph TD
    A[User: fills SpendForm] -->|POST /api/audit| B[API: audit route]
    B --> C[runAudit — auditEngine.ts]
    C -->|AuditResult| B
    B -->|INSERT| D[(Supabase: audits)]
    D -->|UUID| B
    B -->|id + result| A
    A -->|redirect| E[/results?id=UUID]

    E -->|GET /api/audit?id=| D
    D -->|AuditRow| E
    E -->|POST /api/summary| F[API: summary route]
    F --> G[Anthropic Claude Sonnet]
    G -->|100-word summary| F
    F -->|summary text| E

    E -->|POST /api/lead| H[API: lead route]
    H --> I[Rate limit + honeypot check]
    I -->|ok| J[(Supabase: leads)]
    I -->|ok| K[Resend: confirmation email]

    E --> L[/audit/UUID — server component]
    L -->|SELECT| D
    L -->|generateMetadata| M[OG + Twitter card tags]
```

## Data Flow

```
1.  User fills the form (tool, plan, seats, monthly spend per tool)
2.  On submit → POST /api/audit with AuditInput
3.  Server runs runAudit() — pure TS, no external calls, <5ms
4.  AuditResult saved to Supabase; UUID returned
5.  Browser redirects to /results?id=UUID
6.  Results page fetches the stored AuditRow from Supabase
7.  In parallel: POST /api/summary → Anthropic API → 100-word summary
      └─ If Anthropic fails: template fallback shown, no user-visible error
8.  User sees full results (hero savings, per-tool breakdown, AI summary)
9.  User fills email form → POST /api/lead
      ├─ Honeypot check (bot filter)
      ├─ IP rate limit check
      ├─ INSERT into leads table
      └─ Resend sends confirmation email
10. Shareable URL at /audit/UUID (server component, OG tags generated server-side)
     └─ Personal info excluded — only tools and savings shown
```

## Why This Stack

**Next.js 14 App Router** — The shareable page must be a React Server Component so `generateMetadata()` runs at request time. This is the only way to get correct OG/Twitter meta tags for social link previews. The Pages Router doesn't support this pattern cleanly.

**TypeScript strict mode** — The audit engine has branching logic across 8 tools, 30+ plans, and 5 use cases. Strict types catch "wrong field name" and "missing case" bugs at compile time rather than runtime.

**Tailwind CSS** — Audit results pages get screenshotted and shared. Tailwind lets us iterate on the visual design quickly with no class name conflicts and zero unused CSS in production (PurgeCSS is built in).

**Supabase** — Three reasons: the free tier handles MVP scale, the JS SDK is typed, and the table dashboard lets Credex view/export leads without us building an admin interface. UUID primary keys make audit URLs unpredictable (no enumeration attacks).

**Resend** — One `npm install` and one API call. The SES and Postmark alternatives require domain verification setups that aren't worth the time on day one. Resend's free tier covers 100 emails/day.

**Anthropic API (Claude Sonnet)** — Preferred by the brief. Sonnet gives better quality than Haiku at acceptable latency for this use case (the summary appears after results load, so the user is reading the breakdown while waiting). Hard fallback to a template string if the API is unavailable.

## What Changes at 10,000 Audits/Day

| Component | Now | At 10k/day |
|---|---|---|
| Audit logic | Runs in-process in API route | Move to Cloudflare Workers — <50ms globally |
| Rate limiting | In-memory Map (resets on deploy) | Upstash Redis — persists across instances |
| Email | Synchronous in API route | Background queue via Inngest or Trigger.dev |
| Supabase reads | Direct query per request | Add Postgres read replica for shareable pages |
| Pricing data | Hardcoded TypeScript file | Store in DB with background refresh job |
| OG images | Static meta tags | `app/opengraph-image.tsx` for dynamic image generation |
