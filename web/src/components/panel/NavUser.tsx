"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { BadgeCheck, Bell, ChevronsUpDown, LogOut, Settings } from "lucide-react"
import { useFrappeAuth, useFrappeGetDoc } from "frappe-react-sdk"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar"
import { ModeToggle } from "@/utils/ModeToggle"
import UserSettings from "@/components/sections/UserSettings"

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const { data: user } = useFrappeGetDoc<FrappeUser>("User", currentUser || "")

  const handleLogout = async () => {
    await logout()
    navigate("/login")
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
                  <AvatarFallback className="rounded-lg">
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.full_name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
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
              </DropdownMenuLabel>

              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <ModeToggle />
                  Appearance
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                  <Settings className="size-4" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigate("/me")}>
                  <BadgeCheck className="size-4" />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/notifications")}>
                  <Bell className="size-4" />
                  Notifications
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

      <UserSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  )
}
