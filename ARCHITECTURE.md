# ALG3 Hub — Arquitetura

## Visao Geral
Centro de comando unico da holding ALG3. Unifica gestao de campanhas (Meta Ads real), agentes AI (Paperclip), tracking (Utmify), design (Canva/Lovart/GPT Image) e chat AI num unico hub clean e funcional.

## Stack
- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript (strict)
- **Styling**: Tailwind CSS 4 + CSS Variables
- **Componentes**: shadcn/ui
- **Fonte**: Montserrat (headings) + Inter (body)
- **Auth**: Supabase Auth
- **Banco**: Supabase PostgreSQL
- **Agentes**: Paperclip API (localhost:3100)
- **Ads**: Meta Marketing API v21.0
- **AI Chat**: OpenAI GPT-4o (primary) + OpenRouter (fallback)
- **Tracking**: Utmify API
- **Design**: Canva API + Lovart API + OpenAI gpt-image-1

## Design System

### Cores (OKLCH — warm neutrals)
```
Light:
  background:  oklch(0.985 0.003 80)   — off-white quente
  foreground:  oklch(0.18 0.01 60)     — quase preto quente
  card:        oklch(1 0 0)            — branco puro
  border:      oklch(0.915 0.005 80)   — cinza quente sutil
  muted:       oklch(0.48 0.01 60)     — cinza medio
  accent:      oklch(0.955 0.005 80)   — highlight sutil

Dark:
  background:  oklch(0.13 0.005 60)
  foreground:  oklch(0.92 0.005 80)
  card:        oklch(0.17 0.005 60)
  border:      oklch(0.24 0.005 60)
```

### Tipografia
```
Headings:  Montserrat 600/700
Body:      Inter 400/500
Mono:      JetBrains Mono
Sizes:     text-xs(0.75) text-sm(0.875) text-base(1) text-lg(1.125) text-xl(1.25) text-2xl(1.5)
```

### Espacamento
```
Radius:    0.625rem (10px)
Padding:   p-4 (cards), p-6 (sections), p-8 (page)
Gap:       gap-3 (items), gap-4 (cards), gap-6 (sections)
```

### Principios de UI
- Sem gradientes. Sem glassmorphism. Sem sombras pesadas.
- Bordas de 1px sutis. Cards brancos com hover sutil (shadow-sm).
- Section headers: uppercase, letter-spacing, text-xs, font-semibold, text-muted.
- Status: dots coloridos (green=ativo, red=erro, amber=pausa, gray=inativo).
- Icones: Lucide, 16px (size-4) ou 20px (size-5). Cor muted-foreground.
- Sem emojis no UI. Texto clean.

## Estrutura de Pastas
```
alg3-hub/
  src/
    app/
      layout.tsx              — root layout (fonts, theme, providers)
      globals.css             — design tokens + minimal effects
      (auth)/
        login/page.tsx
      (hub)/
        layout.tsx            — sidebar + main area
        page.tsx              — Painel (dashboard)
        empresas/page.tsx     — Empresas da holding
        campanhas/page.tsx    — Meta Ads real data
        agentes/page.tsx      — Paperclip agents
        chat/page.tsx         — AI Chat (persistent)
        config/page.tsx       — Settings + diagnostics
    components/
      ui/                     — shadcn components
      layout/
        sidebar.tsx           — Sidebar navigation
        header.tsx            — Page header
      dashboard/
        stats-card.tsx
        activity-feed.tsx
        agent-status.tsx
        campaign-summary.tsx
    lib/
      supabase/
        client.ts
        server.ts
      api/
        meta-ads.ts           — Meta Marketing API wrapper
        paperclip.ts          — Paperclip API wrapper
        utmify.ts             — Utmify API wrapper
        canva.ts              — Canva API wrapper
        lovart.ts             — Lovart API wrapper
      chat/
        route-handler.ts      — Chat API logic
        model-router.ts       — Model selection
      utils.ts
    types/
      index.ts                — All TypeScript types
    contexts/
      empresa-context.tsx     — Selected company context
```

## Paginas

### 1. Painel (/)
Layout estilo Paperclip dashboard:
- Header: "PAINEL" uppercase
- Secao AGENTES: status dos 5 agentes (idle/running/error)
- Stats: Agentes ativos, Campanhas ativas, Spend total 30d, Issues abertas
- Execucoes recentes e questoes por prioridade (Paperclip data)
- Atividade recente (timeline de acoes)

### 2. Empresas (/empresas)
- Grid das 9 empresas do grupo ALG3
- Cada card: nome, setor, status, conta Meta vinculada
- Click abre detalhes da empresa (campanhas, metricas)

### 3. Campanhas (/campanhas)
- Dados REAIS do Meta Ads API (nao mock)
- Seletor de conta (SENAI, SESI AM, SESI Escola, SESI Saude, SESI Lazer)
- Metricas 30d: spend, impressions, clicks, CTR, CPC, CPM
- Lista de campanhas ativas com status e metricas
- Filtros por status, objetivo

### 4. Agentes (/agentes)
- 5 agentes do Paperclip com status real-time
- Cada agente: nome, role, capabilities, knowledge base size
- Issues atribuidas a cada agente
- Criar nova issue/tarefa para agente

### 5. Chat (/chat)
- Chat com AI persistente (localStorage)
- Modelo: GPT-4o (rapido, com tools)
- Tools: consultar dados, criar campanhas, criar tarefas, Meta Ads insights
- Botao limpar conversa
- Selector de modelo (GPT-4o, Claude, free)

### 6. Config (/config)
- Status de todas as integracoes (Meta, Supabase, Paperclip, Utmify, Canva, Lovart)
- Diagnostico do banco
- Tokens e chaves (mascaradas)

## APIs Internas

### GET /api/meta/insights
Query Meta Ads API real. Params: account_id, date_preset, fields.

### GET /api/meta/campaigns
Lista campanhas reais de uma conta. Params: account_id, status, limit.

### GET /api/paperclip/agents
Proxy para Paperclip /api/companies/{id}/agents.

### GET /api/paperclip/dashboard
Proxy para Paperclip /api/companies/{id}/dashboard.

### POST /api/paperclip/issues
Cria issue no Paperclip.

### POST /api/chat
Chat AI com tool calling. Fallback chain: GPT-4o -> OpenRouter.

### GET /api/utmify/sales
Proxy para Utmify API.

## Empresas do Grupo ALG3
1. Top Prime Seguros e Saude
2. Top Prime Vida e Previdencia
3. Top Prime Seguros Patrimoniais
4. Top Prime Consorcios e Investimentos
5. RedeCORR
6. GDA Sistemas
7. Plano A Administradora
8. Clinica Salut
9. Laboratorio Giovani

## Contas Meta Ads
- SENAI NOVA: act_1318032568658074 (8 campanhas ativas, R$11.6k/30d)
- SESI AMAZONAS: act_103647143172752 (94 campanhas ativas)
- SESI ESCOLA: act_172742621703309 (2 campanhas ativas, R$597/30d)
- SESI SAUDE: act_447781743367534 (0 campanhas ativas)
- SESI LAZER: act_198656655774871 (6 campanhas ativas, R$3.7k/30d)

## Agentes Paperclip
- Meta Ads Manager (claude-opus-4-6) — 45K chars knowledge
- Canva Designer (claude-sonnet-4-6) — 23K chars knowledge
- GPT Image Creator (o4-mini) — 23K chars knowledge
- Lovart AI Designer (claude-sonnet-4-6) — 23K chars knowledge
- Utmify Tracker (claude-haiku-4-5) — 44K chars knowledge
