import * as React from "react"
import { NavMain } from "./NavMain"
import { NavUser } from "./NavUser"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar({ onNavItemClick, ...props }: React.ComponentProps<typeof Sidebar> & {
  onNavItemClick: (title: string) => void
}) {
  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      
      <SidebarContent>
        <NavMain onItemClick={onNavItemClick} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
