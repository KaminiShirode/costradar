import type { Metadata } from 'next'
import SpendForm from '@/components/SpendForm'

export const metadata: Metadata = {
  title: 'CostRadar — Are you overpaying for AI tools?',
  description:
    'Free audit for startup teams. Enter your tools and plans — see exactly where you\'re wasting money in under 60 seconds.',
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">

        {/* Header */}
        <header className="mb-12 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" aria-hidden="true" />
            Free · No login · Results in seconds
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Are you overpaying<br />for AI tools?
          </h1>

          <p className="mt-4 text-lg text-slate-500 sm:text-xl">
            Enter what your team pays. Get an instant audit showing exactly where
            you&apos;re overspending and how much you could save.
          </p>
        </header>

        {/* Trust signals */}
        <ul
          aria-label="Key features"
          className="mb-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-400"
        >
          <li>✓ Covers 8 major AI tools</li>
          <li>✓ Pricing verified weekly</li>
          <li>✓ See results before giving email</li>
        </ul>

        {/* Form — value is shown before any email ask */}
        <SpendForm />

        <footer className="mt-10 text-center text-xs text-slate-400">
          Built by{' '}
          <a
            href="https://credex.rocks"
            className="underline underline-offset-2 hover:text-slate-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            Credex
          </a>{' '}
          · We source discounted AI credits for startups
        </footer>
      </div>
    </main>
  )
}
