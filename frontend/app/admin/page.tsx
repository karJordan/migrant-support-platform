"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import JobsCard from "@/components/JobsCard";
import CommunityGroupCard from "@/components/CommunityGroupCard";
import CommunityEventCard from "@/components/CommunityEventCard";
import ResourcesCard from "@/components/ResourcesCard";
import ServiceCard from "@/components/ServicesCard";
import Modal from "../../components/Modal";
import type { CommunityEvent } from "@/types/event";
import type { CommunityGroup } from "@/types/group";
import type { Job } from "@/types/job";
import type { Resource } from "@/types/resource";
import type { Service } from "@/types/service";
import type { ReactNode } from "react";
import ServiceForm from "@/components/ServiceForm";
import JobsForm from "@/components/JobsForm";
import ResourcesForm from "@/components/ResourcesForm";
import CommunityGroupForm from "@/components/CommunityGroupForm";
import CommunityEventForm from "@/components/CommunityEventForm";

export const dynamic = "force-dynamic";

// Types and configuration used by the admin dashboard.
type User = {
    id: number;
    name: string;
    email: string;
    role: string;
};
type ModerationStatus = "pending" | "approved" | "rejected";

// Maps each moderation status to the badge colours shown on admin cards.
const statusClasses: Record<ModerationStatus, string> = {
    pending:
        "border-amber-200 bg-amber-100 text-amber-800",
    approved:
        "border-emerald-200 bg-emerald-100 text-emerald-800",
    rejected:
        "border-red-200 bg-red-100 text-red-800",
};
type PostFilter =
    | "all"
    | "service"
    | "job"
    | "community"
    | "resource";

// Content-type filters. Community includes both groups and events.
const postFilterOptions: {
    value: PostFilter;
    label: string;
}[] = [
        { value: "all", label: "All" },
        { value: "service", label: "Services" },
        { value: "job", label: "Jobs" },
        { value: "community", label: "Community" },
        { value: "resource", label: "Resources" },
    ];

type PostStatus = "all" | "pending" | "approved" | "rejected";

// Status filters passed to the backend admin endpoints.
const postStatusOptions: {
    value: PostStatus;
    label: string;
}[] = [
        { value: "all", label: "All" },
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
    ];
type Action = "approve" | "reject";

type SelectedPost =
    | { type: "service"; post: Service }
    | { type: "job"; post: Job }
    | { type: "group"; post: CommunityGroup }
    | { type: "event"; post: CommunityEvent }
    | { type: "resource"; post: Resource };

const API_URL = "http://localhost:4000";

const buttonClass =
    "bg-primary text-white px-6 py-3 rounded-lg " +
    "hover:bg-primary/90 transition-colors text-sm " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

// Wraps a listing card with keyboard interaction and an admin-only status badge.
function PostCard({
    label,
    status,
    onOpen,
    children,
}: {
    label: string;
    status: ModerationStatus;
    onOpen: () => void;
    children: ReactNode;
}) {
    return (
        <div
            role="button"
            tabIndex={0}
            aria-label={label}
            onClick={onOpen}
            onKeyDown={(event) => {
                if (event.target !== event.currentTarget) return;

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {
                    event.preventDefault();
                    onOpen();
                }
            }}
            className="relative cursor-pointer rounded-xl focus:outline-none focus:ring-2 focus:ring-primary [&>div]:pt-14"
        >
            {/* Admin-only moderation status badge */}
            <span
                className={
                    "pointer-events-none absolute left-6 top-4 z-10 rounded-full border px-3 py-1 text-xs font-semibold capitalize " +
                    statusClasses[status]
                }
            >
                {status}
            </span>

            {children}
        </div>
    );
}

// Provides a consistent heading, card grid and empty state for each content type.
function PostSection({
    title,
    empty,
    children,
}: {
    title: string;
    empty: boolean;
    children: ReactNode;
}) {
    return (
        <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">{title}</h2>

            {empty ? (
                <p className="text-sm text-gray-600">
                    No {title.toLowerCase()} found.
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {children}
                </div>
            )}
        </section>
    );
}

