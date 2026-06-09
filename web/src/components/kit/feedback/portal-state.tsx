import { AlertCircle, Inbox, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PortalStateProps {
  title: string
  description?: string
  className?: string
  action?: React.ReactNode
}

export function PortalErrorState({
  title,
  description,
  className,
  onRetry,
}: PortalStateProps & { onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-6 py-10 text-center",
        className
      )}
    >
      <AlertCircle className="size-8 text-destructive" aria-hidden />
      <div className="space-y-1">
        <p className="font-medium text-sm">{title}</p>
        {description ? (
          <p className="max-w-md text-muted-foreground text-sm">{description}</p>
        ) : null}
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="mr-2 size-3.5" />
          Try again
        </Button>
      ) : null}
    </div>
  )
}

export function PortalEmptyState({
  title,
  description,
  className,
  action,
}: PortalStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-12 text-center",
        className
      )}
    >
      <Inbox className="size-8 text-muted-foreground" aria-hidden />
      <div className="space-y-1">
        <p className="font-medium text-sm">{title}</p>
        {description ? (
          <p className="max-w-md text-muted-foreground text-sm">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}
