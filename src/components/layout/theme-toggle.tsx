"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("alg3-theme")
    if (stored === "dark") {
      document.documentElement.classList.add("dark")
      setDark(true)
    }
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    if (next) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("alg3-theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("alg3-theme", "light")
    }
  }

  return (
    <button
      onClick={toggle}
      className="flex size-8 items-center justify-center rounded-md text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
      title={dark ? "Modo claro" : "Modo escuro"}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  )
}
