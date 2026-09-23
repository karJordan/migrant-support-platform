"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
    // Form state
    const [email, setEmail] = useState("");

    // UI state
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        setError(null);
        setLoading(true);

        try {
            // Ask the backend to generate and email a reset code
            const response = await fetch(
                "http://localhost:4000/api/auth/forgot-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Could not start password reset"
                );
            }

            // Pass the email to the reset page so the user
            // does not need to enter it again.
            router.push(
                `/reset-password?email=${encodeURIComponent(email)}`
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Could not start password reset"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md mx-auto px-6 py-10">
            <h1 className="text-3xl font-semibold text-black mb-4">
                Forgot password
            </h1>

            <p className="text-sm text-neutral mb-6">
                Enter your email address and we&apos;ll send you a
                6-digit password reset code.
            </p>

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
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Sending code..." : "Send Reset Code"}
                </button>
            </form>

            <p className="mt-4 text-sm text-neutral">
                Remember your password?{" "}
                <Link
                    href="/login"
                    className="text-primary font-semibold hover:underline"
                >
                    Log in
                </Link>
            </p>
        </div>
    );
}