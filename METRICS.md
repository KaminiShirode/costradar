# METRICS

## North Star Metric

**Qualified leads per week** — defined as: email captured from an audit showing ≥$100/month in savings.

### Why this metric, not the obvious alternatives

"Audits run" is too easy to game and doesn't track value. Someone could run 100 audits with fake data.

"Emails captured" is better but includes people who entered their email out of curiosity after finding $0 savings. That's not a Credex lead.

"Consultations booked" is the right long-run metric but happens too infrequently early on (less than weekly) to be useful for day-to-day decisions.

Qualified leads (real email + real savings ≥$100) are the best leading indicator of consultation bookings and eventual revenue. Every qualified lead is someone who has experienced genuine value from the tool and is a plausible Credex customer.

## Three Input Metrics That Drive the North Star

### 1. Audit completion rate
`Visits → audits submitted`

**Target:** 40%+

**Why it matters:** A visit that doesn't become an audit is a total loss. If this rate is low, the form is too long, too confusing, or asks for data people don't have to hand (e.g. "exact monthly spend" — many users will need to check their billing).

**If it drops below 25%:** Shorten the form. Make "monthly spend" optional with an estimate toggle. Add a tooltip showing how to find the number in 30 seconds.

### 2. Savings rate among completed audits
`Audits with ≥$100/month savings ÷ total audits`

**Target:** 25–35%

**Why it matters:** This is partly a function of who we attract (well-optimized teams won't have savings to find) and partly audit engine quality (too-conservative rules undercount real savings). If this is low, we may be attracting the wrong audience or leaving savings on the table.

**If it drops below 15%:** Check whether the HN/Reddit posts are attracting the right audience. Also review the audit engine rules — are we missing obvious savings (e.g. not catching Claude Team at 3 seats when Pro is cheaper)?

### 3. Email capture rate among audits showing savings
`Emails captured ÷ audits showing ≥$50/month savings`

**Target:** 25%+

**Why it matters:** Users who see real savings and still don't give their email represent a value delivery failure — either the CTA isn't compelling, the trust isn't there, or the timing is wrong.

**If it drops below 15%:** A/B test the CTA headline. Try "Send me this report" vs "Get the full breakdown" vs "Email to my CFO". Also check whether the Credex mention in the high-savings CTA is creating friction ("I don't want a sales call").

## What We'd Instrument First

Priority order on day one:

1. `page_view` — are people arriving?
2. `form_started` — did they interact with the first dropdown?
3. `audit_submitted` — did they complete and submit?
4. `email_captured` — did they give their email?
5. `share_link_copied` — is the viral loop activating?
6. `consultation_booked` — revenue signal (track via Calendly webhook or UTM)

No complex analytics stack needed on day one. Plausible or PostHog on free tier handles all of this.

## What Number Triggers a Pivot Decision

After **500 audits completed**:

- If qualified leads per week < 5 → the tool isn't converting at useful scale. Re-examine the Credex CTA and high-savings detection threshold.
- If audit completion rate < 20% → the form is too long or asks for the wrong things. Simplify aggressively.
- If 0 consultations booked after 4 weeks → the tool generates interest but not intent. Reconsider whether this is the right lead-gen mechanism or whether Credex needs a different offer for the audience the tool attracts.

The trigger for shutting down is 4 weeks with no Credex consultation bookings despite reasonable traffic (500+ visits/week). At that point, the tool is a marketing expense with no revenue path, not an asset.
