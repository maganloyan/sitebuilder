import { Link, useLocation } from "react-router-dom"
import { useFrappeGetDoc } from "frappe-react-sdk"
import { Zap } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface FooterItem {
  label: string
  url: string
  parent_label?: string
}

export function MainFooter() {
  const location = useLocation()
  const { data } = useFrappeGetDoc("Site Settings", "Site Settings")

  if (location.pathname.startsWith("/portal")) return null

  const items: FooterItem[] = data?.footer_items || []
  const groups = items.reduce<Record<string, FooterItem[]>>((acc, item) => {
    if (item.parent_label) {
      acc[item.parent_label] = [...(acc[item.parent_label] || []), item]
    }
    return acc
  }, {})
  const standalone = items.filter(i => !i.parent_label && i.label && i.url)

  const hasColumns = Object.keys(groups).length > 0 || standalone.length > 0

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className={`grid gap-10 ${hasColumns ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1"}`}>

          {/* Brand */}
          <div className="space-y-4 col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              {data?.footer_logo
                ? <img src={data.footer_logo} alt={data.app_name} className="h-7 w-auto" />
                : <Zap className="size-5 text-primary" />
              }
              <span className="font-semibold">{data?.app_name || "Sitebuilder"}</span>
            </div>
            {data?.footer_description && (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                {data.footer_description}
              </p>
            )}
          </div>

          {/* Grouped columns */}
          {Object.entries(groups).map(([section, children]) => (
            <div key={section} className="space-y-3">
              <p className="text-sm font-semibold">{section}</p>
              <ul className="space-y-2">
                {children.map(item => (
                  <li key={item.label}>
                    <Link to={item.url} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Standalone links */}
          {standalone.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold">Quick Links</p>
              <ul className="space-y-2">
                {standalone.map(item => (
                  <li key={item.label}>
                    <Link to={item.url} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Separator className="my-8" />

        <p className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} {data?.app_name || "Sitebuilder"}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default MainFooter
