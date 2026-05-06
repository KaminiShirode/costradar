/**
 * Audit engine — pure functions only, zero side effects, fully testable.
 *
 * Design principle: every recommendation must be defensible to a finance person.
 * "Switch because it's cheaper" is not enough — we state who the plan is for,
 * what changes, and why the savings are real, not speculative.
 */

import { TOOLS, Tool, Plan, ToolId, UseCase } from './pricing'

// ─── Input / Output types ──────────────────────────────────────────────────

export type UserTool = {
  toolId: ToolId
  planName: string
  monthlySpend: number  // what they actually pay today
  seats: number
}

export type AuditInput = {
  tools: UserTool[]
  teamSize: number
  useCase: UseCase
}

export type RecommendationStatus =
  | 'optimal'       // keep as-is, no savings found
  | 'overspending'  // cheaper plan from same vendor covers their needs
  | 'overkill'      // plan tier is designed for much larger teams
  | 'switch'        // different tool fits their use case better

export type Recommendation = {
  toolId: ToolId
  toolName: string
  currentPlan: string
  currentMonthlySpend: number
  status: RecommendationStatus
  recommendedAction: string
  recommendedPlan: string
  projectedMonthlySpend: number
  monthlySavings: number
  annualSavings: number
  /** One sentence — must read as defensible financial advice */
  reason: string
}

export type AuditResult = {
  recommendations: Recommendation[]
  totalMonthlySpend: number
  totalProjectedSpend: number
  totalMonthlySavings: number
  totalAnnualSavings: number
  /** True when savings > $500/mo — show Credex CTA */
  showCredex: boolean
  /** True when savings < $100/mo — show "you're spending well" message */
  isAlreadyOptimal: boolean
}

// ─── Main entry point ──────────────────────────────────────────────────────

export function runAudit(input: AuditInput): AuditResult {
  const recommendations: Recommendation[] = []
  let totalMonthlySpend = 0
  let totalProjectedSpend = 0

  for (const entry of input.tools) {
    const tool = TOOLS[entry.toolId]

    // Skip unknown tools or zero-cost / zero-seat entries
    if (!tool || (entry.monthlySpend === 0 && entry.seats === 0)) continue

    totalMonthlySpend += entry.monthlySpend
    const rec = evaluateTool(entry, tool, input)
    recommendations.push(rec)
    totalProjectedSpend += rec.projectedMonthlySpend
  }

  const totalMonthlySavings = Math.max(0, totalMonthlySpend - totalProjectedSpend)
  const totalAnnualSavings = totalMonthlySavings * 12

  return {
    recommendations,
    totalMonthlySpend,
    totalProjectedSpend,
    totalMonthlySavings,
    totalAnnualSavings,
    showCredex: totalMonthlySavings > 500,
    isAlreadyOptimal: totalMonthlySavings < 100,
  }
}

// ─── Evaluation logic ──────────────────────────────────────────────────────

function evaluateTool(entry: UserTool, tool: Tool, input: AuditInput): Recommendation {
  // 1. Use-case mismatch — wrong tool category for what they do
  if (!fitsUseCase(tool.category, input.useCase) && tool.alternatives.length > 0) {
    return buildSwitchRec(entry, tool, input)
  }

  // 2. Overkill — plan designed for much larger teams
  if (isOverkill(entry, input.teamSize)) {
    return buildOverkillRec(entry, tool)
  }

  // 3. Cheaper plan from same vendor covers their needs
  const cheaperPlan = findCheaperPlan(entry, tool)
  if (cheaperPlan) {
    const projected = cheaperPlan.pricePerSeat * entry.seats
    const savings = entry.monthlySpend - projected
    if (savings > 5) return buildDowngradeRec(entry, tool, cheaperPlan, projected, savings)
  }

  // 4. No savings found — already optimal
  return buildOptimalRec(entry, tool, input)
}

// ─── Recommendation builders ───────────────────────────────────────────────

function buildSwitchRec(entry: UserTool, tool: Tool, input: AuditInput): Recommendation {
  const altId = tool.alternatives[0]
  const alt = TOOLS[altId]
  const altPlan = bestPlanForSeats(alt, entry.seats)
  const projected = (altPlan?.pricePerSeat ?? 0) * entry.seats
  const savings = Math.max(0, entry.monthlySpend - projected)

  return {
    toolId: entry.toolId,
    toolName: tool.name,
    currentPlan: entry.planName,
    currentMonthlySpend: entry.monthlySpend,
    status: 'switch',
    recommendedAction: `Switch to ${alt.name} ${altPlan?.name ?? ''}`.trim(),
    recommendedPlan: altPlan?.name ?? 'Pro',
    projectedMonthlySpend: projected,
    monthlySavings: savings,
    annualSavings: savings * 12,
    reason: `${tool.name} is built for ${tool.category} workflows; your team primarily does ${input.useCase}. ${alt.name} is purpose-built for this at $${projected}/mo vs your current $${entry.monthlySpend}/mo.`,
  }
}

