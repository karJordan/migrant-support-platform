"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setError] = useState<string | null>(null);
  const [, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit (e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
  
  try {
    const response = await fetch("http://localhost:4000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      throw new Error("Failed to sign up");
    }

    // Redirect to the login page or home page after successful signup
    router.push("/login");
  } catch {
    setError("Could not connect to server");
  } finally {
    setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold text-black mb-6">Sign Up</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border border-neutral/30 rounded-lg px-4 py-3 bg-white outline-none"
        />
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
        <button
          type="submit"
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors text-sm font-semibold"
        >
          Create Account
        </button>
      </form>
      <p className="mt-4 text-sm text-neutral">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Log in
        </Link>
      </p>
    </div>
    );
}
