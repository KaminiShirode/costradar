# Round 2 Devlog

## 2026-05-20 10:00 – Received assignment

Got the Round 2 brief. Read it twice. 36 hours, 4 required features — persistent audit storage with pricing snapshot, pricing-change detection, notification emails, and a diff view on re-run. Planning before code.

## 2026-05-20 10:30 – Planning

Mapped out the approach. The tricky part is email — Round 1 shows results before asking for it, so requiring email upfront would break the UX. Decided to late-bind: when the user submits the lead form, update the audit row with their email. No form changes needed.

For pricing snapshot, I'll save a copy of the TOOLS array from pricing.ts at audit time and store it as JSONB. Gives me something to diff against later when prices change.

Skipping Vercel Cron — a manual POST /api/detect-changes endpoint satisfies the requirement without the unknown debugging time. Can schedule it later if needed.

## 2026-05-20 11:00 – DB migration done

Ran the SQL in Supabase — added email, pricing_snapshot, notified_at columns to the audits table. Found all working fine.

## 2026-05-20 11:30 – Going through Round 1 code

Read through every file that Round 2 touches — audit route, lead route, pricing.ts, supabase.ts, audit engine. Needed to understand the exact shape of the data before writing anything new. Found that the lead route saves email to the leads table but never to the audits table — this is the gap that the late-bind approach needs to fix.

Also noticed the from email in lead/route.ts was hardcoded as audit@yourdomain.com. Checked Resend dashboard — no verified domain set up. Had to use onboarding@resend.dev as the sender for now. Moved it to an env variable so it's not hardcoded.

## 2026-05-20 16:40 – First commit — DB types and devlog

Updated AuditRow in supabase.ts to match the 3 new columns. First commit pushed.

## 2026-05-20 17:56 – Feature 1 done — persistent audit storage

Added getPricingSnapshot() to pricing.ts — reads the current TOOLS array and saves a copy of all plan names and prices at the time the audit ran. Wired it into the audit route so every new audit stores that snapshot in the database.

Fixed the email gap — updated the lead route to also write the email to the audit row when the user submits the lead form.

## 2026-05-20 19:00 – Break

Took a dinner break. Came back and spent some time thinking through exactly how the detection logic should work before writing any code — specifically whether to compare the stored pricing JSON directly or re-run the audit engine and compare outputs.

## 2026-05-20 22:00 – Building detect-changes endpoint

Working on /api/detect-changes. Fetch all audits with an email, re-run the audit engine on each one with current pricing, compare the old and new recommendations. If status, plan, or savings changed by more than $1 — flag it.

Grouping by email so users with multiple audits only get one notification, not several. Using notified_at to make sure we don't send the same email twice.

## 2026-05-20 22:44 – Features 2 and 3 committed — detection and email notifications

Detect-changes endpoint done. The email template took some time — had to decide what exactly to show in the before/after table. Went with plan name and savings amount per tool, since that's what the user actually cares about. Link at the bottom goes to the diff view page.

## 2026-05-20 23:11 – Tests committed — 23 total

Realised hasChanged() and getChanges() were stuck inside the API route where they couldn't be tested. Moved them to lib/auditDiff.ts and wrote 10 tests. All 23 pass.

## 2026-05-20 23:13 – Feature 4 committed — diff view page

Built /audit/[id]/reaudit. Loads the original audit, re-runs it with current pricing, shows old vs new side by side. Changed tools highlighted in blue, unchanged rows grayed out. Savings delta is the headline.

## 2026-05-21 00:00 – Design decision on pricing snapshot

Noticed that pricing_snapshot is stored in the database but the detection logic never reads it — it re-runs the audit engine with current pricing and compares outputs instead. Considered comparing the stored pricing JSON directly but decided against it. Re-running the engine is simpler and also catches cases where the audit logic itself changes, not just prices. Kept the snapshot for audit trail — so there's a record of what prices were used at the time of the original audit.

## 2026-05-21 00:15 – Caught wrong devlog timestamps

Went back to check the devlog against git log and found the timestamps were off — "Features 2 and 3 done" was written as 17:30 but the actual commit was at 22:44. Fixed all entries to match the real commit times. Should have been writing these in real time instead of reconstructing them later — lesson learned.

## 2026-05-21 00:30 – Wrapping up for the night

All 4 features committed and pushed. Reviewed devlog for accuracy. Picking up tomorrow morning with ROUND2_PR.md, ROUND2_REFLECTION.md, deploy check, and PR.
