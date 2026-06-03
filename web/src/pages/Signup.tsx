import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useFrappeAuth, useFrappeCreateDoc, useFrappeUpdateDoc } from "frappe-react-sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface SignupFormInputs {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
}

interface PasswordFormInputs {
  password: string;
  confirmPassword: string;
}

interface FrappeError {
  message: string;
  httpStatus?: number;
  exception?: string;
}

const Signup: React.FC = () => {
  const [step, setStep] = useState<"signup" | "password" | "loggingIn">("signup");
  const [userEmail, setUserEmail] = useState("");
  const [signupError, setSignupError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { login, updateCurrentUser } = useFrappeAuth();
  const { createDoc, loading: creatingUser } = useFrappeCreateDoc();
  const { updateDoc, loading: updatingPassword } = useFrappeUpdateDoc();

  const navigate = useNavigate();

  // Signup Form Handling
  const {
    register: registerSignup,
    handleSubmit: handleSubmitSignup,
    formState: { errors: signupErrors },
  } = useForm<SignupFormInputs>();

  // Password Form Handling
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormInputs>();

  // Handle Signup (CREATE USER)
  const handleSignup: SubmitHandler<SignupFormInputs> = async (data) => {
    setSignupError(null);
    try {
      await createDoc("User", {
        email: data.email,
        username: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        enabled: 1,
        
        
      });

      setUserEmail(data.email);
      setStep("password");
    } catch (error) {
      setSignupError("Signup failed. Email might already exist.");
      console.error("Signup error:", error);
    }
  };

  // Handle Password Setup (ONLY UPDATE PASSWORD)
  const handleSetPassword: SubmitHandler<PasswordFormInputs> = async (data) => {
    setPasswordError(null);
    if (data.password !== data.confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    try {
      setStep("loggingIn");
      setIsLoggingIn(true);

      // First update the password
      await updateDoc("User", userEmail, { new_password: data.password });
      
      // Wait for a second to ensure password is properly set
      await new Promise(resolve => setTimeout(resolve, 500));

      // Attempt Login
      try {
        await login({
          username: userEmail,
          password: data.password,
        });
        await updateCurrentUser();
        toast.success("Successfully logged in!");
        navigate("/portal");
      } catch (loginError) {
        const error = loginError as FrappeError;
        console.error("Login error:", error);
        if (error?.httpStatus === 401) {
          toast.error("Login failed. Please try again.");
          setPasswordError("Login failed. Please wait a moment and try logging in again.");
        } else {
          toast.error("An unexpected error occurred.");
          setPasswordError("An unexpected error occurred. Please try logging in manually.");
        }
      }
    } catch (error) {
      toast.error("Failed to set password.");
      setPasswordError("Failed to set password. Please try again.");
      console.error("Password setup error:", error);
      setStep("password"); // Go back to password step on error
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      {/* Left Column - Form Section */}
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          {step === "signup" && (
            <>
              <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold">Create Account</h1>
                <p className="text-muted-foreground">
                  Enter your details below to create your account
                </p>
              </div>
              <form onSubmit={handleSubmitSignup(handleSignup)} className="grid gap-4">
                {signupError && <p className="text-red-500 text-center">{signupError}</p>}

                {/* Name Fields Side by Side */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input 
                      id="first_name" 
                      placeholder="John"
                      {...registerSignup("first_name", { required: "First name is required" })} 
                    />
                    {signupErrors.first_name && <p className="text-red-500 text-sm">{signupErrors.first_name.message}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input 
                      id="last_name" 
                      placeholder="Doe"
                      {...registerSignup("last_name", { required: "Last name is required" })} 
                    />
                    {signupErrors.last_name && <p className="text-red-500 text-sm">{signupErrors.last_name.message}</p>}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john@example.com"
                    {...registerSignup("email", { required: "Email is required" })} 
                  />
                  {signupErrors.email && <p className="text-red-500 text-sm">{signupErrors.email.message}</p>}
                </div>

                <Button type="submit" disabled={creatingUser} className="w-full mt-2">
                  {creatingUser ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {creatingUser ? "Creating Account..." : "Sign Up"}
                </Button>

                <div className="mt-4 text-center text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:underline">
                    Login
                  </Link>
                </div>
              </form>
            </>
          )}

          {step === "password" && (
            <form 
              onSubmit={handleSubmitPassword(handleSetPassword)} 
              className="space-y-4 transition-all"
            >
              <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold">Set Password</h1>
                <p className="text-muted-foreground">
                  Create a secure password for your account
                </p>
              </div>

              {passwordError && <p className="text-red-500 text-center">{passwordError}</p>}

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password" 
                    {...registerPassword("password", { required: "Password is required" })} 
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.password && <p className="text-red-500 text-sm">{passwordErrors.password.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input 
                    id="confirmPassword" 
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password" 
                    {...registerPassword("confirmPassword", { required: "Confirm password is required" })} 
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && <p className="text-red-500 text-sm">{passwordErrors.confirmPassword.message}</p>}
              </div>

              <Button type="submit" disabled={updatingPassword} className="w-full mt-2">
                {updatingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {updatingPassword ? "Setting Password..." : "Set Password"}
              </Button>
            </form>
          )}

          {step === "loggingIn" && (
            <div className="space-y-4 text-center">
              <h2 className="text-2xl font-bold">Welcome!</h2>
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">
                  {isLoggingIn ? "Logging you in..." : "Account created successfully!"}
                </p>
                {passwordError && (
                  <p className="text-red-500 mt-4">{passwordError}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Image Section */}
      <div className="hidden bg-muted lg:block">
        <img
          src="/placeholder.svg"
          alt="Sign up cover"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
};

export default Signup;
