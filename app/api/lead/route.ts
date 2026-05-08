import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabase } from '@/lib/supabase'

const resend = new Resend(process.env.RESEND_API_KEY)

// ─── Rate limiting ────────────────────────────────────────────────────────
// Why honeypot + IP rate limit instead of hCaptcha:
// hCaptcha adds a visible challenge that hurts conversion for legitimate users
// (our audience is technical — they find CAPTCHAs annoying). A hidden honeypot
// catches most bots silently. IP rate limiting prevents brute force.
// Documented here per assignment requirement.

const submissionsByIp = new Map<string, number[]>()
const RATE_LIMIT = { maxRequests: 5, windowMs: 60 * 60 * 1000 } // 5 per hour

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (submissionsByIp.get(ip) ?? []).filter(
    t => now - t < RATE_LIMIT.windowMs
  )
  if (recent.length >= RATE_LIMIT.maxRequests) return true
  submissionsByIp.set(ip, [...recent, now])
  return false
}

// ─── Route ────────────────────────────────────────────────────────────────

type LeadBody = {
  email: string
  companyName?: string
  role?: string
  teamSize?: number
  auditId: string
  monthlySavings: number
  website?: string // honeypot field
}

export async function POST(req: NextRequest) {
  const body: LeadBody = await req.json()

  // Honeypot — real users never fill this; bots do
  if (body.website) {
    return NextResponse.json({ ok: true }) // silent reject
  }

  if (!body.email?.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  // Save lead to Supabase
  const { error: dbError } = await (supabase as any).from('leads').insert({
    email: body.email,
    company_name: body.companyName ?? null,
    role: body.role ?? null,
    team_size: body.teamSize ?? null,
    audit_id: body.auditId,
    monthly_savings: body.monthlySavings,
  })

  if (dbError) {
    console.error('Lead insert error:', dbError)
    // Don't surface DB errors to users — still send the email
  }

  const isHighValue = body.monthlySavings > 500
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

  try {
    await resend.emails.send({
      from: 'CostRadar <audit@yourdomain.com>',
      to: body.email,
      subject: `Your audit: $${Math.round(body.monthlySavings)}/mo in potential savings`,
      html: buildEmail({ ...body, isHighValue, baseUrl }),
    })
  } catch (emailError) {
    console.error('Resend error:', emailError)
    // Email failure shouldn't block the user — return success anyway
  }

  return NextResponse.json({ ok: true })
}

// ─── Email template ───────────────────────────────────────────────────────

function buildEmail(opts: LeadBody & { isHighValue: boolean; baseUrl: string }) {
  const savings = Math.round(opts.monthlySavings)
  const annual = savings * 12

  return `
    <div style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#0f172a;">
      <h2 style="font-size:22px;font-weight:700;margin:0 0 8px;">Your CostRadar</h2>
      <p style="color:#64748b;margin:0 0 24px;">
        We found <strong style="color:#0f172a;">$${savings}/month ($${annual}/year)</strong> in potential savings.
      </p>

      ${opts.isHighValue ? `
      <div style="background:#eff6ff;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
        <strong>High savings opportunity detected.</strong><br/>
        <span style="color:#3b82f6;">A Credex advisor will reach out within one business day</span>
        to help you capture these savings through discounted AI credits.
      </div>` : ''}

      <a href="${opts.baseUrl}/audit/${opts.auditId}"
         style="display:inline-block;background:#2563eb;color:#fff;font-weight:600;padding:12px 24px;border-radius:10px;text-decoration:none;margin-bottom:32px;">
        View Full Report →
      </a>

      <p style="font-size:13px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:20px;margin:0;">
        Sent by <a href="https://credex.rocks" style="color:#94a3b8;">Credex</a> —
        we source discounted AI credits for startups.
        You received this because you ran an audit and entered your email.
      </p>
    </div>
  `
}
