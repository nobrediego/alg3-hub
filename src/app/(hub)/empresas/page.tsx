import { Header } from "@/components/layout/header"
import { Building2 } from "lucide-react"

const companies = [
  { name: "Top Prime Seguros e Saude", setor: "Seguros", status: "ativa" },
  { name: "Top Prime Vida e Previdencia", setor: "Seguros", status: "ativa" },
  { name: "Top Prime Seguros Patrimoniais", setor: "Seguros", status: "ativa" },
  { name: "Top Prime Consorcios e Investimentos", setor: "Financeiro", status: "ativa" },
  { name: "RedeCORR", setor: "Corretora", status: "ativa" },
  { name: "GDA Sistemas", setor: "Tecnologia", status: "ativa" },
  { name: "Plano A Administradora", setor: "Administracao", status: "ativa" },
  { name: "Clinica Salut", setor: "Saude", status: "ativa" },
  { name: "Laboratorio Giovani", setor: "Saude", status: "ativa" },
] as const

function statusColor(status: string) {
  switch (status) {
    case "ativa":
      return "bg-green-500"
    case "erro":
      return "bg-red-500"
    case "pausa":
      return "bg-amber-500"
    default:
      return "bg-gray-400"
  }
}

export default function EmpresasPage() {
  return (
    <>
      <Header title="Empresas" description="Empresas do grupo ALG3" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <div key={company.name} className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{company.name}</p>
                <span className="mt-2 inline-block rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                  {company.setor}
                </span>
              </div>
              <Building2 className="size-4 shrink-0 text-muted-foreground" />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span
                className={`size-2 rounded-full ${statusColor(company.status)}`}
              />
              <span className="text-xs capitalize text-muted-foreground">
                {company.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
