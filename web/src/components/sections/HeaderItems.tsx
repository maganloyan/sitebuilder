"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/utils/ModeToggle"
import Notifications from "./Notifications"
import { useNavigate } from "react-router-dom"
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useFrappeAuth, useFrappeGetDoc } from "frappe-react-sdk"
import UserSettings from "./UserSettings"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { userMenu } from "@/auth/userMenu"

interface FrappeUser {
  full_name: string
  user_image: string
  first_name: string
  last_name: string
  email: string
}

export function HeaderItems() {
  const navigate = useNavigate()
  const { currentUser, logout } = useFrappeAuth()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const { data: userData } = useFrappeGetDoc<FrappeUser>("User", currentUser || "")

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const menuGroups = userMenu(handleLogout)

  return (
    <div className="flex h-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-2">
      {currentUser ? (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-auto h-10 w-10">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Notifications />
            </DropdownMenuContent>
          </DropdownMenu>

          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userData?.user_image} alt={userData?.full_name} />
                  <AvatarFallback>
                    {userData?.first_name?.[0]}{userData?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{userData?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{userData?.email}</p>
                </div>
              </DropdownMenuLabel>
              {menuGroups.map((group, gi) => (
                <div key={gi}>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {group.items.map((item, ii) => (
                      <DropdownMenuItem
                        key={ii}
                        onClick={item.onClick ?? (item.path ? () => {
                          if (item.label === "Settings") setIsSettingsOpen(true)
                          else navigate(item.path!)
                        } : undefined)}
                      >
                        <item.icon className="mr-2 size-4" />
                        {item.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <UserSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </>
      ) : (
        <>
          <Button variant="ghost" onClick={() => navigate("/signup")}>Sign Up</Button>
          <Button variant="default" onClick={() => navigate("/login")}>Sign In</Button>
        </>
      )}
    </div>
  )
}

export default HeaderItems
