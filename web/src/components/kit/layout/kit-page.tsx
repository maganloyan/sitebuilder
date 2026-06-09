import { cn } from "@/lib/utils"

/** Page content shell — copy with your layout. */
export function KitPage({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("@container/main flex flex-col gap-4 md:gap-6", className)}>
      {children}
    </div>
  )
}
