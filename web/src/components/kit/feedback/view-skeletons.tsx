import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface DataTableSkeletonProps {
  embedded?: boolean
  filterCount?: number
  columnCount?: number
  rowCount?: number
}

/** Matches DataTableToolbar + table + DataTablePagination layout. */
export function DataTableSkeleton({
  embedded = false,
  filterCount = 2,
  columnCount = 5,
  rowCount = 8,
}: DataTableSkeletonProps) {
  return (
    <div className={embedded ? "space-y-3" : "space-y-3 p-4 sm:p-6"}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {Array.from({ length: filterCount }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full sm:w-48" />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="size-8 shrink-0" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="flex items-center gap-4 border-b bg-muted/50 px-2 py-2.5">
          <Skeleton className="size-4 shrink-0 rounded-sm" />
          {Array.from({ length: columnCount }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-16 shrink-0" />
          ))}
          <Skeleton className="ml-auto size-4 shrink-0 rounded-sm" />
        </div>
        <div className="divide-y">
          {Array.from({ length: rowCount }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-2 py-2.5">
              <Skeleton className="size-4 shrink-0 rounded-sm" />
              {Array.from({ length: columnCount }).map((_, j) => (
                <Skeleton
                  key={j}
                  className={cn("h-3 shrink-0", j === 0 ? "w-32" : "w-20")}
                />
              ))}
              <Skeleton className="ml-auto size-4 shrink-0 rounded-sm" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-16" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-20" />
          <div className="flex items-center gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="size-7 shrink-0" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface FormViewSkeletonProps {
  embedded?: boolean
  fieldCount?: number
}

/** Matches DocForm toolbar + card section grid. */
export function FormViewSkeleton({
  embedded = true,
  fieldCount = 6,
}: FormViewSkeletonProps) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="sticky top-0 z-10 flex h-12 items-center justify-between gap-3 border-b bg-background px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Skeleton className="size-8 shrink-0 rounded-md" />
          {!embedded ? <Skeleton className="h-4 w-44" /> : null}
        </div>
        <Skeleton className="h-8 w-24 shrink-0" />
      </div>

      <div className={cn("flex-1 space-y-4", embedded ? "pt-2" : "p-4 sm:p-6")}>
        <div className="rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm sm:p-5">
          <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
            {Array.from({ length: fieldCount }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Page-level notification list (`variant="page"`). */
export function NotificationPageSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-9 w-full sm:w-[220px]" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="space-y-8">
        <div className="space-y-3">
          <Skeleton className="h-3 w-16" />
          <div className="space-y-2">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex gap-3 rounded-xl border p-4">
                <Skeleton className="size-10 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3.5 w-full" />
                  <div className="flex items-center gap-2 pt-0.5">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Header inbox dropdown (`variant="inbox"`). */
export function NotificationInboxSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex gap-3 border-b border-border/60 px-3 py-3 last:border-0"
        >
          <Skeleton className="size-9 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Dashboard recent notifications (`variant="compact"`). */
export function NotificationCompactSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 rounded-lg px-1 py-2">
          <Skeleton className="mt-1.5 size-8 shrink-0 rounded-md" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-4/5" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-2.5 w-16" />
          </div>
          <Skeleton className="mt-2 size-2 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  )
}

/** Settings profile section. */
export function SettingsProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Skeleton className="size-20 shrink-0 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid max-w-md gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="grid gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

/** Settings notification preferences table. */
export function SettingsNotificationPrefsSkeleton({ rowCount = 4 }: { rowCount?: number }) {
  return (
    <div className="max-w-2xl overflow-hidden rounded-lg border">
      <div className="grid grid-cols-[1fr_6rem_6rem] border-b bg-muted/40 px-4 py-3">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="mx-auto h-3.5 w-10" />
        <Skeleton className="mx-auto h-3.5 w-12" />
      </div>
      {Array.from({ length: rowCount }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_6rem_6rem] items-center border-b px-4 py-4 last:border-0"
        >
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-52" />
          </div>
          <Skeleton className="mx-auto size-5 rounded-full" />
          <Skeleton className="mx-auto size-5 rounded-full" />
        </div>
      ))}
    </div>
  )
}

/** Page builder three-column shell while page/blocks load. */
export function PageBuilderSkeleton() {
  return (
    <div className="flex flex-1 min-h-0">
      <div className="flex w-56 shrink-0 flex-col border-r bg-muted/20">
        <div className="border-b px-3 py-2">
          <Skeleton className="h-3 w-12" />
        </div>
        <div className="space-y-0.5 p-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 rounded-md px-2.5 py-1.5">
              <Skeleton className="size-3 shrink-0" />
              <Skeleton className="h-3.5 flex-1" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-muted/10 p-6">
        <div className="mx-auto max-w-2xl space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3.5"
            >
              <Skeleton className="h-3 w-5 shrink-0" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
              <div className="flex shrink-0 gap-0.5">
                <Skeleton className="size-7 rounded-lg" />
                <Skeleton className="size-7 rounded-lg" />
                <Skeleton className="size-7 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex w-56 shrink-0 flex-col border-l bg-muted/20">
        <div className="border-b px-3 py-2">
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex flex-1 items-center justify-center p-3">
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  )
}

/** Quick access panel link cards on the dashboard. */
export function QuickAccessSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-lg border border-border/50 bg-background p-4"
        >
          <Skeleton className="size-8 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}
