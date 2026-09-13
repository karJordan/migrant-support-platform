"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";

type FavouriteButtonProps = {
    itemId: string | number;
};

export default function FavouriteButton({
    itemId,
}: FavouriteButtonProps) {
    const { user, isLoading } = useAuth();
    const [isFavourite, setIsFavourite] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!isLoading && user && itemId) {
            void checkIfFavourite();
        }
    }, [isLoading, user, itemId]);

    async function checkIfFavourite() {
        if (!user) return;

        try {
            const response = await fetch(
                `http://localhost:4000/api/saved/check/${user.id}/job/${itemId}`,
            );

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data = await response.json();
            setIsFavourite(data.saved);
        } catch (error) {
            console.error("Error checking favourite status", error);
        }
    }

    async function toggleFavourite(
        event: React.MouseEvent<HTMLButtonElement>,
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
                    method: isFavourite ? "DELETE" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        user_id: user.id,
                        listing_id: Number(itemId),
                        listing_type: "job",
                    }),
                },
            );

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            setIsFavourite((current) => !current);
        } catch (error) {
            console.error("Error updating favourite", error);
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading || !user) return null;

    return (
        <button
            type="button"
            onClick={toggleFavourite}
            onKeyDown={(event) => {
                event.stopPropagation();
            }}
            disabled={isSaving}
            aria-pressed={isFavourite}
            aria-label={
                isFavourite
                    ? "Remove job from favourites"
                    : "Add job to favourites"
            }
            className={
                "shrink-0 rounded-full p-1 transition focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-wait disabled:opacity-50 " +
                (isFavourite
                    ? "text-amber-400"
                    : "text-gray-300 hover:text-amber-400")
            }
        >
            <Star
                aria-hidden="true"
                size={23}
                fill={isFavourite ? "currentColor" : "none"}
            />
        </button>
    );
}