"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function CommunityGroupForm() {
    const { user, token } = useAuth();

    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");

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
                "http://localhost:4000/api/community/groups",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name,
                        category,
                        description,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to submit community group");
            }

            setMessage(
                user.role === "admin"
                    ? "Community group added successfully."
                    : "Community group submitted for admin approval."
            );

            setName("");
            setCategory("");
            setDescription("");
        } catch (error) {
            console.error(error);
            setMessage("Unable to submit community group.");
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <h2 className="text-2xl font-semibold">
                    Add a Community Group
                </h2>

                <p className="text-neutral mt-1">
                    {user?.role === "admin"
                        ? "This group will be published immediately."
                        : "This group will be submitted for admin approval."}
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
                Submit Group
            </button>
            <p className="text-neutral mt-1">
                {user?.role === "admin"
                    ? "This group will be published immediately."
                    : "This group will be submitted for admin approval."}
            </p>
            {message && (
                <p className="text-sm text-neutral">
                    {message}
                </p>
            )}
        </form>
    );
}