import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { useNavigate } from "react-router-dom"
import { Clock, FileText, LayoutDashboard, Loader2, LogOut, Settings } from "lucide-react"
import {
  useFrappeAuth,
  useFrappeGetCall,
  useFrappeGetDocList,
  useFrappePostCall,
} from "frappe-react-sdk"

import { cn } from "@/lib/utils"
import { getPortalRecents, recordPortalRecent } from "@/lib/portal-recents"
import {
  portalFormPath,
  portalListPath,
  portalPanelPath,
} from "@/lib/portal-routes"

// ── Context ───────────────────────────────────────────────────────────────────

type Ctx = {
  open: boolean
  setOpen: (v: boolean) => void
  toggle: () => void
}

const CommandPaletteContext = createContext<Ctx | null>(null)

export function usePortalCommandPalette() {
  const ctx = useContext(CommandPaletteContext)
  if (!ctx) {
    throw new Error("usePortalCommandPalette must be used within PortalCommandPaletteProvider")
  }
  return ctx
}

export function PortalCommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen((o) => !o), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen, toggle }}>
      {children}
      {open ? <CommandPaletteSurface onClose={() => setOpen(false)} /> : null}
    </CommandPaletteContext.Provider>
  )
}

// ── Types ─────────────────────────────────────────────────────────────────────

type ResultItem = {
  id: string
  label: string
  sublabel?: string
  icon: ReactNode
  onSelect: () => void
}

type ResultSection = {
  title: string
  items: ResultItem[]
}

interface PortalSearchMessage {
  nav?: Array<{ name: string; title: string; route: string; icon?: string }>
  doctypes?: Array<{ name: string }>
  records?: Array<{ doctype: string; name: string }>
}

function unwrapMessage<T>(res: unknown): T {
  if (res && typeof res === "object" && "message" in res) {
    return (res as { message: T }).message
  }
  return res as T
}

const PORTAL_SHORTCUTS: ResultItem[] = [
  {
    id: "shortcut-dashboard",
    label: "Dashboard",
    sublabel: "/portal",
    icon: <LayoutDashboard className="size-4 text-muted-foreground" />,
    onSelect: () => {},
  },
  {
    id: "shortcut-settings",
    label: "Settings",
    sublabel: "/portal/user/settings",
    icon: <Settings className="size-4 text-muted-foreground" />,
    onSelect: () => {},
  },
]

// ── Surface ───────────────────────────────────────────────────────────────────