export default function Admin() {
    const { user, isLoading, token } = useAuth();
    const router = useRouter();

    const [error, setError] = useState<string | null>(null);

    // User list and user-editing modal state.
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [editedUserName, setEditedUserName] = useState("");
    const [editedUserEmail, setEditedUserEmail] = useState("");
    const [editedUserRole, setEditedUserRole] = useState<"user" | "admin">("user");
    const [isSavingUser, setIsSavingUser] = useState(false);
    const [userEditError, setUserEditError] = useState<string | null>(null);

    // Content returned from the five admin post endpoints.
    const [services, setServices] = useState<Service[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [groups, setGroups] = useState<CommunityGroup[]>([]);
    const [events, setEvents] = useState<CommunityEvent[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);

    // Dashboard navigation and post-filter selections.
    const [view, setView] = useState<"users" | "posts">("users");

    const [postTypeFilter, setPostTypeFilter] =
        useState<PostFilter>("all");

    const [postStatus, setPostStatus] =
        useState<PostStatus>("all");

    const [loading, setLoading] = useState(false);

    const [hasLoaded, setHasLoaded] = useState(false);

    // Post details, editing and moderation modal state.
    const [selectedPost, setSelectedPost] = useState<SelectedPost | null>(null);
    const [isEditingPost, setIsEditingPost] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [savingAction, setSavingAction] = useState<Action | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);



    // A ref blocks duplicate requests immediately, before React rerenders.
    const savingRef = useRef(false);

    // Protect the page by redirecting signed-out and non-admin users.
    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            router.replace("/login");
        } else if (user.role !== "admin") {
            router.replace("/userDashboard");
        }
    }, [isLoading, user, router]);

    // Shared helper for authenticated admin GET requests.
    async function fetchAdminList<T>(path: string): Promise<T[]> {
        const response = await fetch(`${API_URL}/api/admin/${path}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Could not load ${path}. Please try again.`);
        }

        return response.json();
    }

    // Loads either the user list or all content types for the selected status.
    async function loadView(
        nextView: "users" | "posts",
        requestedStatus: PostStatus = postStatus,
    ) {
        setView(nextView);
        setLoading(true);
        setHasLoaded(false);
        setError(null);

        try {
            if (nextView === "users") {
                setUsers(await fetchAdminList<User>("users"));
            } else {
                const [
                    nextServices,
                    nextJobs,
                    nextGroups,
                    nextEvents,
                    nextResources,
                ] = await Promise.all([
                    fetchAdminList<Service>(
                        `services?status=${requestedStatus}`,
                    ),
                    fetchAdminList<Job>(
                        `jobs?status=${requestedStatus}`,
                    ),
                    fetchAdminList<CommunityGroup>(
                        `groups?status=${requestedStatus}`,
                    ),
                    fetchAdminList<CommunityEvent>(
                        `events?status=${requestedStatus}`,
                    ),
                    fetchAdminList<Resource>(
                        `resources?status=${requestedStatus}`,
                    ),
                ]);

                setServices(nextServices);
                setJobs(nextJobs);
                setGroups(nextGroups);
                setEvents(nextEvents);
                setResources(nextResources);
            }

            setHasLoaded(true);
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Could not load the dashboard. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    }

    // User editor modal handlers.
    function openUserEditor(listedUser: User) {
        setSelectedUser(listedUser);
        setEditedUserName(listedUser.name);
        setEditedUserEmail(listedUser.email);
        setEditedUserRole(listedUser.role === "admin" ? "admin" : "user");
        setUserEditError(null);
    }

    function closeUserEditor() {
        if (isSavingUser) return;

        setSelectedUser(null);
        setUserEditError(null);
    }

    async function handleUserSave(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!selectedUser || isSavingUser) return;

        setIsSavingUser(true);
        setUserEditError(null);

        try {
            const response = await fetch(
                `${API_URL}/api/admin/users/${selectedUser.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: editedUserName,
                        email: editedUserEmail,
                        role: editedUserRole,
                    }),
                },
            );

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    result?.error || "Could not update this user.",
                );
            }

            setUsers((currentUsers) =>
                currentUsers.map((listedUser) =>
                    listedUser.id === result.id ? result : listedUser,
                ),
            );

            setSelectedUser(null);
        } catch (caught) {
            setUserEditError(
                caught instanceof Error
                    ? caught.message
                    : "Could not update this user.",
            );
        } finally {
            setIsSavingUser(false);
        }
    }

    // Post modal and approve/reject handlers.
    function openPost(post: SelectedPost) {
        if (savingRef.current) return;

        setActionError(null);
        setIsEditingPost(false);
        setSelectedPost(post);
    }

    function closePost() {
        if (savingRef.current) return;

        setActionError(null);
        setIsEditingPost(false);
        setSelectedPost(null);
    }
    async function handlePostAction(action: Action) {
        if (savingRef.current || !selectedPost) return;

        const { type, post } = selectedPost;

        savingRef.current = true;
        setIsSaving(true);
        setSavingAction(action);
        setActionError(null);

        try {
            const response = await fetch(
                `${API_URL}/api/admin/${action}/${type}/${post.id}`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (!response.ok) {
                throw new Error(`Failed to ${action} this ${type}`);
            }

            // Reload the current status view so the item appears in the correct list.
            await loadView("posts", postStatus);
            // Only close the modal after a successful response.
            setSelectedPost(null);
        } catch {
            setActionError(
                `Could not ${action} this ${type}. Please try again.`,
            );
        } finally {
            savingRef.current = false;
            setIsSaving(false);
            setSavingAction(null);
        }
    }

    // Post editing and rendering helpers.
    function handlePostSaved() {
        setIsEditingPost(false);
        setSelectedPost(null);
        void loadView("posts", postStatus);
    }

    function renderPostEditor(selection: SelectedPost) {
        switch (selection.type) {
            case "service":
                return (
                    <ServiceForm
                        service={selection.post}
                        onCancel={() => setIsEditingPost(false)}
                        onSaved={handlePostSaved}
                    />
                );

            case "job":
                return (
                    <JobsForm
                        job={selection.post}
                        onCancel={() => setIsEditingPost(false)}
                        onSaved={handlePostSaved}
                    />
                );

            case "group":
                return (
                    <CommunityGroupForm
                        group={selection.post}
                        onCancel={() => setIsEditingPost(false)}
                        onSaved={handlePostSaved}
                    />
                );

            case "event":
                return (
                    <CommunityEventForm
                        communityEvent={selection.post}
                        onCancel={() => setIsEditingPost(false)}
                        onSaved={handlePostSaved}
                    />
                );

            case "resource":
                return (
                    <ResourcesForm
                        resource={selection.post}
                        onCancel={() => setIsEditingPost(false)}
                        onSaved={handlePostSaved}
                    />
                );
        }
    }

    // Selects the appropriate read-only detail layout for each content type.
    function renderPostDetails(selection: SelectedPost) {
        switch (selection.type) {
            case "service": {
                const service = selection.post;

                return (
                    <>
                        <h2 className="text-2xl font-semibold">
                            {service.name}
                        </h2>
                        <p className="text-primary mt-2">{service.category}</p>
                        <p className="mt-4">{service.description}</p>
                        <p className="mt-4">{service.location}</p>
                    </>
                );
            }

            case "job": {
                const job = selection.post;

                return (
                    <>
                        <h2 className="text-2xl font-semibold">{job.title}</h2>
                        <p className="font-medium mt-1">{job.company}</p>
                        <p className="text-neutral mt-2">{job.description}</p>
                        <p className="mt-4">Location: {job.location}</p>
                        <p className="mt-2">
                            Employment Type: {job.employment_type}
                        </p>
                    </>
                );
            }

            case "group": {
                const group = selection.post;

                return (
                    <>
                        <h2 className="text-2xl font-semibold">{group.name}</h2>
                        <p className="text-primary mt-2">{group.category}</p>
                        <p className="mt-4">{group.description}</p>
                    </>
                );
            }

            case "event": {
                const event = selection.post;

                return (
                    <>
                        <h2 className="text-2xl font-semibold">{event.title}</h2>
                        <p className="text-primary mt-2">{event.location}</p>
                        <p className="mt-2">
                            {new Date(event.event_date).toLocaleDateString(
                                "en-GB",
                                {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                },
                            )}
                            {event.event_time && ` at ${event.event_time}`}
                        </p>
                        <p className="mt-4">{event.description}</p>
                    </>
                );
            }

            case "resource": {
                const resource = selection.post;

                return (
                    <>
                        <h2 className="text-2xl font-semibold">
                            {resource.title}
                        </h2>
                        <p className="text-primary mt-2">{resource.category}</p>
                        <p className="mt-4">{resource.description}</p>
                        <a
                            href={resource.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline mt-4 inline-block"
                        >
                            Visit Resource
                        </a>
                    </>
                );
            }
        }
    }

    if (isLoading || !user || user.role !== "admin") return null;

    return (
        <div className="w-full max-w-5xl mx-auto px-6 py-10">
            <h1 className="text-4xl font-semibold mb-6">Admin</h1>

            <div className="flex flex-wrap gap-3">
                {/* Primary admin dashboard navigation */}
                <button
                    type="button"
                    disabled={loading}
                    aria-pressed={view === "users"}
                    onClick={() => void loadView("users")}
                    className={buttonClass}
                >
                    Users
                </button>

                <button
                    type="button"
                    disabled={loading}
                    aria-pressed={view === "posts"}
                    onClick={() => void loadView("posts")}
                    className={buttonClass}
                >
                    Posts
                </button>
            </div>

            <p className="mt-4 text-sm text-neutral">
                Admin Dashboard area to manage users and posts.
            </p>
            {/* Horizontal filter bar for post type */}
            {view === "posts" && (
                <div
                    className="-mx-6 mt-4 overflow-x-auto px-6 pb-2"
                    aria-label="Filter posts by content type"
                >
                    <div className="flex w-max gap-3">
                        {postFilterOptions.map((option) => {
                            const isSelected =
                                postTypeFilter === option.value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    aria-pressed={isSelected}
                                    onClick={() =>
                                        setPostTypeFilter(option.value)
                                    }
                                    className={
                                        "shrink-0 whitespace-nowrap rounded-full border px-5 py-2 text-sm font-medium transition " +
                                        (isSelected
                                            ? "border-primary bg-primary text-white"
                                            : "border-gray-200 bg-white text-gray-700 hover:border-primary hover:text-primary")
                                    }
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
            {/* Horizontal filter bar for post status */}
            {view === "posts" && (
                <div
                    className="-mx-6 mt-3 overflow-x-auto px-6 pb-2"
                    aria-label="Filter posts by status"
                >
                    <div className="flex w-max gap-3">
                        {postStatusOptions.map((option) => {
                            const isSelected =
                                postStatus === option.value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    disabled={loading}
                                    aria-pressed={isSelected}
                                    onClick={() => {
                                        setPostStatus(option.value);
                                        void loadView(
                                            "posts",
                                            option.value,
                                        );
                                    }}
                                    className={
                                        "shrink-0 whitespace-nowrap rounded-full border px-5 py-2 text-sm font-medium transition disabled:opacity-50 " +
                                        (isSelected
                                            ? "border-primary bg-primary text-white"
                                            : "border-gray-200 bg-white text-gray-700 hover:border-primary hover:text-primary")
                                    }
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Shared loading and error feedback */}
            {loading && (
                <p role="status" className="mt-4">
                    Loading {view}...
                </p>
            )}

            {error && (
                <p role="alert" className="mt-4 text-red-600">
                    {error}
                </p>
            )}

            {!loading && !hasLoaded && !error && (
                <p className="mt-4 text-sm text-neutral">
                    Select Users or Posts to load the dashboard.
                </p>
            )}

            {!loading && hasLoaded && view === "users" && (
                <ul className="mt-4 space-y-2">
                    {users.length === 0 && (
                        <li className="text-sm text-neutral">No users found.</li>
                    )}

                    {users.map((listedUser) => (
                        <li key={listedUser.id}>
                            <button
                                type="button"
                                onClick={() => openUserEditor(listedUser)}
                                aria-label={`Edit ${listedUser.name}`}
                                className="w-full bg-gray-100 p-4 rounded-lg text-left cursor-pointer transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <p className="text-sm capitalize text-primary">
                                    {listedUser.role}
                                </p>

                                <p className="font-semibold">
                                    {listedUser.name}
                                </p>

                                <p className="text-sm text-gray-600">
                                    {listedUser.email}
                                </p>
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {!loading && hasLoaded && view === "posts" && (
                <>{(postTypeFilter === "all" ||
                    postTypeFilter === "service") && (
                        <PostSection title="Services" empty={services.length === 0}>
                            {services.map((service) => (
                                <PostCard
                                    key={service.id}
                                    label={`View details for ${service.name}`}
                                    status={service.status}
                                    onOpen={() =>
                                        openPost({ type: "service", post: service })
                                    }
                                >
                                    <ServiceCard
                                        id={service.id}
                                        name={service.name}
                                        category={service.category}
                                        description={service.description}
                                        location={service.location}
                                    />
                                </PostCard>
                            ))}
                        </PostSection>
                    )}
                    {(postTypeFilter === "all" ||
                        postTypeFilter === "job") && (
                            <PostSection title="Jobs" empty={jobs.length === 0}>
                                {jobs.map((job) => (
                                    <PostCard
                                        key={job.id}
                                        label={`View details for ${job.title}`}
                                        status={job.status}
                                        onOpen={() => openPost({ type: "job", post: job })}
                                    >
                                        <JobsCard
                                            id={job.id}
                                            title={job.title}
                                            company={job.company}
                                            location={job.location}
                                            description={job.description}
                                            employmentType={job.employment_type}
                                        />
                                    </PostCard>
                                ))}
                            </PostSection>
                        )}
                    {(postTypeFilter === "all" ||
                        postTypeFilter === "community") && (
                            <PostSection
                                title="Community Groups"
                                empty={groups.length === 0}
                            >
                                {groups.map((group) => (
                                    <PostCard
                                        key={group.id}
                                        label={`View details for ${group.name}`}
                                        status={group.status}
                                        onOpen={() =>
                                            openPost({ type: "group", post: group })
                                        }
                                    >
                                        <CommunityGroupCard
                                            id={group.id}
                                            name={group.name}
                                            category={group.category}
                                            description={group.description}
                                        />
                                    </PostCard>
                                ))}
                            </PostSection>
                        )}
                    {(postTypeFilter === "all" ||
                        postTypeFilter === "community") && (
                            <>
                                <PostSection
                                    title="Community Events"
                                    empty={events.length === 0}
                                >
                                    {events.map((event) => (
                                        <PostCard
                                            key={event.id}
                                            label={`View details for ${event.title}`}
                                            status={event.status}
                                            onOpen={() =>
                                                openPost({ type: "event", post: event })
                                            }
                                        >
                                            <CommunityEventCard
                                                id={event.id}
                                                title={event.title}
                                                location={event.location}
                                                eventDate={event.event_date}
                                                eventTime={event.event_time}
                                                description={event.description}
                                            />
                                        </PostCard>
                                    ))}
                                </PostSection>
                            </>
                        )}
                    {(postTypeFilter === "all" ||
                        postTypeFilter === "resource") && (
                            <PostSection
                                title="Resources"
                                empty={resources.length === 0}
                            >
                                {resources.map((resource) => (
                                    <PostCard
                                        key={resource.id}
                                        label={`View details for ${resource.title}`}
                                        status={resource.status}
                                        onOpen={() =>
                                            openPost({ type: "resource", post: resource })
                                        }
                                    >
                                        <ResourcesCard
                                            id={resource.id}
                                            title={resource.title}
                                            category={resource.category}
                                            description={resource.description}
                                            link={resource.link}
                                        />
                                    </PostCard>
                                ))}
                            </PostSection>
                        )}
                </>
            )}

            {/* User editing modal */}
            {selectedUser && (
                <Modal onClose={closeUserEditor}>
                    <form onSubmit={handleUserSave} className="flex flex-col gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold">
                                Edit User
                            </h2>

                            <p className="mt-1 text-sm text-gray-600">
                                Update this user&apos;s account details.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="admin-user-name"
                                className="block text-sm font-medium mb-1"
                            >
                                Name
                            </label>

                            <input
                                id="admin-user-name"
                                type="text"
                                value={editedUserName}
                                onChange={(event) =>
                                    setEditedUserName(event.target.value)
                                }
                                required
                                disabled={isSavingUser}
                                className="w-full border rounded-lg px-4 py-3"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="admin-user-email"
                                className="block text-sm font-medium mb-1"
                            >
                                Email
                            </label>

                            <input
                                id="admin-user-email"
                                type="email"
                                value={editedUserEmail}
                                onChange={(event) =>
                                    setEditedUserEmail(event.target.value)
                                }
                                required
                                disabled={isSavingUser}
                                className="w-full border rounded-lg px-4 py-3"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="admin-user-role"
                                className="block text-sm font-medium mb-1"
                            >
                                Role
                            </label>

                            <select
                                id="admin-user-role"
                                value={editedUserRole}
                                onChange={(event) =>
                                    setEditedUserRole(
                                        event.target.value as "user" | "admin",
                                    )
                                }
                                disabled={
                                    isSavingUser || selectedUser.id === user.id
                                }
                                className="w-full border rounded-lg px-4 py-3"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>

                            {selectedUser.id === user.id && (
                                <p className="mt-1 text-sm text-gray-600">
                                    You cannot remove your own admin role.
                                </p>
                            )}
                        </div>

                        {userEditError && (
                            <p role="alert" className="text-sm text-red-600">
                                {userEditError}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="submit"
                                disabled={isSavingUser}
                                className={buttonClass}
                            >
                                {isSavingUser ? "Saving..." : "Save Changes"}
                            </button>

                            <button
                                type="button"
                                onClick={closeUserEditor}
                                disabled={isSavingUser}
                                className="border px-6 py-3 rounded-lg disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Post details and editing modal */}
            {selectedPost && (
                <Modal onClose={closePost}>
                    {isEditingPost ? (
                        renderPostEditor(selectedPost)
                    ) : (
                        <>
                            {renderPostDetails(selectedPost)}

                            {isSaving && (
                                <p role="status" className="mt-4 text-sm">
                                    {savingAction === "approve"
                                        ? "Approving..."
                                        : "Rejecting..."}
                                </p>
                            )}

                            {actionError && (
                                <p
                                    role="alert"
                                    className="mt-4 text-sm text-red-600"
                                >
                                    {actionError}
                                </p>
                            )}

                            <div className="flex flex-wrap gap-3 mt-6">
                                <button
                                    type="button"
                                    disabled={isSaving}
                                    onClick={() => setIsEditingPost(true)}
                                    className={buttonClass}
                                >
                                    Edit
                                </button>

                                {selectedPost.post.status !== "approved" && (
                                    <button
                                        type="button"
                                        disabled={isSaving}
                                        onClick={() =>
                                            void handlePostAction("approve")
                                        }
                                        className={buttonClass}
                                    >
                                        Approve
                                    </button>
                                )}

                                {selectedPost.post.status !== "rejected" && (
                                    <button
                                        type="button"
                                        disabled={isSaving}
                                        onClick={() =>
                                            void handlePostAction("reject")
                                        }
                                        className={buttonClass}
                                    >
                                        Reject
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </Modal>
            )}
        </div>
    );
}