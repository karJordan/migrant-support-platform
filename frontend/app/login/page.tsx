"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// The LoginContent component handles the login form and its logic.
function LoginContent() {
    // Form field state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // UI state
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    // Get the query parameters from the URL to check if the user has just reset their password
    const searchParams = useSearchParams();

    const passwordResetSuccessful =
        searchParams.get("reset") === "success";

    // Handle the user's email/password login attempt
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        // Clear previous errors and show loading state
        setError(null);
        setLoading(true);

        try {
            // Send the email and password to the backend login endpoint
            const response = await fetch(
                "http://localhost:4000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();

            // Show the backend error message if login fails
            if (!response.ok) {
                throw new Error(
                    data.message || "Invalid username or password"
                );
            }

            // If the password is correct, the backend sends a 2FA code
            // and returns the user's ID.
            if (data.requiresTwoFactor) {
                // Send the user to the separate verification page.
                // The userId is passed in the URL so the verification page
                // knows which user's 2FA code it should check.
                router.push(
                    `/verify-login?userId=${data.userId}`
                );
            }
        } catch (err) {
            // Display either the backend error or a fallback message
            setError(
                err instanceof Error
                    ? err.message
                    : "Invalid username or password"
            );
        } finally {
            // Stop showing the loading state whether login succeeds or fails
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md mx-auto px-6 py-10">
            <h1 className="text-3xl font-semibold text-black mb-6">
                Login
            </h1>
            {/* Show a success message if the user has just reset their password */}
            {passwordResetSuccessful && (
                <p className="mb-4 text-sm text-green-600">
                    Password reset successful. You can now log in with your new password.
                </p>
            )}
            {/* Standard email/password login form */}
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
            >
                <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border border-neutral/30 rounded-lg px-4 py-3 bg-white outline-none"
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border border-neutral/30 rounded-lg px-4 py-3 bg-white outline-none"
                />

                {/* Link to the forgot password page */}
                <div className="text-right">
                    <Link
                        href="/forgot-password"
                        className="text-sm text-primary font-semibold hover:underline"
                    >
                        Forgot password?
                    </Link>
                </div>
                {/* Show login errors returned by the backend */}
                {error && (
                    <p
                        role="alert"
                        className="text-red-500 text-sm"
                    >
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            {/* Link for users who do not yet have an account */}
            <p className="mt-4 text-sm text-neutral">
                Don&apos;t have an account?{" "}
                <Link
                    href="/signup"
                    className="text-primary font-semibold"
                >
                    Sign Up
                </Link>
            </p>
        </div>
    );
}
// The main LoginPage component wraps the LoginContent in a Suspense component to handle loading states.
export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="w-full max-w-md mx-auto px-6 py-10">
                <p className="text-sm text-neutral">
                    Loading...
                </p>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}