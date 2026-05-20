import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { runAudit } from '@/lib/auditEngine'
import { formatMoney } from '@/lib/format'
import type { Recommendation, UserTool, AuditInput } from '@/lib/auditEngine'

type Props = { params: { id: string } }

const STATUS_LABEL: Record<string, string> = {
  optimal: 'Optimal',
  overspending: 'Overspending',
  overkill: 'Overkill plan',
  switch: 'Wrong tool',
}

export default async function ReauditPage({ params }: Props) {
  const { data } = await supabase
    .from('audits')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500">Audit not found.</p>
          <Link href="/" className="mt-3 inline-block text-sm text-blue-600 underline underline-offset-2">
            Run a new audit →
          </Link>
        </div>
      </main>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any

  const input: AuditInput = {
    tools: row.tools as UserTool[],
    teamSize: row.team_size,
    useCase: row.use_case,
  }

  const oldRecs = row.recommendations as Recommendation[]
  const newResult = runAudit(input)
  const newRecs = newResult.recommendations

  const oldTotalSavings = row.total_monthly_savings as number
  const newTotalSavings = newResult.totalMonthlySavings
  const savingsDelta = newTotalSavings - oldTotalSavings

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-12">

        <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-slate-400">
          Updated audit
        </p>

        {/* Savings delta headline */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-400">Savings estimate changed</p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <div>
              <p className="text-2xl font-bold text-slate-300 line-through">
                {formatMoney(Math.round(oldTotalSavings))}/mo
              </p>
              <p className="text-xs text-slate-400">before</p>
            </div>
            <span className="text-slate-300 text-xl">→</span>
            <div>
              <p className="text-4xl font-bold text-blue-600">
                {formatMoney(Math.round(newTotalSavings))}/mo
              </p>
              <p className="text-xs text-slate-400">now</p>
            </div>
          </div>
          {savingsDelta !== 0 && (
            <p className={`mt-3 text-sm font-medium ${savingsDelta > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {savingsDelta > 0 ? '+' : ''}{formatMoney(Math.round(savingsDelta))}/mo {savingsDelta > 0 ? 'more savings available' : 'less savings than before'}
            </p>
          )}
        </section>

        {/* Per-tool diff */}
        <section>
          <h2 className="mb-3 text-base font-semibold text-slate-900">What changed</h2>
          <div className="space-y-3">
            {newRecs.map((newRec, i) => {
              const oldRec = oldRecs.find(r => r.toolId === newRec.toolId)
              const planChanged = oldRec?.recommendedPlan !== newRec.recommendedPlan
              const statusChanged = oldRec?.status !== newRec.status
              const savingsChanged = oldRec && Math.abs(oldRec.monthlySavings - newRec.monthlySavings) > 1
              const changed = planChanged || statusChanged || savingsChanged

              return (
                <article
                  key={i}
                  className={`rounded-2xl border p-5 shadow-sm ${
                    changed
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-slate-200 bg-white opacity-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-900">{newRec.toolName}</p>
                    {changed && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        Changed
                      </span>
                    )}
                  </div>

                  {changed && oldRec ? (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {/* Before */}
                      <div className="rounded-lg bg-white px-3 py-2 text-sm">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">Before</p>
                        <p className="text-slate-600">{STATUS_LABEL[oldRec.status] ?? oldRec.status}</p>
                        <p className="text-slate-500">{oldRec.recommendedPlan}</p>
                        {oldRec.monthlySavings > 0 && (
                          <p className="font-medium text-slate-700">-{formatMoney(Math.round(oldRec.monthlySavings))}/mo</p>
                        )}
                      </div>
                      {/* After */}
                      <div className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white">
                        <p className="text-xs font-medium uppercase tracking-wide text-blue-200 mb-1">Now</p>
                        <p>{STATUS_LABEL[newRec.status] ?? newRec.status}</p>
                        <p className="text-blue-100">{newRec.recommendedPlan}</p>
                        {newRec.monthlySavings > 0 && (
                          <p className="font-medium">-{formatMoney(Math.round(newRec.monthlySavings))}/mo</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-slate-400">No change — {STATUS_LABEL[newRec.status]}</p>
                  )}
                </article>
              )
            })}
          </div>
        </section>

        {/* CTA to run fresh audit */}
        <section className="mt-8 rounded-2xl bg-blue-600 p-6 text-center text-white">
          <h2 className="text-lg font-bold">Want to update your stack?</h2>
          <p className="mt-1 text-sm text-blue-100">
            Run a fresh audit with your current tools and team size.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
          >
            Run new audit →
          </Link>
        </section>

      </div>
    </main>
  )
}
