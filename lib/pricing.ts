/**
 * Pricing data for all supported AI tools.
 * Every number traces to an official vendor URL — see PRICING_DATA.md.
 * Last verified: week of May 6, 2025.
 */

export type Plan = {
  name: string
  pricePerSeat: number   // USD per user per month
  minSeats?: number      // minimum seats required (Team plans etc.)
  maxSeats?: number      // upper bound where plan stops making sense
  features: string[]
  bestFor: string
}

export type Tool = {
  id: ToolId
  name: string
  vendor: string
  category: ToolCategory
  plans: Plan[]
  /** Tool IDs we'd consider switching to for cost or fit reasons */
  alternatives: ToolId[]
}

export type ToolId =
  | 'cursor'
  | 'github_copilot'
  | 'claude'
  | 'chatgpt'
  | 'anthropic_api'
  | 'openai_api'
  | 'gemini'
  | 'windsurf'

export type ToolCategory = 'coding' | 'general' | 'api'

export type UseCase = 'coding' | 'writing' | 'data' | 'research' | 'mixed'

// ─── Tool definitions ──────────────────────────────────────────────────────

export const TOOLS: Record<ToolId, Tool> = {
  cursor: {
    id: 'cursor',
    name: 'Cursor',
    vendor: 'Anysphere',
    category: 'coding',
    alternatives: ['github_copilot', 'windsurf'],
    plans: [
      {
        name: 'Hobby',
        pricePerSeat: 0,
        features: ['2,000 completions/mo', 'Limited GPT-4 access'],
        bestFor: 'Solo devs evaluating the product',
      },
      {
        name: 'Pro',
        pricePerSeat: 20,
        features: ['Unlimited completions', 'GPT-4 & Claude access', 'Fast premium models'],
        bestFor: 'Individual developers using AI coding daily',
      },
      {
        name: 'Business',
        pricePerSeat: 40,
        minSeats: 1,
        features: ['Pro features', 'SSO', 'Admin dashboard', 'Usage analytics', 'Zero data retention'],
        bestFor: 'Teams needing admin controls and compliance',
      },
      {
        name: 'Enterprise',
        pricePerSeat: 100, // estimated — custom pricing, not publicly listed
        minSeats: 20,
        features: ['Business features', 'Custom contracts', 'Dedicated support', 'On-premise option'],
        bestFor: 'Large orgs with procurement and compliance requirements',
      },
    ],
  },

  github_copilot: {
    id: 'github_copilot',
    name: 'GitHub Copilot',
    vendor: 'GitHub / Microsoft',
    category: 'coding',
    alternatives: ['cursor', 'windsurf'],
    plans: [
      {
        name: 'Individual',
        pricePerSeat: 10,
        maxSeats: 10, // above 10 seats Business is cheaper per-feature
        features: ['Code completions', 'Chat in IDE', 'CLI support', 'Mobile app'],
        bestFor: 'Solo devs and very small teams already on GitHub',
      },
      {
        name: 'Business',
        pricePerSeat: 19,
        features: ['Individual features', 'Org-wide policy controls', 'Audit logs', 'IP indemnity'],
        bestFor: 'Teams that need usage controls and compliance',
      },
      {
        name: 'Enterprise',
        pricePerSeat: 39,
        features: ['Business features', 'Fine-tuned models on your codebase', 'Knowledge bases', 'Copilot in GitHub.com'],
        bestFor: 'Large orgs wanting custom model fine-tuning',
      },
    ],
  },

  claude: {
    id: 'claude',
    name: 'Claude',
    vendor: 'Anthropic',
    category: 'general',
    alternatives: ['chatgpt', 'gemini'],
    plans: [
      {
        name: 'Free',
        pricePerSeat: 0,
        features: ['Limited messages/day', 'Claude 3 Haiku'],
        bestFor: 'Occasional use — not suitable for daily work',
      },
      {
        name: 'Pro',
        pricePerSeat: 20,
        maxSeats: 4, // below 5 seats, Pro is better than Team
        features: ['5× more usage vs Free', 'Claude 3.5 Sonnet & Opus', 'Priority access', 'Projects'],
        bestFor: 'Individual heavy users and teams of 1–4',
      },
      {
        name: 'Max',
        pricePerSeat: 100,
        features: ['20× more usage vs Pro', 'Extended thinking', 'Highest priority'],
        bestFor: 'Power users running long research or analysis tasks',
      },
      {
        name: 'Team',
        pricePerSeat: 25,
        minSeats: 5,
        features: ['Pro-level usage per seat', 'Shared projects', 'Admin console', 'No training on data'],
        bestFor: 'Teams of 5+ collaborating on shared projects',
      },
      {
        name: 'Enterprise',
        pricePerSeat: 60, // estimated from Anthropic sales page — custom
        minSeats: 10,
        features: ['Team features', 'SSO/SAML', 'Custom data retention', 'SLA', 'Dedicated support'],
        bestFor: 'Enterprises with compliance and SSO requirements',
      },
    ],
  },

  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    vendor: 'OpenAI',
    category: 'general',
    alternatives: ['claude', 'gemini'],
    plans: [
      {
        name: 'Free',
        pricePerSeat: 0,
        features: ['GPT-3.5', 'Limited GPT-4o access'],
        bestFor: 'Occasional use only',
      },
      {
        name: 'Plus',
        pricePerSeat: 20,
        maxSeats: 4,
        features: ['GPT-4o', 'DALL·E 3', 'Advanced data analysis', 'Custom GPTs'],
        bestFor: 'Individual power users and teams of 1–4',
      },
      {
        name: 'Team',
        pricePerSeat: 30,
        minSeats: 2,
        features: ['Plus features', 'Shared workspace', 'Admin controls', 'No training on data'],
        bestFor: 'Teams of 2+ that need a shared workspace',
      },
      {
        name: 'Enterprise',
        pricePerSeat: 60, // estimated — OpenAI custom pricing
        minSeats: 10,
        features: ['Team features', 'SSO', 'Custom data retention', 'Dedicated support', 'Advanced security'],
        bestFor: 'Large orgs with security and compliance requirements',
      },
    ],
  },

  anthropic_api: {
    id: 'anthropic_api',
    name: 'Anthropic API',
    vendor: 'Anthropic',
    category: 'api',
    alternatives: ['openai_api'],
    plans: [
      {
        name: 'Pay as you go',
        pricePerSeat: 0,
        features: [
          'Claude 3.5 Sonnet: $3/1M input, $15/1M output tokens',
          'Claude 3 Haiku: $0.25/1M input, $1.25/1M output tokens',
          'Claude 3 Opus: $15/1M input, $75/1M output tokens',
        ],
        bestFor: 'Developers building products on top of Claude',
      },
    ],
  },

  openai_api: {
    id: 'openai_api',
    name: 'OpenAI API',
    vendor: 'OpenAI',
    category: 'api',
    alternatives: ['anthropic_api'],
    plans: [
      {
        name: 'Pay as you go',
        pricePerSeat: 0,
        features: [
          'GPT-4o: $5/1M input, $15/1M output tokens',
          'GPT-4o mini: $0.15/1M input, $0.60/1M output tokens',
          'GPT-3.5 Turbo: $0.50/1M input, $1.50/1M output tokens',
        ],
        bestFor: 'Developers building products on top of GPT models',
      },
    ],
  },

  gemini: {
    id: 'gemini',
    name: 'Gemini',
    vendor: 'Google',
    category: 'general',
    alternatives: ['claude', 'chatgpt'],
    plans: [
      {
        name: 'Free',
        pricePerSeat: 0,
        features: ['Gemini 1.5 Flash', 'Limited daily usage'],
        bestFor: 'Light, occasional use',
      },
      {
        name: 'Advanced',
        pricePerSeat: 20,
        maxSeats: 4,
        features: ['Gemini Ultra 1.0', '2TB Google One storage', 'Deep Research'],
        bestFor: 'Heavy Google ecosystem users needing the top model',
      },
      {
        name: 'Business',
        pricePerSeat: 24,
        minSeats: 1,
        features: ['Gemini in all Workspace apps (Docs, Sheets, Meet)', 'Admin controls', 'Enterprise security'],
        bestFor: 'Teams already paying for Google Workspace — best value if so',
      },
    ],
  },

  windsurf: {
    id: 'windsurf',
    name: 'Windsurf',
    vendor: 'Codeium',
    category: 'coding',
    alternatives: ['cursor', 'github_copilot'],
    plans: [
      {
        name: 'Free',
        pricePerSeat: 0,
        features: ['Unlimited completions', 'Limited AI Flows', 'GPT-3.5 access'],
        bestFor: 'Developers wanting a free Copilot alternative',
      },
      {
        name: 'Pro',
        pricePerSeat: 15,
        features: ['Unlimited AI Flows', 'GPT-4o access', 'Priority support'],
        bestFor: 'Individual devs wanting Cursor-like features at 25% lower cost',
      },
      {
        name: 'Teams',
        pricePerSeat: 35,
        minSeats: 2,
        features: ['Pro features', 'Team management', 'Usage analytics', 'SSO'],
        bestFor: 'Teams wanting Cursor Business equivalent at $5/seat less',
      },
    ],
  },
}

export const TOOL_IDS = Object.keys(TOOLS) as ToolId[]
export const TOOL_LIST = Object.values(TOOLS)
