import { useEffect, useMemo } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "motion/react"
import { useFrappeGetDocCount, useFrappeGetDocList, useFrappeAuth } from "frappe-react-sdk"
import { LayoutDashboard, FileText, Bell, Users, Sparkles, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { NotificationItem } from "@/components/kit"
import { NotificationCompactSkeleton, QuickAccessSkeleton } from "@/components/kit/feedback/view-skeletons"
import { DynamicIcon } from "@/portal/DynamicIcon"
import { usePortalBrand } from "@/hooks/use-portal-brand"
import { usePortalNotifications } from "@/hooks/use-portal-notifications"
import { usePortalPageMetaOverride } from "@/context/portal-page-meta-context"
import { cardContainerVariants, cardItemVariants, staggerContainerVariants, staggerItemVariants } from "@/lib/motion-variants"
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
  const inner = (
    <div className="group overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/20 hover:shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{title}</span>
        <div className="rounded-lg bg-primary/10 p-2 text-primary group-hover:scale-105 transition-transform">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-4 space-y-1">
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <h3 className="text-3xl font-bold tracking-tight text-foreground">{value ?? 0}</h3>
        )}
        {href && !loading && (
          <p className="flex items-center gap-1 text-xs font-medium text-primary">
            View all <ArrowRight className="h-3 w-3" />
          </p>
        )}
      </div>
    </div>
  )

  return (
    <motion.div variants={cardItemVariants}>
      {href ? <Link to={href}>{inner}</Link> : inner}
    </motion.div>
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
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <h2 className="text-base font-bold text-foreground">Quick Access</h2>
      {isLoading ? (
        <QuickAccessSkeleton />
      ) : (
      <motion.div
        className="grid grid-cols-2 gap-3"
        variants={staggerContainerVariants}
        initial="hidden"
        animate="show"
      >
          {panels?.map(panel => (
            <motion.div key={panel.name} variants={staggerItemVariants}>
              <Link
                to={`/portal/${panel.route}`}
                className="flex items-start gap-3 rounded-lg border border-border/50 bg-background p-4 transition-all hover:border-primary/25 hover:shadow-xs"
              >
                <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                  {panel.icon ? (
                    <DynamicIcon name={panel.icon} className="size-4" />
                  ) : (
                    <LayoutDashboard className="size-4" />
                  )}
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-semibold text-foreground truncate">{panel.title}</p>
                  <p className="text-[11px] text-muted-foreground">Open panel</p>
                </div>
              </Link>
            </motion.div>
          ))
        }
      </motion.div>
      )}
    </div>
  )
}

// ── Recent Notifications ─────────────────────────────────────────────────────

