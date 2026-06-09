import * as React from "react"
import { Link } from "react-router-dom"
import { ChevronRight, MoreHorizontal } from "lucide-react"
import { DynamicIcon } from "@/portal/DynamicIcon"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface MenuItem {
  title: string
  url: string
  icon?: string
  is_group: boolean
  isActive?: boolean
  children?: {
    title: string
    url: string
    isActive?: boolean
  }[]
}

interface CollapseMenuProps {
  item: MenuItem
  onItemClick?: (title: string) => void
}

export function CollapseMenu({ item, onItemClick }: CollapseMenuProps) {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"
  const [isOpen, setIsOpen] = React.useState(false)

  if (!collapsed || !item.is_group) {
    return null
  }

  const handleMouseEnter = () => setIsOpen(true)
  const handleMouseLeave = () => setIsOpen(false)
  const groupActive =
    item.isActive || item.children?.some((child) => child.isActive)

  return (
    <SidebarMenuItem 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={groupActive}
            className="data-active:bg-sidebar-primary/12 data-active:text-sidebar-primary data-active:font-medium data-active:shadow-[inset_3px_0_0_0_var(--sidebar-primary)]"
          >
            {item.icon && <DynamicIcon name={item.icon} />}
            
            {!collapsed && <span>{item.title}</span>}
            {item.children && item.children.length > 0 && (
              <ChevronRight className="ml-auto h-4 w-4" />
            )}
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        {item.children && item.children.length > 0 && (
          <DropdownMenuContent 
            side="right" 
            align="start" 
            className="w-48"
          >
            <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
            <Separator/>
            {item.children.map((subItem) => (
              <DropdownMenuItem key={subItem.title} asChild>
                <Link
                  to={subItem.url}
                  onClick={() => onItemClick?.(subItem.title)}
                  className={cn(
                    "w-full cursor-pointer",
                    subItem.isActive && "bg-sidebar-primary/10 text-sidebar-primary font-medium"
                  )}
                >
                  {subItem.title}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </SidebarMenuItem>
  )
}
