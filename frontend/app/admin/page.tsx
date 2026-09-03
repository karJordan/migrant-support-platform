"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export const dynamic = 'force-dynamic';
interface User {
    id: number;
    name: string;
    email: string;
}

export default function Admin() {
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [, setLoading] = useState(false);

    const {user, isLoading} = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }

        if (!isLoading && user && user.role !== "admin") {
            router.push("/userDashboard");
        }
    }, [isLoading, user, router]);

    if (isLoading || !user) return null;

    async function getUsers(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("http://localhost:4000/api/services/users", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch users");
            }

            setUsers(await response.json());
        } catch {
            setError("Error fetching users");
        } finally {
            setLoading(false);
        }
    }
    
    return (
        <div className="w-full max-w-md mx-auto px-6 py-10">
            <h1 className="text-3xl font-semibold text-black mb-6">Admin</h1>
            <form onSubmit={getUsers} className="flex flex-col gap-4">
                <button
                    type="submit"
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap text-sm"
                >Users</button>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                    type="button"
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap text-sm"
                >Posts</button>
            </form>
            <div>
                <p className="mt-4 text-sm text-neutral">
                    Admin Dashboard Area to manage users and posts.
                </p>
                {users.length > 0 && (
                    <ul className="mt-4 space-y-2">
                        {users.map((user) => (
                            <li key={user.id} className="bg-gray-100 p-4 rounded-lg">
                                <p className="font-semibold">{user.name}</p>
                                <p className="text-sm text-gray-600">{user.email}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
