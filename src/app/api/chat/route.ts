import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { selectModel, resolveForced } from '@/lib/chat/model-router'
import type { ModelSelection } from '@/types'

const SYSTEM_PROMPT = `Voce e o ALG3, assistente de IA do Hub ALG3.
Voce ajuda com gestao de trafego pago (Meta Ads), analise de dados, automacoes e operacoes do dia a dia.
Responda sempre em portugues brasileiro, de forma direta e objetiva.
Quando relevante, use dados e metricas para embasar suas respostas.`

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
      system: SYSTEM_PROMPT,
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
): Promise<Response> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const completion = await openai.chat.completions.create({
    model: model.model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
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
        { role: 'system', content: SYSTEM_PROMPT },
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

    const streamFn = {
      anthropic: streamAnthropic,
      openai: streamOpenAI,
      openrouter: streamOpenRouter,
    }[model.provider]

    try {
      return await streamFn(model, messages)
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
        return await streamOpenRouter(fallback, messages)
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
