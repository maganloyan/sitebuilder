import { BellOff } from "lucide-react"

import { cn } from "@/lib/utils"

export function NotificationEmptyState({
  title = "You're all caught up",
  description = "New portal activity will show up here.",
  className,
  compact = false,
}: {
  title?: string
  description?: string
  className?: string
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center text-muted-foreground",
        compact ? "gap-1.5 px-4 py-8" : "gap-3 px-6 py-14",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-muted",
          compact ? "size-10" : "size-14"
        )}
      >
        <BellOff className={cn(compact ? "size-4" : "size-6", "opacity-60")} />
      </div>
      <div className="space-y-1">
        <p className={cn("font-medium text-foreground", compact ? "text-sm" : "text-base")}>
          {title}
        </p>
        <p className={cn("max-w-xs", compact ? "text-xs" : "text-sm")}>{description}</p>
      </div>
    </div>
  )
}
