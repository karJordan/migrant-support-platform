"use client";

import Button from "@/components/ui/Button";
import Input, { Textarea } from "@/components/ui/Input";
import Feedback from "@/components/ui/Feedback";
import CategoryField, { useCategoryOptions } from "@/components/CategoryField";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { CommunityEvent } from "@/types/event";

type CommunityEventFormProps = {
    communityEvent?: CommunityEvent & { category_id?: number | null };
    onCancel?: () => void;
    onSaved?: (updatedEvent: CommunityEvent) => void;
};

export default function CommunityEventForm({
    communityEvent,
    onCancel,
    onSaved,
}: CommunityEventFormProps) {
    const { user, token } = useAuth();
    const [categoryId, setCategoryId] = useState(String(communityEvent?.category_id ?? ""));
    const [categoryChanged, setCategoryChanged] = useState(false);
    const categories = useCategoryOptions("community");

    const [title, setTitle] = useState(communityEvent?.title ?? "");
    const [location, setLocation] = useState(
        communityEvent?.location ?? ""
    );
    const [eventDate, setEventDate] = useState(
        communityEvent?.event_date?.slice(0, 10) ?? ""
    );
    const [eventTime, setEventTime] = useState(
        communityEvent?.event_time ?? ""
    );
    const [description, setDescription] = useState(
        communityEvent?.description ?? ""
    );

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error">("error");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isSubmitting) return;
        setMessageType("error");
        setMessage("");

        if (!token || !user) {
            setMessage("You must be logged in to submit an event.");
            return;
        }

        if (categories.loading || categories.error) {
            setMessage("Wait for categories to load, or retry loading them.");
            return;
        }
        if (categoryId && (!communityEvent || categoryChanged) && !categories.options.some(option => String(option.id) === categoryId)) {
            setMessage("Please select an available category.");
            return;
        }

        setIsSubmitting(true);
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
                        ...(communityEvent && !categoryChanged ? {} : { category_id: categoryId === "" ? null : Number(categoryId) }),
                        title,
                        location,
                        event_date: eventDate,
                        event_time: eventTime,
                        description,
                    }),
                }
            );

            if (!response.ok) {
                const failure = await response.json().catch(() => null);
                if (failure?.message || failure?.error) throw new Error(failure.message || failure.error);
                throw new Error(
                    communityEvent
                        ? "Failed to update event"
                        : "Failed to submit event"
                );
            }

            const updatedEvent = await response.json();
            setMessageType("success");

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
                setCategoryId("");
                setCategoryChanged(false);
                setTitle("");
                setLocation("");
                setEventDate("");
                setEventTime("");
                setDescription("");
            }
        } catch (error) {
            console.error(error);

            setMessage(
                error instanceof Error ? error.message : communityEvent
                    ? "Unable to update event."
                    : "Unable to submit event."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <h2 className="heading-3">
                    {communityEvent
                        ? "Edit Community Event"
                        : "Add a Community Event"}
                </h2>

                <p className="text-text-secondary mt-1">
                    {communityEvent
                        ? "Update this community event."
                        : "Submit a community event."}
                </p>
            </div>

            <div>
                <label
                    htmlFor="event-title"
                    className="block text-sm font-medium mb-1"
                >
                    Event Title
                </label>
                <Input
                    id="event-title"
                    type="text"
                    placeholder="Event title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    required
                />
            </div>

            <div>
                <label
                    htmlFor="event-location"
                    className="block text-sm font-medium mb-1"
                >
                    Location
                </label>
                <Input
                    id="event-location"
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    required
                />
            </div>

            <div>
                <label
                    htmlFor="event-date"
                    className="block text-sm font-medium mb-1"
                >
                    Event Date
                </label>
                <Input
                    id="event-date"
                    type="date"
                    value={eventDate}
                    onChange={(event) => setEventDate(event.target.value)}
                    required
                />
            </div>

            <div>
                <label
                    htmlFor="event-time"
                    className="block text-sm font-medium mb-1"
                >
                    Event Time
                </label>
                <Input
                    id="event-time"
                    type="time"
                    value={eventTime}
                    onChange={(event) => setEventTime(event.target.value)}
                    required
                />
            </div>

            <div>
                <label
                    htmlFor="event-description"
                    className="block text-sm font-medium mb-1"
                >
                    Description
                </label>
                <Textarea
                    id="event-description"
                    placeholder="Event description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    required
                />
            </div>

            <CategoryField
                id="event-category"
                value={categoryId}
                onChange={value => { setCategoryId(value); setCategoryChanged(true); }}
                {...categories}
                optional={true}
                disabled={isSubmitting}
            />

            <Button
                type="submit"
                disabled={categories.loading || Boolean(categories.error)}
                loading={isSubmitting} loadingLabel="Saving..."
            >
                {communityEvent ? "Save Changes" : "Submit Event"}
            </Button>

            {communityEvent && onCancel && (
                <Button
                    type="button"
                    onClick={onCancel}
                    variant="secondary" disabled={isSubmitting}
                >
                    Cancel
                </Button>
            )}

            {!communityEvent && (
                <p className="text-text-secondary mt-1">
                    {user?.role === "admin"
                        ? "This event will be published immediately."
                        : "This event will be submitted for admin approval."}
                </p>
            )}

            {message && (
                <Feedback variant={messageType}>{message}</Feedback>
            )}
        </form>
    );
}