"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import Modal from "@/components/Modal";
import { Bell, Plus, BriefcaseBusiness, BookOpen, Users, Search, UserRound } from "lucide-react";
import ServiceForm from "@/components/ServiceForm";
import JobsForm from "@/components/JobsForm";
import ResourcesForm from "@/components/ResourcesForm";
import CommunityGroupForm from "@/components/CommunityGroupForm";
import CommunityEventForm from "@/components/CommunityEventForm";

//card to display services
interface DashboardService {
    id: number;
    name: string;
    category: string;
    location: string;
}
//card to display jobs
interface DashboardJob {
    id: number;
    title: string;
    company: string;
    location: string;
    employment_type: string;
}
type CreatePostType =
    | "service"
    | "job"
    | "resource"
    | "community-group"
    | "community-event";

const createPostOptions: {
    type: CreatePostType;
    label: string;
    description: string;
}[] = [
        {
            type: "service",
            label: "Service",
            description: "Share a local service or support provider.",
        },
        {
            type: "job",
            label: "Job",
            description: "Advertise a job opportunity.",
        },
        {
            type: "resource",
            label: "Resource",
            description: "Share useful information or guidance.",
        },
        {
            type: "community-group",
            label: "Community group",
            description: "Add a group migrants can join.",
        },
        {
            type: "community-event",
            label: "Community event",
            description: "Publish an upcoming event.",
        },
    ];

