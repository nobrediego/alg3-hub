"use client"

import { useEffect, useState, useCallback } from "react"
import { Header } from "@/components/layout/header"
import {
  DollarSign,
  Eye,
  MousePointerClick,
  Percent,
  TrendingDown,
  BarChart3,
} from "lucide-react"

const ACCOUNTS = [
  { id: "senai", name: "SENAI NOVA" },
  { id: "sesi", name: "SESI AMAZONAS" },
  { id: "sesi_escola", name: "SESI ESCOLA" },
  { id: "sesi_saude", name: "SESI SAUDE" },
  { id: "sesi_lazer", name: "SESI LAZER" },
]

interface InsightsRow {
  spend: string
  impressions: string
  clicks: string
  ctr: string
  cpc: string
  cpm: string
}

interface Campaign {
  id: string
  name: string
  status: string
  objective: string
}

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function formatNumber(value: number): string {
  return value.toLocaleString("pt-BR")
}

function campaignStatusColor(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-green-500"
    case "PAUSED":
      return "bg-amber-500"
    case "DELETED":
    case "ARCHIVED":
      return "bg-gray-400"
    default:
      return "bg-gray-400"
  }
}

function campaignStatusBadge(status: string) {
  const colorMap: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    PAUSED: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    DELETED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    ARCHIVED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  }
  return colorMap[status] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
}

export default function CampanhasPage() {
  const [accountId, setAccountId] = useState(ACCOUNTS[0].id)
  const [insights, setInsights] = useState<InsightsRow | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAccountData = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const [insightsRes, campaignsRes] = await Promise.allSettled([
        fetch(`/api/meta/insights?account_id=${id}`),
        fetch(`/api/meta/campaigns?account_id=${id}`),
      ])

      if (insightsRes.status === "fulfilled" && insightsRes.value.ok) {
        const data = await insightsRes.value.json()
        setInsights(data.data?.[0] ?? null)
      } else {
        setInsights(null)
      }

      if (campaignsRes.status === "fulfilled" && campaignsRes.value.ok) {
        const data = await campaignsRes.value.json()
        setCampaigns(data.data ?? [])
      } else {
        setCampaigns([])
      }
    } catch {
      setError("Erro ao carregar dados da conta")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAccountData(accountId)
  }, [accountId, fetchAccountData])

  const spend = insights ? parseFloat(insights.spend) : 0
  const impressions = insights ? parseInt(insights.impressions, 10) : 0
  const clicks = insights ? parseInt(insights.clicks, 10) : 0
  const ctr = insights ? parseFloat(insights.ctr) : 0
  const cpc = insights ? parseFloat(insights.cpc) : 0
  const cpm = insights ? parseFloat(insights.cpm) : 0

  const metrics = [
    { label: "Spend", value: formatBRL(spend), icon: DollarSign },
    { label: "Impressoes", value: formatNumber(impressions), icon: Eye },
    { label: "Clicks", value: formatNumber(clicks), icon: MousePointerClick },
    { label: "CTR", value: `${ctr.toFixed(2)}%`, icon: Percent },
    { label: "CPC", value: formatBRL(cpc), icon: TrendingDown },
    { label: "CPM", value: formatBRL(cpm), icon: BarChart3 },
  ]

  return (
    <>
      <Header title="Campanhas" description="Meta Ads — dados reais" />

      {/* Account selector */}
      <div className="mb-6">
        <label
          htmlFor="account-select"
          className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
        >
          CONTA
        </label>
        <select
          id="account-select"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          className="rounded-lg border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          {ACCOUNTS.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      )}

      {/* Metrics row */}
      <section className="mb-6">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          METRICAS 30D
        </p>
        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-lg border bg-card"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {m.label}
                  </p>
                  <m.icon className="size-4 text-muted-foreground" />
                </div>
                <p className="mt-2 font-montserrat text-lg font-semibold tracking-tight">
                  {m.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Campaigns table */}
      <section>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          CAMPANHAS
        </p>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-lg border bg-card"
              />
            ))}
          </div>
        ) : campaigns.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Objetivo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="px-4 py-3 font-medium">{campaign.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className={`size-2 rounded-full ${campaignStatusColor(campaign.status)}`}
                        />
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${campaignStatusBadge(campaign.status)}`}
                        >
                          {campaign.status}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {campaign.objective?.replace(/_/g, " ") || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border bg-card px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma campanha encontrada para esta conta
            </p>
          </div>
        )}
      </section>
    </>
  )
}
