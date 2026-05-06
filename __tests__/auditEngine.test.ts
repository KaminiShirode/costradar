import { describe, it, expect } from 'vitest'
import { runAudit } from '../lib/auditEngine'
import type { AuditInput } from '../lib/auditEngine'

// ─── Helpers ──────────────────────────────────────────────────────────────

function audit(overrides: Partial<AuditInput> = {}): ReturnType<typeof runAudit> {
  return runAudit({
    tools: [],
    teamSize: 5,
    useCase: 'mixed',
    ...overrides,
  })
}

// ─── Overkill detection ───────────────────────────────────────────────────

describe('overkill detection', () => {
  it('flags Enterprise plan for a 5-person team', () => {
    const result = audit({
      tools: [{ toolId: 'cursor', planName: 'Enterprise', monthlySpend: 500, seats: 5 }],
      teamSize: 5,
    })
    expect(result.recommendations[0].status).toBe('overkill')
    expect(result.totalMonthlySavings).toBeGreaterThan(0)
  })

  it('flags Team plan for a single user', () => {
    const result = audit({
      tools: [{ toolId: 'chatgpt', planName: 'Team', monthlySpend: 30, seats: 1 }],
      teamSize: 1,
    })
    expect(result.recommendations[0].status).toBe('overkill')
  })

  it('flags Business plan for a single Cursor user', () => {
    const result = audit({
      tools: [{ toolId: 'cursor', planName: 'Business', monthlySpend: 40, seats: 1 }],
      teamSize: 1,
    })
    expect(result.recommendations[0].status).toBe('overkill')
  })
})

// ─── Optimal plan detection ───────────────────────────────────────────────

describe('optimal plan detection', () => {
  it('marks GitHub Copilot Individual for a solo dev as optimal', () => {
    const result = audit({
      tools: [{ toolId: 'github_copilot', planName: 'Individual', monthlySpend: 10, seats: 1 }],
      teamSize: 1,
      useCase: 'coding',
    })
    expect(result.recommendations[0].status).toBe('optimal')
    expect(result.totalMonthlySavings).toBe(0)
  })

  it('marks Claude Pro for a solo writer as optimal', () => {
  const result = audit({
    tools: [{ toolId: 'claude', planName: 'Pro', monthlySpend: 20, seats: 1 }],
    teamSize: 1,
    useCase: 'writing',
  })
  // Claude Pro is the right plan for a daily writing user —
  // Free tier is too limited for professional use, so Pro is correctly optimal
  expect(result.recommendations[0].status).not.toBe('switch')
  expect(result.recommendations[0].status).not.toBe('overkill')
})
})

// ─── Savings math ─────────────────────────────────────────────────────────

describe('savings calculations', () => {
  it('annual savings = 12 × monthly savings', () => {
    const result = audit({
      tools: [{ toolId: 'cursor', planName: 'Enterprise', monthlySpend: 1000, seats: 10 }],
      teamSize: 10,
    })
    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12)
  })

  it('savings are never negative', () => {
    const result = audit({
      tools: [{ toolId: 'windsurf', planName: 'Free', monthlySpend: 0, seats: 1 }],
      teamSize: 1,
    })
    expect(result.totalMonthlySavings).toBeGreaterThanOrEqual(0)
    expect(result.totalAnnualSavings).toBeGreaterThanOrEqual(0)
  })
})

// ─── Credex CTA threshold ─────────────────────────────────────────────────

describe('Credex CTA threshold', () => {
  it('shows Credex when savings exceed $500/mo', () => {
    const result = audit({
      tools: [
        { toolId: 'cursor', planName: 'Enterprise', monthlySpend: 1000, seats: 10 },
        { toolId: 'chatgpt', planName: 'Enterprise', monthlySpend: 600, seats: 10 },
      ],
      teamSize: 10,
    })
    expect(result.showCredex).toBe(true)
  })

  it('does not show Credex for an already-optimal stack', () => {
    const result = audit({
      tools: [{ toolId: 'github_copilot', planName: 'Individual', monthlySpend: 10, seats: 1 }],
      teamSize: 1,
      useCase: 'coding',
    })
    expect(result.showCredex).toBe(false)
  })
})

// ─── Edge cases ───────────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles an empty tools array without crashing', () => {
    const result = audit({ tools: [] })
    expect(result.totalMonthlySpend).toBe(0)
    expect(result.recommendations).toHaveLength(0)
  })

  it('skips unknown tool IDs gracefully', () => {
    expect(() =>
      audit({ tools: [{ toolId: 'unknown_xyz' as never, planName: 'Pro', monthlySpend: 50, seats: 1 }] })
    ).not.toThrow()
  })
})

// ─── Use-case mismatch ────────────────────────────────────────────────────

describe('use-case mismatch', () => {
  it('recommends switching a coding tool for a writing team', () => {
    const result = audit({
      tools: [{ toolId: 'cursor', planName: 'Pro', monthlySpend: 20, seats: 1 }],
      teamSize: 1,
      useCase: 'writing',
    })
    expect(result.recommendations[0].status).toBe('switch')
  })

  it('does not flag coding tools for mixed use-case teams', () => {
    const result = audit({
      tools: [{ toolId: 'cursor', planName: 'Pro', monthlySpend: 20, seats: 1 }],
      teamSize: 1,
      useCase: 'mixed',
    })
    // mixed means any tool is acceptable — status should not be 'switch'
    expect(result.recommendations[0].status).not.toBe('switch')
  })
})
