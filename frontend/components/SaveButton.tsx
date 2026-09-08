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

    async function toggleSave() {
        if (!user) {
            window.location.href = "/login";
            return;
        }

        setIsSaving(true);
        try {
            const method = isSaved ? "DELETE" : "POST";
            
            // ✅ Build the request body
        const requestBody = {
            user_id: user.id,
            listing_id: Number(itemId),
            listing_type: itemType,
        };

        // ✅ LOG THIS - check your browser console
        console.log('📤 Sending to backend:', requestBody);
        console.log('📤 user_id:', requestBody.user_id, 'type:', typeof requestBody.user_id);
        console.log('📤 listing_id:', requestBody.listing_id, 'type:', typeof requestBody.listing_id);
        console.log('📤 listing_type:', requestBody.listing_type, 'type:', typeof requestBody.listing_type);

        const response = await fetch(`http://localhost:4000/api/saved/`, {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        // ✅ Log the response
        const responseText = await response.text();
        console.log('📥 Response status:', response.status);
        console.log('📥 Response body:', responseText);

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
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                isSaved 
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