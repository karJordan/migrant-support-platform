"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Heart } from "lucide-react";

interface SaveButtonProps {
    itemId: string | number;
    itemType: "service" | "job" | "community_event" | "community_group" | "resource";
}

export default function SaveButton({ itemId, itemType }: SaveButtonProps) {
    const { user, isLoading } = useAuth();
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const shouldShowButton = !isLoading && user;

    useEffect(() => {
        if (shouldShowButton && itemId) {
            checkIfSaved();
        }
    }, [shouldShowButton, itemId, itemType]);

    async function checkIfSaved() {

        if (!user) return;

        try {
            const response = await fetch(`http://localhost:4000/api/saved/check/${user.id}/${itemType}/${itemId}`);

            if (!response.ok) {
                throw new Error("HTTP Error: " + response.status);
            }

            const data = await response.json();
            setIsSaved(data.saved);
        } catch (error) {
            console.error("Error checking saved status", error);
        }
    }

    async function toggleSave(event: React.MouseEvent) {
        event.stopPropagation();

        if (!user) {
            window.location.href = "/login";
            return;
        }

        setIsSaving(true);
        try {
            const method = isSaved ? "DELETE" : "POST";

            const requestBody = {
                user_id: user.id,
                listing_id: Number(itemId),
                listing_type: itemType,
            };

            const response = await fetch(`http://localhost:4000/api/saved/`, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error("HTTP Error: " + response.status);
            }

            setIsSaved(!isSaved);
        } catch (error) {
            console.error("Error toggling save status", error);
        } finally {
            setIsSaving(false);
        }
    }

    if (!shouldShowButton) {
        return null
    }

    return (
        <button
            onClick={toggleSave}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.stopPropagation();
                }
            }}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${isSaved
                    ? 'bg-primary text-white'
                    : 'bg-white text-primary border-primary'
                }`}
            aria-label={isSaved ? "Unsave" : "Save"}
        >
            <Heart size={20} fill={isSaved ? "currentColor" : "none"} />
            {isSaved ? "Saved" : "Save"}
        </button>
    );
}