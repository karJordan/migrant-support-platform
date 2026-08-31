"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function CommunityEventForm() {
    const { user, token } = useAuth();

    const [title, setTitle] = useState("");
    const [location, setLocation] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [eventTime, setEventTime] = useState("");
    const [description, setDescription] = useState("");

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
                "http://localhost:4000/api/community/events",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
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
                throw new Error("Failed to submit event");
            }

            setMessage(
                user.role === "admin"
                    ? "Event added successfully."
                    : "Event submitted for admin approval."
            );

            setTitle("");
            setLocation("");
            setEventDate("");
            setEventTime("");
            setDescription("");
        } catch (error) {
            console.error(error);
            setMessage("Unable to submit event.");
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <h2 className="text-2xl font-semibold">
                    Add a Community Event
                </h2>

                <p className="text-neutral mt-1">
                    {user?.role === "admin"
                        ? "This event will be published immediately."
                        : "This event will be submitted for admin approval."}
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
                Submit Event
            </button>

            {message && (
                <p className="text-sm text-neutral">
                    {message}
                </p>
            )}
        </form>
    );
}