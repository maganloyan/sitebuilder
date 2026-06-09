import type { BreadcrumbItemConfig } from "@/components/kit/layout/kit-breadcrumbs"
import { portalListPath } from "@/lib/portal-routes"

const toTitleCase = (slug: string) =>
  slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")

export interface PortalPageMeta {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItemConfig[]
}

export function getPortalPageMetaFromPath(pathname: string): PortalPageMeta {
  const portalRoot = { label: "Portal", href: "/portal" }

  if (pathname === "/portal" || pathname === "/portal/") {
    return {
      title: "Dashboard",
      description: "Overview of your portal.",
      breadcrumbs: [portalRoot, { label: "Dashboard" }],
    }
  }

  if (pathname.startsWith("/portal/notifications")) {
    return {
      title: "Notifications",
      description: "Stay on top of portal updates, assignments, and alerts.",
      breadcrumbs: [portalRoot, { label: "Notifications" }],
    }
  }

  if (pathname.startsWith("/portal/user/settings")) {
    return {
      title: "Settings",
      description: "Manage your account, appearance, and notification preferences.",
      breadcrumbs: [portalRoot, { label: "Settings" }],
    }
  }

  const newMatch = pathname.match(/^\/portal\/app\/([^/]+)\/new\/?$/)
  if (newMatch) {
    const doctype = toTitleCase(decodeURIComponent(newMatch[1]))
    return {
      title: `New ${doctype}`,
      description: `Fill in the details below to create a new ${doctype} record.`,
      breadcrumbs: [
        portalRoot,
        { label: doctype, href: portalListPath(doctype) },
        { label: "New" },
      ],
    }
  }

  const formMatch = pathname.match(/^\/portal\/app\/([^/]+)\/view\/([^/]+)\/?$/)
  if (formMatch) {
    const doctype = toTitleCase(decodeURIComponent(formMatch[1]))
    const docId = decodeURIComponent(formMatch[2])
    return {
      title: docId,
      breadcrumbs: [
        portalRoot,
        { label: doctype, href: portalListPath(doctype) },
        { label: docId },
      ],
    }
  }

  const listMatch = pathname.match(/^\/portal\/app\/([^/]+)\/?$/)
  if (listMatch) {
    const doctype = toTitleCase(decodeURIComponent(listMatch[1]))
    return {
      title: doctype,
      description: `Browse and manage ${doctype} records.`,
      breadcrumbs: [portalRoot, { label: doctype }],
    }
  }

  const panelMatch = pathname.match(/^\/portal\/([^/]+)\/?$/)
  if (panelMatch) {
    const slug = decodeURIComponent(panelMatch[1])
    const title = toTitleCase(slug)
    return {
      title,
      breadcrumbs: [portalRoot, { label: title }],
    }
  }

  return { title: "Portal", breadcrumbs: [portalRoot] }
}

/** Prefer human-readable labels from common Frappe title fields. */
export function getDocDisplayTitle(data: Record<string, unknown>): string {
  const name = String(data.name ?? "")
  const keys = [
    "title",
    "employee_name",
    "full_name",
    "customer_name",
    "subject",
    "naming_series",
  ]
  for (const key of keys) {
    const value = data[key]
    if (typeof value === "string" && value.trim()) return value.trim()
  }
  return name
}

export function buildWorkPanelPageMeta(
  panelTitle: string,
  description?: string
): PortalPageMeta {
  const portalRoot = { label: "Portal", href: "/portal" }
  return {
    title: panelTitle,
    description,
    breadcrumbs: [portalRoot, { label: panelTitle }],
  }
}

export function buildFormPageMeta(
  doctype: string,
  mode: "create" | "edit",
  displayTitle: string
): PortalPageMeta {
  const portalRoot = { label: "Portal", href: "/portal" }
  const listHref = portalListPath(doctype)

  if (mode === "create") {
    return {
      title: displayTitle,
      breadcrumbs: [portalRoot, { label: doctype, href: listHref }, { label: "New" }],
    }
  }

  const breadcrumbs = [portalRoot, { label: doctype, href: listHref }]
  if (displayTitle !== doctype) {
    breadcrumbs.push({ label: displayTitle })
  }
  return {
    title: displayTitle,
    breadcrumbs,
  }
}
