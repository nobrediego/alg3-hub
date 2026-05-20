"use client"

import { useEffect, useState, useCallback } from "react"
import { Header } from "@/components/layout/header"
import { RefreshCw } from "lucide-react"

interface ServiceStatus {
  configured: boolean
  connected?: boolean
  error?: string
}

type StatusMap = Record<string, ServiceStatus>

const SERVICES = [
  { key: "meta", name: "Meta Ads", description: "API de anuncios do Facebook e Instagram" },
  { key: "paperclip", name: "Paperclip", description: "Agentes AI e automacao" },
  { key: "utmify", name: "Utmify", description: "Rastreamento de vendas e UTMs" },
  { key: "openai", name: "OpenAI", description: "GPT-4o e modelos de linguagem" },
  { key: "openrouter", name: "OpenRouter", description: "Gateway de modelos AI" },
  { key: "supabase", name: "Supabase", description: "Banco de dados e autenticacao" },
  { key: "canva", name: "Canva", description: "Design e criativos" },
  { key: "lovart", name: "Lovart", description: "Geracao de imagens AI" },
]

function getStatusDot(s?: ServiceStatus) {
  if (!s) return "bg-gray-400"
  if (!s.configured) return "bg-gray-400"
  if (s.connected) return "bg-green-500"
  if (s.error) return "bg-red-500"
  return "bg-amber-500"
}

function getStatusLabel(s?: ServiceStatus) {
  if (!s) return "Verificando..."
  if (!s.configured) return "Nao configurado"
  if (s.connected) return "Conectado"
  if (s.error) return s.error
  return "Verificando..."
}

export default function ConfigPage() {
  const [statuses, setStatuses] = useState<StatusMap | null>(null)
  const [checking, setChecking] = useState(false)
  const [lastChecked, setLastChecked] = useState<number | null>(null)

  const checkAll = useCallback(async () => {
    setChecking(true)
    try {
      const res = await fetch("/api/status")
      if (res.ok) {
        setStatuses(await res.json())
        setLastChecked(Date.now())
      }
    } catch {
      // silently fail
    } finally {
      setChecking(false)
    }
  }, [])

  useEffect(() => {
    checkAll()
  }, [checkAll])

  return (
    <>
      <Header
        title="Configuracao"
        description="Status das integracoes e diagnostico"
      />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            INTEGRACOES
          </p>
          <button
            onClick={checkAll}
            disabled={checking}
            className="flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw
              className={`size-3 ${checking ? "animate-spin" : ""}`}
            />
            Verificar
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((svc) => {
            const s = statuses?.[svc.key]
            return (
              <div key={svc.key} className="rounded-lg border bg-card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold">{svc.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {svc.description}
                    </p>
                  </div>
                  <span
                    className={`mt-1 size-2 shrink-0 rounded-full ${getStatusDot(s)}`}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {getStatusLabel(s)}
                  </span>
                  {lastChecked && (
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(lastChecked).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}
