# Round 2 Devlog

## 2026-05-20 10:00 – Received assignment

Got the Round 2 brief. Read it twice. 36 hours, 4 required features — persistent audit storage with pricing snapshot, pricing-change detection, notification emails, and a diff view on re-run. Planning before code.

## 2026-05-20 10:30 – Planning

Mapped out the approach. The tricky part is email — Round 1 shows results before asking for it, so requiring email upfront would break the UX. Decided to late-bind: when the user submits the lead form, update the audit row with their email. No form changes needed.

For pricing snapshot, I'll serialize the TOOLS array from pricing.ts at audit time and store it as JSONB. Gives me something to diff against later when prices change.

Skipping Vercel Cron — a manual POST /api/detect-changes endpoint satisfies the requirement without the unknown debugging time. Can schedule it later if needed.

## 2026-05-20 11:00 – DB migration and types

Added 3 columns to audits in Supabase: email, pricing_snapshot, notified_at. Ran the SQL, confirmed success. Updated AuditRow in supabase.ts to match. First commit in.

## 2026-05-20 16:30 – Feature 1 done — persistent audit storage

Added getPricingSnapshot() to pricing.ts — reads the current TOOLS array and saves a copy of all plan names and prices at the time the audit ran. Wired it into the audit route so every new audit stores that snapshot in the database.

Also caught that email was never being saved to the audits table — the lead route was only writing it to the leads table. Fixed by updating audits.email when the user submits the lead form. No UI change needed. Now every audit row has the email and pricing snapshot the detection job will need.
