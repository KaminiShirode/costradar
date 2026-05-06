# PRICING DATA

All prices verified during the week of May 6–12, 2025.
Every number in `lib/pricing.ts` traces to an official vendor pricing page listed here.
Enterprise pricing where not publicly listed is noted as estimated with reasoning.

---

## Cursor — cursor.com/pricing — verified 2025-05-07

| Plan | Price | Notes |
|---|---|---|
| Hobby | $0/seat/mo | Free tier |
| Pro | $20/seat/mo | Most common individual plan |
| Business | $40/seat/mo | Adds SSO, admin controls, zero data retention |
| Enterprise | ~$100/seat/mo | **Estimated** — Cursor does not publish Enterprise pricing. Estimate based on Glassdoor enterprise contract disclosures and LinkedIn posts from customers. Marked as estimated in audit output. |

Source: https://cursor.com/pricing

---

## GitHub Copilot — github.com/features/copilot — verified 2025-05-07

| Plan | Price | Notes |
|---|---|---|
| Individual | $10/seat/mo (or $100/yr) | Best for solo devs already on GitHub |
| Business | $19/seat/mo | Adds org-wide policy controls, audit logs |
| Enterprise | $39/seat/mo | Adds fine-tuned models, knowledge bases |

Source: https://github.com/features/copilot#pricing

---

## Claude — Anthropic — claude.ai/upgrade — verified 2025-05-07

| Plan | Price | Notes |
|---|---|---|
| Free | $0 | Limited daily messages |
| Pro | $20/seat/mo | 5× more usage, priority access |
| Max | $100/seat/mo | 20× usage, extended thinking |
| Team | $25/seat/mo | Min 5 seats, shared projects |
| Enterprise | ~$60/seat/mo | **Estimated** — custom pricing; estimate from Anthropic sales collateral |

Sources:
- https://claude.ai/upgrade
- https://www.anthropic.com/claude-for-enterprise

---

## ChatGPT — OpenAI — openai.com/chatgpt/pricing — verified 2025-05-07

| Plan | Price | Notes |
|---|---|---|
| Free | $0 | Limited GPT-4o access |
| Plus | $20/seat/mo | Full GPT-4o, DALL·E 3 |
| Team | $30/seat/mo | Min 2 seats, shared workspace, no training |
| Enterprise | ~$60/seat/mo | **Estimated** — OpenAI custom pricing |

Sources:
- https://openai.com/chatgpt/pricing
- https://openai.com/chatgpt/enterprise

---

## Anthropic API — anthropic.com/pricing — verified 2025-05-07

| Model | Input | Output |
|---|---|---|
| Claude 3.5 Sonnet | $3.00/1M tokens | $15.00/1M tokens |
| Claude 3 Opus | $15.00/1M tokens | $75.00/1M tokens |
| Claude 3 Haiku | $0.25/1M tokens | $1.25/1M tokens |

Source: https://www.anthropic.com/pricing

---

## OpenAI API — openai.com/api/pricing — verified 2025-05-07

| Model | Input | Output |
|---|---|---|
| GPT-4o | $5.00/1M tokens | $15.00/1M tokens |
| GPT-4o mini | $0.15/1M tokens | $0.60/1M tokens |
| GPT-3.5 Turbo | $0.50/1M tokens | $1.50/1M tokens |

Source: https://openai.com/api/pricing

---

## Gemini — Google — verified 2025-05-07

| Plan | Price | Notes |
|---|---|---|
| Free | $0 | Gemini 1.5 Flash |
| Gemini Advanced | $19.99/mo | Via Google One AI Premium |
| Workspace Business | $24/seat/mo | Gemini in Docs, Sheets, Meet |

Sources:
- https://one.google.com/about/plans
- https://workspace.google.com/products/gemini

---

## Windsurf (Codeium) — codeium.com/windsurf/pricing — verified 2025-05-07

| Plan | Price | Notes |
|---|---|---|
| Free | $0 | Unlimited completions, limited AI Flows |
| Pro | $15/seat/mo | Unlimited flows, GPT-4o |
| Teams | $35/seat/mo | Min 2 seats, SSO, analytics |

Source: https://codeium.com/windsurf/pricing

---

## Methodology notes

- Prices are in USD
- "Per seat" means per user per month unless otherwise noted
- API-direct plans are pay-as-you-go and not comparable to seat-based plans; the audit engine treats them separately and does not attempt savings comparisons between API and seat-based plans
- Enterprise pricing that is not publicly listed is marked as estimated in both this file and in the audit engine output shown to users
