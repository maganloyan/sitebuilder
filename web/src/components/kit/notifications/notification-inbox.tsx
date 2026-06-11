import { Bell, CheckCheck } from "lucide-react"
import { Link } from "react-router-dom"

import { NotificationEmptyState } from "@/components/kit/notifications/notification-empty-state"
import { NotificationItem } from "@/components/kit/notifications/notification-item"
import { NotificationInboxSkeleton } from "@/components/kit/feedback/view-skeletons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { InAppNotification } from "@/types/in-app-notification"

export function NotificationInbox({
  notifications,
  isLoading = false,
  onMarkAllRead,
  onMarkRead,
}: {
  notifications: InAppNotification[]
  isLoading?: boolean
  onMarkAllRead?: () => void
  onMarkRead?: (id: string) => void
}) {
  const unread = notifications.filter((n) => !n.read).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-[18px]" />
          {unread > 0 ? (
            <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground ring-2 ring-background">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[380px] overflow-hidden p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="font-semibold text-sm">Notifications</p>
            <p className="text-muted-foreground text-xs">
              {isLoading ? "Loading…" : unread > 0 ? `${unread} unread` : "All caught up"}
            </p>
          </div>
          {unread > 0 && onMarkAllRead ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={(event) => {
                event.preventDefault()
                onMarkAllRead()
              }}
            >
              <CheckCheck className="mr-1.5 size-3.5" />
              Mark all read
            </Button>
          ) : null}
        </div>

        {isLoading ? (
          <NotificationInboxSkeleton />
        ) : notifications.length === 0 ? (
          <NotificationEmptyState compact />
        ) : (
          <ScrollArea className="max-h-[min(24rem,70vh)]">
            <div>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  variant="inbox"
                  onMarkRead={onMarkRead}
                />
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="border-t bg-muted/30 px-4 py-2.5">
          <Button variant="link" size="sm" className="h-auto w-full p-0 text-xs" asChild>
            <Link to="/portal/notifications">View all notifications</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
