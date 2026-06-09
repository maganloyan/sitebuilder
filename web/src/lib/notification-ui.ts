import {
  AlertCircle,
  AtSign,
  Bell,
  Share2,
  UserCheck,
  type LucideIcon,
} from "lucide-react"
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from "date-fns"

import type { InAppNotification } from "@/types/in-app-notification"

export interface NotificationTypeMeta {
  label: string
  icon: LucideIcon
  badgeClass: string
  iconClass: string
}

const TYPE_META: Record<string, NotificationTypeMeta> = {
  Alert: {
    label: "Alert",
    icon: AlertCircle,
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    iconClass: "text-amber-600 dark:text-amber-400",
  },
  Assignment: {
    label: "Assignment",
    icon: UserCheck,
    badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    iconClass: "text-blue-600 dark:text-blue-400",
  },
  Mention: {
    label: "Mention",
    icon: AtSign,
    badgeClass: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
    iconClass: "text-violet-600 dark:text-violet-400",
  },
  Share: {
    label: "Share",
    icon: Share2,
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    iconClass: "text-emerald-600 dark:text-emerald-400",
  },
}

const DEFAULT_META: NotificationTypeMeta = {
  label: "Update",
  icon: Bell,
  badgeClass: "bg-primary/10 text-primary",
  iconClass: "text-primary",
}

export function stripNotificationHtml(html?: string): string {
  if (!html) return ""

  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

function parseAssignmentNotification(
  rawSubject: string,
  documentType?: string,
  documentName?: string,
  fromUser?: string
): { title: string; body: string } {
  const removedMatch = rawSubject.match(
    /^Your assignment on\s+(.+?)\s+has been removed by\s+(.+)$/i
  )
  if (removedMatch) {
    return {
      title: removedMatch[1],
      body: `Assignment removed by ${removedMatch[2]}`,
    }
  }

  const assignerMatch = rawSubject.match(/^(.+?)\s+assigned a new task\s+/i)
  const assigner = assignerMatch?.[1]?.trim() || fromUser || "Someone"
  let remainder = rawSubject
    .replace(/^(.+?)\s+assigned a new task\s+/i, "")
    .replace(/\s+to you$/i, "")
    .trim()

  let docTitle = documentName || remainder
  if (documentType && remainder.startsWith(documentType)) {
    docTitle = remainder.slice(documentType.length).trim() || documentName || documentType
  }

  const doctypeLabel = documentType || "a task"
  return {
    title: docTitle,
    body: `${assigner} assigned ${doctypeLabel} to you`,
  }
}

export function formatNotificationDisplay(input: {
  type?: string
  subject?: string
  email_content?: string
  document_type?: string
  document_name?: string
  from_user?: string
}): { title: string; body: string } {
  const rawSubject = stripNotificationHtml(input.subject)
  const rawBody = stripNotificationHtml(input.email_content)

  if (input.type === "Assignment" && rawSubject) {
    return parseAssignmentNotification(
      rawSubject,
      input.document_type,
      input.document_name,
      input.from_user
    )
  }

  if (input.type === "Mention" && rawSubject) {
    return {
      title: rawSubject,
      body: rawBody && rawBody !== rawSubject ? rawBody.slice(0, 200) : "",
    }
  }

  if (input.type === "Share" && rawSubject) {
    const sharedMatch = rawSubject.match(/^(.+?)\s+shared\s+(.+)$/i)
    if (sharedMatch) {
      return {
        title: sharedMatch[2],
        body: `${sharedMatch[1]} shared a document with you`,
      }
    }
  }

  if (rawBody && rawBody !== rawSubject) {
    return {
      title: rawSubject || "Notification",
      body: rawBody.slice(0, 200),
    }
  }

  return {
    title: rawSubject || "Notification",
    body: "",
  }
}

export function getNotificationTypeMeta(type?: string): NotificationTypeMeta {
  if (!type) return DEFAULT_META
  return TYPE_META[type] ?? { ...DEFAULT_META, label: type }
}

export function formatNotificationTime(
  dateStr: string,
  style: "relative" | "short" | "long" = "relative"
): string {
  try {
    const date = parseISO(dateStr)
    if (style === "relative") {
      return formatDistanceToNow(date, { addSuffix: true })
    }
    if (style === "short") {
      return format(date, "MMM d, HH:mm")
    }
    return format(date, "MMM d, yyyy · HH:mm")
  } catch {
    return dateStr
  }
}

export function getNotificationDateGroup(dateStr: string): string {
  try {
    const date = parseISO(dateStr)
    if (isToday(date)) return "Today"
    if (isYesterday(date)) return "Yesterday"
    return "Earlier"
  } catch {
    return "Earlier"
  }
}

export function groupNotificationsByDate(notifications: InAppNotification[]) {
  const order = ["Today", "Yesterday", "Earlier"] as const
  const buckets = new Map<string, InAppNotification[]>()

  for (const notification of notifications) {
    const label = getNotificationDateGroup(notification.createdAt)
    const list = buckets.get(label) ?? []
    list.push(notification)
    buckets.set(label, list)
  }

  return order
    .filter((label) => buckets.has(label))
    .map((label) => ({ label, items: buckets.get(label)! }))
}
