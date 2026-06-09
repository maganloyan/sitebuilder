import { Check } from "lucide-react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  formatNotificationTime,
  getNotificationTypeMeta,
} from "@/lib/notification-ui"
import { cn } from "@/lib/utils"
import type { InAppNotification } from "@/types/in-app-notification"

export interface NotificationItemProps {
  notification: InAppNotification
  variant?: "inbox" | "page" | "compact"
  onMarkRead?: (id: string) => void
  onNavigate?: () => void
}

export function NotificationItem({
  notification,
  variant = "page",
  onMarkRead,
  onNavigate,
}: NotificationItemProps) {
  const meta = getNotificationTypeMeta(notification.type)
  const Icon = meta.icon
  const isInbox = variant === "inbox"
  const isCompact = variant === "compact"
  const timeStyle = isCompact || isInbox ? "relative" : "long"
  const timeLabel = formatNotificationTime(notification.createdAt, timeStyle)

  if (isCompact) {
    const row = (
      <div className="flex items-start gap-3 rounded-lg px-1 py-2 transition-colors hover:bg-accent/50">
        <div className="mt-1.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
          <Icon className={cn("size-3.5", meta.iconClass)} />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-sm leading-snug",
              !notification.read && "font-medium text-foreground"
            )}
          >
            {notification.title}
          </p>
          {notification.body ? (
            <p className="text-muted-foreground truncate text-xs">{notification.body}</p>
          ) : null}
          <p className="text-muted-foreground text-xs">{timeLabel}</p>
        </div>
        {!notification.read ? (
          <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" aria-hidden />
        ) : null}
      </div>
    )

    if (notification.href) {
      return (
        <Link to={notification.href} className="block">
          {row}
        </Link>
      )
    }
    return row
  }

  const handleMarkRead = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (!notification.read) onMarkRead?.(notification.id)
  }

  const body = (
    <div
      className={cn(
        "group relative flex gap-3 transition-colors",
        isInbox ? "px-3 py-3 hover:bg-accent/60" : "rounded-xl border p-4 hover:bg-accent/30",
        !notification.read &&
          (isInbox
            ? "bg-primary/[0.03] hover:bg-primary/[0.06]"
            : "border-primary/20 bg-primary/[0.04]")
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg bg-muted",
          isInbox ? "size-9" : "size-10"
        )}
      >
        <Icon className={cn(isInbox ? "size-4" : "size-[18px]", meta.iconClass)} />
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-0.5">
            <p
              className={cn(
                "leading-snug",
                isInbox ? "text-sm" : "text-sm font-medium",
                !notification.read && "font-semibold text-foreground"
              )}
            >
              {notification.title}
            </p>
            {notification.body ? (
              <p
                className={cn(
                  "text-muted-foreground line-clamp-2",
                  isInbox ? "text-xs leading-relaxed" : "text-sm"
                )}
              >
                {notification.body}
              </p>
            ) : null}
          </div>

          {!notification.read ? (
            <span
              className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
              aria-hidden
            />
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className={cn("h-5 px-1.5 text-[10px] font-medium", meta.badgeClass)}
          >
            {meta.label}
          </Badge>
          <span className="text-muted-foreground text-[11px]">{timeLabel}</span>
        </div>
      </div>

      {!isInbox && !notification.read && onMarkRead ? (
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 self-start opacity-0 transition-opacity group-hover:opacity-100"
          onClick={handleMarkRead}
        >
          <Check className="mr-1.5 size-3.5" />
          Mark read
        </Button>
      ) : null}
    </div>
  )

  if (notification.href) {
    return (
      <Link
        to={notification.href}
        className={cn("block", isInbox && "border-b border-border/60 last:border-0")}
        onClick={() => {
          if (!notification.read) onMarkRead?.(notification.id)
          onNavigate?.()
        }}
      >
        {body}
      </Link>
    )
  }

  return (
    <div className={cn(isInbox && "border-b border-border/60 last:border-0")}>{body}</div>
  )
}
