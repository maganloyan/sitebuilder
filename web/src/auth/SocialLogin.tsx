import React, {useEffect } from "react";
import { useFrappeGetCall } from "frappe-react-sdk";
import { Button } from "@/components/ui/button";
import {useNavigate } from "react-router-dom";

import { Google, Github, Facebook } from "./Socialicons";


interface SocialLoginIcon {
  html: string;
  src: string;
  alt: string;
}

interface SocialProvider {
  name: string;
  provider_name: string;
  auth_url: string;
  redirect_to: string;
  icon: SocialLoginIcon;
}

interface LoginResponse {
  message: {
    provider_logins: SocialProvider[];
    social_login: boolean;
    login_label: string;
    login_with_email_link: boolean;
    two_factor_is_enabled: boolean;
    disable_signup: number;
  };
}

const Login: React.FC = () => {
 
  const navigate = useNavigate();

  // Get the current URL parameters
  const searchParams = new URLSearchParams(window.location.search);
  const redirectTo = searchParams.get('redirect-to') || '/portal';
//   navigate(redirectTo);

  // Fetch social login providers with the correct API endpoint
  const { data, error: socialError, isLoading: socialLoading } = 
    useFrappeGetCall<LoginResponse>("sitebuilder.api.login.get_context");

  // Access the data through the message property
  const loginContext = data?.message;

  // Debug logs
//   useEffect(() => {
//     console.log("Login Context:", loginContext);
//     console.log("Social Error:", socialError);
//     console.log("Is Loading:", socialLoading);
//   }, [loginContext, socialError, socialLoading]);

  const handleSocialLogin = (authUrl: string) => {
    window.location.href = authUrl;
  };

  

  return (
    <div className="">
      <div className="">
        <div className="mx-auto grid w-[350px] gap-6 ">
         
          {/* Social Login Section */}
          {loginContext?.provider_logins && loginContext.provider_logins.length > 0 && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {loginContext.provider_logins.map((provider) => (
                  <Button
                    key={provider.name}
                    onClick={() => handleSocialLogin(provider.auth_url)}
                    className="flex items-center justify-center gap-2 w-full"
                    variant="outline"
                    type="button"
                  >
                    {provider.provider_name === "Google" && <Google />}
                    {provider.provider_name === "GitHub" && <Github />}
                    {provider.provider_name === "Facebook" && <Facebook />}
                    <span>Continue with {provider.provider_name}</span>
                  </Button>
                ))}
              </div>
            </>
          )}

          {/* <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="underline">
              Sign up
            </Link>
          </div> */}
        </div>
      </div>

      {/* <div className="hidden bg-muted lg:block">
        <img
          src="/placeholder.svg"
          alt="Cover Image"
          className="h-full w-full object-cover"
        />
      </div> */}
    </div>
  );
};

export default Login;
