"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import Modal from "@/components/Modal";

interface SavedItem {
    listing_type: string;
    listing_id: number;
    title?: string;
    name?: string;
}

interface SavedItemDetail {
    id: number;
    title?: string;
    name?: string;
    company?: string;
    category?: string;
    location?: string;
    employment_type?: string;
    description?: string;
}

const filterOptions = [
    { id: "all", label: "All" },
    { id: "service", label: "Services" },
    { id: "job", label: "Jobs" },
    { id: "community_event", label: "Events" },
    { id: "community_group", label: "Groups" },
    { id: "resource", label: "Resources" },
];

export default function SavedPage() {
    const { user } = useAuth();
    const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("all");
    const [itemDetails, setItemDetails] = useState<Record<string, SavedItemDetail>>({});
    const [selectedItem, setSelectedItem] = useState<SavedItem | null>(null);

    useEffect(() => {
        if (user) {
            fetchSavedItems();
        }
    }, [user]);

    async function fetchSavedItems() {
        try {
            const response = await fetch(`http://localhost:4000/api/saved/${user?.id}`);
            const data = await response.json();
            setSavedItems(data);
            await fetchItemDetails(data);
        } catch (error) {
            console.error("Error fetching saved items:", error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchItemDetails(items: SavedItem[]) {
        const details: Record<string, SavedItemDetail> = {};
        for (const item of items) {
            try {
                if (item.listing_type === 'community_event') {
                    const response = await fetch(`http://localhost:4000/api/community/events`);
                    if (response.ok) {
                        const allItems = await response.json();
                        const found = allItems.find((i: SavedItemDetail) => i.id === item.listing_id);
                        if (found) details[`${item.listing_type}-${item.listing_id}`] = found;
                    }
                } else if (item.listing_type === 'community_group') {
                    const response = await fetch(`http://localhost:4000/api/community/groups`);
                    if (response.ok) {
                        const allItems = await response.json();
                        const found = allItems.find((i: SavedItemDetail) => i.id === item.listing_id);
                        if (found) details[`${item.listing_type}-${item.listing_id}`] = found;
                    }
                } else {
                    const response = await fetch(`http://localhost:4000/api/${item.listing_type}s`);
                    if (response.ok) {
                        const allItems = await response.json();
                        const found = allItems.find((i: SavedItemDetail) => i.id === item.listing_id);
                        if (found) details[`${item.listing_type}-${item.listing_id}`] = found;
                    }
                }
            } catch {
                console.error(`Failed to fetch ${item.listing_type} #${item.listing_id}`);
            }
        }
        setItemDetails(details);
    }

    const getItemTitle = (item: SavedItem) => {
        const key = `${item.listing_type}-${item.listing_id}`;
        const details = itemDetails[key];
        if (details) {
            return details.title || details.name || `${item.listing_type} #${item.listing_id}`;
        }
        return `${item.listing_type} #${item.listing_id}`;
    };

    const getItemDetails = (item: SavedItem) => {
        const key = `${item.listing_type}-${item.listing_id}`;
        return itemDetails[key] || null;
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            service: "Service",
            job: "Job",
            community_event: "Event",
            community_group: "Group",
            resource: "Resource",
        };
        return labels[type] || type;
    };

    const filteredItems = activeFilter === "all"
        ? savedItems
        : savedItems.filter(item => item.listing_type === activeFilter);

    if (loading) {
        return <div className="text-center py-12 text-neutral">Loading saved listings...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <Link href="/userDashboard" className="text-neutral hover:text-primary mb-6 inline-block">
                ← Back to Dashboard
            </Link>

            <h1 className="text-2xl font-semibold mb-6">All Saved Listings</h1>

            <div className="flex flex-wrap gap-2 mb-6">
                {filterOptions.map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id)}
                        className={`px-4 py-2 rounded-full text-sm transition-colors ${
                            activeFilter === filter.id
                                ? "bg-primary text-white"
                                : "bg-gray-100 text-neutral-600 hover:bg-gray-200"
                        }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {filteredItems.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-neutral-600">No saved listings found.</p>
                    <p className="text-sm text-neutral-500 mt-1">
                        Start exploring and save services, jobs, and resources you like.
                    </p>
                    <Link href="/services" className="inline-block mt-4 text-primary hover:underline">
                        Browse Services →
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredItems.map((item, index) => (
                        <div
                            key={`${item.listing_type}-${item.listing_id}-${index}`}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedItem(item)}
                            onKeyDown={(keyEvent) => {
                                if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                                    keyEvent.preventDefault();
                                    setSelectedItem(item);
                                }
                            }}
                            className="border border-neutral/20 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-black">
                                        {getItemTitle(item)}
                                    </p>
                                    <p className="text-sm text-neutral-500 capitalize">
                                        {getTypeLabel(item.listing_type)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedItem && (
                <Modal onClose={() => setSelectedItem(null)}>
                    {(() => {
                        const details = getItemDetails(selectedItem);
                        return (
                            <>
                                <h2 className="text-2xl font-semibold">
                                    {details?.title || details?.name || getItemTitle(selectedItem)}
                                </h2>

                                <Link
                                    href={
                                        selectedItem.listing_type === "service"
                                            ? "/services"
                                            : selectedItem.listing_type === "job"
                                                ? "/jobs"
                                                : selectedItem.listing_type === "resource"
                                                    ? "/resources"
                                                    : "/community"
                                    }
                                    className="text-primary mt-2 capitalize inline-block hover:underline"
                                >
                                    {getTypeLabel(selectedItem.listing_type)}
                                </Link>

                                {details?.company && (
                                    <p className="font-medium mt-2">
                                        {details.company}
                                    </p>
                                )}

                                {details?.category && (
                                    <p className="mt-2">
                                        Category: {details.category}
                                    </p>
                                )}

                                {details?.location && (
                                    <p className="mt-2">
                                        Location: {details.location}
                                    </p>
                                )}

                                {details?.employment_type && (
                                    <p className="mt-2">
                                        Employment Type: {details.employment_type}
                                    </p>
                                )}

                                <p className="mt-4">
                                    {details?.description || "No description available"}
                                </p>
                            </>
                        );
                    })()}
                </Modal>
            )}
        </div>
    );
}