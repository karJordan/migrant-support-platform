"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import JobsCard from "@/components/JobsCard";
import CommunityGroupCard from "@/components/CommunityGroupCard";
import CommunityEventCard from "@/components/CommunityEventCard";
import ResourcesCard from "@/components/ResourcesCard";
import ServiceCard from "@/components/ServicesCard";
import Modal from "../../components/Modal";

export const dynamic = 'force-dynamic';

type User ={
    id: number;
    name: string;
    email: string;
    role: string;
}

type Job = {
    id: number;
    title: string;
    company: string;
    location: string;
    employment_type: string;
    description: string;
    status: string;
};

type CommunityEvent = {
    id: number;
    title: string;
    location: string;
    event_date: string;
    event_time: string;
    description: string;
    status: string;
}

type CommunityGroup = {
    id: number;
    name: string;
    category: string;
    description: string;
    status: string;
}

type Resource = {
    id: number;
    title: string;
    description: string;
    link: string;
    category: string;
    status: string;
};

type Service = {
    id: number;
    name: string;
    category: string;
    description: string;
    location: string;
    status: string;
};

export default function Admin() {
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [groups, setGroups] = useState<CommunityGroup[]>([]);
    const [events, setEvents] = useState<CommunityEvent[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [selectedPostType, setSelectedPostType] = useState(true);
    const [, setLoading] = useState(false);

    const { user, isLoading, token } = useAuth();
    const router = useRouter();

    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<CommunityGroup | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null);
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }

        if (!isLoading && user && user.role !== "admin") {
            router.push("/userDashboard");
        }
    }, [isLoading, user, router]);

    if (isLoading || !user) return null;

    async function fetchUsers() {

        try {
            const response = await fetch("http://localhost:4000/api/admin/users", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
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
    };

    async function fetchEvents() {
        try {
            const response = await fetch("http://localhost:4000/api/admin/events", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch events");
            }

            setEvents(await response.json());
        } catch {
            setError("Error fetching events");
        } finally {
            setLoading(false);
        }
    };

    async function fetchJobs() {
        try {
            const response = await fetch("http://localhost:4000/api/admin/jobs", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch jobs");
            }

            setJobs(await response.json());
        } catch {
            setError("Error fetching jobs");
        } finally {
            setLoading(false);
        }
    };

    async function fetchGroups() {
        try {
            const response = await fetch("http://localhost:4000/api/admin/groups", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch groups");
            }

            setGroups(await response.json());
        } catch {
            setError("Error fetching groups");
        } finally {
            setLoading(false);
        }
    };

    async function fetchResources() {
        try {
            const response = await fetch("http://localhost:4000/api/admin/resources", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch resources");
            }

            setResources(await response.json());
        } catch {
            setError("Error fetching resources");
        } finally {
            setLoading(false);
        }
    };

    async function fetchServices() {
        try {
            const response = await fetch("http://localhost:4000/api/admin/services", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch services");
            }

            setServices(await response.json());
        } catch {
            setError("Error fetching services");
        } finally {
            setLoading(false);
        }
    };

    async function handleApprovePost(postType: string, postId: number) {
        try {
            const response = await fetch(`http://localhost:4000/api/admin/approve/${postType}/${postId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to approve ${postType}`);
            }

            // Refresh the relevant list after approval
            switch (postType) {
                case 'service':
                    fetchServices();
                    break;
                case 'resource':
                    fetchResources();
                    break;
                case 'job':
                    fetchJobs();
                    break;
                case 'group':
                    fetchGroups();
                    break;
                case 'event':
                    fetchEvents();
                    break;
                default:
                    throw new Error('Invalid post type');
            }
        } catch {
            setError(`Error approving ${postType}`);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto px-6 py-10">

            <h1 className="text-4xl font-semibold text-black mb-6">Admin</h1>

            <div className="flex flex-wrap gap-3 mt-6">

                <button
                    onClick={() => {
                        setSelectedPostType(true);
                        fetchUsers();
                    }}
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap text-sm"
                >Users</button>

                <button
                    onClick={() => {
                        setSelectedPostType(false);
                        fetchServices();
                        fetchJobs();
                        fetchGroups();
                        fetchEvents();
                        fetchResources();
                    }}
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap text-sm"
                >Posts</button>

                {error && <p className="text-red-500 text-sm">{error}</p>}

            </div>

            <div>

                <p className="mt-4 text-sm text-neutral">
                    Admin Dashboard Area to manage users and posts.
                </p>

                {selectedPostType ? (

                    <ul className="mt-4 space-y-2">
                        {users.map((user) => (
                            <li key={user.id} className="bg-gray-100 p-4 rounded-lg">
                                <p className="font-semibold">{user.role}</p>
                                <p className="font-semibold">{user.name}</p>
                                <p className="text-sm text-gray-600">{user.email}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <ul className="mt-4 space-y-2">
                        <h1 className="text-3xl font-semibold text-black mb-6">Services</h1>
                        {services.length === 0 ? (
                            <p className="text-sm text-gray-600">No services pending approval.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                {services.map((service) => (
                                    <div
                                        key={service.id}
                                        role="button"
                                        onClick={() => setSelectedService(service)}
                                        aria-label={`View details for ${service.name}`}
                                        onKeyDown={(keyEvent) => {
                                            if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                                                keyEvent.preventDefault();
                                                setSelectedService(service);
                                            }
                                        }}
                                        className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
                                    >
                                        <ServiceCard
                                            id={service.id}
                                            name={service.name}
                                            category={service.category}
                                            description={service.description}
                                            location={service.location}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        <h1 className="text-3xl font-semibold text-black mb-6">Jobs</h1>
                        {jobs.length === 0 ? (
                            <p className="text-sm text-gray-600">No job listings pending approval.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                {jobs.map((job) => (
                                    <div
                                        key={job.id}
                                        role="button"
                                        onClick={() => setSelectedJob(job)}
                                        aria-label={`View details for ${job.title}`}
                                        onKeyDown={(keyEvent) => {
                                            if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                                                keyEvent.preventDefault();
                                                setSelectedJob(job);
                                            }
                                        }}
                                        className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
                                    >
                                        <JobsCard
                                            id={job.id}
                                            title={job.title}
                                            company={job.company}
                                            location={job.location}
                                            description={job.description}
                                            employmentType={job.employment_type}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        <h1 className="text-3xl font-semibold text-black mb-6">Community Groups</h1>
                        {groups.length === 0 ? (
                            <p className="text-sm text-gray-600">No groups pending approval.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                {groups.map((group) => (
                                    <div
                                        key={group.id}
                                        role="button"
                                        onClick={() => setSelectedGroup(group)}
                                        aria-label={`View details for ${group.name}`}
                                        onKeyDown={(keyEvent) => {
                                            if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                                                keyEvent.preventDefault();
                                                setSelectedGroup(group);
                                            }
                                        }}
                                        className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
                                    >
                                        <CommunityGroupCard
                                            id={group.id}
                                            name={group.name}
                                            category={group.category}
                                            description={group.description}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        <h1 className="text-3xl font-semibold text-black mb-6">Community Events</h1>
                        {events.length === 0 ? (
                            <p className="text-sm text-gray-600">No events pending approval.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                {events.map((event) => (
                                    <div
                                        key={event.id}
                                        role="button"
                                        onClick={() => setSelectedEvent(event)}
                                        aria-label={`View details for ${event.title}`}
                                        onKeyDown={(keyEvent) => {
                                            if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                                                keyEvent.preventDefault();
                                                setSelectedEvent(event);
                                            }
                                        }}
                                        className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
                                    >
                                        <CommunityEventCard
                                            id={event.id}
                                            title={event.title}
                                            location={event.location}
                                            eventDate={event.event_date}
                                            eventTime={event.event_time}
                                            description={event.description}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        <h1 className="text-3xl font-semibold text-black mb-6">Resources</h1>
                        {resources.length === 0 ? (
                            <p className="text-sm text-gray-600">No resources pending approval.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                {resources.map((resource) => (
                                    <div
                                        key={resource.id}
                                        role="button"
                                        onClick={() => setSelectedResource(resource)}
                                        aria-label={`View details for ${resource.title}`}
                                        onKeyDown={(keyEvent) => {
                                            if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                                                keyEvent.preventDefault();
                                                setSelectedResource(resource);
                                            }
                                        }}
                                        className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
                                    >
                                        <ResourcesCard
                                            id={resource.id}
                                            title={resource.title}
                                            category={resource.category}
                                            description={resource.description}
                                            link={resource.link}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                    </ul>
                )}

                {selectedService && (
                    <Modal onClose={() => setSelectedService(null)}>
                        <h2 className="text-2xl font-semibold">
                            {selectedService.name}
                        </h2>

                        <p className="text-primary mt-2">
                            {selectedService.category}
                        </p>

                        <p className="mt-4">
                            {selectedService.description}
                        </p>

                        <p className="mt-4">
                            {selectedService.location}
                        </p>
                        <div className="flex flex-wrap gap-3 mt-6">
                            <button
                                onClick={() => {
                                    handleApprovePost('service', selectedService.id);
                                    setSelectedService(null);
                                }}
                                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap text-sm"
                            >Approve</button>

                            <button
                                onClick={() => {
                                    setSelectedService(null);
                                }}
                                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap text-sm"
                            >Decline</button>
                        </div>
                    </Modal>
                )}

                {selectedJob && (
                    <Modal onClose={() => setSelectedJob(null)}>
                        <h2 className="text-2xl font-semibold">{selectedJob.title}</h2>
                        <p className="font-medium mt-1">{selectedJob.company}</p>
                        <p className="text-neutral mt-2">{selectedJob.description}</p>
                        <div className="flex items-center gap-2 mt-4 text-neutral">
                            <span>Location: {selectedJob.location}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-neutral">
                            <span>Employment Type: {selectedJob.employment_type}</span>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-6">
                            <button
                                onClick={() => {
                                    handleApprovePost('job', selectedJob.id);
                                    setSelectedJob(null);
                                }}
                                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap text-sm"
                            >Approve</button>

                            <button
                                onClick={() => {
                                    setSelectedJob(null);
                                }}
                                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap text-sm"
                            >Decline</button>
                        </div>
                    </Modal>
                )}

                {selectedGroup && (
                    <Modal onClose={() => setSelectedGroup(null)}>
                        <h2 className="text-2xl font-semibold">{selectedGroup.name}</h2>
                        <p className="text-primary mt-2">{selectedGroup.category}</p>
                        <p className="mt-4">{selectedGroup.description}</p>
                        <button
                            onClick={() => {
                                handleApprovePost('group', selectedGroup.id);
                                setSelectedGroup(null);
                            }}
                            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap text-sm"
                        >Approve</button>

                        <button
                            onClick={() => {
                                setSelectedGroup(null);
                            }}
                            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap text-sm"
                        >Decline</button>
                    </Modal>
                )}

                {selectedEvent && (
                    <Modal onClose={() => setSelectedEvent(null)}>
                        <h2 className="text-2xl font-semibold">{selectedEvent.title}</h2>
                        <p className="text-primary mt-2">{selectedEvent.location}</p>

                        <p className="mt-2">
                            {new Date(selectedEvent.event_date).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })} at {selectedEvent.event_time}
                        </p>

                        <p className="mt-4">{selectedEvent.description}</p>
                        <button
                            onClick={() => {
                                handleApprovePost('event', selectedEvent.id);
                                setSelectedEvent(null);
                            }}
                            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap text-sm"
                        >Approve</button>

                        <button
                            onClick={() => {
                                setSelectedEvent(null);
                            }}
                            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap text-sm"
                        >Decline</button>
                    </Modal>
                )}

                {selectedResource && (
                    <Modal onClose={() => setSelectedResource(null)}>
                        <h2 className="text-2xl font-semibold">
                            {selectedResource.title}
                        </h2>

                        <p className="text-primary mt-2">
                            {selectedResource.category}
                        </p>

                        <p className="mt-4">
                            {selectedResource.description}
                        </p>

                        <a
                            href={selectedResource.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline mt-4 inline-block"
                        >
                            Visit Resource
                        </a>
                        <button
                            onClick={() => {
                                handleApprovePost('resource', selectedResource.id);
                                setSelectedResource(null);
                            }}
                            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap text-sm"
                        >Approve</button>

                        <button
                            onClick={() => {
                                setSelectedResource(null);
                            }}
                            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap text-sm"
                        >Decline</button>
                    </Modal>
                )}

            </div>

        </div>
    );
}
