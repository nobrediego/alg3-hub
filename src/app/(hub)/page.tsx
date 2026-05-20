"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/layout/header"
import {
  Bot,
  Megaphone,
  DollarSign,
  AlertCircle,
} from "lucide-react"

interface Agent {
  id: string
  name: string
  role: string
  status: string
}

interface DashboardData {
  agents?: Agent[]
  activities?: Array<{
    id: string
    description: string
    created_at: string
  }>
  stats?: {
    active_agents: number
    active_campaigns: number
    total_spend: number
    open_issues: number
  }
}

interface InsightsData {
  data?: Array<{
    spend: string
    impressions: string
    clicks: string
  }>
}

const DEFAULT_AGENTS: Agent[] = [
  { id: "1", name: "ORION", role: "Assistente Central", status: "active" },
  { id: "2", name: "ATHENA", role: "Analise de Dados", status: "active" },
  { id: "3", name: "HERMES", role: "Comunicacao", status: "active" },
  { id: "4", name: "APOLLO", role: "Campanhas", status: "paused" },
  { id: "5", name: "SENTINEL", role: "Monitoramento", status: "inactive" },
]

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

export default function PainelPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [insights, setInsights] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashRes, insightsRes] = await Promise.allSettled([
          fetch("/api/paperclip/dashboard"),
          fetch("/api/meta/insights?account_id=senai"),
        ])

        if (dashRes.status === "fulfilled" && dashRes.value.ok) {
          setDashboard(await dashRes.value.json())
        }

        if (insightsRes.status === "fulfilled" && insightsRes.value.ok) {
          setInsights(await insightsRes.value.json())
        }
      } catch {
        setError("Erro ao carregar dados do painel")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const agents = dashboard?.agents ?? DEFAULT_AGENTS
  const activeAgents = agents.filter((a) => a.status === "active").length
  const totalSpend = insights?.data?.[0]?.spend
    ? parseFloat(insights.data[0].spend)
    : 0
  const openIssues = dashboard?.stats?.open_issues ?? 0
  const activeCampaigns = dashboard?.stats?.active_campaigns ?? 0

  const stats = [
    {
      label: "Agentes Ativos",
      value: activeAgents.toString(),
      description: `de ${agents.length} configurados`,
      icon: Bot,
    },
    {
      label: "Campanhas Ativas",
      value: activeCampaigns.toString(),
      description: "Meta Ads",
      icon: Megaphone,
    },
    {
      label: "Spend Total",
      value: totalSpend.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      description: "Ultimos 30 dias",
      icon: DollarSign,
    },
    {
      label: "Issues Abertas",
      value: openIssues.toString(),
      description: "Paperclip",
      icon: AlertCircle,
    },
  ]

  const activities = dashboard?.activities ?? []

  if (loading) {
    return (
      <>
        <Header title="Painel" />
        <div className="space-y-6">
          <div>
            <div className="mb-3 h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-lg border bg-card"
                />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-3 h-3 w-32 animate-pulse rounded bg-muted" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-lg border bg-card"
                />
              ))}
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error && !dashboard && !insights) {
    return (
      <>
        <Header title="Painel" />
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Header title="Painel" />

      <div className="space-y-6">
        {/* Agents Section */}
        <section>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            AGENTES
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {agents.slice(0, 5).map((agent) => (
              <div
                key={agent.id}
                className="rounded-lg border bg-card p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{agent.name}</p>
                  <span
                    className={`size-2 rounded-full ${statusColor(agent.status)}`}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {agent.role}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {statusLabel(agent.status)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Metrics Section */}
        <section>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            METRICAS 30D
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {stat.label}
                  </p>
                  <stat.icon className="size-4 text-muted-foreground" />
                </div>
                <p className="mt-2 font-montserrat text-2xl font-semibold tracking-tight">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity Section */}
        <section>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            ATIVIDADE RECENTE
          </p>
          <div className="rounded-lg border bg-card">
            {activities.length > 0 ? (
              <ul className="divide-y">
                {activities.map((activity) => (
                  <li key={activity.id} className="px-4 py-3">
                    <p className="text-sm">{activity.description}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {new Date(activity.created_at).toLocaleString("pt-BR")}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhuma atividade recente
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  )
}
