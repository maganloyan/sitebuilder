import { useEffect, useMemo, useRef, useState } from "react"
import { Bell, CheckCheck } from "lucide-react"
import { motion } from "motion/react"

import {
  NotificationEmptyState,
  NotificationItem,
} from "@/components/kit"
import { NotificationPageSkeleton } from "@/components/kit/feedback/view-skeletons"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePortalHeaderActionSetter } from "@/context/portal-page-meta-context"
import { usePortalNotifications } from "@/hooks/use-portal-notifications"
import { groupNotificationsByDate } from "@/lib/notification-ui"
import { staggerContainerVariants, staggerItemVariants } from "@/lib/motion-variants"
import type { InAppNotification } from "@/types/in-app-notification"

type Filter = "all" | "unread"

function NotificationGroups({
  notifications,
  onMarkRead,
}: {
  notifications: InAppNotification[]
  onMarkRead: (id: string) => void
}) {
  const groups = useMemo(() => groupNotificationsByDate(notifications), [notifications])

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.label} className="space-y-3">
          <h2 className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            {group.label}
          </h2>
          <motion.div
            className="space-y-2"
            variants={staggerContainerVariants}
            initial="hidden"
            animate="show"
          >
            {group.items.map((notification) => (
              <motion.div key={notification.id} variants={staggerItemVariants}>
                <NotificationItem
                  notification={notification}
                  variant="page"
                  onMarkRead={onMarkRead}
                />
              </motion.div>
            ))}
          </motion.div>
        </section>
      ))}
    </div>
  )
}

export function NotificationsPage() {
  const [filter, setFilter] = useState<Filter>("all")
  const { notifications, unreadCount, isLoading, markAsRead, markAllRead } =
    usePortalNotifications(50)
  const setHeaderAction = usePortalHeaderActionSetter()
  const markAllReadRef = useRef(markAllRead)
  markAllReadRef.current = markAllRead

  useEffect(() => {
    if (!setHeaderAction) return
    setHeaderAction(
      unreadCount > 0 ? (
        <Button variant="outline" size="sm" onClick={() => void markAllReadRef.current()}>
          <CheckCheck className="mr-2 size-4" />
          Mark all read
        </Button>
      ) : null
    )
    return () => setHeaderAction(null)
  }, [setHeaderAction, unreadCount])

  const visible = useMemo(
    () => (filter === "unread" ? notifications.filter((n) => !n.read) : notifications),
    [filter, notifications]
  )

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={filter}
          onValueChange={(value) => setFilter(value as Filter)}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-2 sm:w-[220px]">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 ? (
                <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  {unreadCount}
                </span>
              ) : null}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {!isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Bell className="size-4" />
            <span>
              {notifications.length} total
              {unreadCount > 0 ? ` · ${unreadCount} unread` : ""}
            </span>
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <NotificationPageSkeleton />
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-dashed">
          <NotificationEmptyState
            title={filter === "unread" ? "No unread notifications" : "No notifications yet"}
            description={
              filter === "unread"
                ? "You're up to date. Switch to All to see earlier activity."
                : "Updates to site pages and portal activity will appear here."
            }
          />
        </div>
      ) : (
        <NotificationGroups notifications={visible} onMarkRead={markAsRead} />
      )}
    </div>
  )
}
