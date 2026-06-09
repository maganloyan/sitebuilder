import { DashboardLayout } from "@/layouts/dashboard-layout"
import MainContent from "./MainContent"

/** Portal app shell — see App.tsx `/portal/*` and MainContent routes. */
export default function Page() {
  return (
    <DashboardLayout>
      <MainContent />
    </DashboardLayout>
  )
}
