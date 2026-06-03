import { Routes, Route } from "react-router-dom"
import { useFrappeGetDocCount, useFrappeGetDocList, useFrappeAuth } from "frappe-react-sdk"
import { LayoutDashboard, FileText, Bell, Users, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import DynamicPanel from "./DynamicPanel"
import ListView from "../lists/ListView"
import FormView from "../lists/FormView"
import CreateView from "../lists/CreateView"
import Settings from "../sections/UserSettings"

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
  const { data, isLoading } = useFrappeGetDocList("Notification Log", {
    fields: ["name", "subject", "creation", "read"],
    orderBy: { field: "creation", order: "desc" },
    limit: 5,
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Recent Notifications</CardTitle>
        <Badge variant="secondary">{data?.length ?? 0}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-start">
              <Skeleton className="size-2 rounded-full mt-1.5 shrink-0" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))
        ) : data?.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notifications</p>
        ) : (
          data?.map(n => (
            <div key={n.name} className="flex gap-3 items-start">
              <span className={`size-2 rounded-full mt-1.5 shrink-0 ${n.read ? "bg-muted-foreground/30" : "bg-primary"}`} />
              <p className="text-sm leading-snug">{n.subject}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

// ── Quick Actions ────────────────────────────────────────────────────────────

function QuickActions() {
  const { data: panels, isLoading } = useFrappeGetDocList("Work Panel", {
    fields: ["name", "title", "route"],
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
              <LayoutDashboard className="size-4 text-muted-foreground shrink-0" />
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
  const { currentUser } = useFrappeAuth()
  const { data: panelCount, isLoading: lp } = useFrappeGetDocCount("Work Panel")
  const { data: pageCount, isLoading: lg } = useFrappeGetDocCount("Site Page")
  const { data: unread, isLoading: ln } = useFrappeGetDocCount("Notification Log", [["read", "=", 0]])
  const { data: userCount, isLoading: lu } = useFrappeGetDocCount("Portal User")

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">{greeting}{currentUser ? `, ${currentUser.split("@")[0]}` : ""}!</h1>
        <p className="text-muted-foreground text-sm mt-1">Here's what's happening in your portal.</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Work Panels" value={panelCount ?? 0} icon={LayoutDashboard} href="/portal/app/work-panel" loading={lp} />
        <StatCard title="Site Pages" value={pageCount ?? 0} icon={FileText} href="/portal/app/site-page" loading={lg} />
        <StatCard title="Unread Alerts" value={unread ?? 0} icon={Bell} loading={ln} />
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
    <main className="h-full">
      <Routes>
        <Route path="/" element={<DashboardOverview />} />
        <Route path="/:pageName" element={<DynamicPanel />} />
        <Route path="/app/:doctype" element={<ListView />} />
        <Route path="/app/:doctype/view/:docId" element={<FormView />} />
        <Route path="/app/:doctype/new" element={<CreateView />} />
        <Route path="/user/settings" element={<Settings isOpen={true} onClose={() => {}} />} />
      </Routes>
    </main>
  )
}