import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useLocation } from "react-router-dom"

import {
  getPortalPageMetaFromPath,
  type PortalPageMeta,
} from "@/lib/portal-page-meta-route"

function metaEquals(a: PortalPageMeta | null, b: PortalPageMeta | null): boolean {
  if (a === b) return true
  if (!a || !b) return false
  return (
    a.title === b.title &&
    a.description === b.description &&
    JSON.stringify(a.breadcrumbs) === JSON.stringify(b.breadcrumbs)
  )
}

interface PortalPageMetaContextValue {
  meta: PortalPageMeta
  setOverride: (meta: PortalPageMeta | null) => void
  headerAction: ReactNode | null
  setHeaderAction: (action: ReactNode | null) => void
}

const PortalPageMetaContext = createContext<PortalPageMetaContextValue | null>(null)

export function PortalPageMetaProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const [override, setOverride] = useState<PortalPageMeta | null>(null)
  const [headerAction, setHeaderAction] = useState<ReactNode | null>(null)

  const routeMeta = useMemo(
    () => getPortalPageMetaFromPath(pathname),
    [pathname]
  )

  useEffect(() => {
    setOverride(null)
    setHeaderAction(null)
  }, [pathname])

  const meta = override ?? routeMeta

  const setOverrideStable = useCallback((next: PortalPageMeta | null) => {
    setOverride((prev) => {
      if (next === null) return prev === null ? prev : null
      if (metaEquals(prev, next)) return prev
      return next
    })
  }, [])

  const setHeaderActionStable = useCallback((action: ReactNode | null) => {
    setHeaderAction(action)
  }, [])

  const value = useMemo(
    () => ({
      meta,
      setOverride: setOverrideStable,
      headerAction,
      setHeaderAction: setHeaderActionStable,
    }),
    [meta, setOverrideStable, headerAction, setHeaderActionStable]
  )

  return (
    <PortalPageMetaContext.Provider value={value}>
      {children}
    </PortalPageMetaContext.Provider>
  )
}

export function usePortalPageMeta(): PortalPageMeta {
  const ctx = useContext(PortalPageMetaContext)
  if (!ctx) {
    return getPortalPageMetaFromPath(
      typeof window !== "undefined" ? window.location.pathname : "/portal"
    )
  }
  return ctx.meta
}

export function usePortalHeaderAction(): ReactNode | null {
  return useContext(PortalPageMetaContext)?.headerAction ?? null
}

/** Sync document titles into the dashboard header (forms, work panels). */
export function usePortalPageMetaOverride() {
  const setOverride = useContext(PortalPageMetaContext)?.setOverride

  const apply = useCallback(
    (next: PortalPageMeta) => {
      setOverride?.(next)
    },
    [setOverride]
  )

  const clear = useCallback(() => {
    setOverride?.(null)
  }, [setOverride])

  return { apply, clear }
}

/** Stable setter for header toolbar actions (e.g. notifications “Mark all read”). */
export function usePortalHeaderActionSetter() {
  return useContext(PortalPageMetaContext)?.setHeaderAction
}
