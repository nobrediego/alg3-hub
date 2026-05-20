"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Palette, ImagePlus, Wand2, Download, Loader2 } from "lucide-react"

type Provider = "canva" | "lovart" | "gpt-image"

interface GenerationResult {
  id: string
  provider: Provider
  imageUrl?: string
  status: string
  prompt: string
}

const providers: Array<{
  id: Provider
  name: string
  description: string
  icon: typeof Palette
}> = [
  {
    id: "canva",
    name: "Canva",
    description: "Designs profissionais com templates e export",
    icon: Palette,
  },
  {
    id: "lovart",
    name: "Lovart AI",
    description: "Geracao de design com estilos artisticos",
    icon: Wand2,
  },
  {
    id: "gpt-image",
    name: "GPT Image",
    description: "Imagens via OpenAI gpt-image-1",
    icon: ImagePlus,
  },
]

const sizeOptions = [
  { label: "1024 x 1024", value: "1024x1024" },
  { label: "1024 x 1536", value: "1024x1536" },
  { label: "1536 x 1024", value: "1536x1024" },
]

const styleOptions = [
  "bold-modern",
  "minimal",
  "elegant",
  "playful",
  "vintage",
  "corporate",
  "geometric",
  "neon",
  "tech",
  "luxury",
  "flat",
]

const formatOptions = ["png", "jpg", "webp"]

export default function DesignPage() {
  const [provider, setProvider] = useState<Provider>("gpt-image")
  const [prompt, setPrompt] = useState("")
  const [size, setSize] = useState("1024x1024")
  const [style, setStyle] = useState("bold-modern")
  const [format, setFormat] = useState("png")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<GenerationResult[]>([])
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    if (!prompt.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/design/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          prompt,
          options: { size, style, format },
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? "Erro ao gerar design")
      }

      const imageUrl =
        data.result?.images?.[0]?.url ??
        data.result?.imageUrl ??
        data.result?.thumbnailUrl ??
        null

      setResults((prev) => [
        {
          id: data.id ?? `gen_${Date.now()}`,
          provider: data.provider,
          imageUrl,
          status: data.status,
          prompt,
        },
        ...prev,
      ])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header title="Design" description="Crie criativos com AI" />

      {/* Provider cards */}
      <div className="mb-6">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          PROVIDERS
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {providers.map((p) => {
            const isSelected = provider === p.id
            const Icon = p.icon
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setProvider(p.id)}
                className={`rounded-lg border bg-card p-4 text-left transition-colors ${
                  isSelected
                    ? "border-foreground"
                    : "border-border hover:border-foreground/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="size-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">{p.name}</span>
                  <span
                    className={`ml-auto size-2 rounded-full ${
                      isSelected ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {p.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Input section */}
      <div className="mb-6 rounded-lg border bg-card p-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          PROMPT
        </p>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Descreva o design que deseja criar..."
          rows={3}
          className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />

        {/* Options row */}
        <div className="mt-4 flex flex-wrap items-end gap-4">
          {/* Provider selector */}
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Provider
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as Provider)}
              className="rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Size */}
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Tamanho
            </label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {sizeOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Style (lovart) */}
          {provider === "lovart" && (
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Estilo
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {styleOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Format */}
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Formato
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {formatOptions.map((f) => (
                <option key={f} value={f}>
                  {f.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Generate button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="ml-auto flex items-center gap-2 rounded-md bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Wand2 className="size-4" />
            )}
            {loading ? "Gerando..." : "Gerar"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-card p-4">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Results gallery */}
      {results.length > 0 && (
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            RESULTADOS
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.map((result) => (
              <div
                key={result.id}
                className="overflow-hidden rounded-lg border bg-card"
              >
                {result.imageUrl ? (
                  <div className="relative aspect-square bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={result.imageUrl}
                      alt={result.prompt}
                      className="size-full object-cover"
                    />
                    <a
                      href={result.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-2 right-2 rounded-md bg-background/80 p-1.5 backdrop-blur-sm transition-colors hover:bg-background"
                    >
                      <Download className="size-4" />
                    </a>
                  </div>
                ) : (
                  <div className="flex aspect-square items-center justify-center bg-muted">
                    <p className="text-xs text-muted-foreground">
                      {result.status === "processing"
                        ? "Processando..."
                        : "Sem preview"}
                    </p>
                  </div>
                )}
                <div className="p-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`size-2 rounded-full ${
                        result.status === "completed"
                          ? "bg-green-500"
                          : result.status === "failed"
                            ? "bg-red-500"
                            : "bg-amber-500"
                      }`}
                    />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {result.provider}
                    </span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
                    {result.prompt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {results.length === 0 && !loading && (
        <div className="rounded-lg border bg-card px-4 py-12 text-center">
          <ImagePlus className="mx-auto size-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">
            Nenhum design gerado ainda
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Escreva um prompt e clique em Gerar
          </p>
        </div>
      )}

      {/* Loading state */}
      {loading && results.length === 0 && (
        <div className="rounded-lg border bg-card px-4 py-12 text-center">
          <Loader2 className="mx-auto size-8 animate-spin text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">
            Gerando design...
          </p>
        </div>
      )}
    </>
  )
}
