import {
 
    LucideIcon,
    User,
    BadgeCheck,
    Bell,
    LogOut,
    Globe,
    GraduationCap
  } from "lucide-react";


  

  type MenuItem = {
    label: string
    icon: LucideIcon
    path?: string
    onClick?: () => void
  }
  
  type MenuGroup = {
    items: MenuItem[]
  }
  

  export const userMenu = (handleLogout: () => void): MenuGroup[] => [
    {
      items: [
        {
          label: "My Account",
          icon: User,
          path: "/me"
        },
        {
          label: "Portal",
          icon: GraduationCap,
          path: "/portal/my-courses"
        },
        {
          label: "View Website",
          icon: Globe,
          path: "/home"
        }
      ]
    },
    {
      items: [
        {
          label: "Account",
          icon: BadgeCheck,
          path: "/portal/user/settings"
        },
        {
          label: "Notifications",
          icon: Bell,
          path: "/portal/notifications"
        }
      ]
    },
    {
      items: [
        {
          label: "Log out",
          icon: LogOut,
          onClick: handleLogout
        }
      ]
    }
  ]
  