function RecentNotifications() {
  const { notifications, unreadCount, isLoading } = usePortalNotifications(5)

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">Recent Notifications</h2>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="default" className="h-5 px-1.5 text-[10px]">
              {unreadCount} unread
            </Badge>
          )}
          <Link to="/portal/notifications" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            View all
          </Link>
        </div>
      </div>
      <div className="space-y-1">
        {isLoading ? (
          <NotificationCompactSkeleton />
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 border border-dashed border-border/60 rounded-lg">
            <Bell className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-xs font-semibold text-foreground">All caught up</p>
            <p className="text-[11px] text-muted-foreground">No new notifications</p>
          </div>
        ) : (
          <motion.div
            className="space-y-1"
            variants={staggerContainerVariants}
            initial="hidden"
            animate="show"
          >
            {notifications.map(n => (
              <motion.div key={n.id} variants={staggerItemVariants}>
                <NotificationItem notification={n} variant="compact" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

// ── Dashboard Overview ───────────────────────────────────────────────────────

function DashboardOverview() {
  const { appName, isLoading: brandLoading } = usePortalBrand()
  const { currentUser } = useFrappeAuth()
  const { apply: applyPageMeta, clear: clearPageMeta } = usePortalPageMetaOverride()
  const { data: panelCount, isLoading: lp } = useFrappeGetDocCount("Work Panel")
  const { data: publishedCount, isLoading: lpub } = useFrappeGetDocCount("Work Panel", [["published", "=", 1]])
  const { data: pageCount, isLoading: lg } = useFrappeGetDocCount("Site Page")
  const { data: unread, isLoading: ln } = useFrappeGetDocCount("Notification Log", [["read", "=", 0]])
  const { data: userCount, isLoading: lu } = useFrappeGetDocCount("Portal User")

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
  const firstName = currentUser ? currentUser.split("@")[0] : ""

  const panelProgress = panelCount && panelCount > 0
    ? Math.round(((publishedCount ?? 0) / panelCount) * 100)
    : 0

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
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-radial from-primary/[0.08] to-transparent p-6 md:p-8">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3 w-3" />
            <span>{brandLoading ? "Portal" : (appName ?? "Portal")} Online</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {greeting}, <span className="text-primary">{firstName || "there"}</span>!
          </h1>
          <p className="text-sm text-muted-foreground">
            Here's a quick overview of your portal.
            {(unread ?? 0) > 0 && (
              <> You have <span className="font-semibold text-foreground">{unread} unread notification{unread !== 1 ? "s" : ""}</span>.</>
            )}
          </p>
        </div>
        <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 opacity-5 pointer-events-none">
          <LayoutDashboard className="h-64 w-64 text-primary" />
        </div>
      </div>

      {/* Stat Cards with stagger */}
      <motion.div
        className="grid gap-4 grid-cols-2 lg:grid-cols-4"
        variants={cardContainerVariants}
        initial="hidden"
        animate="show"
      >
        <StatCard title="Work Panels" value={panelCount ?? 0} icon={LayoutDashboard} href="/portal/app/work-panel" loading={lp} />
        <StatCard title="Site Pages" value={pageCount ?? 0} icon={FileText} href="/portal/app/site-page" loading={lg} />
        <StatCard title="Unread Alerts" value={unread ?? 0} icon={Bell} href="/portal/notifications" loading={ln} />
        <StatCard title="Portal Users" value={userCount ?? 0} icon={Users} href="/portal/app/portal-user" loading={lu} />
      </motion.div>

      {/* Quick Access + Notifications */}
      <div className="grid gap-4 md:grid-cols-2">
        <QuickActions />
        <RecentNotifications />
      </div>

      {/* Portal Progress */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-foreground">Portal Progress</h2>
            <p className="text-xs text-muted-foreground">
              {lp || lpub ? "Loading…" : `${publishedCount ?? 0} of ${panelCount ?? 0} panels published`}
            </p>
          </div>
          <span className="text-sm font-semibold text-primary">{lp || lpub ? "–" : `${panelProgress}%`}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
          {!lp && !lpub && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${panelProgress}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full bg-primary rounded-full"
            />
          )}
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-background py-2.5 border border-border/50">
            <span className="block text-lg font-bold text-foreground">{lp ? "–" : (panelCount ?? 0)}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-medium">Total</span>
          </div>
          <div className="rounded-lg bg-background py-2.5 border border-border/50">
            <span className="block text-lg font-bold text-emerald-600">{lpub ? "–" : (publishedCount ?? 0)}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-medium">Published</span>
          </div>
          <div className="rounded-lg bg-background py-2.5 border border-border/50">
            <span className="block text-lg font-bold text-amber-600">
              {lp || lpub ? "–" : (panelCount ?? 0) - (publishedCount ?? 0)}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase font-medium">Drafts</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Router ───────────────────────────────────────────────────────────────────

export default function MainContent() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.18 }}
      >
        <Routes location={location}>
          <Route path="/" element={<DashboardOverview />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/:pageName" element={<DynamicPanel />} />
          <Route path="/app/:doctype" element={<ListView />} />
          <Route path="/app/:doctype/view/:docId" element={<FormView />} />
          <Route path="/app/:doctype/new" element={<CreateView />} />
          <Route path="/page-builder/:pageName" element={<PageBuilder />} />
          <Route path="/user/settings/*" element={<SettingsPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}
