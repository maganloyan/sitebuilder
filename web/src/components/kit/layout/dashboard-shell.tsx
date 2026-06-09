import { cn } from "@/lib/utils"

/** @deprecated Use dashboard header meta; only for optional content spacing. */
export interface DashboardShellProps {
  children: React.ReactNode
  className?: string
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  return <div className={cn("flex flex-col gap-4", className)}>{children}</div>
}
