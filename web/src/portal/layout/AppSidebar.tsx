import { Link } from "react-router-dom"
import { Zap } from "lucide-react"

import { NavMain } from "@/portal/nav/NavMain"
import { Skeleton } from "@/components/ui/skeleton"
import { usePortalBrand } from "@/hooks/use-portal-brand"
import { NavUser } from "@/portal/nav/NavUser"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { appLogoUrl, isLoading } = usePortalBrand()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link to="/portal">
                {appLogoUrl ? (
                  <img
                    src={appLogoUrl}
                    alt=""
                    className="size-8 shrink-0 rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Zap className="size-4" aria-hidden />
                  </div>
                )}
                {isLoading ? (
                  <Skeleton className="h-4 w-24" />
                ) : (
                  <span className="font-semibold text-base truncate">Sitebuilder</span>
                )}
              </Link>
            </SidebarMenuButton>
            <SidebarSeparator />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
