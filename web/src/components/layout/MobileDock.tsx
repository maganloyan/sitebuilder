import { Link, useLocation } from "react-router-dom"
import { Home, LayoutDashboard, Bell, User } from "lucide-react"
import { useFrappeAuth, useFrappeGetDocCount } from "frappe-react-sdk"

export default function MobileDock() {
  const location = useLocation()
  const { currentUser } = useFrappeAuth()

  const { data: unreadCount } = useFrappeGetDocCount("Notification Log", [["read", "=", 0]])

  const links = [
    { to: "/",         icon: Home,            label: "Home" },
    { to: "/portal",   icon: LayoutDashboard, label: "Portal",  requireAuth: true },
    { to: "/notifications", icon: Bell,       label: "Alerts",  requireAuth: true, badge: unreadCount },
    { to: "/me",       icon: User,            label: "Profile", requireAuth: true },
  ]

  const visible = links.filter(l => !l.requireAuth || !!currentUser)

  if (location.pathname.startsWith("/portal")) return null

  return (
    <div className="sm:hidden fixed z-50 bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <nav className="flex h-16 items-center justify-around px-2">
        {visible.map(({ to, icon: Icon, label, badge }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors relative ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="relative">
                <Icon className="size-5" />
                {!!badge && (
                  <span className="absolute -top-1 -right-1 size-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-medium">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}