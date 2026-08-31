"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ResourcesForm() {
    const { user, token } = useAuth();

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [link, setLink] = useState("");

    const [message, setMessage] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setMessage("");

        if (!token || !user) {
            setMessage("You must be logged in to submit a resource.");
            return;
        }

        try {
            const response = await fetch("http://localhost:4000/api/resources", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    category,
                    description,
                    link,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to submit resource");
            }

            setMessage(
                user.role === "admin"
                    ? "Resource added successfully."
                    : "Resource submitted for admin approval."
            );

            setTitle("");
            setCategory("");
            setDescription("");
            setLink("");
        } catch (error) {
            console.error(error);
            setMessage("Unable to submit resource.");
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <h2 className="text-2xl font-semibold">
                    Add a Resource
                </h2>

                <p className="text-neutral mt-1">
                    {user?.role === "admin"
                        ? "This resource will be published immediately."
                        : "This resource will be submitted for admin approval."}
                </p>
            </div>

            <input
                type="text"
                placeholder="Resource title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
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
                placeholder="Description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                className="border border-neutral/20 rounded-lg px-4 py-3 min-h-28"
            />

            <input
                type="url"
                placeholder="Resource link"
                value={link}
                onChange={(event) => setLink(event.target.value)}
                required
                className="border border-neutral/20 rounded-lg px-4 py-3"
            />

            <button
                type="submit"
                className="bg-primary text-white px-4 py-3 rounded-lg"
            >
                Submit Resource
            </button>

            {message && (
                <p className="text-sm text-neutral">
                    {message}
                </p>
            )}
        </form>
    );
}