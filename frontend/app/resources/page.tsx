"use client";

import { useState, useEffect } from "react";
import ResourcesCard from "@/components/ResourcesCard";
import Modal from "@/components/Modal";
import ResourcesForm from "@/components/ResourcesForm";

type Resource = {
    id: number;
    title: string;
    description: string;
    link: string;
    category: string;
    status: string;
};

export default function ResourcePage() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [showResourcesForm, setShowResourcesForm] = useState(false);

    useEffect(() => {
        async function fetchResources() {
            try {
                const res = await fetch("http://localhost:4000/api/resources");

                if (!res.ok) {
                    throw new Error("Failed to fetch resources");
                }

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

    const categories = [
        "All",
        ...new Set(resources.map((resource) => resource.category))
    ];

    const filteredResources =
        selectedCategory === "All"
            ? resources
            : resources.filter(
                (resource) => resource.category === selectedCategory
            );

    return (
        <div className="w-full max-w-5xl mx-auto px-6 py-10">
            <h1 className="text-4xl font-semibold">Find Resources</h1>

            <p className="text-neutral mt-2">
                Browse resources for migrants in New Zealand.
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
                <button
                    onClick={() => setShowResourcesForm(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg"
                >
                    Add Resource
                </button>{categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-lg border transition-colors ${selectedCategory === category
                            ? "bg-primary text-white border-primary"
                            : "bg-white border-neutral/20"
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {loading && (
                <p className="mt-8 text-neutral">
                    Loading resources...
                </p>
            )}

            {error && (
                <p className="mt-8">
                    {error}
                </p>
            )}

            {!loading && !error && (
                <>
                    {filteredResources.length === 0 ? (
                        <p className="mt-8 text-neutral">
                            No resources found.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            {filteredResources.map((resource) => (
                                <ResourcesCard
                                    key={resource.id}
                                    title={resource.title}
                                    category={resource.category}
                                    description={resource.description}
                                    link={resource.link}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {showResourcesForm && (
                <Modal onClose={() => setShowResourcesForm(false)}>
                    <ResourcesForm />
                </Modal>
            )}
        </div>
    );
}