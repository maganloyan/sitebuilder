import { useState } from "react"
import { MenuIcon } from "lucide-react"
import { ModeToggle } from "@/utils/ModeToggle"
import { NavUser } from "@/auth/nav-user"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import ActionSearchBar from "@/components/extensions/search"
import { NavMain } from "./NavMain"
import { useLocation } from "react-router-dom"

function usePageTitle() {
  const location = useLocation()
  const segments = location.pathname.replace(/^\/portal\/?/, "").split("/").filter(Boolean)
  if (!segments.length) return "Dashboard"
  // /portal/app/:doctype → use doctype segment
  const label = segments[0] === "app" ? segments[1] ?? "" : segments[0]
  return label
    .replace(/-/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase())
}

export function Navbar() {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full rounded-lg border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-4 sm:mx-8 flex h-14 items-center gap-2">

        {/* Desktop sidebar trigger */}
        <div className="hidden md:flex items-center gap-2">
          <SidebarTrigger className="cursor-pointer" />
          <Separator orientation="vertical" className="h-4" />
        </div>

        {/* Mobile sheet menu */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger className="md:hidden" asChild>
            <Button className="h-8" variant="outline" size="icon">
              <MenuIcon size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-72 px-3 flex flex-col" side="left">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <Separator />
            <NavMain onItemClick={() => setSheetOpen(false)} />
          </SheetContent>
        </Sheet>

          <h1 className="hidden md:block font-semibold text-sm">{usePageTitle()}</h1>

        {/* Right section */}
        <div className="flex flex-1 justify-end items-center gap-4">
          <div className="hidden sm:block sm:min-w-[300px] max-w-full">
            <ActionSearchBar doctype="DocType" route="/portal/app" />
          </div>
          <ModeToggle />
          <NavUser />
        </div>

      </div>
    </header>
  )
}
