import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { selectModel, resolveForced } from '@/lib/chat/model-router'
import type { ModelSelection } from '@/types'

async function buildSystemPrompt(): Promise<string> {
  let metaData = ''
  let agentsData = ''
  let dashboardData = ''

  try {
    const metaRes = await fetch(
      `https://graph.facebook.com/v21.0/act_1318032568658074/insights?fields=spend,impressions,clicks,ctr,cpc,cpm&date_preset=last_30d&access_token=${process.env.META_ACCESS_TOKEN}`,
      { cache: 'no-store' }
    )
    if (metaRes.ok) {
      const data = await metaRes.json()
      const d = data.data?.[0]
      if (d) {
        metaData = `\n\nDADOS META ADS (SENAI, ultimos 30 dias):
- Spend: R$ ${parseFloat(d.spend).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Impressoes: ${parseInt(d.impressions).toLocaleString('pt-BR')}
- Clicks: ${parseInt(d.clicks).toLocaleString('pt-BR')}
- CTR: ${d.ctr}%
- CPC: R$ ${d.cpc}
- CPM: R$ ${d.cpm}`
      }
    }
  } catch {}

  const paperclipUrl = process.env.PAPERCLIP_API_URL || 'http://127.0.0.1:3100/api'
  const companyId = process.env.PAPERCLIP_COMPANY_ID || ''

  try {
    const agentsRes = await fetch(`${paperclipUrl}/companies/${companyId}/agents`, { cache: 'no-store' })
    if (agentsRes.ok) {
      const agents = await agentsRes.json()
      if (Array.isArray(agents)) {
        agentsData = `\n\nAGENTES PAPERCLIP (${agents.length} agentes):
${agents.map((a: { name: string; title: string; status: string; adapterConfig?: { model?: string } }) =>
  `- ${a.name} (${a.title}) — status: ${a.status}, modelo: ${a.adapterConfig?.model || 'N/A'}`
).join('\n')}`
      }
    }
  } catch {}

  try {
    const dashRes = await fetch(`${paperclipUrl}/companies/${companyId}/dashboard`, { cache: 'no-store' })
    if (dashRes.ok) {
      const dash = await dashRes.json()
      dashboardData = `\n\nDASHBOARD PAPERCLIP:
- Agentes ativos: ${dash.agents?.active || 0}, rodando: ${dash.agents?.running || 0}
- Issues abertas: ${dash.tasks?.open || 0}, em progresso: ${dash.tasks?.inProgress || 0}`
    }
  } catch {}

  return `Voce e o assistente executivo do ALG3 Hub — o centro de comando da holding ALG3.
Voce TEM acesso real aos dados e PODE executar acoes. Responda sempre em portugues brasileiro, direto e objetivo.

SUAS CAPACIDADES:
- Consultar dados de campanhas Meta Ads (5 contas: SENAI, SESI Amazonas, SESI Escola, SESI Saude, SESI Lazer)
- Ver status e gerenciar agentes AI do Paperclip (criar issues, consultar dashboard)
- Analisar metricas de trafego pago (spend, CTR, CPC, CPM, ROAS)
- Criar tarefas para os agentes executarem
- Consultar dados de vendas e tracking (Utmify)
- Gerar criativos com GPT Image e Lovart AI

EMPRESAS DO GRUPO ALG3:
1. Top Prime Seguros e Saude
2. Top Prime Vida e Previdencia
3. Top Prime Seguros Patrimoniais
4. Top Prime Consorcios e Investimentos
5. RedeCORR
6. GDA Sistemas
7. Plano A Administradora
8. Clinica Salut
9. Laboratorio Giovani

CONTAS META ADS:
- SENAI NOVA (act_1318032568658074) — principal
- SESI AMAZONAS (act_103647143172752)
- SESI ESCOLA (act_172742621703309)
- SESI SAUDE (act_447781743367534)
- SESI LAZER (act_198656655774871)
${metaData}${agentsData}${dashboardData}

Quando o usuario pedir para ativar/executar agentes, explique que pode criar issues/tarefas no Paperclip para os agentes executarem.
Quando pedir dados de campanhas, use os dados reais acima.
Seja proativo, mostre numeros e sugira acoes concretas.`
}


function createSSEStream(readable: ReadableStream): Response {
  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

function sseEncode(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`
}

async function streamAnthropic(
  model: ModelSelection,
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string,
): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model.model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      stream: true,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Anthropic API error ${res.status}`)
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      controller.enqueue(encoder.encode(sseEncode({ meta: { model: model.model, provider: model.provider } })))

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                controller.enqueue(encoder.encode(sseEncode({ text: parsed.delta.text })))
              }
            } catch {
              // skip unparseable chunks
            }
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Stream error'
        controller.enqueue(encoder.encode(sseEncode({ error: message })))
      } finally {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
    },
  })

  return createSSEStream(stream)
}

async function streamOpenAI(
  model: ModelSelection,
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string,
): Promise<Response> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const completion = await openai.chat.completions.create({
    model: model.model,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ],
    stream: true,
  })

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      controller.enqueue(encoder.encode(sseEncode({ meta: { model: model.model, provider: model.provider } })))

      try {
        for await (const chunk of completion) {
          const text = chunk.choices[0]?.delta?.content
          if (text) {
            controller.enqueue(encoder.encode(sseEncode({ text })))
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Stream error'
        controller.enqueue(encoder.encode(sseEncode({ error: message })))
      } finally {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
    },
  })

  return createSSEStream(stream)
}

async function streamOpenRouter(
  model: ModelSelection,
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string,
): Promise<Response> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured')

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://alg3-hub.vercel.app',
      'X-Title': 'ALG3 Hub',
    },
    body: JSON.stringify({
      model: model.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
      stream: true,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `OpenRouter API error ${res.status}`)
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      controller.enqueue(encoder.encode(sseEncode({ meta: { model: model.model, provider: model.provider } })))

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              const text = parsed.choices?.[0]?.delta?.content
              if (text) {
                controller.enqueue(encoder.encode(sseEncode({ text })))
              }
            } catch {
              // skip unparseable chunks
            }
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Stream error'
        controller.enqueue(encoder.encode(sseEncode({ error: message })))
      } finally {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
    },
  })

  return createSSEStream(stream)
}

export async function POST(req: NextRequest) {
  try {
    const { messages, model: requestedModel } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const lastUserMessage = [...messages].reverse().find((m: { role: string }) => m.role === 'user')?.content || ''

    let model: ModelSelection
    if (requestedModel && requestedModel !== 'auto') {
      model = resolveForced(requestedModel)
    } else {
      model = selectModel(lastUserMessage)
    }

    const systemPrompt = await buildSystemPrompt()

    const streamFn = {
      anthropic: streamAnthropic,
      openai: streamOpenAI,
      openrouter: streamOpenRouter,
    }[model.provider]

    try {
      return await streamFn(model, messages, systemPrompt)
    } catch (primaryError) {
      // Fallback: try OpenRouter free models if primary fails
      if (model.provider !== 'openrouter') {
        console.error(`Primary provider ${model.provider} failed, falling back to OpenRouter:`, primaryError)
        const fallback: ModelSelection = {
          provider: 'openrouter',
          model: 'deepseek/deepseek-chat-v3-0324:free',
          tier: model.tier,
          supportsTools: false,
        }
        return await streamOpenRouter(fallback, messages, systemPrompt)
      }
      throw primaryError
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(sseEncode({ error: message })))
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })
    return createSSEStream(stream)
  }
}
