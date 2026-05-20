"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/layout/header"
import { Bot, Database } from "lucide-react"

interface Agent {
  id: string
  name: string
  role: string
  status: string
  capabilities?: string[]
  knowledge_base?: {
    size?: number
    documents?: number
  }
}

function statusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-green-500"
    case "error":
      return "bg-red-500"
    case "paused":
      return "bg-amber-500"
    default:
      return "bg-gray-400"
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "active":
      return "Ativo"
    case "error":
      return "Erro"
    case "paused":
      return "Pausa"
    default:
      return "Inativo"
  }
}

export default function AgentesPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAgents() {
      try {
        const res = await fetch("/api/paperclip/agents")
        if (!res.ok) throw new Error("Falha ao carregar agentes")
        const data = await res.json()
        setAgents(Array.isArray(data) ? data : data.data ?? [])
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro desconhecido")
      } finally {
        setLoading(false)
      }
    }

    fetchAgents()
  }, [])

  return (
    <>
      <Header title="Agentes" description="Agentes AI do Paperclip" />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-lg border bg-card"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      ) : agents.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <div key={agent.id} className="rounded-lg border bg-card p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{agent.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {agent.role}
                  </p>
                </div>
                <Bot className="size-4 shrink-0 text-muted-foreground" />
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span
                  className={`size-2 rounded-full ${statusColor(agent.status)}`}
                />
                <span className="text-xs text-muted-foreground">
                  {statusLabel(agent.status)}
                </span>
              </div>

              {agent.capabilities && agent.capabilities.length > 0 && (
                <div className="mt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Capacidades
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {agent.capabilities.join(", ")}
                  </p>
                </div>
              )}

              {agent.knowledge_base && (
                <div className="mt-3 flex items-center gap-1.5">
                  <Database className="size-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">
                    {agent.knowledge_base.documents != null
                      ? `${agent.knowledge_base.documents} documentos`
                      : agent.knowledge_base.size != null
                        ? `${agent.knowledge_base.size} itens`
                        : "Base de conhecimento"}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-card px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum agente encontrado
          </p>
        </div>
      )}
    </>
  )
}
