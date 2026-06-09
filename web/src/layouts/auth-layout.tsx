import { Outlet } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"

/** Auth pages use their own full-bleed layouts; this shell only sets page background. */
export function AuthLayout() {
  return (
    <div className="min-h-svh bg-muted/30">
      <Outlet />
      <Toaster position="top-right" richColors closeButton />
    </div>
  )
}
