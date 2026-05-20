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
  title?: string
  role: string
  status: 'idle' | 'running' | 'paused' | 'error'
  capabilities?: string
  adapterConfig?: { model?: string }
  metadata?: { knowledgeBase?: { role?: string } }
}

export interface PaperclipIssue {
  id: string
  title: string
  description: string
  status: 'backlog' | 'in_progress' | 'done' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigneeAgentId?: string
  identifier?: string
  createdAt: string
}

export interface PaperclipDashboard {
  companyId: string
  agents: { active: number; running: number; paused: number; error: number }
  tasks: { open: number; inProgress: number; blocked: number; done: number }
  costs: { monthSpendCents: number; monthBudgetCents: number }
  runActivity: Array<{ date: string; succeeded: number; failed: number; other: number; total: number }>
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
