"use client";

import { useState, useEffect } from "react";

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

export default function CommunityPage() {
    const [event, setEvent] = useState<CommunityEvent[]>([]);
    const [group, setGroup] = useState<CommunityGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchEvents() {
            setError("");
            try {
                const res = await fetch("http://localhost:4000/api/community/events", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                if (!res.ok) throw new Error("Failed to fetch events");

                const data = await res.json();
                setEvent(data);
            } catch {
                setError("Could not load events");
            } finally {
                setLoading(false);
            }
        }

        async function fetchGroups() {
            setError("");
            try {
                const res = await fetch("http://localhost:4000/api/community/groups", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                if (!res.ok) throw new Error("Failed to fetch groups");

                const data = await res.json();
                setGroup(data);
            } catch {
                setError("Could not load groups");
            } finally {
                setLoading(false);
            }
        }
        fetchEvents();
        fetchGroups();
    }, []);

    return (
        <div className="w-full max-w-5xl mx-auto px-6 py-10">
            <h1 className="text-4xl font-semibold">Find Communities</h1>

            <p className="text-neutral mt-2">
                Browse community events and groups for migrants in New Zealand.
            </p>
            <div>
                <h2 className="text-3xl font-semibold">Upcoming Events</h2>
                {loading && (
                    
                    <p className="mt-8 text-neutral">Loading communities...</p>
                )}

                {error && (
                    <p className="mt-8">{error}</p>
                )}

                {!loading && !error && (
                    <>
                    {event.length === 0 ? (
                        <p className="mt-8 text-neutral">No events found.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            {event.map((e) => (
                                <div key={e.id} className="border border-neutral/20 rounded-xl p-4 bg-white">
                                    <h2 className="font-semibold">{e.title}</h2>
                                    <p className="text-sm text-neutral">{e.location}</p>
                                    <p className="text-sm text-neutral mt-1">{e.event_date} at {e.event_time}</p>
                                    <p className="text-sm text-neutral mt-2">{e.description}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    </>
                ) }
            </div>
            <div>
                <h2 className="text-3xl font-semibold">Community Groups</h2>
                {loading && (
                    <p className="mt-8 text-neutral">Loading communities...</p>
                )}

                {error && (
                    <p className="mt-8">{error}</p>
                )}

                {!loading && !error && (
                    <>
                    {group.length === 0 ? (
                        <p className="mt-8 text-neutral">No groups found.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            {group.map((g) => (
                                <div key={g.id} className="border border-neutral/20 rounded-xl p-4 bg-white">
                                    <h2 className="font-semibold">{g.name}</h2>
                                    <p className="text-sm text-neutral">{g.category}</p>
                                    <p className="text-sm text-neutral mt-1">{g.description}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    </>
                ) }
            </div>
        </div>
    );
}