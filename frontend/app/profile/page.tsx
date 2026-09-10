"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, ChevronRight, LogOut, Mail, UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Feedback from "@/components/ui/Feedback";

type SavedSummary = { userId: string; count?: number; error?: string };

export default function ProfilePage() {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const [summary, setSummary] = useState<SavedSummary | null>(null);
    const [retry, setRetry] = useState(0);
    const userId = user ? String(user.id) : null;

    useEffect(() => {
        if (!userId) return;
        const controller = new AbortController();
        async function loadSavedCount() {
            try {
                const response = await fetch(`http://localhost:4000/api/saved/${encodeURIComponent(userId!)}`, {
                    signal: controller.signal,
                });
                if (!response.ok) throw new Error("Saved listings request failed");
                const items: unknown = await response.json();
                if (!Array.isArray(items)) throw new Error("Unexpected saved listings response");
                if (!controller.signal.aborted) setSummary({ userId: userId!, count: items.length });
            } catch {
                if (!controller.signal.aborted) {
                    setSummary({ userId: userId!, error: "We couldn’t load your saved listings. Please try again." });
                }
            }
        }
        void loadSavedCount();
        return () => controller.abort();
    }, [userId, retry]);

    if (isLoading) {
        return <div className="mx-auto max-w-xl px-4 py-10"><Feedback variant="loading">Loading your profile...</Feedback></div>;
    }

    if (!user) {
        return (
            <div className="mx-auto max-w-xl px-4 py-10">
                <Card>
                    <h1 className="heading-2">Your profile</h1>
                    <p className="mt-3 text-text-secondary">Log in to see your account details and saved listings.</p>
                    <Link href="/login" className="mt-6 inline-flex min-h-12 items-center rounded-control bg-primary px-5 py-3 font-medium text-white hover:bg-primary-hover">Log In</Link>
                    <p className="mt-4 text-sm text-text-secondary">New to MigrantHub? <Link href="/signup" className="font-medium text-primary underline">Sign Up</Link></p>
                </Card>
            </div>
        );
    }

    const initials = user.name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "?";
    const currentSummary = summary?.userId === userId ? summary : null;

    return (
        <div className="mx-auto w-full max-w-2xl pb-8">
            <section aria-labelledby="profile-title" className="bg-gradient-to-br from-primary-light to-blue-50 px-6 py-10 text-center sm:rounded-b-card">
                <div aria-hidden="true" className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">{initials}</div>
                <h1 id="profile-title" className="heading-3 mt-4 break-words">{user.name}</h1>
                <p className="mt-1 text-sm text-text-secondary">Your MigrantHub profile</p>
                <Link href="/saved" className="mt-5 inline-flex flex-col items-center rounded-control px-6 py-2 hover:bg-white/60">
                    <span className="text-2xl font-bold text-primary">{currentSummary?.count ?? "—"}</span>
                    <span className="text-sm text-text-secondary">Saved listings</span>
                </Link>
            </section>

            <div className="space-y-5 px-4 pt-6 sm:px-6">
                {!currentSummary && <Feedback variant="loading">Loading your saved-listing count...</Feedback>}
                {currentSummary?.error && (
                    <div className="space-y-2">
                        <Feedback variant="error">{currentSummary.error}</Feedback>
                        <Button variant="secondary" onClick={() => { setSummary(null); setRetry(value => value + 1); }}>Try again</Button>
                    </div>
                )}
                <Card>
                    <h2 className="heading-4">Account details</h2>
                    <dl className="mt-5 space-y-5">
                        <div className="flex items-start gap-3">
                            <UserRound aria-hidden="true" className="mt-1 shrink-0 text-primary" size={20} />
                            <div className="min-w-0"><dt className="text-sm text-text-secondary">Name</dt><dd className="break-words font-medium">{user.name}</dd></div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Mail aria-hidden="true" className="mt-1 shrink-0 text-primary" size={20} />
                            <div className="min-w-0"><dt className="text-sm text-text-secondary">Email</dt><dd className="break-all font-medium">{user.email}</dd></div>
                        </div>
                    </dl>
                </Card>
                <Link href="/saved" className="flex min-h-16 items-center gap-3 rounded-card border border-border bg-white p-5 shadow-card hover:shadow-card-hover">
                    <Bookmark aria-hidden="true" size={22} className="shrink-0 text-primary" />
                    <span className="flex-1 font-medium">View saved listings</span>
                    <ChevronRight aria-hidden="true" size={20} className="text-text-secondary" />
                </Link>
                <Button variant="secondary" className="w-full !border-red-200 !bg-red-50 !text-danger hover:!bg-red-100" onClick={() => { logout(); router.replace("/"); }}>
                    <LogOut aria-hidden="true" size={18} />Sign Out
                </Button>
            </div>
        </div>
    );
}
