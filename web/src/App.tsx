import { FrappeProvider } from "frappe-react-sdk"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import "./index.css"
import { ThemeProvider } from "./utils/ThemeProvider"
import { TooltipProvider } from "./components/ui/tooltip"
import NotFound from "./pages/NotFound"
import Layout from "./components/layout/Layout"
import AppRoutes from "./AppRoutes"
import Page from "./components/panel/Page"
import ProtectedRoute from "@/auth/ProtectedRoute"

function App() {
  return (
    <FrappeProvider siteName={import.meta.env.VITE_SITE_NAME} socketPort={import.meta.env.VITE_SOCKET_PORT}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <TooltipProvider>
          <BrowserRouter basename={import.meta.env.VITE_BASE_PATH}>
            <Routes>
              <Route path="/portal/*" element={<ProtectedRoute requireAuth={true}><Page /></ProtectedRoute>} />
              <Route path="/*" element={<Layout><AppRoutes /></Layout>} />
              <Route path="*" element={<Layout><NotFound /></Layout>} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </FrappeProvider>
  )
}

export default App
