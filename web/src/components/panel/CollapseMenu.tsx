import * as React from "react"
import { Link } from "react-router-dom"
import { ChevronRight, MoreHorizontal } from "lucide-react"
import { DynamicIcon } from "@/components/extensions/DynamicIcon"
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

interface MenuItem {
  title: string
  url: string
  icon?: string
  is_group: boolean
  children?: {
    title: string
    url: string
  }[]
}

interface CollapseMenuProps {
  item: MenuItem
  onItemClick: (title: string) => void
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

  return (
    <SidebarMenuItem 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton 
            // tooltip={item.title}
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
                  onClick={() => onItemClick(subItem.title)}
                  className="w-full cursor-pointer"
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
