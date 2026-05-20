export interface Empresa {
  id: string
  nome: string
  setor: string
  status: 'ativa' | 'inativa'
  metaAccountId?: string
  metaAccountName?: string
}

export interface MetaCampaign {
  id: string
  name: string
  status: string
  objective: string
  daily_budget?: string
  lifetime_budget?: string
  insights?: MetaInsights
}

export interface MetaInsights {
  spend: string
  impressions: string
  clicks: string
  ctr: string
  cpc: string
  cpm: string
  reach?: string
  actions?: Array<{ action_type: string; value: string }>
}

export interface MetaAccount {
  id: string
  name: string
  accountId: string
  envKey: string
  tokenKey: string
}

export interface PaperclipAgent {
  id: string
  name: string
  role: string
  status: 'idle' | 'running' | 'error'
  capabilities?: string
  metadata?: Record<string, unknown>
}

export interface PaperclipIssue {
  id: string
  title: string
  description: string
  status: string
  priority: string
  assignee_id?: string
  created_at: string
}

export interface PaperclipDashboard {
  agents: PaperclipAgent[]
  issues: PaperclipIssue[]
  stats: {
    total_agents: number
    active_agents: number
    total_issues: number
    open_issues: number
  }
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  model?: string
}

export type ModelTier = 'action' | 'analysis' | 'simple'
export type ModelProvider = 'anthropic' | 'openai' | 'openrouter'

export interface ModelSelection {
  provider: ModelProvider
  model: string
  tier: ModelTier
  supportsTools: boolean
}
