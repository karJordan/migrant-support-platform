"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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
        login(data.token, data.user);

        // Redirect to the home page after successful login
        router.push("/");
    } catch {
        setError("Invalid username or password");
    } finally {
        setLoading(false);
    }
}

return (
    <div className="w-full max-w-md mx-auto px-6 py-10">
        <h1 className="text-3xl font-semibold text-black mb-6">Login</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap text-sm"
            >
                {loading ? "Logging in..." : "Login"}
            </button>
        </form>
        <p className="mt-4 text-sm text-neutral">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary font-semibold">
                Sign Up
            </Link>
        </p>
    </div>
    );
}
