"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, ChevronRight, LogOut, Mail, UserRound, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Feedback from "@/components/ui/Feedback";
import Modal from "@/components/Modal";

type SavedSummary = { userId: string; count?: number; error?: string };

export default function ProfilePage() {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const [summary, setSummary] = useState<SavedSummary | null>(null);
    const [retry, setRetry] = useState(0);

    const [showEditProfile, setShowEditProfile] = useState(false);
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");

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
            <section
                aria-labelledby="profile-title"
                className="
        relative
        bg-gradient-to-br from-primary-light to-blue-50
        px-6 py-10 text-center
        sm:rounded-b-card
    "
            >
                {/* Edit profile modal */}
                <button
                    type="button"
                    onClick={() => setShowEditProfile(true)}
                    aria-label="Edit profile"
                    className="
            absolute right-5 top-5
            flex h-10 w-10 items-center justify-center
            rounded-full bg-white
            text-text-secondary
            shadow-card
            transition
            hover:text-primary
            hover:shadow-card-hover
        "
                >
                    <Settings size={20} aria-hidden="true" />
                </button>
                <div aria-hidden="true" className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">{initials}</div>
                <h1 id="profile-title" className="heading-3 mt-4 break-words">{user.name}</h1>
                <p className="mt-1 text-sm text-text-secondary">Your MigrantHub profile</p>
                <Link href="/saved" className="mt-5 inline-flex flex-col items-center rounded-control px-6 py-2 hover:bg-white/60">
                    <span className="text-2xl font-bold text-primary">{currentSummary?.count ?? "—"}</span>
                    <span className="text-sm text-text-secondary">Saved</span>
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
                <Link href="/saved" className="flex min-h-16 items-center gap-3 rounded-card border border-border bg-white p-5 shadow-card hover:shadow-card-hover">
                    <Bookmark aria-hidden="true" size={22} className="shrink-0 text-primary" />
                    <span className="flex-1 font-medium">View saved listings</span>
                    <ChevronRight aria-hidden="true" size={20} className="text-text-secondary" />
                </Link>
                <Button variant="secondary" className="w-full !border-red-200 !bg-red-50 !text-danger hover:!bg-red-100" onClick={() => { logout(); router.replace("/"); }}>
                    <LogOut aria-hidden="true" size={18} />Sign Out
                </Button>
            </div>
            {showEditProfile && (
                <Modal onClose={() => setShowEditProfile(false)}>
                    <h2 className="text-xl font-semibold text-text-primary">
                        Edit profile
                    </h2>

                    <p className="mt-1 text-sm text-text-secondary">
                        Update your account information.
                    </p>

                    <form
                        className="mt-6 space-y-5"
                        onSubmit={(event) => {
                            event.preventDefault();

                            // We will connect this to the backend update endpoint next.
                            console.log({
                                name: editName,
                                email: editEmail,
                            });
                        }}
                    >
                        <div>
                            <label
                                htmlFor="profile-name"
                                className="mb-1 block text-sm font-medium text-text-primary"
                            >
                                Name
                            </label>

                            <input
                                id="profile-name"
                                type="text"
                                value={editName}
                                onChange={(event) => setEditName(event.target.value)}
                                className="
                        w-full rounded-control border border-border
                        bg-white px-4 py-3
                        text-text-primary
                        focus:border-primary
                        focus:outline-none
                    "
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="profile-email"
                                className="mb-1 block text-sm font-medium text-text-primary"
                            >
                                Email
                            </label>

                            <input
                                id="profile-email"
                                type="email"
                                value={editEmail}
                                onChange={(event) => setEditEmail(event.target.value)}
                                className="
                        w-full rounded-control border border-border
                        bg-white px-4 py-3
                        text-text-primary
                        focus:border-primary
                        focus:outline-none
                    "
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setShowEditProfile(false)}
                            >
                                Cancel
                            </Button>

                            <Button type="submit">
                                Save changes
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
