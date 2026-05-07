import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { runAudit } from '@/lib/auditEngine'
import type { AuditInput } from '@/lib/auditEngine'

export async function POST(req: NextRequest) {
  let input: AuditInput

  try {
    input = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!Array.isArray(input.tools) || input.tools.length === 0) {
    return NextResponse.json({ error: 'No tools provided' }, { status: 400 })
  }

  const result = runAudit(input)

  const { data, error } = await (supabase as any)
    .from('audits')
    .insert({
      tools: input.tools,
      team_size: input.teamSize,
      use_case: input.useCase,
      total_monthly_spend: result.totalMonthlySpend,
      total_monthly_savings: result.totalMonthlySavings,
      total_annual_savings: result.totalAnnualSavings,
      recommendations: result.recommendations,
      show_credex: result.showCredex,
      is_already_optimal: result.isAlreadyOptimal,
      ai_summary: null,
    })
    .select('id')
    .single()

  if (error || !data) {
    console.error('Supabase insert error:', error)
    return NextResponse.json({ error: 'Failed to save audit' }, { status: 500 })
  }

  return NextResponse.json({ id: data.id, result })
}

export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('audits')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}
