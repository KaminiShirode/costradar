# ECONOMICS

## What a Converted Lead Is Worth to Credex

Credex resells discounted AI credits. A "converted lead" is someone who books a consultation and buys.

**Assumptions (conservative):**
- Average deal: a 20-person startup replacing 6 months of retail ChatGPT Team ($30/seat × 20 seats × 6 months = $3,600 retail)
- Credex discount to customer: 25% off retail → customer pays $2,700
- Credex margin on resale: 20% → **gross profit per deal = $540**
- Average customer repeats 2× per year = **$1,080 gross profit/customer/year**

High end: a 50-person company buying Cursor Business credits at $40/seat × 50 × 12 = $24,000/year retail, with 25% discount = $18,000 customer spend, 20% margin = **$3,600 gross profit per customer per year**.

**Blended estimate: $1,500 gross profit per converted customer per year** (mix of SMB and mid-market).

## CAC by Channel

| Channel | Monthly visitors | Audit completion (40%) | Audits/mo | High-savings audits (15%) | Consultations (25% of high-savings) | Purchases (30% of consults) | CAC |
|---|---|---|---|---|---|---|---|
| HN + organic | 800 | 320 | 320 | 48 | 12 | 3–4 | ~$0 |
| Twitter outreach | 300 | 120 | 120 | 18 | 4–5 | 1–2 | ~$0 |
| Reddit posts | 400 | 160 | 160 | 24 | 6 | 1–2 | ~$0 |
| Paid Google (later) | 500 | 200 | 200 | 30 | 7–8 | 2 | ~$600 |

**At zero paid budget: ~6 purchases/month, $0 CAC → payback period = 0 months.**

Paid CAC of $600 vs $1,500 LTV = 2.5× LTV:CAC ratio. Acceptable, not great. Improve by increasing audit → consultation conversion rate (better CTA copy, faster follow-up).

## Conversion Funnel Model

```
Website visitors:          1,000 / month
↓ Audit started (40%):       400
↓ Audit completed (90%):     360
↓ Email captured (22%):       79
↓ High-savings audits (15%):  54
↓ Consultation booked (25%):  13
↓ Purchase made (30%):         4

Revenue per month:      4 × $1,500 LTV = $6,000
Cost per month:         ~$50 (Vercel + Supabase + Resend free tiers)
Margin at 1k visitors:  >99%
```

Key insight: the bottleneck is visitors, not conversion. The tool's economics improve dramatically with more traffic, not better funnel optimization.

## What Would Have to Be True for $1M ARR in 18 Months

$1M ARR = $83,333 revenue/month.

At $1,500 gross profit/customer/year → need **56 new customers/month** sustained.

Working backward:
- 56 purchases/month at 30% close rate → **187 consultations/month**
- 187 consults at 25% conversion from high-savings audits → **748 high-savings audits/month**
- 748 high-savings audits at 15% of all audits → **4,987 audits/month**
- 4,987 audits at 40% visit-to-audit rate → **12,467 website visitors/month**

**12,500 visitors/month is achievable by month 9** through:
- Ongoing HN/Reddit presence (500–1,000/month organic)
- SEO on "cursor pricing", "chatgpt team vs enterprise", etc. ramping to 3,000/month by month 6
- Vendor page placements (Credex's unfair channel) adding 2,000+/month
- Shareable URL referral loop contributing 1,000–2,000/month

The math works. The risk is execution speed, not the model itself.

## Sensitivity Analysis

The most sensitive variable is the audit → consultation rate (currently modeled at 25% of high-savings audits). If this drops to 10%:
- Purchases fall from 56 to ~22/month
- ARR drops from $1M to ~$400k
- Fix: improve the Credex CTA copy, add a calendar embed for instant booking

The least sensitive variable is the purchase → revenue figure — Credex controls the deal terms.
