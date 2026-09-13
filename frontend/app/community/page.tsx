"use client";

import { Select } from "@/components/ui/Input";
import CommunityGroupCard from "@/components/CommunityGroupCard";
import CommunityEventCard from "@/components/CommunityEventCard";
import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import CommunityGroupForm from "@/components/CommunityGroupForm";
import CommunityEventForm from "@/components/CommunityEventForm";
import { useAuth } from "@/context/AuthContext";
import { CommunityGroup } from "@/types/group";
import { CommunityEvent } from "@/types/event";


export default function CommunityPage() {

    const [event, setEvent] = useState<CommunityEvent[]>([]);
    const [group, setGroup] = useState<CommunityGroup[]>([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [groupsLoading, setGroupsLoading] = useState(true);

    const [eventsError, setEventsError] = useState<string | null>(null);
    const [groupsError, setGroupsError] = useState<string | null>(null);

    const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<CommunityGroup | null>(null);
    const [isEditingEvent, setIsEditingEvent] = useState(false);
    const [isEditingGroup, setIsEditingGroup] = useState(false);

    const { user } = useAuth();
    const [eventSort, setEventSort] = useState("soonest");
    const sortedEvents = [...event].sort((a, b) => {
        if (eventSort === "title") return a.title.localeCompare(b.title, "en-NZ");
        const dateValue = (item: CommunityEvent) => {
            const day = item.event_date?.slice(0, 10);
            return day ? Date.parse(`${day}T${item.event_time || "00:00:00"}`) : NaN;
        };
        const first = dateValue(a);
        const second = dateValue(b);
        // Undated events stay last in either date order.
        if (Number.isNaN(first)) return Number.isNaN(second) ? a.id - b.id : 1;
        if (Number.isNaN(second)) return -1;
        return (eventSort === "latest" ? second - first : first - second) || a.id - b.id;
    });

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
        <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:px-6 sm:py-10">
            <h1 className="text-2xl font-bold sm:text-3xl">
                Community
            </h1>

            <p className="hidden sm:block text-sm text-text-secondary mt-2 mb-6">
                Browse community events and groups for migrants in New Zealand.
            </p>
            <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold">Upcoming Events</h2>

                </div>
                <div className="mt-4 mb-4 max-w-xs">
                    <label htmlFor="event-sort" className="mb-1 block text-sm font-medium">Sort events</label>
                    <Select id="event-sort" value={eventSort} onChange={(event) => setEventSort(event.target.value)}>
                        <option value="soonest">Soonest first</option>
                        <option value="latest">Latest date first</option>
                        <option value="title">Title A–Z</option>
                    </Select>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                {sortedEvents.map((e) => (
                                    <div
                                        key={e.id}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`View details for ${e.title}`}
                                        onClick={() => {
                                            setSelectedEvent(e);
                                            setIsEditingEvent(false);
                                        }}
                                        onKeyDown={(keyEvent) => {
                                            if (keyEvent.target !== keyEvent.currentTarget) return;
                                            if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                                                keyEvent.preventDefault();
                                                setSelectedEvent(e);
                                                setIsEditingEvent(false);
                                            }
                                        }}
                                        className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
                                    >
                                        <CommunityEventCard
                                            id={e.id}
                                            title={e.title}
                                            location={e.location}
                                            eventDate={e.event_date}
                                            eventTime={e.event_time}
                                            description={e.description}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            <div className="mt-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold">Community Groups</h2>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                {group.map((g) => (
                                    <div
                                        key={g.id}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`View details for ${g.name}`}
                                        onClick={() => {
                                            setSelectedGroup(g);
                                            setIsEditingGroup(false);
                                        }}
                                        onKeyDown={(keyEvent) => {
                                            if (keyEvent.target !== keyEvent.currentTarget) return;
                                            if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                                                keyEvent.preventDefault();
                                                setSelectedGroup(g);
                                                setIsEditingGroup(false);
                                            }
                                        }}
                                        className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
                                    >
                                        <CommunityGroupCard
                                            id={g.id}
                                            name={g.name}
                                            category={g.category}
                                            description={g.description}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            {selectedEvent && (
                <Modal
                    onClose={() => {
                        setSelectedEvent(null);
                        setIsEditingEvent(false);
                    }}
                >
                    {isEditingEvent ? (
                        <CommunityEventForm
                            communityEvent={selectedEvent}
                            onCancel={() => setIsEditingEvent(false)}
                            onSaved={(updatedEvent) => {
                                setEvent((currentEvents) =>
                                    currentEvents.map((event) =>
                                        event.id === updatedEvent.id
                                            ? updatedEvent
                                            : event
                                    )
                                );

                                setSelectedEvent(updatedEvent);
                                setIsEditingEvent(false);
                            }}
                        />
                    ) : (
                        <>
                            <h2 className="text-2xl font-semibold">
                                {selectedEvent.title}
                            </h2>

                            <p className="text-primary mt-2">
                                {selectedEvent.location}
                            </p>

                            <p className="mt-2">
                                {new Date(
                                    selectedEvent.event_date
                                ).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}{" "}
                                at {selectedEvent.event_time}
                            </p>

                            <p className="mt-4">
                                {selectedEvent.description}
                            </p>

                            {user?.role === "admin" && (
                                <button
                                    onClick={() => setIsEditingEvent(true)}
                                    className="bg-primary text-white px-6 py-3 rounded-lg mt-6"
                                >
                                    Edit
                                </button>
                            )}
                        </>
                    )}
                </Modal>
            )}
            {selectedGroup && (
                <Modal
                    onClose={() => {
                        setSelectedGroup(null);
                        setIsEditingGroup(false);
                    }}
                >
                    {isEditingGroup ? (
                        <CommunityGroupForm
                            group={selectedGroup}
                            onCancel={() => setIsEditingGroup(false)}
                            onSaved={(updatedGroup) => {
                                setGroup((currentGroups) =>
                                    currentGroups.map((group) =>
                                        group.id === updatedGroup.id
                                            ? updatedGroup
                                            : group
                                    )
                                );

                                setSelectedGroup(updatedGroup);
                                setIsEditingGroup(false);
                            }}
                        />
                    ) : (
                        <>
                            <h2 className="text-2xl font-semibold">
                                {selectedGroup.name}
                            </h2>

                            <p className="text-primary mt-2">
                                {selectedGroup.category}
                            </p>

                            <p className="mt-4">
                                {selectedGroup.description}
                            </p>

                            {user?.role === "admin" && (
                                <button
                                    onClick={() => setIsEditingGroup(true)}
                                    className="bg-primary text-white px-6 py-3 rounded-lg mt-6"
                                >
                                    Edit
                                </button>
                            )}
                        </>
                    )}
                </Modal>
            )}
        </div>
    );
}