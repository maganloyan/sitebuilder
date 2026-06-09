import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu, Zap } from "lucide-react"
import { useFrappeGetDoc } from "frappe-react-sdk"

import { NavItems } from "./NavItem"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/lib/ModeToggle"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  url: string
  parent_label?: string
  description?: string
}

interface GroupedNavItem {
  parent: NavItem
  children: NavItem[]
}

type GroupedNavItems = Record<string, GroupedNavItem>

export function MainNavbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { data } = useFrappeGetDoc("Site Settings", "Site Settings")
  const [hasScrolled, setHasScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 0)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isActive = (url: string) => location.pathname === url

  const links: NavItem[] = data?.top_bar_items || []
  const groupedLinks = links.reduce<GroupedNavItems>((acc, item) => {
    if (!item.parent_label && item.label) {
      acc[item.label] = { parent: item, children: [] }
    } else if (item.parent_label) {
      if (!acc[item.parent_label]) {
        acc[item.parent_label] = { parent: { label: item.parent_label, url: "#" }, children: [] }
      }
      acc[item.parent_label].children.push(item)
    }
    return acc
  }, {})

  const appName = data?.app_name || "Sitebuilder"

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        hasScrolled && "shadow-sm"
      )}
    >
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          {data?.app_logo ? (
            <img src={data.app_logo} alt={appName} className="h-7 w-auto" />
          ) : (
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="size-4" />
            </div>
          )}
          <span className="font-semibold text-base tracking-tight">{appName}</span>
        </Link>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {Object.entries(groupedLinks).map(([label, { parent, children }]) => (
              <NavigationMenuItem key={label}>
                {children.length > 0 ? (
                  <>
                    <NavigationMenuTrigger>{label}</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul
                        className={cn(
                          "grid gap-3 p-4 w-[200px] md:w-[400px]",
                          children.length > 3 ? "grid-cols-2" : "grid-cols-1"
                        )}
                      >
                        {children.map((child) => (
                          <li key={child.label}>
                            <Link
                              to={child.url}
                              className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">{child.label}</div>
                              {child.description ? (
                                <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  {child.description}
                                </p>
                              ) : null}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <Link
                    to={parent.url}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      isActive(parent.url) && "text-primary"
                    )}
                  >
                    {parent.label}
                  </Link>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <div className="hidden md:flex">
            <NavItems />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="hidden md:inline-flex"
            onClick={() => navigate("/portal")}
          >
            Portal
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-72 flex-col gap-4">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex items-center gap-2 pt-2">
                <Zap className="size-4 text-primary" />
                <span className="font-semibold">{appName}</span>
              </div>
              <Separator />
              <nav className="flex flex-col gap-3">
                {Object.entries(groupedLinks).map(([label, { parent, children }]) => (
                  <div key={label}>
                    {children.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">{label}</p>
                        <div className="space-y-2 pl-3">
                          {children.map((child) => (
                            <Link
                              key={child.label}
                              to={child.url}
                              onClick={() => setMobileOpen(false)}
                              className="block text-sm text-muted-foreground hover:text-foreground"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        to={parent.url}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "block text-sm font-medium hover:text-primary",
                          isActive(parent.url) && "text-primary"
                        )}
                      >
                        {parent.label}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
              <Separator />
              <div className="mt-auto flex flex-col gap-2">
                <NavItems />
                <Button variant="secondary" onClick={() => { setMobileOpen(false); navigate("/portal") }}>
                  Open portal
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export default MainNavbar