export default function UserDashboardPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const [showCreatePost, setShowCreatePost] = useState(false);
    const [createPostType, setCreatePostType] =
        useState<CreatePostType | null>(null);

    const [nearbyServices, setNearbyServices] = useState<DashboardService[]>([]);
    const [recommendedJobs, setRecommendedJobs] = useState<DashboardJob[]>([]);

    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [isLoading, user, router]);


    useEffect(() => {
        fetchDashboardContent();
    }, []);

    async function fetchDashboardContent() {
        try {
            const [servicesResponse, jobsResponse] = await Promise.all([
                fetch("http://localhost:4000/api/services"),
                fetch("http://localhost:4000/api/jobs"),
            ]);

            if (servicesResponse.ok) {
                const services = await servicesResponse.json();
                setNearbyServices(services.slice(0, 3));
            }

            if (jobsResponse.ok) {
                const jobs = await jobsResponse.json();
                setRecommendedJobs(jobs.slice(0, 2));
            }
        } catch (error) {
            console.error("Error loading dashboard content:", error);
        }
    }

    if (isLoading || !user) return null;

    function closeCreatePost() {
        setShowCreatePost(false);
        setCreatePostType(null);
    }

    function renderCreatePostForm() {
        switch (createPostType) {
            case "service":
                return (
                    <ServiceForm
                        onCancel={() => setCreatePostType(null)}
                        onSaved={closeCreatePost}
                    />
                );

            case "job":
                return (
                    <JobsForm
                        onCancel={() => setCreatePostType(null)}
                        onSaved={closeCreatePost}
                    />
                );

            case "resource":
                return (
                    <ResourcesForm
                        onCancel={() => setCreatePostType(null)}
                        onSaved={closeCreatePost}
                    />
                );

            case "community-group":
                return (
                    <CommunityGroupForm
                        onCancel={() => setCreatePostType(null)}
                        onSaved={closeCreatePost}
                    />
                );

            case "community-event":
                return (
                    <CommunityEventForm
                        onCancel={() => setCreatePostType(null)}
                        onSaved={closeCreatePost}
                    />
                );

            default:
                return null;
        }
    }
    return (
        <div>
            {/*Full width container*/}
            <section className="w-full bg-[#EEF4FF]">
                <div className="mx-auto max-w-4xl px-6 py-8">
                    <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                            <p className="mb-1 text-lg text-text-secondary">
                                Hello 👋
                            </p>

                            <h1 className="text-2xl font-semibold text-text-primary">
                                {user.name}
                            </h1>
                        </div>

                        <button
                            type="button"
                            disabled
                            aria-label="Notifications coming soon"
                            title="Notifications coming soon"
                            className="
            flex h-11 w-11 shrink-0 items-center justify-center
            rounded-full bg-white text-text-secondary
            shadow-card
            disabled:cursor-not-allowed disabled:opacity-70
        "
                        >
                            <Bell size={22} aria-hidden="true" />
                        </button>
                    </div>
                    {/* Search */}
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();

                            const query = searchQuery.trim();

                            if (query.length >= 2) {
                                router.push(`/search?query=${encodeURIComponent(query)}`);
                            }
                        }}
                    >
                        <div
                            className="
            flex w-full items-center
                            rounded-xl border border-border
                            bg-white px-4 py-3
                            shadow-md
                            transition
                            focus-within:border-primary
                            focus-within:ring-2
                            focus-within:ring-primary/20
        "
                        >
                            <Search
                                size={20}
                                className="mr-3 shrink-0 text-text-secondary"
                                aria-hidden="true"
                            />

                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search services, jobs, resources, community..."
                                aria-label="Search"
                                className="
                w-full bg-transparent
                text-sm text-text-primary
                outline-none
                placeholder:text-text-secondary
            "
                            />
                        </div>
                    </form>
                </div>
            </section>

            {/*Normal Dashboard Content*/}
            <div className="mx-auto max-w-4xl px-6 py-10">
                {/* Quick Access */}
                <section className="mb-8">
                    <h2 className="text-lg font-semibold text-text-primary mb-4">
                        Quick Access
                    </h2>

                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4">
                        <Link
                            href="/profile"
                            className="
        hidden md:flex
        group w-full flex-col items-center justify-center
        rounded-card border border-border bg-white
        px-2 py-4 text-center shadow-card
        transition
        hover:-translate-y-1 hover:shadow-card-hover
        hover:border-primary/30
    "
                        >
                            <div
                                className="
            mb-3 flex h-12 w-12 items-center justify-center
            rounded-xl bg-blue-100 text-blue-600
        "
                            >
                                <UserRound size={24} aria-hidden="true" />
                            </div>

                            <span className="text-sm font-medium text-text-primary">
                                Profile
                            </span>
                        </Link>
                        <Link
                            href="/resources"
                            className="
                group flex w-full flex-col items-center justify-center
                rounded-card border border-border bg-white
                px-3 py-5 text-center shadow-card
                transition
                hover:-translate-y-1 hover:shadow-card-hover
                hover:border-primary/30
            "
                        >
                            <div
                                className="
                    mb-3 flex h-12 w-12 items-center justify-center
                    rounded-xl bg-amber-100 text-amber-500
                "
                            >
                                <BookOpen size={24} aria-hidden="true" />
                            </div>

                            <span className="text-sm font-medium text-text-primary">
                                Resources
                            </span>
                        </Link>

                        <Link
                            href="/jobs"
                            className="
                group flex w-full flex-col items-center justify-center
                rounded-card border border-border bg-white
                px-3 py-5 text-center shadow-card
                transition
                hover:-translate-y-1 hover:shadow-card-hover
                hover:border-primary/30
                            "
                        >
                            <div
                                className="
                    mb-3 flex h-12 w-12 items-center justify-center
                    rounded-xl bg-primary-light text-primary
                "
                            >
                                <BriefcaseBusiness size={24} aria-hidden="true" />
                            </div>

                            <span className="text-sm font-medium text-text-primary">
                                Find Jobs
                            </span>
                        </Link>

                        <Link
                            href="/community"
                            className="
                group flex w-full flex-col items-center justify-center
                rounded-card border border-border bg-white
                px-3 py-5 text-center shadow-card
                transition
                hover:-translate-y-1 hover:shadow-card-hover
                hover:border-primary/30
            "
                        >
                            <div
                                className="
                    mb-3 flex h-12 w-12 items-center justify-center
                    rounded-xl bg-violet-100 text-violet-600
                "
                            >
                                <Users size={24} aria-hidden="true" />
                            </div>

                            <span className="text-sm font-medium text-text-primary">
                                Community
                            </span>
                        </Link>

                    </div>
                </section>

                <button
                    type="button"
                    onClick={() => setShowCreatePost(true)}
                    className="
        mb-8 inline-flex items-center gap-2 rounded-control
        bg-primary px-5 py-3 font-medium text-white
        transition-colors hover:bg-primary-hover
    "
                >
                    <Plus size={18} aria-hidden="true" />
                    Create a post
                </button>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                    <div className="border border-neutral/20 rounded-xl p-4">
                        <p className="text-2xl font-semibold text-primary">0</p>
                        <p className="text-sm text-neutral">My Posts</p>
                    </div>
                    <div className="border border-neutral/20 rounded-xl p-4">
                        <p className="text-2xl font-semibold text-primary">0</p>
                        <p className="text-sm text-neutral">Messages</p>
                    </div>
                </div>

                {/* Nearby Services */}
                <section className="mt-8">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-text-primary">
                            Nearby Services
                        </h2>

                        <Link
                            href="/services"
                            className="text-sm font-medium text-primary hover:underline"
                        >
                            See all
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {nearbyServices.map((service) => (
                            <Link
                                key={service.id}
                                href="/services"
                                className="
                    flex items-center gap-4
                    rounded-card border border-border
                    bg-white p-4 shadow-card
                    transition
                    hover:border-primary/30
                    hover:shadow-card-hover
                "
                            >
                                <div
                                    className="
                        flex h-12 w-12 shrink-0
                        items-center justify-center
                        rounded-xl bg-primary-light
                        text-primary
                    "
                                >
                                    <Users size={22} aria-hidden="true" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h3 className="truncate font-semibold text-text-primary">
                                        {service.name}
                                    </h3>

                                    <div className="mt-1 flex flex-wrap gap-x-3 text-sm text-text-secondary">
                                        <span>{service.category}</span>
                                        <span>{service.location}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Recommended Jobs */}
                <section className="mt-8">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-text-primary">
                            Recommended Jobs
                        </h2>

                        <Link
                            href="/jobs"
                            className="text-sm font-medium text-primary hover:underline"
                        >
                            See all
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {recommendedJobs.map((job) => (
                            <Link
                                key={job.id}
                                href="/jobs"
                                className="
                    block rounded-card border border-border
                    bg-white p-5 shadow-card
                    transition
                    hover:border-primary/30
                    hover:shadow-card-hover
                "
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className="
                            flex h-12 w-12 shrink-0
                            items-center justify-center
                            rounded-xl bg-primary
                            text-white
                        "
                                    >
                                        <BriefcaseBusiness size={22} aria-hidden="true" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="font-semibold text-text-primary">
                                                    {job.title}
                                                </h3>

                                                <p className="text-sm text-text-secondary">
                                                    {job.company}
                                                </p>
                                            </div>

                                            {job.employment_type && (
                                                <span
                                                    className="
                                        shrink-0 rounded-full
                                        bg-primary-light px-3 py-1
                                        text-xs font-medium text-primary
                                    "
                                                >
                                                    {job.employment_type}
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-2 text-sm text-text-secondary">
                                            {job.location}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>


            {showCreatePost && (
                <Modal onClose={closeCreatePost}>
                    {createPostType ? (
                        <>
                            <button
                                type="button"
                                onClick={() => setCreatePostType(null)}
                                className="mb-4 text-sm font-medium text-primary hover:underline"
                            >
                                ← Back to post types
                            </button>

                            {renderCreatePostForm()}
                        </>
                    ) : (
                        <>
                            <h2 className="text-xl font-semibold">
                                Create a post
                            </h2>

                            <p className="mt-2 text-sm text-text-secondary">
                                What would you like to share?
                            </p>

                            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {createPostOptions.map((option) => (
                                    <button
                                        key={option.type}
                                        type="button"
                                        onClick={() => setCreatePostType(option.type)}
                                        className="
                                rounded-xl border border-border bg-white p-4
                                text-left transition
                                hover:border-primary hover:bg-primary-light
                            "
                                    >
                                        <span className="block font-semibold text-text-primary">
                                            {option.label}
                                        </span>

                                        <span className="mt-1 block text-sm text-text-secondary">
                                            {option.description}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </Modal>
            )}
        </div>
    );
}