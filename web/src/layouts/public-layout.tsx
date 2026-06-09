import { Outlet } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"

import MainFooter from "@/site/MainFooter"
import MainNavbar from "@/site/MainNavbar"
import MobileDock from "@/site/MobileDock"

/** Public marketing / site pages with header, footer, and mobile dock. */
export function PublicLayout() {
  return (
    <div className="min-h-svh flex flex-col bg-background">
      <MainNavbar />
      <main className="flex-1 pt-14 pb-16 sm:pb-0">
        <Outlet />
      </main>
      <MainFooter />
      <MobileDock />
      <Toaster position="top-right" richColors closeButton />
    </div>
  )
}
