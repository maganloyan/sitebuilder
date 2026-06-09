import { Link, useLocation } from "react-router-dom"

import { cn } from "@/lib/utils"

export const PORTAL_SETTINGS_PATH = "/portal/user/settings"

export interface SettingsNavItem {
  id: string
  label: string
  href: string
}

export interface SettingsLayoutProps {
  title: string
  description?: string
  navItems: SettingsNavItem[]
  activeId: string
  children: React.ReactNode
}

export function SettingsLayout({
  title,
  description,
  navItems,
  activeId,
  children,
}: SettingsLayoutProps) {
  const location = useLocation()

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
      <aside className="shrink-0 lg:w-48">
        <div className="mb-4 lg:mb-6">
          <h2 className="font-semibold text-lg">{title}</h2>
          {description ? (
            <p className="text-muted-foreground text-sm">{description}</p>
          ) : null}
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const hash = item.href.includes("#") ? item.href.split("#")[1] : undefined
            const to = hash
              ? { pathname: PORTAL_SETTINGS_PATH, hash }
              : item.href
            const isActive =
              activeId === item.id ||
              (hash !== undefined && location.hash === `#${hash}`)

            return (
              <Link
                key={item.id}
                to={to}
                className={cn(
                  "min-h-11 rounded-md px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
