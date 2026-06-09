import { useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { useFrappeAuth, useFrappePostCall } from "frappe-react-sdk"
import { Eye, EyeOff, Loader2, Zap, CheckCircle2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import SocialLogin from "@/auth/SocialLogin"
import toast from "@/lib/portal-toast"
import { getFrappeErrorMessage } from "@/lib/utils"

interface SignupFormInputs {
  first_name: string
  last_name: string
  email: string
}

interface PasswordFormInputs {
  password: string
  confirmPassword: string
}

type Step = "signup" | "password" | "done"

export default function Signup() {
  const [step, setStep] = useState<Step>("signup")
  const [userEmail, setUserEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { login, updateCurrentUser } = useFrappeAuth()
  const { call: signupUser, loading: creatingUser } = useFrappePostCall("sitebuilder.api.signup.user_signup")
  const { call: setPasswordCall, loading: settingPassword } = useFrappePostCall("sitebuilder.api.signup.set_password")
  const navigate = useNavigate()

  const signupForm = useForm<SignupFormInputs>()
  const passwordForm = useForm<PasswordFormInputs>()

  const handleSignup: SubmitHandler<SignupFormInputs> = async (data) => {
    setError(null)
    try {
      await signupUser({ first_name: data.first_name, last_name: data.last_name, email: data.email, username: data.email })
      setUserEmail(data.email)
      setStep("password")
    } catch (err) {
      setError(
        getFrappeErrorMessage(err) ??
          "Signup failed. This email may already be registered."
      )
    }
  }

  const handleSetPassword: SubmitHandler<PasswordFormInputs> = async (data) => {
    setError(null)
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    try {
      setStep("done")
      await setPasswordCall({ email: userEmail, new_password: data.password })
      await new Promise(r => setTimeout(r, 500))
      await login({ username: userEmail, password: data.password })
      await updateCurrentUser()
      toast.success("Welcome aboard!")
      navigate("/portal")
      window.location.reload()
    } catch {
      setError("Failed to set password. Please try logging in manually.")
      setStep("password")
    }
  }

  const steps = ["Create account", "Set password"]
  const stepIndex = step === "signup" ? 0 : 1

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* ── Brand panel ── */}
      <div className="hidden lg:flex flex-col bg-primary p-10 text-primary-foreground">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <Zap className="size-5" />
          Sitebuilder
        </div>
        <div className="flex-1 flex flex-col justify-center max-w-sm space-y-6">
          {[
            "Build portals for any Frappe app",
            "Drag-and-drop site pages with live blocks",
            "Auto-generate React components from doctypes",
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <CheckCircle2 className="size-5 shrink-0 text-primary-foreground/70" />
              <span className="text-primary-foreground/90">{feature}</span>
            </div>
          ))}
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

          {/* Step indicator */}
          {step !== "done" && (
            <div className="flex items-center gap-2">
              {steps.map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`flex items-center justify-center size-6 rounded-full text-xs font-medium transition-colors ${
                    i <= stepIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {i + 1}
                  </div>
                  <span className={`text-sm ${i === stepIndex ? "font-medium" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                  {i < steps.length - 1 && <div className="h-px w-6 bg-border" />}
                </div>
              ))}
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* ── Step 1: Details ── */}
          {step === "signup" && (
            <>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
                <p className="text-sm text-muted-foreground">Start building in minutes</p>
              </div>

              <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="first_name">First name</Label>
                    <Input id="first_name" placeholder="John" {...signupForm.register("first_name", { required: true })} />
                    {signupForm.formState.errors.first_name && <p className="text-xs text-destructive">Required</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="last_name">Last name</Label>
                    <Input id="last_name" placeholder="Doe" {...signupForm.register("last_name", { required: true })} />
                    {signupForm.formState.errors.last_name && <p className="text-xs text-destructive">Required</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" autoComplete="email"
                    {...signupForm.register("email", { required: true })} />
                  {signupForm.formState.errors.email && <p className="text-xs text-destructive">Required</p>}
                </div>

                <Button type="submit" className="w-full" disabled={creatingUser}>
                  {creatingUser && <Loader2 className="size-4 animate-spin mr-2" />}
                  {creatingUser ? "Creating account…" : "Continue"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <SocialLogin />

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-foreground hover:underline">Sign in</Link>
              </p>
            </>
          )}

          {/* ── Step 2: Password ── */}
          {step === "password" && (
            <>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Set your password</h1>
                <p className="text-sm text-muted-foreground">Choose a strong password for <span className="font-medium text-foreground">{userEmail}</span></p>
              </div>

              <form onSubmit={passwordForm.handleSubmit(handleSetPassword)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                      {...passwordForm.register("password", { required: true, minLength: { value: 8, message: "Min 8 characters" } })} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.password && (
                    <p className="text-xs text-destructive">{passwordForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <div className="relative">
                    <Input id="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="••••••••"
                      {...passwordForm.register("confirmPassword", { required: true })} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={settingPassword}>
                  {settingPassword && <Loader2 className="size-4 animate-spin mr-2" />}
                  {settingPassword ? "Setting up…" : "Create account"}
                </Button>

                <button type="button" onClick={() => setStep("signup")}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center">
                  ← Back
                </button>
              </form>
            </>
          )}

          {/* ── Step 3: Loading ── */}
          {step === "done" && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <Loader2 className="size-8 animate-spin text-primary" />
              <div>
                <p className="font-medium">Setting up your account…</p>
                <p className="text-sm text-muted-foreground mt-1">You'll be redirected shortly</p>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  )
}
