"use client"


import { useNavigate } from "react-router-dom"
import { BadgeCheck, Bell, EllipsisVertical, LogOut, Settings } from "lucide-react"
import { useFrappeAuth, useFrappeGetDoc } from "frappe-react-sdk"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar"
import { getInitials } from "@/lib/utils"
import { PORTAL_SETTINGS_PATH } from "@/components/kit"

interface FrappeUser {
  name: string
  user_image: string
  full_name: string
  first_name: string
  last_name: string
  email: string
}

export function NavUser() {
  const { currentUser, logout } = useFrappeAuth()
  const navigate = useNavigate()
  const { isMobile } = useSidebar()
  const { data: user } = useFrappeGetDoc<FrappeUser>("User", currentUser || "")

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // Session may already be Guest; still send user to login.
    } finally {
      navigate("/login", { replace: true })
    }
  }

  if (!user) return null

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.user_image} alt={user.full_name} />
                  <AvatarFallback className="rounded-lg">{getInitials(user.full_name)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.full_name}</span>
                  <span className="truncate text-muted-foreground text-xs">{user.email}</span>
                </div>
                <EllipsisVertical className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              {/* <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.user_image} alt={user.full_name} />
                    <AvatarFallback className="rounded-lg">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.full_name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel> */}

              
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigate(`${PORTAL_SETTINGS_PATH}#profile`)}>
                  <Settings className="size-4" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuGroup>

             
              

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

    </>
  )
}
