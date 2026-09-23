"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
    // Form state
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // UI state
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();

    // The forgot-password page passes the user's email in the URL
    const email = searchParams.get("email");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!email) {
            setError(
                "Password reset session is missing. Please start again."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setError(null);
        setLoading(true);

        try {
            // Send the reset code and new password to the backend
            const response = await fetch(
                "http://localhost:4000/api/auth/reset-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        code,
                        newPassword,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Password reset failed"
                );
            }

            // Password has been changed successfully,
            // so send the user back to the login page.
            router.replace("/login?reset=success");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Password reset failed"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md mx-auto px-6 py-10">
            <h1 className="text-3xl font-semibold text-black mb-4">
                Reset password
            </h1>

            <p className="text-sm text-neutral mb-6">
                Enter the 6-digit code sent to your email and choose a
                new password.
            </p>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
            >
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="Reset Code"
                    value={code}
                    onChange={(e) =>
                        setCode(
                            e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 6)
                        )
                    }
                    required
                    className="border border-neutral/30 rounded-lg px-4 py-3 bg-white outline-none"
                />

                <input
                    type="password"
                    name="newPassword"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) =>
                        setNewPassword(e.target.value)
                    }
                    required
                    className="border border-neutral/30 rounded-lg px-4 py-3 bg-white outline-none"
                />

                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) =>
                        setConfirmPassword(e.target.value)
                    }
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
                    disabled={
                        loading ||
                        code.length !== 6 ||
                        !newPassword ||
                        !confirmPassword
                    }
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Resetting..." : "Reset Password"}
                </button>
            </form>
        </div>
    );
}