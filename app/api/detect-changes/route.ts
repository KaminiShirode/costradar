import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabase } from '@/lib/supabase'
import { runAudit } from '@/lib/auditEngine'
import type { AuditInput, Recommendation } from '@/lib/auditEngine'
import type { UserTool } from '@/lib/auditEngine'
import { hasChanged, getChanges } from '@/lib/auditDiff'
import type { ToolChange } from '@/lib/auditDiff'

const resend = new Resend(process.env.RESEND_API_KEY)

function buildNotificationEmail(
  changes: ToolChange[],
  auditId: string,
  newTotalSavings: number
): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const reauditUrl = `${baseUrl}/audit/${auditId}/reaudit`

  const changeRows = changes.map(c => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-weight:500;">${c.toolName}</td>
      <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;">${c.oldRecommendedPlan} · $${Math.round(c.oldMonthlySavings)}/mo saved</td>
      <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#2563eb;">${c.newRecommendedPlan} · $${Math.round(c.newMonthlySavings)}/mo saved</td>
    </tr>
  `).join('')

  return `
    <div style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#0f172a;">
      <h2 style="font-size:22px;font-weight:700;margin:0 0 8px;">Your audit is out of date</h2>
      <p style="color:#64748b;margin:0 0 24px;">
        Pricing changed for some tools in your stack. Your previous audit no longer reflects current prices.
        We re-ran it — here's what's different:
      </p>

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px 0;font-size:12px;color:#94a3b8;text-transform:uppercase;">Tool</th>
            <th style="text-align:left;padding:8px 0;font-size:12px;color:#94a3b8;text-transform:uppercase;">Before</th>
            <th style="text-align:left;padding:8px 0;font-size:12px;color:#94a3b8;text-transform:uppercase;">Now</th>
          </tr>
        </thead>
        <tbody>${changeRows}</tbody>
      </table>

      <p style="margin:0 0 24px;">
        New total savings estimate: <strong>$${Math.round(newTotalSavings)}/mo</strong>
      </p>

      <a href="${reauditUrl}"
         style="display:inline-block;background:#2563eb;color:#fff;font-weight:600;padding:12px 24px;border-radius:10px;text-decoration:none;margin-bottom:32px;">
        See full diff →
      </a>

      <p style="font-size:13px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:20px;margin:0;">
        Sent by <a href="https://credex.rocks" style="color:#94a3b8;">Credex</a> —
        we track AI tool pricing so your audit stays accurate.
      </p>
    </div>
  `
}

export async function POST() {
  const db = supabase as any

  // Get all audits that have an email and haven't been notified yet
  const { data: audits, error } = await db
    .from('audits')
    .select('*')
    .not('email', 'is', null)
    .is('notified_at', null)

  if (error) {
    console.error('Failed to fetch audits:', error)
    return NextResponse.json({ error: 'Failed to fetch audits' }, { status: 500 })
  }

  if (!audits || audits.length === 0) {
    return NextResponse.json({ message: 'No audits to check', notified: 0 })
  }

  // Group stale audits by email — one email per user, not per audit
  const staleByEmail = new Map<string, { auditId: string; changes: ToolChange[]; newTotalSavings: number }[]>()

  for (const audit of audits) {
    const input: AuditInput = {
      tools: audit.tools as UserTool[],
      teamSize: audit.team_size,
      useCase: audit.use_case,
    }

    const oldRecs = audit.recommendations as Recommendation[]
    const newResult = runAudit(input)

    if (!hasChanged(oldRecs, newResult.recommendations)) continue

    const changes = getChanges(oldRecs, newResult.recommendations)
    if (changes.length === 0) continue

    const email = audit.email as string
    const existing = staleByEmail.get(email) ?? []
    staleByEmail.set(email, [...existing, {
      auditId: audit.id,
      changes,
      newTotalSavings: newResult.totalMonthlySavings,
    }])
  }

  if (staleByEmail.size === 0) {
    return NextResponse.json({ message: 'All audits are still accurate', notified: 0 })
  }

  const notifiedAuditIds: string[] = []

  // Send one email per user
  for (const [email, staleAudits] of staleByEmail) {
    // Use the audit with the highest savings for the email
    const topAudit = staleAudits.sort((a, b) => b.newTotalSavings - a.newTotalSavings)[0]
    const allChanges = staleAudits.flatMap(a => a.changes)

    try {
      await resend.emails.send({
        from: `CostRadar <${process.env.RESEND_FROM_EMAIL}>`,
        to: email,
        subject: `Your AI spend audit has changed — $${Math.round(topAudit.newTotalSavings)}/mo in savings`,
        html: buildNotificationEmail(allChanges, topAudit.auditId, topAudit.newTotalSavings),
      })

      staleAudits.forEach(a => notifiedAuditIds.push(a.auditId))
    } catch (emailError) {
      console.error(`Failed to send email to ${email}:`, emailError)
    }
  }

  // Mark all notified audits so we don't email them again
  if (notifiedAuditIds.length > 0) {
    await db
      .from('audits')
      .update({ notified_at: new Date().toISOString() })
      .in('id', notifiedAuditIds)
  }

  return NextResponse.json({
    message: `Notified ${staleByEmail.size} user(s) about pricing changes`,
    notified: staleByEmail.size,
    auditIds: notifiedAuditIds,
  })
}
