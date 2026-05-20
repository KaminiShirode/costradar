import { describe, it, expect } from 'vitest'
import { hasChanged, getChanges } from '../lib/auditDiff'
import type { Recommendation } from '../lib/auditEngine'

function makeRec(overrides: Partial<Recommendation>): Recommendation {
  return {
    toolId: 'cursor',
    toolName: 'Cursor',
    currentPlan: 'Pro',
    currentMonthlySpend: 20,
    status: 'optimal',
    recommendedAction: 'Keep current plan',
    recommendedPlan: 'Pro',
    projectedMonthlySpend: 20,
    monthlySavings: 0,
    annualSavings: 0,
    reason: 'No savings found.',
    ...overrides,
  }
}

// ─── hasChanged ───────────────────────────────────────────────────────────

describe('hasChanged', () => {
  it('returns false when recommendations are the same', () => {
    const rec = makeRec({})
    expect(hasChanged([rec], [rec])).toBe(false)
  })

  it('returns true when status changes', () => {
    const old = makeRec({ status: 'optimal' })
    const next = makeRec({ status: 'overspending' })
    expect(hasChanged([old], [next])).toBe(true)
  })

  it('returns true when recommended plan changes', () => {
    const old = makeRec({ recommendedPlan: 'Pro' })
    const next = makeRec({ recommendedPlan: 'Hobby' })
    expect(hasChanged([old], [next])).toBe(true)
  })

  it('returns true when savings change by more than $1', () => {
    const old = makeRec({ monthlySavings: 10 })
    const next = makeRec({ monthlySavings: 20 })
    expect(hasChanged([old], [next])).toBe(true)
  })

  it('returns false when savings change by $1 or less', () => {
    const old = makeRec({ monthlySavings: 10 })
    const next = makeRec({ monthlySavings: 10.5 })
    expect(hasChanged([old], [next])).toBe(false)
  })

  it('returns true when a new tool appears in the new result', () => {
    const old = makeRec({ toolId: 'cursor' })
    const next = makeRec({ toolId: 'github_copilot' })
    expect(hasChanged([old], [next])).toBe(true)
  })
})

// ─── getChanges ───────────────────────────────────────────────────────────

describe('getChanges', () => {
  it('returns empty array when nothing changed', () => {
    const rec = makeRec({})
    expect(getChanges([rec], [rec])).toHaveLength(0)
  })

  it('returns the changed tool when plan changes', () => {
    const old = makeRec({ recommendedPlan: 'Pro', monthlySavings: 0 })
    const next = makeRec({ recommendedPlan: 'Hobby', monthlySavings: 20 })
    const changes = getChanges([old], [next])
    expect(changes).toHaveLength(1)
    expect(changes[0].oldRecommendedPlan).toBe('Pro')
    expect(changes[0].newRecommendedPlan).toBe('Hobby')
  })

  it('returns the changed tool when savings change', () => {
    const old = makeRec({ monthlySavings: 10 })
    const next = makeRec({ monthlySavings: 25 })
    const changes = getChanges([old], [next])
    expect(changes).toHaveLength(1)
    expect(changes[0].oldMonthlySavings).toBe(10)
    expect(changes[0].newMonthlySavings).toBe(25)
  })

  it('only returns tools that actually changed', () => {
    const unchanged = makeRec({ toolId: 'cursor', toolName: 'Cursor' })
    const oldChanged = makeRec({ toolId: 'github_copilot', toolName: 'GitHub Copilot', recommendedPlan: 'Individual', monthlySavings: 0 })
    const newChanged = makeRec({ toolId: 'github_copilot', toolName: 'GitHub Copilot', recommendedPlan: 'Business', monthlySavings: 50 })
    const changes = getChanges([unchanged, oldChanged], [unchanged, newChanged])
    expect(changes).toHaveLength(1)
    expect(changes[0].toolName).toBe('GitHub Copilot')
  })
})
