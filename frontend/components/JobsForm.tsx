"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function JobsForm() {
    const { user, token } = useAuth();

    const [title, setTitle] = useState("");
    const [company, setCompany] = useState("");
    const [location, setLocation] = useState("");
    const [employmentType, setEmploymentType] = useState("");
    const [description, setDescription] = useState("");

    const [message, setMessage] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setMessage("");

        if (!token || !user) {
            setMessage("You must be logged in to submit a job.");
            return;
        }

        try {
            const response = await fetch("http://localhost:4000/api/jobs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    company,
                    location,
                    employment_type: employmentType,
                    description,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to submit job");
            }

            setMessage(
                user.role === "admin"
                    ? "Job added successfully."
                    : "Job submitted for admin approval."
            );

            setTitle("");
            setCompany("");
            setLocation("");
            setEmploymentType("");
            setDescription("");
        } catch (error) {
            console.error(error);
            setMessage("Unable to submit job.");
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <h2 className="text-2xl font-semibold">
                    Add a Job
                </h2>

                <p className="text-neutral mt-1">
                    {user?.role === "admin"
                        ? "This job will be published immediately."
                        : "This job will be submitted for admin approval."}
                </p>
            </div>

            <input
                type="text"
                placeholder="Job title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                className="border border-neutral/20 rounded-lg px-4 py-3"
            />

            <input
                type="text"
                placeholder="Company"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
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

            <select
                value={employmentType}
                onChange={(event) => setEmploymentType(event.target.value)}
                required
                className="border border-neutral/20 rounded-lg px-4 py-3 bg-white"
            >
                <option value="">Select employment type</option>
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Contract">Contract</option>
                <option value="Casual">Casual</option>
            </select>

            <textarea
                placeholder="Job description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                className="border border-neutral/20 rounded-lg px-4 py-3 min-h-28"
            />

            <button
                type="submit"
                className="bg-primary text-white px-4 py-3 rounded-lg"
            >
                Submit Job
            </button>

            {message && (
                <p className="text-sm text-neutral">
                    {message}
                </p>
            )}
        </form>
    );
}