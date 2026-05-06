'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { formatMoney } from '@/lib/format'
import type { AuditResult, Recommendation, RecommendationStatus } from '@/lib/auditEngine'
import type { AuditRow } from '@/lib/supabase'
import LeadCapture from '@/components/LeadCapture'

// ─── Status badge ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<RecommendationStatus, { label: string; className: string }> = {
  optimal:     { label: 'Optimal',      className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  overspending:{ label: 'Overspending', className: 'bg-red-50    text-red-700    ring-red-200'    },
  overkill:    { label: 'Overkill plan',className: 'bg-amber-50  text-amber-700  ring-amber-200'  },
  switch:      { label: 'Wrong tool',   className: 'bg-violet-50 text-violet-700 ring-violet-200' },
}

function StatusBadge({ status }: { status: RecommendationStatus }) {
  const { label, className } = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}>
      {label}
    </span>
  )
}

// ─── Tool card ────────────────────────────────────────────────────────────

function ToolCard({ rec }: { rec: Recommendation }) {
  const hasSavings = rec.monthlySavings > 0

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-900">{rec.toolName}</h3>
            <StatusBadge status={rec.status} />
          </div>
          <p className="mt-0.5 text-sm text-slate-400">{rec.currentPlan} plan</p>
        </div>

        {hasSavings && (
          <div className="text-right">
            <p className="text-lg font-bold text-emerald-600">
              -{formatMoney(rec.monthlySavings)}/mo
            </p>
            <p className="text-xs text-slate-400">
              -{formatMoney(rec.annualSavings)}/yr
            </p>
          </div>
        )}
      </div>

      {/* Spend flow: current → action → projected */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium text-slate-700">{formatMoney(rec.currentMonthlySpend)}/mo</span>
        <span className="text-slate-300" aria-hidden="true">→</span>
        <span className="font-medium text-blue-600">{rec.recommendedAction}</span>
        {hasSavings && (
          <>
            <span className="text-slate-300" aria-hidden="true">→</span>
            <span className="font-medium text-emerald-600">
              {formatMoney(rec.projectedMonthlySpend)}/mo
            </span>
          </>
        )}
      </div>

      {/* One-sentence reason — must be defensible */}
      <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm leading-relaxed text-slate-600">
        {rec.reason}
      </p>
    </article>
  )
}

// ─── Main results view ────────────────────────────────────────────────────

