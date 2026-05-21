# feat: add re-audit on pricing change with email notifications

## What this PR does

Extends the Round 1 audit tool to track pricing changes over time. Every audit now stores a snapshot of the prices used and the user's email. When pricing changes, a single endpoint detects which stored audits are now out of date and emails the affected users. Users can click through to a diff view that shows what changed and how it affects their savings estimate.

## Why

A stale audit is worse than no audit — it gives users false confidence. AI tool pricing changes regularly (Cursor, Claude, and Copilot have all changed plans in the past year). The Round 1 tool gave a one-time result with no way to know when it stopped being accurate. This PR makes the audit stay useful after the first visit.

The target user is a team lead or founder who ran an audit months ago and is still making decisions based on that number. They need to know when that number changes — without having to remember to come back and check.

## How it works

**Data flow:**

1. User submits audit → `POST /api/audit` runs the engine, stores result + pricing snapshot in the `audits` table
2. User submits email → `POST /api/lead` saves lead and also writes the email to `audits.email` (late-bind — keeps the Round 1 UX of showing results before asking for email)
3. Pricing changes in `pricing.ts` (manual file edit + redeploy)
4. `POST /api/detect-changes` is triggered manually → fetches all audits with an email and no `notified_at`, re-runs the audit engine on each one with current pricing, compares old vs new recommendations
5. If status, plan, or savings changed by more than $1 → user gets one consolidated email per user (not one per audit) via Resend
6. `notified_at` is set on all notified audits to prevent duplicate emails
7. User clicks "See full diff →" in the email → lands on `/audit/[id]/reaudit` which shows old vs new side by side

**New files:**
- `lib/auditDiff.ts` — `hasChanged()` and `getChanges()` pure functions
- `app/api/detect-changes/route.ts` — detection + email sending
- `app/audit/[id]/reaudit/page.tsx` — diff view page

**DB changes:**
- `audits.email` — populated when user submits lead form
- `audits.pricing_snapshot` — saved at audit creation time (kept as audit trail; detection re-runs the engine instead of reading this directly)
- `audits.notified_at` — set after notification is sent to prevent re-sending

## What I cut

- **Vercel Cron schedule** — a manual `/api/detect-changes` endpoint satisfies the requirement. Adding a cron schedule would have taken debugging time I didn't have. Can be added later by setting up a cron job in `vercel.json`.
- **Unsubscribe link** — would need a new DB table and token-based auth. Not worth the time when the core email flow wasn't done yet.
- **Admin dashboard** — bonus feature, skipped entirely to protect the 4 required features.
- **Tests for API routes** — tested the pure logic in `lib/auditDiff.ts` instead. API route tests would need mocking Supabase and Resend which adds complexity for limited value in 36 hours.
- **Reading pricing_snapshot for detection** — considered comparing the stored JSON directly but re-running the engine is simpler and also catches logic changes, not just price changes.

## How to test it manually

1. Go to the live app and submit an audit with at least one tool (e.g. Cursor Pro, $20/mo, 1 seat)
2. Submit your email in the lead capture form
3. In `lib/pricing.ts`, change Cursor Pro `pricePerSeat` from `20` to `25`
4. Redeploy to Vercel (or run locally with `npm run dev`)
5. Trigger detection: `POST https://costradar-nu.vercel.app/api/detect-changes` (no body needed)
6. Check your inbox — you should get one email showing Cursor changed with a before/after table
7. Click "See full diff →" — you should land on `/audit/[id]/reaudit` showing the old vs new recommendations side by side
8. Changed tools appear highlighted in blue, unchanged rows are grayed out

## What's tested

- `hasChanged()` — returns false when nothing changed, returns true when status, plan, or savings changed
- `getChanges()` — returns only the tools that actually changed, with correct before/after values
- Edge cases — small savings changes under $1 don't trigger a notification, new tools in result trigger a change
- All 23 tests pass (13 from Round 1 + 10 new)

Skipped: API route tests for `/api/detect-changes`. Would be the first thing to add with more time.

## Open questions / risks

- **notified_at is a one-way door** — once an audit is marked as notified, it won't trigger another email even if prices change again. A user could miss a second price change. Fix: reset `notified_at` after each detection run instead of leaving it permanently set.
- **Email delivery depends on Resend free tier** — using `onboarding@resend.dev` as the sender. Works for testing but looks unprofessional in production. Needs a verified domain before going live.
- **No rate limiting on /api/detect-changes** — anyone can trigger it and cause emails to go out. Should be protected with a secret token before production use.
