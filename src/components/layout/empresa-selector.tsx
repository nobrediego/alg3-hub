"use client"

import { useEmpresa } from "@/contexts/empresa-context"
import { Badge } from "@/components/ui/badge"

export function EmpresaSelector() {
  const { empresas, selectedEmpresa, setSelectedEmpresa } = useEmpresa()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value
    if (!id) {
      setSelectedEmpresa(null)
      return
    }
    const empresa = empresas.find((emp) => emp.id === id)
    if (empresa) setSelectedEmpresa(empresa)
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedEmpresa?.id ?? ""}
        onChange={handleChange}
        className="h-9 rounded-md border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">Todas as empresas</option>
        {empresas.map((empresa) => (
          <option key={empresa.id} value={empresa.id}>
            {empresa.nome}
          </option>
        ))}
      </select>
      {selectedEmpresa && (
        <Badge variant="secondary" className="text-xs">
          {selectedEmpresa.setor}
        </Badge>
      )}
    </div>
  )
}
