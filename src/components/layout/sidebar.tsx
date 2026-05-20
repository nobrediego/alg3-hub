"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  Building2,
  Megaphone,
  Bot,
  Palette,
  MessageSquare,
  Settings,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./theme-toggle"

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
      { name: "Design", href: "/design", icon: Palette },
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

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <>
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
                      onClick={onNavigate}
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

      <div className="border-t px-4 py-3 flex items-center justify-between">
        <p className="text-[10px] text-sidebar-muted">ALG3 Hub v1.0</p>
        <ThemeToggle />
      </div>
    </>
  )
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-50 flex size-10 items-center justify-center rounded-md border bg-card lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r bg-sidebar transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between px-4">
          <span className="font-montserrat text-xl font-bold text-sidebar-foreground">
            ALG3
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            className="flex size-8 items-center justify-center rounded-md text-sidebar-muted hover:text-sidebar-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        <SidebarContent onNavigate={() => setMobileOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex h-screen w-60 flex-col border-r bg-sidebar">
        <div className="flex h-14 items-center px-4">
          <span className="font-montserrat text-xl font-bold text-sidebar-foreground">
            ALG3
          </span>
        </div>
        <SidebarContent />
      </aside>
    </>
  )
}
