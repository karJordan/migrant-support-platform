"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function UserDashboardPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [isLoading, user, router]);

    if (isLoading || !user) return null;

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-semibold mb-2">Welcome back, {user.name}</h1>
          <p className="text-neutral mb-8">This is your dashboard.</p>
    
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-neutral/20 rounded-xl p-4">
              <p className="text-2xl font-semibold text-primary">0</p>
              <p className="text-sm text-neutral">Saved Services</p>
            </div>
            <div className="border border-neutral/20 rounded-xl p-4">
              <p className="text-2xl font-semibold text-primary">0</p>
              <p className="text-sm text-neutral">Saved Jobs</p>
            </div>
            <div className="border border-neutral/20 rounded-xl p-4">
              <p className="text-2xl font-semibold text-primary">0</p>
              <p className="text-sm text-neutral">My Posts</p>
            </div>
            <div className="border border-neutral/20 rounded-xl p-4">
              <p className="text-2xl font-semibold text-primary">0</p>
              <p className="text-sm text-neutral">Messages</p>
            </div>
          </div>
        </div>
      );
    }
    