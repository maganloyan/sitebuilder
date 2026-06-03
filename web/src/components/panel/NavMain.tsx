"use client"

import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { ChevronRight, Zap } from "lucide-react"
import { CollapseMenu } from "./CollapseMenu"
import { DynamicIcon } from "@/components/extensions/DynamicIcon"
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
  onItemClick: (title: string) => void
}) {
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

  const { state } = useSidebar()
  const collapsed = state == "collapsed"

  const { data: workPanels, isLoading, error } = useFrappeGetDocList<WorkPanel>('Work Panel', {
    fields: ['*'],
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
            isActive: `/portal/${page.route}` === location.pathname,
            children: page.is_group
              ? workPanels
                  .filter(subPage => subPage.parent_page === page.name)
                  .map(subPage => ({
                    title: subPage.title,
                    url: `/portal/${subPage.route}`,
                    isActive: `/portal/${subPage.route}` === location.pathname,
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
    return <div>Error loading menu items</div> 
  }



  return (
    <>
     <Link to="/portal" className="flex items-center py-3 px-3">
     <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Zap className="size-5" />
              </div>
            <div className="grid flex-1 text-left text-2xl ml-3 ">
                {!collapsed && <span className="truncate font-semibold">
                 Portal
                </span>}
                {/* <span className="truncate text-xs">{activeTeam.plan}</span> */}
              </div>
        </Link>
        <div className="border-b border-border mb-2"></div>
      {Object.entries(groupedMenuItems).map(([groupLabel, items], index, array) => (
        <div key={groupLabel}>
          <SidebarGroup>
            <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
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
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            data-active={item.isActive || item.children?.some(child => child.isActive)}
                            className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                          >
                            {item.icon && <DynamicIcon name={item.icon} />}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.children?.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton 
                                  asChild
                                  data-active={subItem.isActive}
                                  className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                                >
                                  <Link
                                    to={subItem.url}
                                    onClick={() => onItemClick(subItem.title)}
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
                      onClick={() => onItemClick(item.title)}
                      data-active={item.isActive}
                      className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                      asChild
                    >
                      <Link to={item.url}>
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