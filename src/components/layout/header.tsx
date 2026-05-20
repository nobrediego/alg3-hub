import { EmpresaSelector } from "@/components/layout/empresa-selector"

interface HeaderProps {
  title: string
  description?: string
  showEmpresaSelector?: boolean
}

export function Header({ title, description, showEmpresaSelector }: HeaderProps) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="font-montserrat text-lg font-semibold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {showEmpresaSelector && <EmpresaSelector />}
    </div>
  )
}
