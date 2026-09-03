"use client";

import { useState, useEffect } from "react";

export const dynamic = 'force-dynamic';

type User ={
    id: number;
    name: string;
    email: string;
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
    const [jobs, setJobs] = useState<Job[]>([]);
    const [events, setEvents] = useState<CommunityEvent[]>([]);
    const [groups, setGroups] = useState<CommunityGroup[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [selectedPostType, setSelectedPostType] = useState(true);
    const [loading, setLoading] = useState(false);

    async function fetchUsers() {

        try {
            const response = await fetch("http://localhost:4000/api/admin/users", {
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
    };

    async function fetchEvents() {
        try {
            const response = await fetch("http://localhost:4000/api/admin/events", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
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
                    "Content-Type": "application/json"
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
                    "Content-Type": "application/json"
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
                    "Content-Type": "application/json"
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
                    "Content-Type": "application/json"
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
                                        <li key={service.id} className="bg-gray-100 p-4 rounded-lg">
                                            <p className="font-semibold">{service.name}</p>
                                            <p className="text-sm text-gray-600">{service.description}</p>
                                        </li>
                                    ))}
                                </div>
                            )}
                            <h1 className="text-3xl font-semibold text-black mb-6">Jobs</h1>
                            {jobs.length === 0 ? (
                                <p className="text-sm text-gray-600">No job listings pending approval.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                    {jobs.map((job) => (
                                        <li key={job.id} className="bg-gray-100 p-4 rounded-lg">
                                            <p className="font-semibold">{job.title}</p>
                                            <p className="text-sm text-gray-600">{job.description}</p>
                                        </li>
                                    ))}
                                </div>
                            )}
                            <h1 className="text-3xl font-semibold text-black mb-6">Community Groups</h1>
                            {groups.length === 0 ? (
                                <p className="text-sm text-gray-600">No groups pending approval.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                    {groups.map((group) => (
                                        <li key={group.id} className="bg-gray-100 p-4 rounded-lg">
                                            <p className="font-semibold">{group.name}</p>
                                            <p className="text-sm text-gray-600">{group.description}</p>
                                        </li>
                                    ))}
                                </div>
                            )}
                            <h1 className="text-3xl font-semibold text-black mb-6">Community Events</h1>
                            {events.length === 0 ? (
                                <p className="text-sm text-gray-600">No events pending approval.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                    {events.map((event) => (
                                        <li key={event.id} className="bg-gray-100 p-4 rounded-lg">
                                            <p className="font-semibold">{event.title}</p>
                                            <p className="text-sm text-gray-600">{event.description}</p>
                                        </li>
                                    ))}
                                </div>
                            )}
                            <h1 className="text-3xl font-semibold text-black mb-6">Resources</h1>
                            {resources.length === 0 ? (
                                <p className="text-sm text-gray-600">No resources pending approval.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                    {resources.map((resource) => (
                                        <li key={resource.id} className="bg-gray-100 p-4 rounded-lg">
                                            <p className="font-semibold">{resource.title}</p>
                                            <p className="text-sm text-gray-600">{resource.description}</p>
                                        </li>
                                    ))}
                                </div>
                            )}
                    </ul>
                )}

            </div>

        </div>
    );
}
