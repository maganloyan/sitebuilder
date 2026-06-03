import { useState } from "react"
import { Link } from "react-router-dom"
import { useForm, SubmitHandler } from "react-hook-form"
import { Zap, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FormInput {
  email: string
}

export default function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, watch, formState: { isSubmitting, errors } } = useForm<FormInput>()
  const email = watch("email", "")

  const onSubmit: SubmitHandler<FormInput> = async (data) => {
    setError(null)
    try {
      const res = await fetch("/api/method/frappe.core.doctype.user.user.reset_password", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Frappe-CSRF-Token": "fetch" },
        body: JSON.stringify({ user: data.email }),
      })
      const json = await res.json()
      if (json.exc || res.status >= 400) {
        setError("No account found with that email address.")
        return
      }
      setSent(true)
    } catch {
      setError("Something went wrong. Please try again.")
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* ── Brand panel ── */}
      <div className="hidden lg:flex flex-col bg-primary p-10 text-primary-foreground">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <Zap className="size-5" />
          Sitebuilder
        </div>
        <div className="flex-1 flex items-center">
          <p className="text-xl font-medium leading-relaxed max-w-sm text-primary-foreground/90">
            "Forgot your password? No problem — we'll send you a reset link right away."
          </p>
        </div>
        <p className="text-primary-foreground/50 text-xs">© {new Date().getFullYear()} Sitebuilder</p>
      </div>

      {/* ── Form panel ── */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 font-semibold text-lg lg:hidden">
            <Zap className="size-5 text-primary" />
            Sitebuilder
          </div>

          {sent ? (
            /* ── Success state ── */
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <CheckCircle2 className="size-12 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  We sent a password reset link to{" "}
                  <span className="font-medium text-foreground">{email}</span>.
                  <br />
                  It may take a minute to arrive.
                </p>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/login">
                  <ArrowLeft className="size-4 mr-2" />
                  Back to login
                </Link>
              </Button>
            </div>
          ) : (
            /* ── Request form ── */
            <>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Forgot password?</h1>
                <p className="text-sm text-muted-foreground">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    placeholder="you@example.com"
                    {...register("email", { required: "Email is required" })}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="size-4 animate-spin mr-2" />}
                  {isSubmitting ? "Sending…" : "Send reset link"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Remember it?{" "}
                <Link to="/login" className="font-medium text-foreground hover:underline">
                  Back to login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>

    </div>
  )
}
