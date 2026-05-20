"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Building2,
  Megaphone,
  Bot,
  MessageSquare,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navGroups = [
  {
    label: "NAVEGACAO",
    items: [
      { name: "Painel", href: "/", icon: LayoutDashboard },
      { name: "Empresas", href: "/empresas", icon: Building2 },
      { name: "Campanhas", href: "/campanhas", icon: Megaphone },
    ],
  },
  {
    label: "FERRAMENTAS",
    items: [
      { name: "Agentes", href: "/agentes", icon: Bot },
      { name: "Chat", href: "/chat", icon: MessageSquare },
    ],
  },
  {
    label: "SISTEMA",
    items: [
      { name: "Config", href: "/config", icon: Settings },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-60 flex-col border-r bg-sidebar">
      <div className="flex h-14 items-center px-4">
        <span className="font-montserrat text-xl font-bold text-sidebar-foreground">
          ALG3
        </span>
      </div>

      <nav className="flex-1 space-y-6 px-2 py-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-muted">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href)

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}
                    >
                      <item.icon className="size-4" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t px-4 py-3">
        <p className="text-[10px] text-sidebar-muted">ALG3 Hub v1.0</p>
      </div>
    </aside>
  )
}
