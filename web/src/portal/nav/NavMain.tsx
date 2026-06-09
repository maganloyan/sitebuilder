"use client"

import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { CollapseMenu } from "./CollapseMenu"
import { DynamicIcon } from "@/portal/DynamicIcon"
import { useFrappeGetDocList } from 'frappe-react-sdk'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { PortalErrorState } from "@/components/kit/feedback/portal-state"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
interface WorkPanel {
  name: string
  title: string
  route: string
  is_group: boolean
  parent_page?: string
  icon?: string
  group_label?: string
  sequence_id?: string
}

export function NavMain({
  onItemClick,
}: {
  onItemClick?: (title: string) => void
} = {}) {
  const location = useLocation()
  const [groupedMenuItems, setGroupedMenuItems] = useState<Record<string, {
    title: string
    url: string
    icon?: string
    isActive?: boolean
    is_group: boolean
    children?: {
      isActive: boolean;
      title: string;
      url: string;
}[]
  }[]>>({
    Platform: []
  })

  const { state, isMobile } = useSidebar()
  const collapsed = state === "collapsed" && !isMobile

  const isRouteActive = (url: string) => {
    if (url === "/portal") return location.pathname === "/portal" || location.pathname === "/portal/"
    return location.pathname === url || location.pathname.startsWith(`${url}/`)
  }

  const { data: workPanels, isLoading, error, mutate } = useFrappeGetDocList<WorkPanel>('Work Panel', {
    fields: ['*'],
    filters: [['published', '=', 1]],
    orderBy: {
      field: "sequence_id",
      order: "asc",
    },
  })

  useEffect(() => {
    // Update menu items when workPanels data or route changes
    if (workPanels) {
      // Transform the flat list into a hierarchical structure
      // Group items by their group_label
      const grouped = workPanels
        .filter(page => !page.parent_page) // Get top-level items
        .reduce((acc, page) => {
          const groupLabel = page.group_label || 'Platform'
          const item = {
            title: page.title,
            url: `/portal/${page.route}`,
            icon: page.icon || 'Folder',
            is_group: page.is_group,
            isActive: isRouteActive(`/portal/${page.route}`),
            children: page.is_group
              ? workPanels
                  .filter(subPage => subPage.parent_page === page.name)
                  .map(subPage => ({
                    title: subPage.title,
                    url: `/portal/${subPage.route}`,
                    isActive: isRouteActive(`/portal/${subPage.route}`),
                  }))
              : undefined,
          }

          if (!acc[groupLabel]) {
            acc[groupLabel] = []
          }
          acc[groupLabel].push(item)
          return acc
        }, {} as Record<string, {
          title: string
          url: string
          icon?: string
          is_group: boolean
          isActive?: boolean
          children?: { title: string; url: string }[]
        }[]>) as Record<string, {
          title: string
          url: string
          icon?: string
          is_group: boolean
          isActive?: boolean
          children?: { isActive: boolean; title: string; url: string }[]
        }[]>

      setGroupedMenuItems(grouped)
    }
  }, [workPanels, location.pathname])

  if (isLoading) {
    return (
      <>
        {[1, 2].map((group) => (
          <div key={group} className="space-y-1">
            <SidebarGroup>
              <SidebarGroupLabel>
                <Skeleton className="h-4 w-20" />
              </SidebarGroupLabel>
              <SidebarMenu>
                {[1, 2, 3, 4].map((item) => (
                  <SidebarMenuItem key={item}>
                    <SidebarMenuButton>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5 shrink-0" />
                        {!collapsed && <Skeleton className="h-4 w-[100px]" />}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
            {group < 2 && collapsed && <Separator className="my-2" />}
          </div>
        ))}
      </>
    )
  }

  if (error) {
    return (
      <div className="p-3">
        <PortalErrorState
          title="Couldn't load navigation"
          description={error.message}
          onRetry={() => void mutate()}
        />
      </div>
    )
  }



  return (
    <>
      {Object.entries(groupedMenuItems).map(([groupLabel, items], index, array) => (
        <div key={groupLabel}>
          <SidebarGroup className="py-1">
            <SidebarGroupLabel className="text-xs uppercase tracking-wide text-muted-foreground">
              {groupLabel}
            </SidebarGroupLabel>
            <SidebarMenu>
              {items.map((item) => (
                item.is_group ? (
                  collapsed ? (
                    <CollapseMenu key={item.title} item={item} onItemClick={onItemClick} />
                  ) : (
                    <Collapsible
                      key={item.title}
                      asChild
                      defaultOpen={item.isActive}
                      className="group/collapsible "
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            isActive={item.isActive || item.children?.some((child) => child.isActive)}
                            className="data-active:bg-sidebar-primary/12 data-active:text-sidebar-primary data-active:font-medium data-active:shadow-[inset_3px_0_0_0_var(--sidebar-primary)]"
                          >
                            {item.icon && <DynamicIcon name={item.icon} />}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 " />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.children?.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={subItem.isActive}
                                  className="data-active:bg-sidebar-primary/12 data-active:text-sidebar-primary data-active:font-medium data-active:shadow-[inset_3px_0_0_0_var(--sidebar-primary)]"
                                >
                                  <Link
                                    to={subItem.url}
                                    onClick={() => onItemClick?.(subItem.title)}
                                  >
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={item.isActive}
                      className="data-active:bg-sidebar-primary/12 data-active:text-sidebar-primary data-active:font-medium data-active:shadow-[inset_3px_0_0_0_var(--sidebar-primary)]"
                      asChild
                    >
                      <Link to={item.url} onClick={() => onItemClick?.(item.title)}>
                        {item.icon && <DynamicIcon name={item.icon} />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              ))}
            </SidebarMenu>
          </SidebarGroup>
          {index < array.length - 1 && collapsed && (
            <Separator className="" />
          )}
        </div>
      ))}
    </>
  )
}