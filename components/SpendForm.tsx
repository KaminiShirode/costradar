'use client'

import { useState, useEffect, useId } from 'react'
import { useRouter } from 'next/navigation'
import { TOOLS, TOOL_LIST, UseCase } from '@/lib/pricing'
import type { AuditInput, UserTool } from '@/lib/auditEngine'

// ─── Types ────────────────────────────────────────────────────────────────

type ToolEntry = {
  toolId: string
  planName: string
  seats: string
  monthlySpend: string
}

type FormState = {
  entries: ToolEntry[]
  teamSize: string
  useCase: UseCase
}

// ─── Constants ────────────────────────────────────────────────────────────

const STORAGE_KEY = 'ai-audit-v1'

const USE_CASES: { value: UseCase; label: string }[] = [
  { value: 'coding', label: 'Coding / Engineering' },
  { value: 'writing', label: 'Writing / Content' },
  { value: 'data', label: 'Data / Analysis' },
  { value: 'research', label: 'Research' },
  { value: 'mixed', label: 'Mixed / General' },
]

const DEFAULT_STATE: FormState = {
  entries: [{ toolId: '', planName: '', seats: '1', monthlySpend: '' }],
  teamSize: '5',
  useCase: 'mixed',
}

// ─── Component ────────────────────────────────────────────────────────────

export default function SpendForm() {
  const router = useRouter()
  const formId = useId()
  const [state, setState] = useState<FormState>(DEFAULT_STATE)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Restore from localStorage on first render
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setState(JSON.parse(saved))
    } catch {
      // Ignore parse errors — bad storage data shouldn't break the app
    }
  }, [])

  // Persist every change to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  function updateEntry(index: number, field: keyof ToolEntry, value: string) {
    setState(prev => {
      const entries = [...prev.entries]
      entries[index] = { ...entries[index], [field]: value }
      // Reset plan when tool changes — avoids plan/tool mismatch
      if (field === 'toolId') entries[index].planName = ''
      return { ...prev, entries }
    })
  }

  function addTool() {
    setState(prev => ({
      ...prev,
      entries: [...prev.entries, { toolId: '', planName: '', seats: '1', monthlySpend: '' }],
    }))
  }

  function removeTool(index: number) {
    setState(prev => ({
      ...prev,
      entries: prev.entries.filter((_, i) => i !== index),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const validEntries = state.entries.filter(
      e => e.toolId && e.planName && e.monthlySpend
    )

    if (validEntries.length === 0) {
      setError('Add at least one tool with a plan and monthly spend.')
      return
    }

    const tools: UserTool[] = validEntries.map(e => ({
      toolId: e.toolId as UserTool['toolId'],
      planName: e.planName,
      monthlySpend: parseFloat(e.monthlySpend) || 0,
      seats: parseInt(e.seats) || 1,
    }))

    const input: AuditInput = {
      tools,
      teamSize: parseInt(state.teamSize) || 1,
      useCase: state.useCase,
    }

    setLoading(true)
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!res.ok) throw new Error(`Server error: ${res.status}`)

      const data = await res.json()
      router.push(`/results?id=${data.id}`)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="CostRadar form">

      {/* Team context */}
      <section aria-labelledby={`${formId}-team-heading`} className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 id={`${formId}-team-heading`} className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Your Team
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Total team size" htmlFor={`${formId}-team-size`}>
            <input
              id={`${formId}-team-size`}
              type="number"
              min="1"
              max="10000"
              value={state.teamSize}
              onChange={e => setState(prev => ({ ...prev, teamSize: e.target.value }))}
              className={inputClass}
              placeholder="e.g. 12"
            />
          </FormField>

          <FormField label="Primary use case" htmlFor={`${formId}-use-case`}>
            <select
              id={`${formId}-use-case`}
              value={state.useCase}
              onChange={e => setState(prev => ({ ...prev, useCase: e.target.value as UseCase }))}
              className={inputClass}
            >
              {USE_CASES.map(u => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </FormField>
        </div>
      </section>

      {/* Tool entries */}
      <section aria-label="AI tools your team pays for" className="mb-4 space-y-3">
        {state.entries.map((entry, index) => {
          const tool = entry.toolId ? TOOLS[entry.toolId as keyof typeof TOOLS] : null
          const entryId = `${formId}-entry-${index}`

          return (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              role="group"
              aria-label={`Tool ${index + 1}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Tool {index + 1}</span>
                {state.entries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTool(index)}
                    aria-label={`Remove tool ${index + 1}`}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <FormField label="Tool" htmlFor={`${entryId}-tool`} className="col-span-2 sm:col-span-1">
                  <select
                    id={`${entryId}-tool`}
                    value={entry.toolId}
                    onChange={e => updateEntry(index, 'toolId', e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select tool…</option>
                    {TOOL_LIST.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Plan" htmlFor={`${entryId}-plan`} className="col-span-2 sm:col-span-1">
                  <select
                    id={`${entryId}-plan`}
                    value={entry.planName}
                    onChange={e => updateEntry(index, 'planName', e.target.value)}
                    disabled={!tool}
                    className={inputClass + ' disabled:cursor-not-allowed disabled:opacity-50'}
                    aria-disabled={!tool}
                  >
                    <option value="">Select plan…</option>
                    {tool?.plans.map(p => (
                      <option key={p.name} value={p.name}>
                        {p.name} — ${p.pricePerSeat}/seat/mo
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Seats" htmlFor={`${entryId}-seats`}>
                  <input
                    id={`${entryId}-seats`}
                    type="number"
                    min="1"
                    max="10000"
                    value={entry.seats}
                    onChange={e => updateEntry(index, 'seats', e.target.value)}
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Monthly spend ($)" htmlFor={`${entryId}-spend`}>
                  <input
                    id={`${entryId}-spend`}
                    type="number"
                    min="0"
                    step="1"
                    value={entry.monthlySpend}
                    onChange={e => updateEntry(index, 'monthlySpend', e.target.value)}
                    placeholder="200"
                    className={inputClass}
                  />
                </FormField>
              </div>
            </div>
          )
        })}
      </section>

      {/* Add tool */}
      <button
        type="button"
        onClick={addTool}
        className="mb-6 w-full rounded-2xl border-2 border-dashed border-slate-200 py-3.5 text-sm text-slate-400 transition-colors hover:border-blue-300 hover:text-blue-500"
      >
        + Add another tool
      </button>

      {/* Honeypot — bots fill this; humans never see it */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        aria-hidden="true"
        className="hidden"
        autoComplete="off"
      />

      {error && (
        <p role="alert" className="mb-4 text-sm text-red-500">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-blue-600 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        aria-busy={loading}
      >
        {loading ? 'Analyzing…' : 'Run Free Audit →'}
      </button>
    </form>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400'

function FormField({
  label,
  htmlFor,
  children,
  className = '',
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </label>
      {children}
    </div>
  )
}
