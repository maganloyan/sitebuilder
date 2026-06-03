import { AppSidebar } from "./AppSidebar"
import { Toaster } from "react-hot-toast"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Navbar } from "./Navbar"
import MainContent from "./MainContent"

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar onNavItemClick={() => {}} />
      <SidebarInset className="h-full">
        <Navbar />
        <div className="h-full overflow-auto bg-accent/20">
          <MainContent />
        </div>
        <Toaster position="top-right" />
      </SidebarInset>
    </SidebarProvider>
  )
}
