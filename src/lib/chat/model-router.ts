import type { ModelSelection, ModelTier, ModelProvider } from '@/types'

const ACTION_KEYWORDS = [
  'crie', 'cria', 'create', 'make', 'build', 'gere', 'gera', 'generate',
  'escreva', 'write', 'edite', 'edit', 'altere', 'change', 'delete',
  'remova', 'remove', 'execute', 'run', 'deploy', 'send', 'envie',
  'configure', 'setup', 'install', 'update', 'atualize',
]

const ANALYSIS_KEYWORDS = [
  'analise', 'analyze', 'analyse', 'compare', 'compare', 'avalie',
  'evaluate', 'explique', 'explain', 'por que', 'why', 'como funciona',
  'how does', 'diagnose', 'diagnostique', 'review', 'revise',
  'investigue', 'investigate', 'debug', 'optimize', 'otimize',
]

export const OPENROUTER_MODELS = {
  nemotron: {
    id: 'nvidia/llama-3.1-nemotron-ultra-253b-v1:free',
    name: 'Nemotron Ultra 253B (Free)',
    supportsTools: false,
  },
  deepseek: {
    id: 'deepseek/deepseek-chat-v3-0324:free',
    name: 'DeepSeek V3 0324 (Free)',
    supportsTools: false,
  },
} as const

export function classifyTier(message: string): ModelTier {
  const lower = message.toLowerCase()

  if (ACTION_KEYWORDS.some(kw => lower.includes(kw))) return 'action'
  if (ANALYSIS_KEYWORDS.some(kw => lower.includes(kw))) return 'analysis'
  return 'simple'
}

export function selectModel(message: string): ModelSelection {
  const tier = classifyTier(message)
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY
  const hasOpenAI = !!process.env.OPENAI_API_KEY

  if (tier === 'action') {
    if (hasAnthropic) {
      return { provider: 'anthropic', model: 'claude-sonnet-4-20250514', tier, supportsTools: true }
    }
    if (hasOpenAI) {
      return { provider: 'openai', model: 'gpt-4o', tier, supportsTools: true }
    }
    return { provider: 'openrouter', model: OPENROUTER_MODELS.nemotron.id, tier, supportsTools: false }
  }

  if (tier === 'analysis') {
    if (hasAnthropic) {
      return { provider: 'anthropic', model: 'claude-sonnet-4-20250514', tier, supportsTools: true }
    }
    if (hasOpenAI) {
      return { provider: 'openai', model: 'gpt-4o', tier, supportsTools: true }
    }
    return { provider: 'openrouter', model: OPENROUTER_MODELS.deepseek.id, tier, supportsTools: false }
  }

  // simple tier
  if (hasAnthropic) {
    return { provider: 'anthropic', model: 'claude-sonnet-4-20250514', tier, supportsTools: true }
  }
  if (hasOpenAI) {
    return { provider: 'openai', model: 'gpt-4o-mini', tier, supportsTools: true }
  }
  return { provider: 'openrouter', model: OPENROUTER_MODELS.deepseek.id, tier, supportsTools: false }
}

export function resolveForced(modelId: string): ModelSelection {
  // Check if it's an OpenRouter model
  if (modelId.includes('/')) {
    return { provider: 'openrouter', model: modelId, tier: 'action', supportsTools: false }
  }

  // Check if it's an Anthropic model
  if (modelId.startsWith('claude')) {
    return { provider: 'anthropic', model: modelId, tier: 'action', supportsTools: true }
  }

  // Default to OpenAI
  return { provider: 'openai', model: modelId, tier: 'action', supportsTools: true }
}
