import { Search } from "lucide-react"

import { KitBreadcrumbs } from "@/components/kit/layout/kit-breadcrumbs"
import { CommandTrigger } from "@/components/kit"
import { usePortalCommandPalette } from "@/portal/PortalCommandPalette"
import { NotificationInbox } from "@/components/kit"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  usePortalHeaderAction,
  usePortalPageMeta,
} from "@/context/portal-page-meta-context"
import { usePortalNotifications } from "@/hooks/use-portal-notifications"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/lib/ModeToggle"

export function DashboardHeader() {
  const { setOpen } = usePortalCommandPalette()
  const { notifications, markAllRead, markAsRead, isLoading } = usePortalNotifications()
  const { title, description, breadcrumbs } = usePortalPageMeta()
  const headerAction = usePortalHeaderAction()

  const showBreadcrumbs = breadcrumbs && breadcrumbs.length > 1

  return (
    <header className="flex shrink-0 flex-col gap-2 border-b bg-background px-4 py-3 lg:px-6  h-(--header-height) rounded-t-xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <SidebarTrigger className="-ml-1 shrink-0" />
          <Separator
            orientation="vertical"
            className="hidden sm:block data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-center"
          />
          <div className="min-w-0 flex-1">
            {showBreadcrumbs ? (
              <KitBreadcrumbs
                items={breadcrumbs}
                className="hidden md:flex"
              />
            ) : null}
            <p
              className={cn(
                "truncate font-semibold text-base tracking-tight",
                showBreadcrumbs && "md:hidden"
              )}
            >
              {title}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {headerAction}
          <Button
            variant="outline"
            size="icon"
            className="size-8 md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Search"
          >
            <Search className="size-4" />
          </Button>
          <CommandTrigger
            className="hidden md:flex"
            onClick={() => setOpen(true)}
          />
          <NotificationInbox
            notifications={notifications}
            isLoading={isLoading}
            onMarkAllRead={() => void markAllRead()}
            onMarkRead={(id) => void markAsRead(id)}
          />
          <ModeToggle />
        </div>
      </div>
      {description ? (
        <p className="text-muted-foreground text-sm max-w-2xl">{description}</p>
      ) : null}
    </header>
  )
}