function CommandPaletteSurface({ onClose }: { onClose: () => void }) {
  const titleId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const navigate = useNavigate()
  const { logout } = useFrappeAuth()
  const [query, setQuery] = useState("")
  const [sections, setSections] = useState<ResultSection[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestId = useRef(0)

  const { call: portalSearch } = useFrappePostCall<PortalSearchMessage>(
    "sitebuilder.sitebuilder.api.portal_search"
  )

  const { data: workPanels } = useFrappeGetDocList("Work Panel", {
    fields: ["name", "title", "route", "icon"],
    filters: [["published", "=", 1], ["is_group", "=", 0]],
    orderBy: { field: "sequence_id", order: "asc" },
    limit: 8,
  })

  const { data: portalDoctypesData } = useFrappeGetCall<{
    message: Array<{ name: string }>
  }>("sitebuilder.sitebuilder.api.portal_list_doctypes", { limit: 12 })

  const flatItems = useMemo(
    () => sections.flatMap((s) => s.items),
    [sections]
  )

  const buildDefaultSections = useCallback((): ResultSection[] => {
    const recentItems: ResultItem[] = getPortalRecents().map((r) => ({
      id: `recent-${r.id}`,
      label: r.label,
      sublabel: r.doctype ?? r.href,
      icon: <Clock className="size-4 text-muted-foreground" />,
      onSelect: () => navigate(r.href),
    }))

    const navItems: ResultItem[] = (workPanels ?? []).map((p) => ({
      id: `nav-${p.name}`,
      label: p.title,
      sublabel: portalPanelPath(p.route),
      icon: <LayoutDashboard className="size-4 text-muted-foreground" />,
      onSelect: () => {
        recordPortalRecent({ label: p.title, href: portalPanelPath(p.route) })
        navigate(portalPanelPath(p.route))
      },
    }))

    const shortcuts: ResultItem[] = [
      {
        ...PORTAL_SHORTCUTS[0],
        onSelect: () => {
          recordPortalRecent({ label: "Dashboard", href: "/portal" })
          navigate("/portal")
        },
      },
      {
        ...PORTAL_SHORTCUTS[1],
        onSelect: () => {
          recordPortalRecent({ label: "Settings", href: "/portal/user/settings" })
          navigate("/portal/user/settings")
        },
      },
    ]

    const listItems: ResultItem[] = (portalDoctypesData?.message ?? []).map((d) => ({
      id: `list-${d.name}`,
      label: d.name,
      sublabel: portalListPath(d.name),
      icon: <FileText className="size-4 text-muted-foreground" />,
      onSelect: () => {
        const href = portalListPath(d.name)
        recordPortalRecent({ label: d.name, href, doctype: d.name })
        navigate(href)
      },
    }))

    return [
      { title: "Recent", items: recentItems },
      { title: "Portal", items: shortcuts },
      { title: "Navigation", items: navItems },
      { title: "Lists", items: listItems },
    ].filter((s) => s.items.length > 0)
  }, [workPanels, portalDoctypesData, navigate])

  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus(), 10)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    setSections(buildDefaultSections())
    setActiveIndex(0)
  }, [buildDefaultSections])

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)

    const q = query.trim()
    if (!q) {
      setLoading(false)
      setSections(buildDefaultSections())
      setActiveIndex(0)
      return
    }

    const currentRequest = ++requestId.current
    searchTimer.current = setTimeout(async () => {
      let loadingTimer: ReturnType<typeof setTimeout> | undefined
      loadingTimer = setTimeout(() => {
        if (requestId.current === currentRequest) setLoading(true)
      }, 150)

      try {
        const message = unwrapMessage<PortalSearchMessage>(
          await portalSearch({ query: q })
        )
        if (requestId.current !== currentRequest) return

        const navItems: ResultItem[] = (message?.nav ?? []).map((p) => ({
          id: `nav-${p.name}`,
          label: p.title,
          sublabel: portalPanelPath(p.route),
          icon: <LayoutDashboard className="size-4 text-muted-foreground" />,
          onSelect: () => navigate(portalPanelPath(p.route)),
        }))

        const doctypeItems: ResultItem[] = (message?.doctypes ?? []).map((d) => ({
          id: `dt-${d.name}`,
          label: d.name,
          sublabel: "List",
          icon: <FileText className="size-4 text-muted-foreground" />,
          onSelect: () => {
            recordPortalRecent({ label: d.name, href: portalListPath(d.name), doctype: d.name })
            navigate(portalListPath(d.name))
          },
        }))

        const recordItems: ResultItem[] = (message?.records ?? []).map((r) => ({
          id: `rec-${r.doctype}-${r.name}`,
          label: r.name,
          sublabel: r.doctype,
          icon: <FileText className="size-4 text-muted-foreground" />,
          onSelect: () => {
            const href = portalFormPath(r.doctype, r.name)
            recordPortalRecent({ label: r.name, href, doctype: r.doctype, name: r.name })
            navigate(href)
          },
        }))

        const actionItems: ResultItem[] =
          q.toLowerCase().includes("sign") || q.toLowerCase().includes("log")
            ? [
                {
                  id: "action-sign-out",
                  label: "Sign out",
                  icon: <LogOut className="size-4 text-muted-foreground" />,
                  onSelect: async () => {
                    await logout()
                    navigate("/login")
                  },
                },
              ]
            : []

        const next: ResultSection[] = [
          { title: "Navigation", items: navItems },
          { title: "Lists", items: doctypeItems },
          { title: "Records", items: recordItems },
          { title: "Actions", items: actionItems },
        ].filter((s) => s.items.length > 0)

        setSections(next)
        setActiveIndex(0)
      } catch (err) {
        console.error("portal_search failed:", err)
        if (requestId.current === currentRequest) {
          setSections([])
        }
      } finally {
        clearTimeout(loadingTimer)
        if (requestId.current === currentRequest) setLoading(false)
      }
    }, 250)

    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current)
    }
  }, [query, buildDefaultSections, navigate, logout, portalSearch])

  const selectItem = useCallback(
    (item: ResultItem) => {
      onClose()
      item.onSelect()
    },
    [onClose]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, Math.max(flatItems.length - 1, 0)))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === "Enter") {
        e.preventDefault()
        const item = flatItems[activeIndex]
        if (item) selectItem(item)
      } else if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      }
    },
    [flatItems, activeIndex, selectItem, onClose]
  )

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const active = list.querySelector(`[data-active="true"]`)
    active?.scrollIntoView({ block: "nearest" })
  }, [activeIndex])

  let itemOffset = 0

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[min(18vh,7rem)]">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Close command palette"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b px-3">
          <LayoutDashboard className="size-4 shrink-0 text-muted-foreground opacity-0" aria-hidden />
          <input
            ref={inputRef}
            id={titleId}
            type="search"
            autoComplete="off"
            spellCheck={false}
            placeholder="Search pages, records, lists…"
            aria-label="Search the portal"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          {loading ? (
            <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
          ) : (
            <kbd className="hidden shrink-0 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground sm:inline">
              ESC
            </kbd>
          )}
        </div>

        <ul
          ref={listRef}
          role="listbox"
          aria-label="Search results"
          className="max-h-[min(24rem,50vh)] overflow-y-auto py-1"
        >
          {flatItems.length === 0 && !loading ? (
            <li className="px-4 py-8 text-center text-muted-foreground text-sm">
              {query.trim() ? (
                "No results found."
              ) : (
                <span>
                  Try a page name, doctype, or record — e.g. employee, leave application
                </span>
              )}
            </li>
          ) : (
            sections.map((section) => (
              <li key={section.title} role="presentation">
                <p className="px-3 py-1.5 font-medium text-muted-foreground text-xs">
                  {section.title}
                </p>
                <ul role="group">
                  {section.items.map((item) => {
                    const index = itemOffset++
                    const isActive = index === activeIndex
                    return (
                      <li
                        key={item.id}
                        role="option"
                        aria-selected={isActive}
                        data-active={isActive ? "true" : undefined}
                        className={cn(
                          "mx-1 flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent/50"
                        )}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => selectItem(item)}
                      >
                        <span className="shrink-0">{item.icon}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{item.label}</span>
                          {item.sublabel ? (
                            <span className="block truncate text-muted-foreground text-xs">
                              {item.sublabel}
                            </span>
                          ) : null}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </li>
            ))
          )}
        </ul>

        {flatItems.length > 0 ? (
          <div className="border-t px-3 py-2">
            <p className="text-muted-foreground text-[10px]">
              ↑↓ navigate · ↵ select · ⌘K open · ESC close
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
