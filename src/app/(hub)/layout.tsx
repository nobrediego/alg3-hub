import { Sidebar } from "@/components/layout/sidebar"
import { EmpresaProvider } from "@/contexts/empresa-context"

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <EmpresaProvider>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 pt-14 lg:p-6 lg:pt-6 lg:pl-6">
          {children}
        </main>
      </div>
    </EmpresaProvider>
  )
}
