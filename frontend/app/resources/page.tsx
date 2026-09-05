"use client";

import { useState, useEffect } from "react";
import ResourcesCard from "@/components/ResourcesCard";
import Modal from "@/components/Modal";
import ResourcesForm from "@/components/ResourcesForm";
import { useAuth } from "@/context/AuthContext";

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
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

    const { user } = useAuth();

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
                {user && (
                    <button
                        onClick={() => setShowResourcesForm(true)}
                        className="bg-primary text-white px-4 py-2 rounded-lg"
                    >
                        Add Resource
                    </button>
                )}
                {categories.map((category) => (
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
                                <div
                                    key={resource.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => setSelectedResource(resource)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            setSelectedResource(resource);
                                        }
                                    }}
                                    className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
                                >
                                    <ResourcesCard
                                        title={resource.title}
                                        description={resource.description}
                                        link={resource.link}
                                        category={resource.category}
                                    />
                                </div>
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
 {selectedResource && (
    <Modal onClose={() => setSelectedResource(null)}>
        <h2 className="text-2xl font-semibold">
            {selectedResource.title}
        </h2>

        <p className="text-primary mt-2">
            {selectedResource.category}
        </p>

        <p className="mt-4">
            {selectedResource.description}
        </p>

        <a
            href={selectedResource.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline mt-4 inline-block"
        >
            Visit Resource
        </a>
    </Modal>
)}
        </div>
    );
}