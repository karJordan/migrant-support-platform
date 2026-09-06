"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { CommunityGroup } from "@/types/group";

type CommunityGroupFormProps = {
    group?: CommunityGroup;
    onCancel?: () => void;
    onSaved?: (updatedGroup: CommunityGroup) => void;
};

export default function CommunityGroupForm({
    group,
    onCancel,
    onSaved,
}: CommunityGroupFormProps) {
    const { user, token } = useAuth();

    const [name, setName] = useState(group?.name ?? "");
    const [category, setCategory] = useState(group?.category ?? "");
    const [description, setDescription] = useState(
        group?.description ?? ""
    );

    const [message, setMessage] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setMessage("");

        if (!token || !user) {
            setMessage("You must be logged in to submit a community group.");
            return;
        }

        try {
            const response = await fetch(
                group
                    ? `http://localhost:4000/api/community/groups/${group.id}`
                    : "http://localhost:4000/api/community/groups",
                {
                    method: group ? "PATCH" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name,
                        category,
                        description,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(
                    group
                        ? "Failed to update community group"
                        : "Failed to submit community group"
                );
            }

            const updatedGroup = await response.json();

            setMessage(
                group
                    ? "Community group updated successfully."
                    : user.role === "admin"
                        ? "Community group added successfully."
                        : "Community group submitted for admin approval."
            );

            if (group) {
                onSaved?.(updatedGroup);
            }

            if (!group) {
                setName("");
                setCategory("");
                setDescription("");
            }
        } catch (error) {
            console.error(error);

            setMessage(
                group
                    ? "Unable to update community group."
                    : "Unable to submit community group."
            );
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <h2 className="text-2xl font-semibold">
                    {group
                        ? "Edit Community Group"
                        : "Add a Community Group"}
                </h2>

                <p className="text-neutral mt-1">
                    {group
                        ? "Update this community group."
                        : "Submit a community group."}
                </p>
            </div>

            <input
                type="text"
                placeholder="Group name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="border border-neutral/20 rounded-lg px-4 py-3"
            />

            <input
                type="text"
                placeholder="Category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                required
                className="border border-neutral/20 rounded-lg px-4 py-3"
            />

            <textarea
                placeholder="Group description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                className="border border-neutral/20 rounded-lg px-4 py-3 min-h-28"
            />

            <button
                type="submit"
                className="bg-primary text-white px-4 py-3 rounded-lg"
            >
                {group ? "Save Changes" : "Submit Group"}
            </button>

            {group && onCancel && (
                <button
                    type="button"
                    onClick={onCancel}
                    className="border px-4 py-3 rounded-lg"
                >
                    Cancel
                </button>
            )}

            {!group && (
                <p className="text-neutral mt-1">
                    {user?.role === "admin"
                        ? "This group will be published immediately."
                        : "This group will be submitted for admin approval."}
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