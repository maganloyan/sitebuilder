import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CommandTrigger({
  onClick,
  className,
}: {
  onClick?: () => void
  className?: string
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "hidden h-8 w-48 justify-start gap-2 text-muted-foreground md:flex",
        className
      )}
      onClick={onClick}
    >
      <Search className="size-4" />
      <span className="text-xs">Search…</span>
      <kbd className="pointer-events-none ml-auto hidden rounded border bg-muted px-1 font-mono text-[10px] lg:inline">
        ⌘K
      </kbd>
    </Button>
  )
}
