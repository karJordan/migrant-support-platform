"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";

type ListingType =
    | "job"
    | "service"
    | "resource"
    | "community_event"
    | "community_group";

type SaveButtonProps = {
    itemId: string | number;
    listingType: ListingType;
};

export default function SaveButton({
    itemId,
    listingType,
}: SaveButtonProps) {
    const { user, isLoading } = useAuth();
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!isLoading && user && itemId) {
            void checkIfSaved();
        }
    }, [isLoading, user, itemId, listingType]);

    async function checkIfSaved() {
        if (!user) return;

        try {
            const response = await fetch(
                `http://localhost:4000/api/saved/check/${user.id}/${listingType}/${itemId}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data = await response.json();
            setIsSaved(data.saved);
        } catch (error) {
            console.error("Error checking saved status", error);
        }
    }

    async function toggleSaved(
        event: React.MouseEvent<HTMLButtonElement>
    ) {
        event.stopPropagation();

        if (!user) {
            window.location.href = "/login";
            return;
        }

        if (isSaving) return;

        setIsSaving(true);

        try {
            const response = await fetch(
                "http://localhost:4000/api/saved/",
                {
                    method: isSaved ? "DELETE" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        user_id: user.id,
                        listing_id: Number(itemId),
                        listing_type: listingType,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            setIsSaved((current) => !current);
        } catch (error) {
            console.error("Error updating saved listing", error);
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading || !user || user.role === "admin") {
        return null;
    }

    return (
        <button
            type="button"
            onClick={toggleSaved}
            onKeyDown={(event) => event.stopPropagation()}
            disabled={isSaving}
            aria-pressed={isSaved}
            aria-label={
                isSaved
                    ? "Remove from saved listings"
                    : "Save listing"
            }
            className={
                "shrink-0 rounded-full p-1 transition " +
                "focus:outline-none focus:ring-2 focus:ring-primary " +
                "disabled:cursor-wait disabled:opacity-50 " +
                (isSaved
                    ? "text-red-500"
                    : "text-gray-300 hover:text-red-500")
            }
        >
            <Heart
                aria-hidden="true"
                size={23}
                fill={isSaved ? "currentColor" : "none"}
            />
        </button>
    );
}