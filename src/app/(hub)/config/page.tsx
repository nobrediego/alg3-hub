"use client"

import { useEffect, useState, useCallback } from "react"
import { Header } from "@/components/layout/header"
import { RefreshCw } from "lucide-react"

interface IntegrationStatus {
  name: string
  description: string
  status: "connected" | "error" | "unconfigured" | "checking"
  lastChecked: number | null
  testEndpoint: string | null
}

const INITIAL_INTEGRATIONS: IntegrationStatus[] = [
  {
    name: "Meta Ads",
    description: "Facebook & Instagram Ads API",
    status: "checking",
    lastChecked: null,
    testEndpoint: "/api/meta/insights?account_id=senai",
  },
  {
    name: "Paperclip",
    description: "Agentes AI e automacao",
    status: "checking",
    lastChecked: null,
    testEndpoint: "/api/paperclip/agents",
  },
  {
    name: "Utmify",
    description: "Rastreamento de vendas e UTMs",
    status: "checking",
    lastChecked: null,
    testEndpoint: "/api/utmify/sales",
  },
  {
    name: "OpenAI",
    description: "GPT-4o e modelos de linguagem",
    status: "unconfigured",
    lastChecked: null,
    testEndpoint: null,
  },
  {
    name: "OpenRouter",
    description: "Gateway de modelos AI",
    status: "unconfigured",
    lastChecked: null,
    testEndpoint: null,
  },
  {
    name: "Supabase",
    description: "Banco de dados e autenticacao",
    status: "unconfigured",
    lastChecked: null,
    testEndpoint: null,
  },
  {
    name: "Canva",
    description: "Design e criativos",
    status: "unconfigured",
    lastChecked: null,
    testEndpoint: null,
  },
  {
    name: "Lovart",
    description: "Geracao de imagens AI",
    status: "unconfigured",
    lastChecked: null,
    testEndpoint: null,
  },
]

function statusColor(status: IntegrationStatus["status"]) {
  switch (status) {
    case "connected":
      return "bg-green-500"
    case "error":
      return "bg-red-500"
    case "unconfigured":
      return "bg-gray-400"
    case "checking":
      return "bg-amber-500"
  }
}

function statusLabel(status: IntegrationStatus["status"]) {
  switch (status) {
    case "connected":
      return "Conectado"
    case "error":
      return "Erro"
    case "unconfigured":
      return "Nao configurado"
    case "checking":
      return "Verificando..."
  }
}

export default function ConfigPage() {
  const [integrations, setIntegrations] =
    useState<IntegrationStatus[]>(INITIAL_INTEGRATIONS)
  const [checking, setChecking] = useState(false)

  const checkIntegrations = useCallback(async () => {
    setChecking(true)

    const updated = await Promise.all(
      INITIAL_INTEGRATIONS.map(async (integration) => {
        if (!integration.testEndpoint) {
          return { ...integration }
        }

        try {
          const res = await fetch(integration.testEndpoint)
          return {
            ...integration,
            status: res.ok
              ? ("connected" as const)
              : ("error" as const),
            lastChecked: Date.now(),
          }
        } catch {
          return {
            ...integration,
            status: "error" as const,
            lastChecked: Date.now(),
          }
        }
      })
    )

    setIntegrations(updated)
    setChecking(false)
  }, [])

  useEffect(() => {
    checkIntegrations()
  }, [checkIntegrations])

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
            onClick={checkIntegrations}
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
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="rounded-lg border bg-card p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold">{integration.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {integration.description}
                  </p>
                </div>
                <span
                  className={`mt-1 size-2 shrink-0 rounded-full ${statusColor(integration.status)}`}
                />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {statusLabel(integration.status)}
                </span>
                {integration.lastChecked && (
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(integration.lastChecked).toLocaleTimeString(
                      "pt-BR",
                      { hour: "2-digit", minute: "2-digit", second: "2-digit" }
                    )}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
