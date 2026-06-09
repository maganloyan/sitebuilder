import { useEffect, useMemo } from "react"
import { Routes, Route } from "react-router-dom"
import { useFrappeGetDocCount, useFrappeGetDocList, useFrappeAuth } from "frappe-react-sdk"
import { LayoutDashboard, FileText, Bell, Users, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { NotificationItem } from "@/components/kit"
import { DynamicIcon } from "@/portal/DynamicIcon"
import { usePortalBrand } from "@/hooks/use-portal-brand"
import { usePortalNotifications } from "@/hooks/use-portal-notifications"
import { usePortalPageMetaOverride } from "@/context/portal-page-meta-context"
import DynamicPanel from "../DynamicPanel"
import ListView from "@/builder/views/ListView"
import FormView from "@/builder/views/FormView"
import CreateView from "@/builder/views/CreateView"
import { NotificationsPage } from "@/pages/portal/NotificationsPage"
import { SettingsPage } from "@/pages/portal/SettingsPage"
import { PageBuilder } from "@/pages/portal/PageBuilder"

// ── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ title, value, icon: Icon, href, loading }: {
  title: string; value?: number; icon: React.ElementType; href?: string; loading?: boolean
}) {
  const content = (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold">{value ?? 0}</span>
            {href && <ArrowRight className="size-4 text-muted-foreground" />}
          </div>
        )}
      </CardContent>
    </Card>
  )
  return href ? <Link to={href}>{content}</Link> : content
}

// ── Recent Notifications ─────────────────────────────────────────────────────

function RecentNotifications() {
  const { notifications, unreadCount, isLoading } = usePortalNotifications(5)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Recent Notifications</CardTitle>
        <div className="flex items-center gap-2">
          {unreadCount > 0 ? (
            <Badge variant="default" className="h-5 px-1.5 text-[10px]">
              {unreadCount} unread
            </Badge>
          ) : null}
          <Link
            to="/portal/notifications"
            className="text-muted-foreground text-xs hover:text-foreground"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-start">
              <Skeleton className="size-9 shrink-0 rounded-lg" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))
        ) : notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No notifications yet</p>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              variant="compact"
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}

// ── Quick Actions ────────────────────────────────────────────────────────────

function QuickActions() {
  const { data: panels, isLoading } = useFrappeGetDocList("Work Panel", {
    fields: ["name", "title", "route", "icon"],
    filters: [["parent_page", "=", ""]],
    orderBy: { field: "sequence_id", order: "asc" },
    limit: 6,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Quick Access</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)
          : panels?.map(panel => (
            <Link
              key={panel.name}
              to={`/portal/${panel.route}`}
              className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
            >
              {panel.icon ? (
                <DynamicIcon name={panel.icon} className="size-4 text-muted-foreground shrink-0" />
              ) : (
                <LayoutDashboard className="size-4 text-muted-foreground shrink-0" />
              )}
              <span className="truncate">{panel.title}</span>
            </Link>
          ))
        }
      </CardContent>
    </Card>
  )
}

// ── Dashboard Overview ───────────────────────────────────────────────────────

function DashboardOverview() {
  const { appName, isLoading: brandLoading } = usePortalBrand()
  const { currentUser } = useFrappeAuth()
  const { apply: applyPageMeta, clear: clearPageMeta } = usePortalPageMetaOverride()
  const { data: panelCount, isLoading: lp } = useFrappeGetDocCount("Work Panel")
  const { data: pageCount, isLoading: lg } = useFrappeGetDocCount("Site Page")
  const { data: unread, isLoading: ln } = useFrappeGetDocCount("Notification Log", [["read", "=", 0]])
  const { data: userCount, isLoading: lu } = useFrappeGetDocCount("Portal User")

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
  const firstName = currentUser ? currentUser.split("@")[0] : ""

  const pageMeta = useMemo(
    () => ({
      title: `${greeting}${firstName ? `, ${firstName}` : ""}`,
      description: brandLoading
        ? "Here's a quick overview of your portal."
        : `Here's what's happening in ${appName}.`,
      breadcrumbs: [
        { label: "Portal", href: "/portal" },
        { label: "Dashboard" },
      ],
    }),
    [greeting, firstName, brandLoading, appName]
  )

  useEffect(() => {
    applyPageMeta(pageMeta)
    return () => clearPageMeta()
  }, [applyPageMeta, clearPageMeta, pageMeta.title, pageMeta.description])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Work Panels" value={panelCount ?? 0} icon={LayoutDashboard} href="/portal/app/work-panel" loading={lp} />
        <StatCard title="Site Pages" value={pageCount ?? 0} icon={FileText} href="/portal/app/site-page" loading={lg} />
        <StatCard title="Unread Alerts" value={unread ?? 0} icon={Bell} href="/portal/notifications" loading={ln} />
        <StatCard title="Portal Users" value={userCount ?? 0} icon={Users} href="/portal/app/portal-user" loading={lu} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <QuickActions />
        <RecentNotifications />
      </div>
    </div>
  )
}

// ── Router ───────────────────────────────────────────────────────────────────

export default function MainContent() {
  return (
    <Routes>
      <Route path="/" element={<DashboardOverview />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/:pageName" element={<DynamicPanel />} />
      <Route path="/app/:doctype" element={<ListView />} />
      <Route path="/app/:doctype/view/:docId" element={<FormView />} />
      <Route path="/app/:doctype/new" element={<CreateView />} />
      <Route path="/page-builder/:pageName" element={<PageBuilder />} />
      <Route path="/user/settings/*" element={<SettingsPage />} />
    </Routes>
  )
}
