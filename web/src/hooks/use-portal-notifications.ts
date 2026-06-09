import { useCallback, useMemo } from "react"
import {
  useFrappeEventListener,
  useFrappeGetCall,
  useFrappeGetDocList,
  useFrappePostCall,
} from "frappe-react-sdk"

import type { InAppNotification } from "@/types/in-app-notification"
import type { NotificationPreference } from "@/types/notification-preference"
import { formatNotificationDisplay } from "@/lib/notification-ui"

interface NotificationLog {
  name: string
  subject: string
  email_content?: string
  creation: string
  read: number | boolean
  type?: string
  document_type?: string
  document_name?: string
  link?: string
  from_user?: string
}

function notificationHref(n: NotificationLog): string | undefined {
  if (n.link) return n.link.startsWith("/") ? n.link : `/${n.link}`
  if (n.document_type && n.document_name) {
    const slug = n.document_type.trim().toLowerCase().replace(/\s+/g, "-")
    return `/portal/app/${encodeURIComponent(slug)}/view/${encodeURIComponent(n.document_name)}`
  }
  return "/portal/notifications"
}

function mapNotification(n: NotificationLog): InAppNotification {
  const { title, body } = formatNotificationDisplay({
    type: n.type,
    subject: n.subject,
    email_content: n.email_content,
    document_type: n.document_type,
    document_name: n.document_name,
    from_user: n.from_user,
  })

  return {
    id: n.name,
    title,
    body,
    read: Boolean(n.read),
    createdAt: n.creation,
    href: notificationHref(n),
    type: n.type,
    documentType: n.document_type,
    documentName: n.document_name,
  }
}

export function usePortalNotifications(limit = 15) {
  const { data, isLoading, mutate } = useFrappeGetDocList<NotificationLog>(
    "Notification Log",
    {
      fields: [
        "name",
        "subject",
        "email_content",
        "creation",
        "read",
        "type",
        "document_type",
        "document_name",
        "link",
        "from_user",
      ],
      orderBy: { field: "creation", order: "desc" },
      limit,
    }
  )

  const { call: markRead } = useFrappePostCall(
    "frappe.desk.doctype.notification_log.notification_log.mark_as_read"
  )
  const { call: markAllReadCall } = useFrappePostCall(
    "sitebuilder.sitebuilder.notifications.mark_all_notifications_read"
  )

  useFrappeEventListener("notification", () => {
    void mutate()
  })

  const notifications: InAppNotification[] = useMemo(
    () => (data ?? []).map(mapNotification),
    [data]
  )

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  )

  const markAsRead = useCallback(
    async (id: string) => {
      await markRead({ docname: id })
      await mutate()
    },
    [markRead, mutate]
  )

  const markAllRead = useCallback(async () => {
    await markAllReadCall()
    await mutate()
  }, [markAllReadCall, mutate])

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllRead,
    refresh: mutate,
  }
}

export function useNotificationPreferences() {
  const { data, isLoading, mutate } = useFrappeGetCall<{
    preferences: NotificationPreference[]
  }>("sitebuilder.sitebuilder.notifications.get_portal_notification_preferences")

  const { call: updatePreference, loading: saving } = useFrappePostCall(
    "sitebuilder.sitebuilder.notifications.update_portal_notification_preference"
  )

  const update = useCallback(
    async (id: string, channel: "email" | "inApp", value: boolean) => {
      await updatePreference({ preference_id: id, channel, value })
      await mutate()
    },
    [updatePreference, mutate]
  )

  return {
    preferences: data?.preferences ?? [],
    isLoading,
    saving,
    update,
    refresh: mutate,
  }
}
