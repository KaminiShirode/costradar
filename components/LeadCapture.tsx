'use client'

import { useId, useState } from 'react'

type Props = {
  auditId: string
  monthlySavings: number
  isHighValue: boolean
  isOptimal: boolean
  onCaptured: () => void
}

export default function LeadCapture({ auditId, monthlySavings, isHighValue, isOptimal, onCaptured }: Props) {
  const id = useId()
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const headline = isOptimal
    ? 'Get notified when your stack has new savings opportunities'
    : isHighValue
    ? 'Get the full report — Credex will also reach out'
    : 'Email me this report'

  const subtext = isHighValue
    ? 'Your savings are significant. A Credex advisor will reach out within one business day.'
    : 'We\'ll email you the report. No spam, ever.'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          companyName: company || undefined,
          role: role || undefined,
          auditId,
          monthlySavings,
          website, // honeypot
        }),
      })

      if (!res.ok && res.status !== 429) throw new Error('Failed')
      onCaptured()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 id={`${id}-heading`} className="font-semibold text-slate-900">{headline}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtext}</p>

      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3" aria-label="Email capture form">
        {/* Honeypot — visually hidden, not accessible to real users */}
        <input
          type="text"
          name="website"
          value={website}
          onChange={e => setWebsite(e.target.value)}
          tabIndex={-1}
          aria-hidden="true"
          className="hidden"
          autoComplete="off"
        />

        <div>
          <label htmlFor={`${id}-email`} className="sr-only">Email address</label>
          <input
            id={`${id}-email`}
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            className={inputClass}
            aria-required="true"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${id}-company`} className="sr-only">Company name (optional)</label>
            <input
              id={`${id}-company`}
              type="text"
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="Company (optional)"
              autoComplete="organization"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={`${id}-role`} className="sr-only">Your role (optional)</label>
            <input
              id={`${id}-role`}
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="Role (optional)"
              autoComplete="organization-title"
              className={inputClass}
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          aria-busy={loading}
        >
          {loading ? 'Sending…' : 'Send me the report →'}
        </button>
      </form>

      <p className="mt-3 text-center text-xs text-slate-400">No spam · Unsubscribe any time</p>
    </section>
  )
}

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400'
