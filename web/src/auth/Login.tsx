import { useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { useFrappeAuth } from "frappe-react-sdk"
import { Eye, EyeOff, Zap } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import SocialLogin from "@/auth/SocialLogin"

interface LoginFormInput {
  usernameOrEmail: string
  password: string
}

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormInput>()
  const { login, updateCurrentUser } = useFrappeAuth()
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const navigate = useNavigate()

  const onSubmit: SubmitHandler<LoginFormInput> = async (data) => {
    setLoginError(null)
    try {
      await login({ username: data.usernameOrEmail, password: data.password })
      await updateCurrentUser()
      navigate("/portal")
      window.location.reload()
    } catch {
      setLoginError("Invalid credentials. Please check your email and password.")
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
        <div className="flex-1 flex flex-col justify-center max-w-sm">
          <blockquote className="space-y-4">
            <p className="text-xl font-medium leading-relaxed">
              "Build powerful portals and websites for any Frappe app — without writing a single line of backend code."
            </p>
            <footer className="text-primary-foreground/70 text-sm">
              Powered by Frappe Framework
            </footer>
          </blockquote>
        </div>
        <p className="text-primary-foreground/50 text-xs">
          © {new Date().getFullYear()} Sitebuilder
        </p>
      </div>

      {/* ── Form panel ── */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 font-semibold text-lg lg:hidden">
            <Zap className="size-5 text-primary" />
            Sitebuilder
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
          </div>

          {loginError && (
            <Alert variant="destructive">
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="usernameOrEmail">Email</Label>
              <Input
                id="usernameOrEmail"
                type="text"
                placeholder="you@example.com"
                autoComplete="username"
                {...register("usernameOrEmail", { required: "Email is required" })}
              />
              {errors.usernameOrEmail && (
                <p className="text-xs text-destructive">{errors.usernameOrEmail.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={passwordVisible ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register("password", { required: "Password is required" })}
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or continue with</span>
            </div>
          </div>

          <SocialLogin />

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-foreground hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

    </div>
  )
}
