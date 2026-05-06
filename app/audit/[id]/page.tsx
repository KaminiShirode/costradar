import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatMoney } from '@/lib/format'
import type { Recommendation, RecommendationStatus } from '@/lib/auditEngine'

type Props = { params: { id: string } }

// ─── Metadata (OG + Twitter card) ─────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data } = await supabase
    .from('audits')
    .select('total_monthly_savings, total_annual_savings')
    .eq('id', params.id)
    .single()

  if (!data) return { title: 'Audit not found' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any
  const savings = Math.round(row.total_monthly_savings ?? 0)
  const hasS = savings > 0

  const title = hasS
    ? `CostRadar — ${formatMoney(savings)}/mo in savings found`
    : 'CostRadar — Spend already optimized'

  const description = hasS
    ? `This team could save ${formatMoney(savings)}/month by optimizing their AI tool stack.`
    : 'This team\'s AI tool spend is well-optimized.'

  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

// ─── Status labels ────────────────────────────────────────────────────────

const STATUS_LABEL: Record<RecommendationStatus, string> = {
  optimal: '✓ Optimal',
  overspending: '↓ Overspending',
  overkill: '↓ Overkill plan',
  switch: '⇄ Wrong tool',
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default async function PublicAuditPage({ params }: Props) {
  const { data } = await supabase
    .from('audits')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500">
            This audit link is invalid or has expired.
          </p>
          <Link
            href="/"
            className="mt-3 inline-block text-sm text-blue-600 underline underline-offset-2"
          >
            Run your own CostRadar audit →
          </Link>
        </div>
      </main>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any
  const recs = row.recommendations as Recommendation[]
  const savings = Math.round(row.total_monthly_savings ?? 0)
  const hasSavings = savings > 0

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-12">

        <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-slate-400">
          Shared CostRadar audit
        </p>

        {/* Hero */}
        <section
          aria-label="Savings summary"
          className="mb-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"
        >
          {hasSavings ? (
            <>
              <p className="text-sm text-slate-400">Potential monthly savings</p>
              <p className="mt-1 text-5xl font-bold text-blue-600">
                {formatMoney(savings)}
              </p>
              <p className="mt-1 text-slate-400">
                {formatMoney(row.total_annual_savings ?? 0)}/year
              </p>
            </>
          ) : (
            <>
              <p className="text-4xl" role="img" aria-label="Check mark">✓</p>
              <p className="mt-2 text-xl font-bold text-slate-900">
                Spend already optimized
              </p>
            </>
          )}
        </section>

        {/* Per-tool breakdown */}
        <section aria-label="Tool breakdown">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Breakdown by tool
          </h2>
          <div className="space-y-3">
            {recs.map((rec, i) => (
              <article
                key={i}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{rec.toolName}</p>
                    <p className="text-xs text-slate-400">
                      {STATUS_LABEL[rec.status]}
                    </p>
                  </div>
                  {rec.monthlySavings > 0 && (
                    <p className="font-bold text-emerald-600">
                      -{formatMoney(rec.monthlySavings)}/mo
                    </p>
                  )}
                </div>
                <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  {rec.reason}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Viral CTA */}
        <section className="mt-8 rounded-2xl bg-blue-600 p-6 text-center text-white">
          <h2 className="text-lg font-bold">
            Run your own free CostRadar audit
          </h2>
          <p className="mt-1 text-sm text-blue-100">
            No signup required. Results in under 60 seconds.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
          >
            Start free audit →
          </Link>
        </section>

      </div>
    </main>
  )
}