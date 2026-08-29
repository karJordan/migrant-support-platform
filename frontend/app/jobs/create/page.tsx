"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import Link from "next/link";

export default function CreateJobPage() {
    const { user, token, isLoading } = useAuth();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [company, setCompany] = useState("");
    const [location, setLocation] = useState("");
    const [employmentType, setEmploymentType] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login"); // redirect to login if not authenticated
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return <p>Loading...</p>; 
    }

    if (!user) {
        return null;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:4000/api/jobs", {
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

            if (!res.ok) throw new Error("Failed to create job");

            router.push("/jobs");
        } catch {
            setError("Could not create job");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <div className="flex justify-end mb-6">
            <Link 
                href="/jobs"
                className="inline-flex items-center gap-2 text-neutral hover:text-blue-600 transition"
            >
                ← Back to Jobs
            </Link>
            </div>
            <h1 className="text-2xl font-semibold mb-4">Create Job</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="text"
                    placeholder="Job Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="border border-neutral/20 rounded-xl p-2"
                />
                <input
                    type="text"
                    placeholder="Company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                    className="border border-neutral/20 rounded-xl p-2"
                />
                <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="border border-neutral/20 rounded-xl p-2"
                />
                <input
                    type="text"
                    placeholder="Employment Type"
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    required
                    className="border border-neutral/20 rounded-xl p-2"
                />
                <textarea
                    placeholder="Job Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    required
                    className="border border-neutral/20 rounded-xl p-2"
                />
                {error && <p className="text-red-500">{error}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-white rounded-xl p-2 disabled:opacity-50"
                >
                    {loading ? "Submitting..." : "Submit for approval"}
                </button>
            </form>
        </div>
    );
}
