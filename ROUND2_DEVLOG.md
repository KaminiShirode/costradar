# Round 2 Devlog

## 2026-05-20 10:00 – Received assignment

Got the Round 2 brief. Read it twice. 36 hours, 4 required features — persistent audit storage with pricing snapshot, pricing-change detection, notification emails, and a diff view on re-run. Planning before code.

## 2026-05-20 10:30 – Planning

Mapped out the approach. The tricky part is email — Round 1 shows results before asking for it, so requiring email upfront would break the UX. Decided to late-bind: when the user submits the lead form, update the audit row with their email. No form changes needed.

For pricing snapshot, I'll save a copy of the TOOLS array from pricing.ts at audit time and store it as JSONB. Gives me something to diff against later when prices change.

Skipping Vercel Cron — a manual POST /api/detect-changes endpoint satisfies the requirement without the unknown debugging time. Can schedule it later if needed.

## 2026-05-20 11:00 – DB migration and types

Added 3 columns to audits in Supabase: email, pricing_snapshot, notified_at. Ran the SQL, confirmed success. Updated AuditRow in supabase.ts to match. First commit in.

## 2026-05-20 11:30 – Reviewing existing codebase before writing new code

Spent time going through the Round 1 code carefully before adding anything — audit route, lead route, pricing.ts, audit engine. Wanted to understand exactly where each change needed to go before touching anything.

## 2026-05-20 16:30 – Feature 1 done — persistent audit storage

Added getPricingSnapshot() to pricing.ts — reads the current TOOLS array and saves a copy of all plan names and prices at the time the audit ran. Wired it into the audit route so every new audit stores that snapshot in the database.

Also caught that email was never being saved to the audits table — the lead route was only writing it to the leads table. Fixed by updating audits.email when the user submits the lead form. No UI change needed. Now every audit row has the email and pricing snapshot the detection job will need.

## 2026-05-20 17:30 – Features 2 and 3 done — pricing change detection and email notifications

Created /api/detect-changes. It fetches all audits with an email, re-runs the audit engine on each one with current pricing, and checks if the recommendation changed. If it did, it sends the user an email showing what changed and links them to the diff view.

Grouped by email so a user with multiple affected audits gets one email, not several. Used notified_at to make sure we don't email the same person twice.

Also noticed the from email was hardcoded as audit@yourdomain.com — moved it to an env variable RESEND_FROM_EMAIL so it works in any environment.

## 2026-05-20 18:30 – Feature 4 done — diff view page

Built /audit/[id]/reaudit. It loads the original audit from the database, re-runs it with current pricing, and shows old vs new side by side. Changed tools get a blue highlight with a before/after card. Unchanged rows are grayed out so the user's eye goes straight to what matters. Savings delta is the headline.

## 2026-05-20 19:22 – Refactored and tests passing — 23 total

Moved hasChanged() and getChanges() out of the API route into lib/auditDiff.ts so they could be tested. Pure logic doesn't belong in API routes. Wrote 10 new tests covering both functions — same status, plan change, savings change, edge cases. All 23 tests pass.
