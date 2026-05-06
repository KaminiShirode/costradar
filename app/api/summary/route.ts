import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { AuditResult } from '@/lib/auditEngine'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

type SummaryRequest = {
  result: AuditResult
  teamSize: number
  useCase: string
}

export async function POST(req: NextRequest) {
  const { result, teamSize, useCase }: SummaryRequest = await req.json()

  const nonOptimal = result.recommendations.filter(r => r.status !== 'optimal')
  const topActions = nonOptimal
    .slice(0, 3)
    .map(r => r.recommendedAction)
    .join('; ')

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 180,
      messages: [
        {
          role: 'user',
          content: buildPrompt({ teamSize, useCase, result, topActions }),
        },
      ],
    })

    const summary = (message.content[0] as { type: string; text: string }).text
    return NextResponse.json({ summary, source: 'api' })

  } catch (err) {
    // API is down or rate-limited — fall back to a template so the page still works
    console.error('Anthropic API error (using fallback):', err)
    return NextResponse.json({
      summary: buildFallback({ teamSize, useCase, result, topActions }),
      source: 'fallback',
    })
  }
}

// ─── Prompt ───────────────────────────────────────────────────────────────
// Full prompt text is also documented in PROMPTS.md

function buildPrompt({ teamSize, useCase, result, topActions }: {
  teamSize: number
  useCase: string
  result: AuditResult
  topActions: string
}) {
  return `You are a CFO advisor. Write an 80–100 word paragraph — no bullet points, no hedging language.

Context:
- Team: ${teamSize} people, primary use case: ${useCase}
- Current monthly AI spend: $${result.totalMonthlySpend}
- Potential monthly savings: $${result.totalMonthlySavings}
- Top recommendations: ${topActions || 'no changes needed'}

Rules:
- Be direct and specific — use the exact dollar figures above
- Sound like a CFO, not a chatbot (no "you might consider", no "it could potentially")
- End with the annual savings figure
- Never use bullet points`
}

// ─── Fallback template ────────────────────────────────────────────────────

function buildFallback({ teamSize, useCase, result, topActions }: {
  teamSize: number
  useCase: string
  result: AuditResult
  topActions: string
}) {
  if (result.totalMonthlySavings === 0) {
    return `Your team of ${teamSize} is spending $${result.totalMonthlySpend}/month on AI tools for ${useCase} work. Based on current vendor pricing and your team size, your stack is well-calibrated — no meaningful savings opportunities were found. We'll flag new optimization options if pricing changes or your team grows.`
  }

  return `Your team of ${teamSize} is spending $${result.totalMonthlySpend}/month on AI tools. The audit found $${result.totalMonthlySavings}/month in unnecessary spend — ${topActions}. These are plan mismatches against published vendor pricing, not speculative estimates. Fixing them costs nothing and saves $${result.totalAnnualSavings}/year starting this month.`
}
