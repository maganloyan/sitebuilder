/** URL slug for portal list/form routes (matches ListView toTitleCase). */
export function doctypeToPath(doctype: string) {
  return doctype.trim().toLowerCase().replace(/\s+/g, "-")
}

export function portalListPath(doctype: string) {
  return `/portal/app/${encodeURIComponent(doctypeToPath(doctype))}`
}

export function portalFormPath(doctype: string, name: string) {
  return `/portal/app/${encodeURIComponent(doctypeToPath(doctype))}/view/${encodeURIComponent(name)}`
}

export function portalPanelPath(route: string) {
  return `/portal/${route.replace(/^\//, "")}`
}
