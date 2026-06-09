import { FrappeProvider } from "frappe-react-sdk"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import "./index.css"
import { ThemeProvider } from "@/lib/ThemeProvider"
import { TooltipProvider } from "./components/ui/tooltip"
import NotFound from "./pages/NotFound"
import AppRoutes from "./AppRoutes"
import Page from "@/portal/layout/Page"
import ProtectedRoute from "@/auth/ProtectedRoute"
import { AuthLayout } from "@/layouts/auth-layout"
import { PublicLayout } from "@/layouts/public-layout"
import Login from "@/auth/Login"
import SignUp from "@/auth/Signup"
import ForgotPassword from "@/auth/ForgotPassword"
import { ThemeProvider as NextThemesProvider } from "next-themes"

function App() {
  return (
    <FrappeProvider siteName={import.meta.env.VITE_SITE_NAME} socketPort={import.meta.env.VITE_SOCKET_PORT}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <NextThemesProvider>
        <TooltipProvider>
          <BrowserRouter basename={import.meta.env.VITE_BASE_PATH}>
            <Routes>
              <Route
                path="/portal/*"
                element={
                  <ProtectedRoute requireAuth={true}>
                    <Page />
                  </ProtectedRoute>
                }
              />
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<ProtectedRoute requireAuth={false}><Login /></ProtectedRoute>} />
                <Route path="/signup" element={<ProtectedRoute requireAuth={false}><SignUp /></ProtectedRoute>} />
                <Route
                  path="/forgot-password"
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <ForgotPassword />
                    </ProtectedRoute>
                  }
                />
              </Route>
              <Route element={<PublicLayout />}>
                <Route path="/*" element={<AppRoutes />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        </NextThemesProvider>
      </ThemeProvider>
    </FrappeProvider>
  )
}

export default App