function ResultsView({ auditId }: { auditId: string }) {
  const [audit, setAudit] = useState<AuditRow | null>(null)
  const [result, setResult] = useState<AuditResult | null>(null)
  const [summary, setSummary] = useState('')
  const [leadDone, setLeadDone] = useState(false)
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState<'loading' | 'error' | 'ok'>('loading')

  useEffect(() => {
    fetch(`/api/audit?id=${auditId}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then((row: AuditRow) => {
        setAudit(row)

        // Reconstruct AuditResult from the stored row
        const r: AuditResult = {
          recommendations: row.recommendations as Recommendation[],
          totalMonthlySpend: row.total_monthly_spend,
          totalProjectedSpend: row.total_monthly_spend - row.total_monthly_savings,
          totalMonthlySavings: row.total_monthly_savings,
          totalAnnualSavings: row.total_annual_savings,
          showCredex: row.show_credex,
          isAlreadyOptimal: row.is_already_optimal,
        }
        setResult(r)
        setStatus('ok')

        // Fetch AI summary in parallel — non-blocking
        fetch('/api/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ result: r, teamSize: row.team_size, useCase: row.use_case }),
        })
          .then(r => r.json())
          .then(d => setSummary(d.summary))
          .catch(() => {}) // silently fail — summary is a nice-to-have
      })
      .catch(() => setStatus('error'))
  }, [auditId])

  function copyShareLink() {
    navigator.clipboard.writeText(`${window.location.origin}/audit/${auditId}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3" role="status" aria-live="polite">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        <p className="text-sm text-slate-400">Analyzing your AI spend…</p>
      </div>
    )
  }

  if (status === 'error' || !result) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center" role="alert">
        <p className="text-slate-500">Audit not found.</p>
        <Link href="/" className="text-sm text-blue-600 underline underline-offset-2">
          Run a new audit
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">

      {/* ── Hero savings ─────────────────────────────────────────────── */}
      <section
        aria-label="Savings summary"
        className="mb-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"
      >
        {result.totalMonthlySavings > 0 ? (
          <>
            <p className="mb-1 text-sm font-medium text-slate-400">Potential monthly savings</p>
            <p className="text-6xl font-bold tabular-nums text-blue-600" aria-label={`${formatMoney(result.totalMonthlySavings)} per month`}>
              {formatMoney(result.totalMonthlySavings)}
            </p>
            <p className="mt-1 text-lg text-slate-400">
              {formatMoney(result.totalAnnualSavings)}<span className="text-sm">/year</span>
            </p>
            <p className="mt-3 text-sm text-slate-400">
              Current: {formatMoney(result.totalMonthlySpend)}/mo →
              Optimized: {formatMoney(result.totalProjectedSpend)}/mo
            </p>
          </>
        ) : (
          <>
            <p className="text-5xl" role="img" aria-label="Check mark">✓</p>
            <h2 className="mt-3 text-2xl font-bold text-slate-900">You&apos;re spending well</h2>
            <p className="mt-2 text-slate-500">
              No meaningful savings opportunities found for your current stack and team size.
            </p>
          </>
        )}
      </section>

      {/* ── AI summary ───────────────────────────────────────────────── */}
      {summary && (
        <section aria-label="AI analysis" className="mb-6 rounded-2xl bg-blue-50 p-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-400">
            AI Analysis
          </p>
          <p className="leading-relaxed text-slate-700">{summary}</p>
        </section>
      )}

      {/* ── Per-tool breakdown ────────────────────────────────────────── */}
      <section aria-label="Per-tool breakdown">
        <h2 className="mb-3 text-base font-semibold text-slate-900">Breakdown by tool</h2>
        <div className="space-y-3">
          {result.recommendations.map((rec, i) => (
            <ToolCard key={i} rec={rec} />
          ))}
        </div>
      </section>

      {/* ── Credex CTA — only for >$500/mo savings ───────────────────── */}
      {result.showCredex && (
        <section
          aria-label="Credex offer"
          className="mt-6 rounded-2xl bg-blue-600 p-6 text-white"
        >
          <h2 className="text-lg font-bold">Save even more with Credex</h2>
          <p className="mt-1 text-sm leading-relaxed text-blue-100">
            Credex sources discounted AI credits from companies that overforecast —
            Cursor, Claude, ChatGPT Enterprise and more. Your audit shows over $500/mo
            in opportunity. A conversation with us typically unlocks an additional 15–30% off retail.
          </p>
          <a
            href="https://credex.rocks"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
          >
            Book a free consultation →
          </a>
        </section>
      )}

      {/* ── Share link ────────────────────────────────────────────────── */}
      <section aria-label="Share your audit" className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Share this audit</h2>
        <div className="flex gap-2">
          <input
            readOnly
            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/audit/${auditId}`}
            aria-label="Shareable audit link"
            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
          />
          <button
            onClick={copyShareLink}
            className="shrink-0 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
            aria-label="Copy share link"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Personal details are not included in the public link — only tools and savings numbers.
        </p>
      </section>

      {/* ── Lead capture — ALWAYS after results, never before ────────── */}
      {!leadDone && (
        <div className="mt-6">
          <LeadCapture
            auditId={auditId}
            monthlySavings={result.totalMonthlySavings}
            isHighValue={result.showCredex}
            isOptimal={result.isAlreadyOptimal}
            onCaptured={() => setLeadDone(true)}
          />
        </div>
      )}

      {leadDone && (
        <p className="mt-6 rounded-2xl bg-emerald-50 py-4 text-center text-sm font-medium text-emerald-700">
          ✓ Report sent to your inbox
        </p>
      )}

      <div className="mt-8 text-center text-xs text-slate-400">
        <Link href="/" className="underline underline-offset-2 hover:text-slate-600">
          Run another audit
        </Link>
        {' · '}
        <a href="https://credex.rocks" className="underline underline-offset-2 hover:text-slate-600">
          About Credex
        </a>
      </div>
    </div>
  )
}

// ─── Page wrapper (Suspense required for useSearchParams) ─────────────────

function ResultsPageInner() {
  const params = useSearchParams()
  const id = params.get('id')

  if (!id) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">
          No audit ID found.{' '}
          <Link href="/" className="text-blue-600 underline">
            Start a new audit
          </Link>
        </p>
      </div>
    )
  }

  return <ResultsView auditId={id} />
}

export default function ResultsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center" role="status">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        </div>
      }>
        <ResultsPageInner />
      </Suspense>
    </main>
  )
}
