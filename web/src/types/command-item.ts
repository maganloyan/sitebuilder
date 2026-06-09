import type { LucideIcon } from "lucide-react"

export interface CommandMenuItem {
  id: string
  group: string
  label: string
  keywords?: string
  href?: string
  onSelect?: () => void
  icon?: LucideIcon
  description?: string
}
