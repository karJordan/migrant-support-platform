"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    LogOut,
    Settings,
    Circle,
    CircleCheck
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Feedback from "@/components/ui/Feedback";
import Modal from "@/components/Modal";

type ProfileSummary = {
    userId: string;
    saved: number;
    applications: number;
    groups: number;
    error?: string;
};

type JobApplication = {
    application_id: number;
    application_status: string;
    applied_at: string;
    job_id: number;
    title: string;
    company: string;
    location?: string | null;
    employment_type?: string | null;
    description?: string | null;
};

type JoinedGroup = {
    membership_id: number;
    joined_at: string;
    group_id: number;
    name: string;
    description?: string | null;
    category?: string | null;
};

type SummaryModal = "applications" | "groups" | null;

const settlementTasks = [
    "Create account",
    "Complete profile",
    "Find a service",
    "Open a bank account",
    "Apply for IRD number",
];

export default function ProfilePage() {
    const {
        user,
        token,
        isLoading,
        logout,
        updateUser,
    } = useAuth();

    const router = useRouter();
    const [summary, setSummary] = useState<ProfileSummary | null>(null);
    const [retry, setRetry] = useState(0);
    const [summaryModal, setSummaryModal] = useState<SummaryModal>(null);

    const [completedTasks, setCompletedTasks] = useState<string[]>([]);

    const [pendingChecklistTask, setPendingChecklistTask] = useState<string | null>(null);
    const [pendingChecklistAction, setPendingChecklistAction] =
        useState<"check" | "uncheck" | null>(null);

    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [selectedApplication, setSelectedApplication] =
        useState<JobApplication | null>(null);

    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [withdrawMessage, setWithdrawMessage] = useState("");

    const [joinedGroups, setJoinedGroups] = useState<JoinedGroup[]>([]);

    const [selectedGroup, setSelectedGroup] =
        useState<JoinedGroup | null>(null);

    const [leaveGroupLoading, setLeaveGroupLoading] = useState(false);
    const [leaveGroupMessage, setLeaveGroupMessage] = useState("");

    const [summaryDetailsLoading, setSummaryDetailsLoading] = useState(false);
    const [summaryDetailsError, setSummaryDetailsError] = useState("");

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
        if (!userId || !token) {
            return;
        }

        const currentUserId = userId;
        const controller = new AbortController();

        async function loadProfileSummary() {
            try {
                const response = await fetch(
                    "http://localhost:4000/api/users/me/summary",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        signal: controller.signal,
                    }
                );

                if (!response.ok) {
                    throw new Error("Profile summary request failed");
                }

                const data: {
                    saved: number;
                    applications: number;
                    groups: number;
                } = await response.json();

                if (!controller.signal.aborted) {
                    setSummary({
                        userId: currentUserId,
                        saved: Number(data.saved),
                        applications: Number(data.applications),
                        groups: Number(data.groups),
                    });
                }
            } catch {
                if (!controller.signal.aborted) {
                    setSummary({
                        userId: currentUserId,
                        saved: 0,
                        applications: 0,
                        groups: 0,
                        error: "We couldn’t load your profile summary. Please try again.",
                    });
                }
            }
        }

        void loadProfileSummary();

        return () => controller.abort();
    }, [userId, token, retry]);

    useEffect(() => {
        if (!user) return;

        const savedChecklist = localStorage.getItem(
            `settlement-checklist-${user.id}`
        );

        if (savedChecklist) {
            setCompletedTasks(JSON.parse(savedChecklist));
        }
    }, [user]);

    async function openApplicationsModal() {
        if (!token) return;

        setSummaryModal("applications");
        setSummaryDetailsLoading(true);
        setSummaryDetailsError("");

        try {
            const response = await fetch(
                "http://localhost:4000/api/jobs/applications/me",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Applications request failed");
            }

            const data: unknown = await response.json();

            if (!Array.isArray(data)) {
                throw new Error("Unexpected applications response");
            }

            setApplications(data as JobApplication[]);
        } catch {
            setSummaryDetailsError(
                "We couldn’t load your applications. Please try again."
            );
        } finally {
            setSummaryDetailsLoading(false);
        }
    }

    async function withdrawApplication(jobId: number) {
        if (!token) return;

        setWithdrawLoading(true);
        setWithdrawMessage("");

        try {
            const response = await fetch(
                `http://localhost:4000/api/jobs/${jobId}/apply`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data: { message?: string } = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Could not withdraw application"
                );
            }

            setApplications((currentApplications) =>
                currentApplications.filter(
                    (application) => application.job_id !== jobId
                )
            );

            setSummary((currentSummary) =>
                currentSummary
                    ? {
                        ...currentSummary,
                        applications: Math.max(
                            0,
                            currentSummary.applications - 1
                        ),
                    }
                    : currentSummary
            );

            setSelectedApplication(null);
        } catch (error) {
            setWithdrawMessage(
                error instanceof Error
                    ? error.message
                    : "Could not withdraw application"
            );
        } finally {
            setWithdrawLoading(false);
        }
    }

    async function openGroupsModal() {
        if (!token) return;

        setSummaryModal("groups");
        setSummaryDetailsLoading(true);
        setSummaryDetailsError("");

        try {
            const response = await fetch(
                "http://localhost:4000/api/community/groups/joined",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Joined groups request failed");
            }

            const data: unknown = await response.json();

            if (!Array.isArray(data)) {
                throw new Error("Unexpected joined groups response");
            }

            setJoinedGroups(data as JoinedGroup[]);
        } catch {
            setSummaryDetailsError(
                "We couldn’t load your joined groups. Please try again."
            );
        } finally {
            setSummaryDetailsLoading(false);
        }
    }

    async function leaveGroup(groupId: number) {
        if (!token) return;

        setLeaveGroupLoading(true);
        setLeaveGroupMessage("");

        try {
            const response = await fetch(
                `http://localhost:4000/api/community/groups/${groupId}/join`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data: { message?: string } = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Could not leave group"
                );
            }

            setJoinedGroups((currentGroups) =>
                currentGroups.filter(
                    (group) => group.group_id !== groupId
                )
            );

            setSummary((currentSummary) =>
                currentSummary
                    ? {
                        ...currentSummary,
                        groups: Math.max(
                            0,
                            currentSummary.groups - 1
                        ),
                    }
                    : currentSummary
            );

            setSelectedGroup(null);
        } catch (error) {
            setLeaveGroupMessage(
                error instanceof Error
                    ? error.message
                    : "Could not leave group"
            );
        } finally {
            setLeaveGroupLoading(false);
        }
    }

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


    function requestChecklistChange(task: string) {
        const isCompleted = completedTasks.includes(task);

        setPendingChecklistTask(task);
        setPendingChecklistAction(isCompleted ? "uncheck" : "check");
    }

    function confirmChecklistChange() {
        if (!user || !pendingChecklistTask || !pendingChecklistAction) {
            return;
        }

        setCompletedTasks((currentTasks) => {
            const updatedTasks =
                pendingChecklistAction === "check"
                    ? [...currentTasks, pendingChecklistTask]
                    : currentTasks.filter(
                        (item) => item !== pendingChecklistTask
                    );

            localStorage.setItem(
                `settlement-checklist-${user.id}`,
                JSON.stringify(updatedTasks)
            );

            return updatedTasks;
        });

        setPendingChecklistTask(null);
        setPendingChecklistAction(null);
    }

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
                <div className="mx-auto mt-5 grid max-w-md grid-cols-3">
                    <Link
                        href="/saved"
                        className="
            flex flex-col items-center
            rounded-control px-3 py-2
            hover:bg-white/60
        "
                    >
                        <span className="text-2xl font-bold text-primary">
                            {currentSummary && !currentSummary.error
                                ? currentSummary.saved
                                : "—"}
                        </span>

                        <span className="text-sm text-text-secondary">
                            Saved
                        </span>
                    </Link>

                    <button
                        type="button"
                        onClick={() => void openApplicationsModal()}
                        className="
            flex flex-col items-center
            rounded-control px-3 py-2
            hover:bg-white/60
        "
                    >
                        <span className="text-2xl font-bold text-primary">
                            {currentSummary && !currentSummary.error
                                ? currentSummary.applications
                                : "—"}
                        </span>

                        <span className="text-sm text-text-secondary">
                            Applications
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => void openGroupsModal()}
                        className="
            flex flex-col items-center
            rounded-control px-3 py-2
            hover:bg-white/60
        "
                    >
                        <span className="text-2xl font-bold text-primary">
                            {currentSummary && !currentSummary.error
                                ? currentSummary.groups
                                : "—"}
                        </span>

                        <span className="text-sm text-text-secondary">
                            Groups
                        </span>
                    </button>
                </div>
            </section>
            <section className="mx-4 mt-6 rounded-card border border-border bg-white p-5 shadow-card sm:mx-6">
                <h2 className="text-lg font-semibold text-text-primary">
                    Settlement Checklist
                </h2>

                <div className="mt-4 space-y-3">
                    {settlementTasks.map((task) => {
                        const completed = completedTasks.includes(task);

                        return (
                            <button
                                key={task}
                                type="button"
                                onClick={() => requestChecklistChange(task)}
                                className="
                        flex w-full items-center gap-3
                        text-left
                    "
                            >
                                {completed ? (
                                    <CircleCheck
                                        size={21}
                                        className="shrink-0 text-primary"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <Circle
                                        size={21}
                                        className="shrink-0 text-text-secondary"
                                        aria-hidden="true"
                                    />
                                )}

                                <span
                                    className={
                                        completed
                                            ? "text-text-secondary line-through"
                                            : "text-text-primary"
                                    }
                                >
                                    {task}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </section>

            <div className="space-y-5 px-4 pt-6 sm:px-6">
                {!currentSummary && (
                    <Feedback variant="loading">
                        Loading your profile summary...
                    </Feedback>
                )}
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
            {summaryModal && (
                <Modal
                    onClose={() => {
                        if (selectedApplication) {
                            setSelectedApplication(null);
                            setWithdrawMessage("");
                            return;
                        }

                        if (selectedGroup) {
                            setSelectedGroup(null);
                            setLeaveGroupMessage("");
                            return;
                        }

                        setSummaryModal(null);
                        setSummaryDetailsError("");
                    }}
                >
                    {!selectedApplication && !selectedGroup && (
                        <h2 className="text-xl font-semibold text-text-primary">
                            {summaryModal === "applications"
                                ? "Your applications"
                                : "Your groups"}
                        </h2>
                    )}

                    {summaryDetailsLoading && (
                        <div className="mt-6">
                            <Feedback variant="loading">
                                {summaryModal === "applications"
                                    ? "Loading your applications..."
                                    : "Loading your groups..."}
                            </Feedback>
                        </div>
                    )}

                    {!summaryDetailsLoading && summaryDetailsError && (
                        <div className="mt-6">
                            <Feedback variant="error">
                                {summaryDetailsError}
                            </Feedback>
                        </div>
                    )}

                    {!summaryDetailsLoading &&
                        !summaryDetailsError &&
                        summaryModal === "applications" &&
                        (selectedApplication ? (
                            <div className="mt-2">
                                <h2 className="text-2xl font-semibold">
                                    {selectedApplication.title}
                                </h2>

                                <p className="mt-1 font-medium">
                                    {selectedApplication.company}
                                </p>

                                {selectedApplication.description && (
                                    <p className="mt-2 text-neutral">
                                        {selectedApplication.description}
                                    </p>
                                )}

                                <div className="mt-4 text-neutral">
                                    Location:{" "}
                                    {selectedApplication.location || "Not specified"}
                                </div>

                                <div className="mt-2 text-neutral">
                                    Employment Type:{" "}
                                    {selectedApplication.employment_type || "Not specified"}
                                </div>

                                <div className="mt-6">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            void withdrawApplication(
                                                selectedApplication.job_id
                                            )
                                        }
                                        disabled={withdrawLoading}
                                        className="
                        rounded-control border border-primary
                        bg-white px-6 py-3 font-medium text-primary
                        transition-colors hover:bg-primary-light
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                    "
                                    >
                                        {withdrawLoading
                                            ? "Withdrawing..."
                                            : "Withdraw application"}
                                    </button>

                                    {withdrawMessage && (
                                        <p
                                            role="status"
                                            className="mt-3 text-sm text-text-secondary"
                                        >
                                            {withdrawMessage}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="mt-6 space-y-3">
                                {applications.length === 0 ? (
                                    <p className="text-text-secondary">
                                        You haven’t applied for any jobs yet.
                                    </p>
                                ) : (
                                    applications.map((application) => (
                                        <button
                                            key={application.application_id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedApplication(application);
                                                setWithdrawMessage("");
                                            }}
                                            className="
                            w-full rounded-card border border-border
                            bg-white p-4 text-left
                            transition
                            hover:border-primary hover:shadow-card
                            focus:outline-none focus:ring-2 focus:ring-primary
                        "
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="font-semibold text-text-primary">
                                                        {application.title}
                                                    </h3>

                                                    <p className="mt-1 text-sm text-text-secondary">
                                                        {application.company}
                                                    </p>
                                                </div>

                                                <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-medium capitalize text-primary">
                                                    {application.application_status}
                                                </span>
                                            </div>

                                            {(application.location ||
                                                application.employment_type) && (
                                                    <p className="mt-3 text-sm text-text-secondary">
                                                        {[
                                                            application.location,
                                                            application.employment_type,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(" · ")}
                                                    </p>
                                                )}
                                        </button>
                                    ))
                                )}
                            </div>
                        ))}

                    {!summaryDetailsLoading &&
                        !summaryDetailsError &&
                        summaryModal === "groups" &&
                        (selectedGroup ? (
                            <div className="mt-2">
                                <h2 className="text-2xl font-semibold">
                                    {selectedGroup.name}
                                </h2>

                                {selectedGroup.category && (
                                    <p className="mt-2 text-primary">
                                        {selectedGroup.category}
                                    </p>
                                )}

                                {selectedGroup.description && (
                                    <p className="mt-4">
                                        {selectedGroup.description}
                                    </p>
                                )}

                                <div className="mt-6">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            void leaveGroup(selectedGroup.group_id)
                                        }
                                        disabled={leaveGroupLoading}
                                        className="
                        rounded-control border border-primary
                        bg-white px-6 py-3 font-medium text-primary
                        transition-colors hover:bg-primary-light
                        disabled:cursor-not-allowed disabled:opacity-60
                    "
                                    >
                                        {leaveGroupLoading
                                            ? "Leaving..."
                                            : "Leave group"}
                                    </button>

                                    {leaveGroupMessage && (
                                        <p
                                            role="status"
                                            className="mt-3 text-sm text-text-secondary"
                                        >
                                            {leaveGroupMessage}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="mt-6 space-y-3">
                                {joinedGroups.length === 0 ? (
                                    <p className="text-text-secondary">
                                        You haven’t joined any groups yet.
                                    </p>
                                ) : (
                                    joinedGroups.map((joinedGroup) => (
                                        <button
                                            key={joinedGroup.membership_id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedGroup(joinedGroup);
                                                setLeaveGroupMessage("");
                                            }}
                                            className="
                            w-full rounded-card border border-border
                            bg-white p-4 text-left
                            transition
                            hover:border-primary hover:shadow-card
                            focus:outline-none focus:ring-2 focus:ring-primary
                        "
                                        >
                                            <h3 className="font-semibold text-text-primary">
                                                {joinedGroup.name}
                                            </h3>

                                            {joinedGroup.category && (
                                                <p className="mt-1 text-sm font-medium text-primary">
                                                    {joinedGroup.category}
                                                </p>
                                            )}

                                            {joinedGroup.description && (
                                                <p className="mt-3 text-sm text-text-secondary">
                                                    {joinedGroup.description}
                                                </p>
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        ))}
                </Modal>
            )}
            {pendingChecklistTask && pendingChecklistAction && (
                <Modal
                    onClose={() => {
                        setPendingChecklistTask(null);
                        setPendingChecklistAction(null);
                    }}
                >
                    <h2 className="text-xl font-semibold text-text-primary">
                        {pendingChecklistAction === "check"
                            ? "Complete this task?"
                            : "Mark task as incomplete?"}
                    </h2>

                    <p className="mt-3 text-text-secondary">
                        {pendingChecklistAction === "check"
                            ? `Are you sure you want to mark "${pendingChecklistTask}" as completed?`
                            : `Are you sure you want to uncheck "${pendingChecklistTask}"?`}
                    </p>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setPendingChecklistTask(null);
                                setPendingChecklistAction(null);
                            }}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="button"
                            onClick={confirmChecklistChange}
                        >
                            {pendingChecklistAction === "check"
                                ? "Mark complete"
                                : "Mark incomplete"}
                        </Button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
