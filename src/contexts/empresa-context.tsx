"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type EmpresaStatus = "ativa" | "inativa"

export interface Empresa {
  id: string
  nome: string
  setor: string
  status: EmpresaStatus
}

export const EMPRESAS: Empresa[] = [
  { id: "top-prime-seguros", nome: "Top Prime Seguros e Saude", setor: "Seguros", status: "ativa" },
  { id: "top-prime-vida", nome: "Top Prime Vida e Previdencia", setor: "Seguros", status: "ativa" },
  { id: "top-prime-patrimoniais", nome: "Top Prime Seguros Patrimoniais", setor: "Seguros", status: "ativa" },
  { id: "top-prime-consorcios", nome: "Top Prime Consorcios e Investimentos", setor: "Financeiro", status: "ativa" },
  { id: "redecorr", nome: "RedeCORR", setor: "Corretora", status: "ativa" },
  { id: "gda-sistemas", nome: "GDA Sistemas", setor: "Tecnologia", status: "ativa" },
  { id: "plano-a", nome: "Plano A Administradora", setor: "Administracao", status: "ativa" },
  { id: "clinica-salut", nome: "Clinica Salut", setor: "Saude", status: "ativa" },
  { id: "lab-giovani", nome: "Laboratorio Giovani", setor: "Saude", status: "ativa" },
]

interface EmpresaContextValue {
  empresas: Empresa[]
  selectedEmpresa: Empresa | null
  setSelectedEmpresa: (empresa: Empresa | null) => void
}

const EmpresaContext = createContext<EmpresaContextValue | undefined>(undefined)

const STORAGE_KEY = "alg3-hub-selected-empresa"

export function EmpresaProvider({ children }: { children: ReactNode }) {
  const [selectedEmpresa, setSelectedEmpresaState] = useState<Empresa | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const found = EMPRESAS.find((e) => e.id === stored)
      if (found) setSelectedEmpresaState(found)
    }
    setHydrated(true)
  }, [])

  function setSelectedEmpresa(empresa: Empresa | null) {
    setSelectedEmpresaState(empresa)
    if (empresa) {
      localStorage.setItem(STORAGE_KEY, empresa.id)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  if (!hydrated) return null

  return (
    <EmpresaContext value={{ empresas: EMPRESAS, selectedEmpresa, setSelectedEmpresa }}>
      {children}
    </EmpresaContext>
  )
}

export function useEmpresa() {
  const ctx = useContext(EmpresaContext)
  if (!ctx) {
    throw new Error("useEmpresa must be used within an EmpresaProvider")
  }
  return ctx
}
