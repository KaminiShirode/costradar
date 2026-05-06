import { createClient } from '@supabase/supabase-js'

// ─── Database schema types ────────────────────────────────────────────────

export type AuditRow = {
  id: string
  created_at: string
  tools: unknown           // UserTool[] — stored as JSONB
  team_size: number
  use_case: string
  total_monthly_spend: number
  total_monthly_savings: number
  total_annual_savings: number
  recommendations: unknown // Recommendation[] — stored as JSONB
  show_credex: boolean
  is_already_optimal: boolean
  ai_summary: string | null
}

export type LeadRow = {
  id: string
  created_at: string
  audit_id: string
  email: string
  company_name: string | null
  role: string | null
  team_size: number | null
  monthly_savings: number
}

export type Database = {
  public: {
    Tables: {
      audits: { Row: AuditRow; Insert: Omit<AuditRow, 'id' | 'created_at'>; Update: Partial<AuditRow> }
      leads: { Row: LeadRow; Insert: Omit<LeadRow, 'id' | 'created_at'>; Update: Partial<LeadRow> }
    }
  }
}

// ─── Client ───────────────────────────────────────────────────────────────

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
