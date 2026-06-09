import { PortalCommandPaletteProvider } from "@/portal/PortalCommandPalette"
import { AppSidebar } from "@/portal/layout/AppSidebar"
import { DashboardHeader } from "@/portal/layout/DashboardHeader"
import { Toaster } from "@/components/ui/sonner"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { PortalPageMetaProvider } from "@/context/portal-page-meta-context"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const defaultOpen =
    typeof window !== "undefined"
      ? localStorage.getItem("sidebar_state") !== "false"
      : true

  return (
    <PortalPageMetaProvider>
      <PortalCommandPaletteProvider>
        <SidebarProvider
          defaultOpen={defaultOpen}
      
          style={{ "--sidebar-width": "15rem" } as React.CSSProperties}
        >
          <AppSidebar variant="inset" collapsible="icon" />
          <SidebarInset >
            <DashboardHeader />
            <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 md:p-6">
              {children}
            </div>
            <Toaster position="top-right" richColors closeButton />
          </SidebarInset>
        </SidebarProvider>
      </PortalCommandPaletteProvider>
    </PortalPageMetaProvider>
  )
}
