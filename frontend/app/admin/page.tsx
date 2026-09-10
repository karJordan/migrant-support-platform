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

export const dynamic = "force-dynamic";

type User = {
    id: number;
    name: string;
    email: string;
    role: string;
};

type PostType = "service" | "job" | "group" | "event" | "resource";
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

function PostCard({
    label,
    onOpen,
    children,
}: {
    label: string;
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
                // Let controls inside the card handle their own keyboard events.
                if (event.target !== event.currentTarget) return;

                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpen();
                }
            }}
            className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
        >
            {children}
        </div>
    );
}

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
                    No {title.toLowerCase()} pending approval.
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
    const [users, setUsers] = useState<User[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [groups, setGroups] = useState<CommunityGroup[]>([]);
    const [events, setEvents] = useState<CommunityEvent[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);

    const [view, setView] = useState<"users" | "posts">("users");
    const [loading, setLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    const [selectedPost, setSelectedPost] = useState<SelectedPost | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [savingAction, setSavingAction] = useState<Action | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    // A ref blocks duplicate requests immediately, before React rerenders.
    const savingRef = useRef(false);

    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            router.replace("/login");
        } else if (user.role !== "admin") {
            router.replace("/userDashboard");
        }
    }, [isLoading, user, router]);

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

    async function loadView(nextView: "users" | "posts") {
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
                    fetchAdminList<Service>("services"),
                    fetchAdminList<Job>("jobs"),
                    fetchAdminList<CommunityGroup>("groups"),
                    fetchAdminList<CommunityEvent>("events"),
                    fetchAdminList<Resource>("resources"),
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

    function openPost(post: SelectedPost) {
        if (savingRef.current) return;

        setActionError(null);
        setSelectedPost(post);
    }

    function closePost() {
        if (savingRef.current) return;

        setActionError(null);
        setSelectedPost(null);
    }

    function removeFromPendingList(type: PostType, id: number) {
        switch (type) {
            case "service":
                setServices((items) => items.filter((item) => item.id !== id));
                break;
            case "job":
                setJobs((items) => items.filter((item) => item.id !== id));
                break;
            case "group":
                setGroups((items) => items.filter((item) => item.id !== id));
                break;
            case "event":
                setEvents((items) => items.filter((item) => item.id !== id));
                break;
            case "resource":
                setResources((items) => items.filter((item) => item.id !== id));
                break;
        }
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

            // The API confirmed success. The item is no longer pending.
            removeFromPendingList(type, post.id);

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
                        <li
                            key={listedUser.id}
                            className="bg-gray-100 p-4 rounded-lg"
                        >
                            <p className="font-semibold">{listedUser.role}</p>
                            <p className="font-semibold">{listedUser.name}</p>
                            <p className="text-sm text-gray-600">
                                {listedUser.email}
                            </p>
                        </li>
                    ))}
                </ul>
            )}

            {!loading && hasLoaded && view === "posts" && (
                <>
                    <PostSection title="Services" empty={services.length === 0}>
                        {services.map((service) => (
                            <PostCard
                                key={service.id}
                                label={`View details for ${service.name}`}
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

                    <PostSection title="Jobs" empty={jobs.length === 0}>
                        {jobs.map((job) => (
                            <PostCard
                                key={job.id}
                                label={`View details for ${job.title}`}
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

                    <PostSection
                        title="Community Groups"
                        empty={groups.length === 0}
                    >
                        {groups.map((group) => (
                            <PostCard
                                key={group.id}
                                label={`View details for ${group.name}`}
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

                    <PostSection
                        title="Community Events"
                        empty={events.length === 0}
                    >
                        {events.map((event) => (
                            <PostCard
                                key={event.id}
                                label={`View details for ${event.title}`}
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

                    <PostSection
                        title="Resources"
                        empty={resources.length === 0}
                    >
                        {resources.map((resource) => (
                            <PostCard
                                key={resource.id}
                                label={`View details for ${resource.title}`}
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
                </>
            )}

            {selectedPost && (
                <Modal onClose={closePost}>
                    {renderPostDetails(selectedPost)}

                    {isSaving && (
                        <p role="status" className="mt-4 text-sm">
                            {savingAction === "approve"
                                ? "Approving..."
                                : "Rejecting..."}
                        </p>
                    )}

                    {actionError && (
                        <p role="alert" className="mt-4 text-sm text-red-600">
                            {actionError}
                        </p>
                    )}

                    <div className="flex flex-wrap gap-3 mt-6">
                        <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => void handlePostAction("approve")}
                            className={buttonClass}
                        >
                            Approve
                        </button>

                        <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => void handlePostAction("reject")}
                            className={buttonClass}
                        >
                            Reject
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}