function buildOverkillRec(entry: UserTool, tool: Tool): Recommendation {
  const rightPlan = bestPlanForSeats(tool, entry.seats)
  const projected = (rightPlan?.pricePerSeat ?? 0) * entry.seats
  const savings = Math.max(0, entry.monthlySpend - projected)

  return {
    toolId: entry.toolId,
    toolName: tool.name,
    currentPlan: entry.planName,
    currentMonthlySpend: entry.monthlySpend,
    status: 'overkill',
    recommendedAction: `Downgrade to ${rightPlan?.name ?? 'a lower tier'}`,
    recommendedPlan: rightPlan?.name ?? entry.planName,
    projectedMonthlySpend: projected,
    monthlySavings: savings,
    annualSavings: savings * 12,
    reason: `${entry.planName} is designed for ${rightPlan?.minSeats ? `${rightPlan.minSeats}+` : 'large'} teams; ${entry.seats} seat(s) at ${entry.planName} pricing is over-provisioned by $${savings}/mo with no capability gain.`,
  }
}

function buildDowngradeRec(
  entry: UserTool,
  tool: Tool,
  targetPlan: Plan,
  projected: number,
  savings: number
): Recommendation {
  return {
    toolId: entry.toolId,
    toolName: tool.name,
    currentPlan: entry.planName,
    currentMonthlySpend: entry.monthlySpend,
    status: 'overspending',
    recommendedAction: `Downgrade to ${targetPlan.name}`,
    recommendedPlan: targetPlan.name,
    projectedMonthlySpend: projected,
    monthlySavings: savings,
    annualSavings: savings * 12,
    reason: `${targetPlan.name} ($${targetPlan.pricePerSeat}/seat) covers your team's needs — ${targetPlan.bestFor}. Saves $${savings}/mo ($${savings * 12}/yr) with no capability loss for your use case.`,
  }
}

function buildOptimalRec(entry: UserTool, tool: Tool, input: AuditInput): Recommendation {
  return {
    toolId: entry.toolId,
    toolName: tool.name,
    currentPlan: entry.planName,
    currentMonthlySpend: entry.monthlySpend,
    status: 'optimal',
    recommendedAction: 'Keep current plan',
    recommendedPlan: entry.planName,
    projectedMonthlySpend: entry.monthlySpend,
    monthlySavings: 0,
    annualSavings: 0,
    reason: `${tool.name} ${entry.planName} is appropriately matched for ${entry.seats} seat(s) and your ${input.useCase} workflow. No savings opportunity found at current pricing.`,
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Does this tool category match what the team actually does? */
function fitsUseCase(category: Tool['category'], useCase: UseCase): boolean {
  if (useCase === 'mixed') return true
  if (category === 'api') return true
  if (useCase === 'coding') return category === 'coding'
  // writing / data / research → general tools
  return category === 'general'
}

/** Is this plan tier clearly over-provisioned for the team? */
function isOverkill(entry: UserTool, teamSize: number): boolean {
  const plan = entry.planName.toLowerCase()
  if (plan.includes('enterprise') && teamSize <= 10) return true
  if (plan === 'business' && entry.seats === 1) return true
  if (plan === 'team' && entry.seats <= 2) return true
  return false
}

/** Find the cheapest plan from the same vendor that fits their seat count */
function findCheaperPlan(entry: UserTool, tool: Tool): Plan | null {
  const current = tool.plans.find(
    p => p.name.toLowerCase() === entry.planName.toLowerCase()
  )
  if (!current) return null

  return (
    tool.plans
      .filter(p => p.pricePerSeat < current.pricePerSeat)
      .filter(p => !p.minSeats || p.minSeats <= entry.seats)
      .filter(p => !p.maxSeats || p.maxSeats >= entry.seats)
      .sort((a, b) => b.pricePerSeat - a.pricePerSeat)[0] ?? null
  )
}

/** Pick the most appropriate plan for a given seat count */
function bestPlanForSeats(tool: Tool, seats: number): Plan | null {
  return (
    tool.plans
      .filter(p => !p.minSeats || p.minSeats <= seats)
      .filter(p => !p.maxSeats || p.maxSeats >= seats)
      .sort((a, b) => a.pricePerSeat - b.pricePerSeat)[0] ?? null
  )
}
