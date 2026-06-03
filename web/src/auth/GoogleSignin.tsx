import React, { useContext, useEffect } from 'react';
import { FrappeContext, FrappeConfig } from 'frappe-react-sdk';
import { Button } from "@/components/ui/button";

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/auth'; // Base Google OAuth URL
const CLIENT_ID = '1089776630762-crmk0vho8rneh0hhq89aliionsfh9vvb.apps.googleusercontent.com'; // Replace with your actual client ID
const REDIRECT_URI = window.location.href; // Redirect back to the current page after authentication
const RESPONSE_TYPE = 'code';
const SCOPE = 'email profile'; // Define the scopes you need
const STATE = Math.random().toString(36).substring(2); // Generate a random state to protect against CSRF attacks

const GoogleSignIn = () => {
    const { call } = useContext(FrappeContext) as FrappeConfig;

    const handleGoogleSignIn = async () => {
        // Construct the Google OAuth2 authorization URL manually
        const googleAuthUrl = `${GOOGLE_AUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}&state=${STATE}`;

        // Redirect the user to the Google OAuth2 authorization URL
        window.location.href = googleAuthUrl;
    };

    const handleRedirect = async () => {
        // Extract code and state from the URL after the redirect
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        if (code && state) {
            try {
                // Call the API to complete the login process using the code and state
                const response = await call.post('frappe.integrations.oauth2_logins.login_via_google', {
                    code,
                    state
                });

                if (response && response.message) {
                    console.log('Login successful:', response.message);
                    // Handle successful login (e.g., redirect to a dashboard)
                } else {
                    console.error('Login failed:', response);
                    // Handle login failure
                }
            } catch (error) {
                console.error('Error completing Google sign-in:', error);
            }
        }
    };

    // Call handleRedirect when the component mounts to handle any redirect back from Google
    useEffect(() => {
        handleRedirect();
    }, []);

    return (
        <Button variant="outline" onClick={handleGoogleSignIn} className="w-full">
            Sign in with Google
        </Button>
    );
};

export default GoogleSignIn;
