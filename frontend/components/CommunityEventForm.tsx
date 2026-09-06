"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { CommunityEvent } from "@/types/event";

type CommunityEventFormProps = {
    communityEvent?: CommunityEvent;
    onCancel?: () => void;
    onSaved?: (updatedEvent: CommunityEvent) => void;
};

export default function CommunityEventForm({
    communityEvent,
    onCancel,
    onSaved,
}: CommunityEventFormProps) {
    const { user, token } = useAuth();

    const [title, setTitle] = useState(communityEvent?.title ?? "");
    const [location, setLocation] = useState(
        communityEvent?.location ?? ""
    );
    const [eventDate, setEventDate] = useState(
        communityEvent?.event_date ?? ""
    );
    const [eventTime, setEventTime] = useState(
        communityEvent?.event_time ?? ""
    );
    const [description, setDescription] = useState(
        communityEvent?.description ?? ""
    );

    const [message, setMessage] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setMessage("");

        if (!token || !user) {
            setMessage("You must be logged in to submit an event.");
            return;
        }

        try {
            const response = await fetch(
                communityEvent
                    ? `http://localhost:4000/api/community/events/${communityEvent.id}`
                    : "http://localhost:4000/api/community/events",
                {
                    method: communityEvent ? "PATCH" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title,
                        location,
                        event_date: eventDate,
                        event_time: eventTime,
                        description,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(
                    communityEvent
                        ? "Failed to update event"
                        : "Failed to submit event"
                );
            }

            const updatedEvent = await response.json();

            setMessage(
                communityEvent
                    ? "Event updated successfully."
                    : user.role === "admin"
                        ? "Event added successfully."
                        : "Event submitted for admin approval."
            );

            if (communityEvent) {
                onSaved?.(updatedEvent);
            }

            if (!communityEvent) {
                setTitle("");
                setLocation("");
                setEventDate("");
                setEventTime("");
                setDescription("");
            }
        } catch (error) {
            console.error(error);

            setMessage(
                communityEvent
                    ? "Unable to update event."
                    : "Unable to submit event."
            );
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <h2 className="text-2xl font-semibold">
                    {communityEvent
                        ? "Edit Community Event"
                        : "Add a Community Event"}
                </h2>

                <p className="text-neutral mt-1">
                    {communityEvent
                        ? "Update this community event."
                        : "Submit a community event."}
                </p>
            </div>

            <input
                type="text"
                placeholder="Event title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                className="border border-neutral/20 rounded-lg px-4 py-3"
            />

            <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                required
                className="border border-neutral/20 rounded-lg px-4 py-3"
            />

            <input
                type="date"
                value={eventDate}
                onChange={(event) => setEventDate(event.target.value)}
                required
                className="border border-neutral/20 rounded-lg px-4 py-3"
            />

            <input
                type="time"
                value={eventTime}
                onChange={(event) => setEventTime(event.target.value)}
                required
                className="border border-neutral/20 rounded-lg px-4 py-3"
            />

            <textarea
                placeholder="Event description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                className="border border-neutral/20 rounded-lg px-4 py-3 min-h-28"
            />

            <button
                type="submit"
                className="bg-primary text-white px-4 py-3 rounded-lg"
            >
                {communityEvent ? "Save Changes" : "Submit Event"}
            </button>

            {communityEvent && onCancel && (
                <button
                    type="button"
                    onClick={onCancel}
                    className="border px-4 py-3 rounded-lg"
                >
                    Cancel
                </button>
            )}

            {!communityEvent && (
                <p className="text-neutral mt-1">
                    {user?.role === "admin"
                        ? "This event will be published immediately."
                        : "This event will be submitted for admin approval."}
                </p>
            )}

            {message && (
                <p className="text-sm text-neutral">
                    {message}
                </p>
            )}
        </form>
    );
}