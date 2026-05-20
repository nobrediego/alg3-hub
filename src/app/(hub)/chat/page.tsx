"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Send, Trash2 } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  model?: string
  timestamp: number
}

const MODELS = [
  { id: "auto", label: "Auto (recomendado)" },
  { id: "gpt-4o", label: "GPT-4o" },
  { id: "claude-sonnet-4-20250514", label: "Claude Sonnet" },
  { id: "nvidia/llama-3.1-nemotron-ultra-253b-v1:free", label: "Nemotron Ultra (gratis)" },
  { id: "deepseek/deepseek-chat-v3-0324:free", label: "DeepSeek V3 (gratis)" },
] as const

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Ola! Sou o assistente do ALG3 Hub. Posso ajudar com relatorios, campanhas, agentes e mais.",
  model: "auto",
  timestamp: Date.now(),
}

const STORAGE_KEY = "alg3-chat-messages"
const MODEL_KEY = "alg3-chat-model"

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [model, setModel] = useState("auto")
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const storedModel = localStorage.getItem(MODEL_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Message[]
        setMessages(parsed.length > 0 ? parsed : [WELCOME_MESSAGE])
      } else {
        setMessages([WELCOME_MESSAGE])
      }
      if (storedModel) setModel(storedModel)
    } catch {
      setMessages([WELCOME_MESSAGE])
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    }
  }, [messages])

  useEffect(() => {
    localStorage.setItem(MODEL_KEY, model)
  }, [model])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Auto-resize textarea
  function resizeTextarea() {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`
  }

  const clearChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE])
  }, [])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || isStreaming) return

    const userMsg: Message = {
      id: generateId(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    }

    const assistantId = generateId()
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      model,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setInput("")
    setIsStreaming(true)

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content:
                    errData.error || `Erro ${res.status}: falha na requisicao`,
                }
              : m
          )
        )
        setIsStreaming(false)
        return
      }

      const reader = res.body?.getReader()
      if (!reader) {
        setIsStreaming(false)
        return
      }

      const decoder = new TextDecoder()
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const payload = line.slice(6).trim()
          if (payload === "[DONE]") continue

          try {
            const parsed = JSON.parse(payload)
            if (parsed.text) {
              accumulated += parsed.text
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: accumulated } : m
                )
              )
            }
            if (parsed.error) {
              accumulated += parsed.error
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: accumulated } : m
                )
              )
            }
            if (parsed.meta?.model) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, model: parsed.meta.model }
                    : m
                )
              )
            }
          } catch {
            // Skip unparseable lines
          }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Erro de conexao com o servidor" }
            : m
        )
      )
    } finally {
      setIsStreaming(false)
    }
  }, [input, isStreaming, messages, model])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col -m-4 lg:-m-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h1 className="font-montserrat text-lg font-semibold tracking-tight">
          Chat ORION
        </h1>
        <div className="flex items-center gap-3">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="rounded-lg border bg-card px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-ring"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          <button
            onClick={clearChat}
            className="rounded-lg border p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Limpar conversa"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${
                  msg.role === "user" ? "bg-blue-600" : "bg-primary"
                }`}
              >
                {msg.role === "user" ? "DG" : "AI"}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[75%] rounded-lg px-3 py-2 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                <div
                  className={`mt-1 flex items-center gap-2 ${
                    msg.role === "user" ? "justify-end" : ""
                  }`}
                >
                  {msg.role === "assistant" && msg.model && (
                    <span className="text-[10px] text-muted-foreground">
                      {msg.model}
                    </span>
                  )}
                  <span
                    className={`text-[10px] ${
                      msg.role === "user"
                        ? "text-primary-foreground/60"
                        : "text-muted-foreground"
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isStreaming && (
            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                AI
              </div>
              <div className="rounded-lg bg-muted px-3 py-2">
                <div className="flex gap-1">
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              resizeTextarea()
            }}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            rows={1}
            className="flex-1 resize-none rounded-lg border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="rounded-lg bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
