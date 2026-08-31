"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ServiceForm() {
    const { user, token } = useAuth();

    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [phone, setPhone] = useState("");
    const [website, setWebsite] = useState("");

    const [message, setMessage] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setMessage("");

        if (!token || !user) {
            setMessage("You must be logged in to submit a service.");
            return;
        }
        try {
            const response = await fetch("http://localhost:4000/api/services", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name,
                    category,
                    description,
                    location,
                    phone,
                    website,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to submit service");
            }

            setMessage("Service submitted successfully.");

            setName("");
            setCategory("");
            setDescription("");
            setLocation("");
            setPhone("");
            setWebsite("");
        } catch (error) {
            console.error(error);
            setMessage("Unable to submit service.");
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <h2 className="text-2xl font-semibold">
                    Add a Service
                </h2>

                <p className="text-neutral mt-1">
                    Submit a service for the community.
                </p>
            </div>

            <input
                type="text"
                placeholder="Service name"
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
                placeholder="Description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="border border-neutral/20 rounded-lg px-4 py-3 min-h-28"
            />

            <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="border border-neutral/20 rounded-lg px-4 py-3"
            />

            <input
                type="text"
                placeholder="Phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="border border-neutral/20 rounded-lg px-4 py-3"
            />

            <input
                type="url"
                placeholder="Website"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                className="border border-neutral/20 rounded-lg px-4 py-3"
            />

            <button
                type="submit"
                className="bg-primary text-white px-4 py-3 rounded-lg"
            >
                Submit Service
            </button>
            <p className="text-neutral mt-1">
                {user?.role === "admin"
                    ? "This service will be published immediately."
                    : "This service will be submitted for admin approval."}
            </p>

            {message && (
                <p className="text-sm text-neutral">
                    {message}
                </p>
            )}
        </form>
    );
}