"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

// The VerifyLoginPageContent component handles the verification form and its logic.
function VerifyLoginContent() {
    const [code, setCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();

    const userId = searchParams.get("userId");

    async function handleVerifyCode(e: React.FormEvent) {
        e.preventDefault();

        if (!userId) {
            setError("Verification session is missing. Please log in again.");
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:4000/api/auth/verify-2fa",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        userId: Number(userId),
                        code,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Verification failed"
                );
            }

            login(data.token, data.user);

            router.replace(
                data.user.role === "admin"
                    ? "/admin"
                    : "/userDashboard"
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Verification failed"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md mx-auto px-6 py-10">
            <h1 className="text-3xl font-semibold text-black mb-4">
                Verify your login
            </h1>

            <p className="text-sm text-neutral mb-6">
                We sent a 6-digit verification code to your email address.
            </p>

            <form
                onSubmit={handleVerifyCode}
                className="flex flex-col gap-4"
            >
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="Verification Code"
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
                    disabled={loading || code.length !== 6}
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Verifying..." : "Verify Code"}
                </button>
            </form>

            <button
                type="button"
                onClick={() => router.push("/login")}
                className="mt-4 text-sm text-primary font-semibold"
            >
                Back to login
            </button>
        </div>
    );
}

// The VerifyLoginPage component wraps the VerifyLoginPageContent with Suspense for loading state.
export default function VerifyLoginPage() {
    return (
        <Suspense
            fallback={
                <div className="w-full max-w-md mx-auto px-6 py-10">
                    <p className="text-sm text-neutral">
                        Loading...
                    </p>
                </div>
            }
        >
            <VerifyLoginContent />
        </Suspense>
    );
}