import type { Recommendation } from './auditEngine'

export type ToolChange = {
  toolName: string
  oldRecommendedPlan: string
  newRecommendedPlan: string
  oldMonthlySavings: number
  newMonthlySavings: number
}

// Returns true if the new audit result is different enough to notify the user
export function hasChanged(oldRecs: Recommendation[], newRecs: Recommendation[]): boolean {
  for (const newRec of newRecs) {
    const oldRec = oldRecs.find(r => r.toolId === newRec.toolId)
    if (!oldRec) return true
    if (oldRec.status !== newRec.status) return true
    if (oldRec.recommendedPlan !== newRec.recommendedPlan) return true
    if (Math.abs(oldRec.monthlySavings - newRec.monthlySavings) > 1) return true
  }
  return false
}

// Returns the list of tools where the recommendation actually changed
export function getChanges(oldRecs: Recommendation[], newRecs: Recommendation[]): ToolChange[] {
  const changes: ToolChange[] = []

  for (const newRec of newRecs) {
    const oldRec = oldRecs.find(r => r.toolId === newRec.toolId)
    if (!oldRec) continue

    const planChanged = oldRec.recommendedPlan !== newRec.recommendedPlan
    const savingsChanged = Math.abs(oldRec.monthlySavings - newRec.monthlySavings) > 1

    if (planChanged || savingsChanged) {
      changes.push({
        toolName: newRec.toolName,
        oldRecommendedPlan: oldRec.recommendedPlan,
        newRecommendedPlan: newRec.recommendedPlan,
        oldMonthlySavings: oldRec.monthlySavings,
        newMonthlySavings: newRec.monthlySavings,
      })
    }
  }

  return changes
}
