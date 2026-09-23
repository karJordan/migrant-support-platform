"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    //2fa state variables
    const [twoFactorRequired, setTwoFactorRequired] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [code, setCode] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();





    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:4000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error("Could not connect to server");
            }
            const data = await response.json();
            // Check if two-factor authentication is required
            if (data.requiresTwoFactor) {
                setUserId(data.userId);
                setTwoFactorRequired(true);
                return;
            }
        } catch {
            setError("Invalid username or password");
        } finally {
            setLoading(false);
        }
    }

    // Function to handle the submission of the 2FA code
    async function handleVerifyCode(e: React.FormEvent) {
        e.preventDefault();
        setError("");
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
                        userId,
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
            <h1 className="text-3xl font-semibold text-black mb-6">
                {twoFactorRequired ? "Verify your login" : "Login"}
            </h1>
            {!twoFactorRequired ? (
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

                    {error && (
                        <p className="text-red-500 text-sm">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap text-sm"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            ) : (
                <form
                    onSubmit={handleVerifyCode}
                    className="flex flex-col gap-4"
                >
                    <p className="text-sm text-neutral">
                        We sent a 6-digit verification code to your
                        email address.
                    </p>

                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Verification Code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                        className="border border-neutral/30 rounded-lg px-4 py-3 bg-white outline-none"
                    />

                    {error && (
                        <p className="text-red-500 text-sm">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap text-sm"
                    >
                        {loading ? "Verifying..." : "Verify Code"}
                    </button>
                </form>
            )}
            <p className="mt-4 text-sm text-neutral">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-primary font-semibold">
                    Sign Up
                </Link>
            </p>
        </div>
    );
}
