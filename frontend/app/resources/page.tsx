"use client";

import { useState, useEffect } from "react";

type Resource = {
    id: number;
    title: string;
    description: string;
    link: string;
    category: string;
    status: string;
}

export default function ResourcePage() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchResources() {
            try {
                const res = await fetch("http://localhost:4000/api/resources");
                if (!res.ok) throw new Error("Failed to fetch resources");
                const data = await res.json();
                setResources(data);
            } catch {
                setError("Could not load resources");
            } finally {
                setLoading(false);
            }
        }
        fetchResources();
    }, []);

    return (
        <div className="w-full max-w-5xl mx-auto px-6 py-10">
            <h1 className="text-4xl font-semibold">Find Resources</h1>

            <p className="text-neutral mt-2">
                Browse resources for migrants in New Zealand.
            </p>

            {loading && (
                <p className="mt-8 text-neutral">Loading resources...</p>
            )}

            {error && (
                <p className="mt-8">{error}</p>
            )}

            {!loading && !error && (
                <>
                    {resources.length === 0 ? (
                        <p className="mt-8 text-neutral">No resources found.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            {resources.map((resource) => (
                                <div key={resource.id} className="border border-neutral/20 rounded-xl p-4 bg-white">
                                    <h2 className="font-semibold">{resource.title}</h2>
                                    <p className="text-sm text-neutral">{resource.link}</p>
                                    <p className="text-sm text-neutral mt-2">{resource.description}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}