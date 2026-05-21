# Round 2 Reflection

## What was the most uncomfortable trade-off you made because of the time pressure?

The most uncomfortable one was the email binding approach. Round 1 shows results before asking for email — that's a deliberate UX decision that worked well in user testing. To make notifications work, I needed the email attached to the audit row. The cleanest solution would have been to require email upfront, but that would break the Round 1 UX and feel like a regression.

I went with late-binding — updating the audit row when the lead form submits. This works, but it means any user who ran an audit and never gave their email will never get notified, no matter how much prices change. That's a real gap. I knew it going in and shipped it anyway because the alternative was worse. It bothered me more than the missing unsubscribe link or the lack of tests on the API routes — those felt like obvious cuts, this one felt like a compromise.

## If we extended the deadline by another 24 hours, what's the first thing you'd do?

Fix the `notified_at` problem. Right now once an audit is marked as notified, it never gets emailed again — even if prices change a second time. The fix is to reset `notified_at` after each detection run so every pricing change triggers a fresh check. This isn't hard to build but I ran out of time to think through the implications — specifically, how to avoid re-sending the same email if the price changed and then changed back. I'd work through that edge case first, then implement the reset. Everything else — unsubscribe links, admin dashboard, cron schedule — can wait. This one actually affects whether the feature works correctly over time.

## What's one thing your Round 1 self made harder for your Round 2 self?

No database migration system. In Round 1 I ran the SQL directly in the Supabase dashboard and never tracked it anywhere. That was fine for Round 1 — it was just two tables and I documented them in ARCHITECTURE.md. But for Round 2, adding three new columns meant going back to the dashboard, running raw SQL, and hoping I didn't miss anything. There's no migration file, no history of what changed, and no way to set up the schema from scratch without reading through the docs and the code. If I'd set up even a basic `schema.sql` file in Round 1, Round 2 would have been cleaner. The schema would be in the repo, the new columns would be a visible diff, and anyone reviewing the PR could see exactly what changed in the database without digging through Supabase.
