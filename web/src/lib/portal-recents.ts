const RECENTS_KEY = "portal-desk-recents"
const MAX_RECENTS = 8

export interface PortalRecent {
  id: string
  label: string
  href: string
  doctype?: string
  name?: string
}

export function getPortalRecents(): PortalRecent[] {
  try {
    return JSON.parse(localStorage.getItem(RECENTS_KEY) || "[]") as PortalRecent[]
  } catch {
    return []
  }
}

export function recordPortalRecent(entry: Omit<PortalRecent, "id">) {
  const id = entry.href
  const next = [
    { ...entry, id },
    ...getPortalRecents().filter((r) => r.href !== entry.href),
  ].slice(0, MAX_RECENTS)
  localStorage.setItem(RECENTS_KEY, JSON.stringify(next))
}
