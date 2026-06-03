import { useState } from "react"
import { Link, useLocation, Routes, Route, Navigate } from "react-router-dom"
import { Zap, Settings, Folder } from "lucide-react"
import { useFrappeGetDocList } from "frappe-react-sdk"
import { Skeleton } from "@/components/ui/skeleton"
import UserSettings from "./UserSettings"
import { DynamicIcon } from "@/components/extensions/DynamicIcon"

interface WorkPanel {
  name: string
  title: string
  route: string
  icon?: string
  parent_page?: string
  sequence_id?: number
}

const DashboardContent = () => (
  <div className="p-4">
    <h2 className="text-lg font-semibold">Dashboard Overview</h2>
  </div>
)

export const MainContent = () => (
  <main className="p-4">
    <Routes>
      <Route index element={<DashboardContent />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </main>
)

const Sidebar = ({ isSidebarOpen }: { isSidebarOpen: boolean }) => {
  const location = useLocation()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const { data: panels, isLoading } = useFrappeGetDocList<WorkPanel>("Work Panel", {
    fields: ["name", "title", "route", "icon", "parent_page", "sequence_id"],
    filters: [["parent_page", "=", ""]],
    orderBy: { field: "sequence_id", order: "asc" },
  })

  return (
    <aside className={`${isSidebarOpen ? "w-48" : "w-16"} transition-all duration-200 ease-in-out bg-accent border-r`}>
      <div className="flex flex-col h-full">
        <Link to="/dashboard" className="flex items-center justify-center py-4">
          <Zap className="w-8 h-8 text-primary" />
          {isSidebarOpen && <span className="ml-2 text-lg font-semibold">Portal</span>}
        </Link>
        <div className="border-b border-border mb-4" />

        <nav className="flex flex-col flex-grow">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center p-2 gap-2">
                <Skeleton className="w-5 h-5" />
                {isSidebarOpen && <Skeleton className="h-4 w-24" />}
              </div>
            ))
          ) : (
            panels?.map((panel) => (
              <Link
                key={panel.name}
                to={`/portal/${panel.route}`}
                className={`flex items-center p-2 hover:bg-accent/80 ${
                  location.pathname === `/portal/${panel.route}` ? "bg-accent font-semibold" : ""
                }`}
              >
                <DynamicIcon name={panel.icon || "Folder"} className="w-5 h-5" />
                {isSidebarOpen && <span className="ml-2">{panel.title}</span>}
              </Link>
            ))
          )}

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="mt-auto flex items-center p-2 border-t border-border hover:bg-accent/80"
          >
            <Settings className="w-6 h-6" />
            {isSidebarOpen && <span className="ml-2">Settings</span>}
          </button>
          <UserSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar
