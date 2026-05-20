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
  title: string
  role: string
  status: string
}

interface DashboardStats {
  agents?: { active: number; running: number; paused: number; error: number }
  tasks?: { open: number; inProgress: number; blocked: number; done: number }
  costs?: { monthSpendCents: number; monthBudgetCents: number }
  runActivity?: Array<{ date: string; succeeded: number; failed: number; total: number }>
}

interface InsightsData {
  data?: Array<{
    spend: string
    impressions: string
    clicks: string
  }>
}

function statusColor(status: string) {
  switch (status) {
    case "idle":
      return "bg-green-500"
    case "running":
      return "bg-blue-500"
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
    case "idle":
      return "Disponivel"
    case "running":
      return "Executando"
    case "error":
      return "Erro"
    case "paused":
      return "Pausado"
    default:
      return "Inativo"
  }
}

export default function PainelPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [dashboard, setDashboard] = useState<DashboardStats | null>(null)
  const [insights, setInsights] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [agentsRes, dashRes, insightsRes] = await Promise.allSettled([
          fetch("/api/paperclip/agents"),
          fetch("/api/paperclip/dashboard"),
          fetch("/api/meta/insights?account_id=senai"),
        ])

        if (agentsRes.status === "fulfilled" && agentsRes.value.ok) {
          const data = await agentsRes.value.json()
          setAgents(Array.isArray(data) ? data : [])
        }

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

  const activeAgents = dashboard?.agents?.active ?? agents.filter((a) => a.status === "idle" || a.status === "running").length
  const totalAgents = agents.length || (dashboard?.agents ? Object.values(dashboard.agents).reduce((a, b) => a + b, 0) : 0)
  const totalSpend = insights?.data?.[0]?.spend
    ? parseFloat(insights.data[0].spend)
    : 0
  const openIssues = dashboard?.tasks?.open ?? 0

  const stats = [
    {
      label: "Agentes Ativos",
      value: activeAgents.toString(),
      description: `de ${totalAgents} configurados`,
      icon: Bot,
    },
    {
      label: "Campanhas Ativas",
      value: insights ? "Conectado" : "—",
      description: "Meta Ads SENAI",
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

  const recentActivity = (dashboard?.runActivity ?? [])
    .filter((r) => r.total > 0)
    .slice(0, 5)

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

  if (error && agents.length === 0 && !dashboard && !insights) {
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
            {agents.length > 0 ? (
              agents.map((agent) => (
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
                    {agent.title || agent.role}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {statusLabel(agent.status)}
                  </p>
                </div>
              ))
            ) : (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-card p-4">
                  <p className="text-sm text-muted-foreground">Sem conexao com Paperclip</p>
                </div>
              ))
            )}
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
            {recentActivity.length > 0 ? (
              <ul className="divide-y">
                {recentActivity.map((run) => (
                  <li key={run.date} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm">{run.date}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {run.succeeded} sucesso, {run.failed} falha
                      </p>
                    </div>
                    <p className="text-sm font-medium">{run.total} runs</p>
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
