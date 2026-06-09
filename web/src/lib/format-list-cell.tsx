import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type StatusTone = "success" | "warning" | "destructive" | "info" | "neutral"

const NUMERIC_TYPES = new Set(["Int", "Float", "Currency", "Percent"])
const DATE_TYPES = new Set(["Date", "Datetime"])

const SUCCESS = new Set([
  "approved",
  "active",
  "enabled",
  "open",
  "completed",
  "complete",
  "success",
  "paid",
  "yes",
  "1",
  "true",
])

const WARNING = new Set([
  "pending",
  "draft",
  "submitted",
  "in progress",
  "in-progress",
  "processing",
  "on hold",
  "on-hold",
  "partially paid",
])

const DESTRUCTIVE = new Set([
  "rejected",
  "cancelled",
  "canceled",
  "disabled",
  "closed",
  "failed",
  "error",
  "overdue",
  "no",
  "0",
  "false",
])

const INFO = new Set(["review", "in review", "scheduled"])

export function resolveStatusTone(value: string): StatusTone {
  const key = value.trim().toLowerCase()
  if (!key) return "neutral"
  if (SUCCESS.has(key)) return "success"
  if (DESTRUCTIVE.has(key)) return "destructive"
  if (WARNING.has(key)) return "warning"
  if (INFO.has(key)) return "info"
  return "neutral"
}

const toneClass: Record<StatusTone, string> = {
  success:
    "border-transparent bg-success/15 text-success dark:bg-success/20 dark:text-success",
  warning:
    "border-transparent bg-warning/20 text-warning-foreground dark:bg-warning/25",
  destructive: "",
  info: "border-transparent bg-info/15 text-info dark:bg-info/20 dark:text-info",
  neutral: "",
}

export function shouldRenderStatusBadge(
  fieldtype: string,
  fieldname: string
): boolean {
  if (fieldtype === "Select" || fieldtype === "Check") return true
  const name = fieldname.toLowerCase()
  return (
    name.includes("status") ||
    name.includes("state") ||
    name === "docstatus" ||
    name.endsWith("_status")
  )
}

function parseDate(value: unknown): Date | null {
  if (value == null || value === "") return null
  if (value instanceof Date) return value
  const text = String(value).trim()
  if (!text) return null
  const iso = text.includes("T") ? text : text.includes(" ") ? text.replace(" ", "T") : `${text}T00:00:00`
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

function formatScalarText(value: unknown, fieldtype: string): string {
  if (fieldtype === "Currency") {
    const n = Number(value)
    if (Number.isNaN(n)) return String(value)
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n)
  }
  if (fieldtype === "Percent") {
    const n = Number(value)
    if (Number.isNaN(n)) return String(value)
    return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n)}%`
  }
  if (fieldtype === "Float" || fieldtype === "Int") {
    const n = Number(value)
    if (Number.isNaN(n)) return String(value)
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: fieldtype === "Int" ? 0 : 2,
    }).format(n)
  }
  if (fieldtype === "Date") {
    const d = parseDate(value)
    if (!d) return String(value)
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d)
  }
  if (fieldtype === "Datetime") {
    const d = parseDate(value)
    if (!d) return String(value)
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(d)
  }
  return String(value)
}

function isNumericFieldtype(fieldtype: string) {
  return NUMERIC_TYPES.has(fieldtype)
}

export function formatListCellValue(
  value: unknown,
  fieldtype: string,
  fieldname: string
): ReactNode {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground">—</span>
  }

  if (fieldtype === "Check") {
    const checked = value === 1 || value === "1" || value === true || value === "true"
    const label = checked ? "Yes" : "No"
    return <StatusBadge label={label} tone={checked ? "success" : "neutral"} />
  }

  if (shouldRenderStatusBadge(fieldtype, fieldname)) {
    const text = String(value)
    return <StatusBadge label={text} tone={resolveStatusTone(text)} />
  }

  const text = formatScalarText(value, fieldtype)
  const className = cn(
    isNumericFieldtype(fieldtype) || DATE_TYPES.has(fieldtype)
      ? "tabular-nums"
      : undefined
  )

  return <span className={className}>{text}</span>
}

function StatusBadge({ label, tone }: { label: string; tone: StatusTone }) {
  if (tone === "destructive") {
    return <Badge variant="destructive">{label}</Badge>
  }
  if (tone === "neutral") {
    return <Badge variant="outline">{label}</Badge>
  }
  return (
    <Badge variant="outline" className={cn(toneClass[tone])}>
      {label}
    </Badge>
  )
}
