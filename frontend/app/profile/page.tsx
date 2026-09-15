"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    LogOut,
    Settings
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Feedback from "@/components/ui/Feedback";
import Modal from "@/components/Modal";

type SavedSummary = { userId: string; count?: number; error?: string };

export default function ProfilePage() {
    const {
        user,
        token,
        isLoading,
        logout,
        updateUser,
    } = useAuth();

    const router = useRouter();
    const [summary, setSummary] = useState<SavedSummary | null>(null);
    const [retry, setRetry] = useState(0);

    const [showEditProfile, setShowEditProfile] = useState(false);
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editCountryOfOrigin, setEditCountryOfOrigin] = useState("");
    const [editCurrentAddress, setEditCurrentAddress] = useState("");
    const [editCurrentCity, setEditCurrentCity] = useState("");
    const [editCurrentCountry, setEditCurrentCountry] = useState("");
    const [editPhoneNumber, setEditPhoneNumber] = useState("");

    useEffect(() => {
        if (!user) return;

        setEditName(user.name ?? "");
        setEditEmail(user.email ?? "");
        setEditCountryOfOrigin(user.country_of_origin ?? "");
        setEditCurrentAddress(user.current_address ?? "");
        setEditCurrentCity(user.current_city ?? "");
        setEditCurrentCountry(user.current_country ?? "");
        setEditPhoneNumber(user.phone_number ?? "");
    }, [user]);

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
                    onClick={() => {
                        setIsEditingProfile(false);
                        setShowEditProfile(true);
                    }}
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
                <p className="mt-1 text-sm text-text-secondary">
                    {user.country_of_origin || "Nationality not set"}
                    {" · "}
                    {user.current_city && user.current_country
                        ? `${user.current_city}, ${user.current_country}`
                        : "Location not set"}
                    {" · "}
                    {user.created_at
                        ? `Joined ${new Date(user.created_at).toLocaleDateString("en-NZ", {
                            month: "short",
                            year: "numeric",
                        })}`
                        : ""}
                </p>
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
                <Button variant="secondary" className="w-full !border-red-200 !bg-red-50 !text-danger hover:!bg-red-100" onClick={() => { logout(); router.replace("/"); }}>
                    <LogOut aria-hidden="true" size={18} />Sign Out
                </Button>
            </div>
           {showEditProfile && (
    <Modal
        onClose={() => {
            setShowEditProfile(false);
            setIsEditingProfile(false);
        }}
    >
        {!isEditingProfile ? (
            <>
                <h2 className="text-xl font-semibold text-text-primary">
                    Profile details
                </h2>

                <div className="mt-6 space-y-4">
                    <div>
                        <p className="text-sm text-text-secondary">
                            Name
                        </p>
                        <p className="font-medium text-text-primary">
                            {user.name}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-text-secondary">
                            Email
                        </p>
                        <p className="font-medium text-text-primary break-all">
                            {user.email}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-text-secondary">
                            Country of origin
                        </p>
                        <p className="font-medium text-text-primary">
                            {user.country_of_origin || "Not set"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-text-secondary">
                            Current address
                        </p>
                        <p className="font-medium text-text-primary">
                            {user.current_address || "Not set"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-text-secondary">
                            Current city
                        </p>
                        <p className="font-medium text-text-primary">
                            {user.current_city || "Not set"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-text-secondary">
                            Current country
                        </p>
                        <p className="font-medium text-text-primary">
                            {user.current_country || "Not set"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-text-secondary">
                            Phone number
                        </p>
                        <p className="font-medium text-text-primary">
                            {user.phone_number || "Not set"}
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <Button
                        type="button"
                        onClick={() => setIsEditingProfile(true)}
                    >
                        Edit
                    </Button>
                </div>
            </>
        ) : (
            <>
                <h2 className="text-xl font-semibold text-text-primary">
                    Edit profile
                </h2>

                <p className="mt-1 text-sm text-text-secondary">
                    Update your account information.
                </p>

                <form
                    className="mt-6 space-y-5"
                    onSubmit={async (event) => {
                        event.preventDefault();

                        try {
                            const response = await fetch(
                                `http://localhost:4000/api/users/${user.id}`,
                                {
                                    method: "PATCH",
                                    headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({
                                        name: editName,
                                        email: editEmail,
                                        country_of_origin: editCountryOfOrigin,
                                        current_address: editCurrentAddress,
                                        current_city: editCurrentCity,
                                        current_country: editCurrentCountry,
                                        phone_number: editPhoneNumber,
                                    }),
                                }
                            );

                            const data = await response.json();

                            if (!response.ok) {
                                throw new Error(
                                    data.message || "Profile update failed"
                                );
                            }

                            updateUser(data.user);

                            setIsEditingProfile(false);
                        } catch (error) {
                            console.error(
                                "Error updating profile:",
                                error
                            );
                        }
                    }}
                >
                    <div>
                        <label
                            htmlFor="profile-name"
                            className="mb-1 block text-sm font-medium"
                        >
                            Name
                        </label>

                        <input
                            id="profile-name"
                            type="text"
                            value={editName}
                            onChange={(event) =>
                                setEditName(event.target.value)
                            }
                            className="w-full rounded-control border border-border bg-white px-4 py-3 focus:border-primary focus:outline-none"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="profile-email"
                            className="mb-1 block text-sm font-medium"
                        >
                            Email
                        </label>

                        <input
                            id="profile-email"
                            type="email"
                            value={editEmail}
                            onChange={(event) =>
                                setEditEmail(event.target.value)
                            }
                            className="w-full rounded-control border border-border bg-white px-4 py-3 focus:border-primary focus:outline-none"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="country-origin"
                            className="mb-1 block text-sm font-medium"
                        >
                            Country of origin
                        </label>

                        <input
                            id="country-origin"
                            type="text"
                            value={editCountryOfOrigin}
                            onChange={(event) =>
                                setEditCountryOfOrigin(event.target.value)
                            }
                            className="w-full rounded-control border border-border bg-white px-4 py-3 focus:border-primary focus:outline-none"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="current-address"
                            className="mb-1 block text-sm font-medium"
                        >
                            Current address
                        </label>

                        <input
                            id="current-address"
                            type="text"
                            value={editCurrentAddress}
                            onChange={(event) =>
                                setEditCurrentAddress(event.target.value)
                            }
                            className="w-full rounded-control border border-border bg-white px-4 py-3 focus:border-primary focus:outline-none"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="current-city"
                            className="mb-1 block text-sm font-medium"
                        >
                            Current city
                        </label>

                        <input
                            id="current-city"
                            type="text"
                            value={editCurrentCity}
                            onChange={(event) =>
                                setEditCurrentCity(event.target.value)
                            }
                            className="w-full rounded-control border border-border bg-white px-4 py-3 focus:border-primary focus:outline-none"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="current-country"
                            className="mb-1 block text-sm font-medium"
                        >
                            Current country
                        </label>

                        <input
                            id="current-country"
                            type="text"
                            value={editCurrentCountry}
                            onChange={(event) =>
                                setEditCurrentCountry(event.target.value)
                            }
                            className="w-full rounded-control border border-border bg-white px-4 py-3 focus:border-primary focus:outline-none"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="phone-number"
                            className="mb-1 block text-sm font-medium"
                        >
                            Phone number
                        </label>

                        <input
                            id="phone-number"
                            type="tel"
                            value={editPhoneNumber}
                            onChange={(event) =>
                                setEditPhoneNumber(event.target.value)
                            }
                            className="w-full rounded-control border border-border bg-white px-4 py-3 focus:border-primary focus:outline-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                                setIsEditingProfile(false)
                            }
                        >
                            Cancel
                        </Button>

                        <Button type="submit">
                            Save changes
                        </Button>
                    </div>
                </form>
            </>
        )}
    </Modal>
)}
        </div>
    );
}
