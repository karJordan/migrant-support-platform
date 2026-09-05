"use client";

import CommunityGroupCard from "@/components/CommunityGroupCard";
import CommunityEventCard from "@/components/CommunityEventCard";
import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import CommunityGroupForm from "@/components/CommunityGroupForm";
import CommunityEventForm from "@/components/CommunityEventForm";
import { useAuth } from "@/context/AuthContext";

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
    const [eventsLoading, setEventsLoading] = useState(true);
    const [groupsLoading, setGroupsLoading] = useState(true);

    const [eventsError, setEventsError] = useState<string | null>(null);
    const [groupsError, setGroupsError] = useState<string | null>(null);

    const [showGroupForm, setShowGroupForm] = useState(false);
    const [showEventForm, setShowEventForm] = useState(false);

    const { user } = useAuth();
    
    useEffect(() => {
        async function fetchEvents() {
            setEventsError("");
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
                setEventsError("Could not load events");
            } finally {
                setEventsLoading(false);
            }
        }

        async function fetchGroups() {
            setGroupsError("");
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
                setGroupsError("Could not load groups");
            } finally {
                setGroupsLoading(false);
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
                <div className="flex gap-3 mt-6">
                    {user && (
                        <button
                            onClick={() => setShowEventForm(true)}
                            className="bg-primary text-white px-4 py-2 rounded-lg"
                        >
                            Add Community Event
                        </button>
                    )}
                </div>

                {eventsLoading && (

                    <p className="mt-8 text-neutral">Loading communities...</p>
                )}

                {eventsError && (
                    <p className="mt-8">{eventsError}</p>
                )}

                {!eventsLoading && !eventsError && (
                    <>
                        {event.length === 0 ? (
                            <p className="mt-8 text-neutral">No events found.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                {event.map((e) => (
                                    <CommunityEventCard
                                        key={e.id}
                                        id={e.id}
                                        title={e.title}
                                        location={e.location}
                                        eventDate={e.event_date}
                                        eventTime={e.event_time}
                                        description={e.description}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            <div className="mt-12">
                <h2 className="text-3xl font-semibold">Community Groups</h2>
                <div className="flex gap-3 mt-6">
                    {user && (
                        <button
                            onClick={() => setShowGroupForm(true)}
                            className="bg-primary text-white px-4 py-2 rounded-lg"
                        >
                            Add Community Group
                        </button>
                    )}
                </div>
                {groupsLoading && (
                    <p className="mt-8 text-neutral">Loading communities...</p>
                )}

                {groupsError && (
                    <p className="mt-8">{groupsError}</p>
                )}

                {!groupsLoading && !groupsError && (
                    <>
                        {group.length === 0 ? (
                            <p className="mt-8 text-neutral">No groups found.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                {group.map((g) => (
                                    <CommunityGroupCard
                                        key={g.id}
                                        id={g.id}
                                        name={g.name}
                                        category={g.category}
                                        description={g.description}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            {showGroupForm && (
                <Modal onClose={() => setShowGroupForm(false)}>
                    <CommunityGroupForm />
                </Modal>
            )}
            {showEventForm && (
                <Modal onClose={() => setShowEventForm(false)}>
                    <CommunityEventForm />
                </Modal>
            )}
        </div>
    );
}