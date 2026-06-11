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
  const { appName, appLogoUrl, isLoading } = usePortalBrand()

  return (
    <Sidebar {...props}>
      <SidebarHeader className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" className="h-12 px-2">
              <Link to="/portal" className="gap-3">
                {appLogoUrl ? (
                  <img
                    src={appLogoUrl}
                    alt=""
                    className="size-9 shrink-0 rounded-xl border border-sidebar-border/60 bg-background object-contain p-1"
                  />
                ) : (
                  <div className="flex aspect-square size-9 items-center justify-center rounded-xl border border-sidebar-border/60 bg-sidebar-primary text-sidebar-primary-foreground shadow-xs">
                    <Zap className="size-4" aria-hidden />
                  </div>
                )}
                {isLoading ? (
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                ) : (
                  <div className="flex min-w-0 flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold text-base tracking-tight">{appName}</span>
                    <span className="truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Portal
                    </span>
                  </div>
                )}
              </Link>
            </SidebarMenuButton>
            <SidebarSeparator className="mx-0" />
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
