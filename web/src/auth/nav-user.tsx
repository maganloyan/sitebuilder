import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ChevronsUpDown } from "lucide-react"
import { useFrappeAuth, useFrappeGetDoc } from 'frappe-react-sdk'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { userMenu } from "@/auth/userMenu"

interface FrappeUser {
  name: string
  user_image: string
  full_name: string
  first_name: string
  last_name: string
  email: string
}

export function NavUser() {
  const { currentUser, logout, isLoading: authLoading } = useFrappeAuth()
  const navigate = useNavigate()
  
  const { data: userData, isLoading: userLoading } = useFrappeGetDoc<FrappeUser>(
    'User', 
    currentUser || ''
  )

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login')
    }
  }, [authLoading, currentUser, navigate])

  if (authLoading || userLoading || !userData) {
    return null
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const menuGroups = userMenu(handleLogout)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg  hover:bg-accent">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={userData.user_image} alt={userData.full_name} />
            <AvatarFallback className="rounded-lg">
              {userData.first_name?.[0]}{userData.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <ChevronsUpDown className="size-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56 rounded-lg"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 p-2">
            <div className="grid flex-1 text-left text-sm">
              <span className="font-semibold">{userData.full_name}</span>
              <span className="text-xs text-muted-foreground">{userData.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>

        {menuGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {group.items.map((item, itemIndex) => (
                <DropdownMenuItem
                  key={itemIndex}
                  onClick={item.onClick}
                  asChild={!item.onClick}
                >
                  {item.path ? (
                    <Link to={item.path} className="flex items-center w-full">
                      <item.icon className="mr-2 size-4" />
                      {item.label}
                    </Link>
                  ) : (
                    <div className="flex items-center w-full">
                      <item.icon className="mr-2 size-4" />
                      {item.label}
                    </div>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
