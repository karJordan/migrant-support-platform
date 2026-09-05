"use client";

import { use, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";

interface SavedItem {
  listing_type: string;
  listing_id: number;
  title?: string;
  name?: string;
}

const filterOptions = [
    { id: "all", label: "All" },
    { id: "service", label: "Services" },
    { id: "job", label: "Jobs" },
    { id: "community_event", label: "Events" },
    { id: "community_group", label: "Groups" },
    { id: "resource", label: "Resources" },
];

const typeLabels: Record<string, string> = {
    service: "Service",
    job: "Job",
    community_event: "Event",
    community_group: "Group",
    resource: "Resource",
    };

export default function SavedPage() {
    const { user } = useAuth();
    const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("all");
    const [itemDetails, setItemDetails] = useState<Record<string, any>>({});

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
        const details: Record<string, any> = {};
        
        for (const item of items) {
            try {
                if (item.listing_type === 'community_event') {
                    // Fetch community events
                    const response = await fetch(`http://localhost:4000/api/community/events`);
                    if (response.ok) {
                        const allItems = await response.json();
                        const found = allItems.find((i: any) => i.id === item.listing_id);
                        if (found) details[`${item.listing_type}-${item.listing_id}`] = found;
                    }
                } else if (item.listing_type === 'community_group') {
                    // Fetch community groups
                    const response = await fetch(`http://localhost:4000/api/community/groups`);
                    if (response.ok) {
                        const allItems = await response.json();
                        const found = allItems.find((i: any) => i.id === item.listing_id);
                        if (found) details[`${item.listing_type}-${item.listing_id}`] = found;
                    }
                } else {
                    // Regular types: jobs, services, resources
                    const response = await fetch(`http://localhost:4000/api/${item.listing_type}s`);
                    if (response.ok) {
                        const allItems = await response.json();
                        const found = allItems.find((i: any) => i.id === item.listing_id);
                        if (found) details[`${item.listing_type}-${item.listing_id}`] = found;
                    }
                }
            } catch (error) {
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

    const getItemHref = (item: SavedItem) => {
        if (item.listing_type === 'community_event' || item.listing_type === 'community_group') {
            return '/community';
        }
        return `/${item.listing_type}s/${item.listing_id}`;
    };

    const filteredItems = activeFilter === "all"
        ? savedItems
        : savedItems.filter(item => item.listing_type === activeFilter);

        if (loading) {
            return <div className="text-center py-12 text-neutral"> Loading saved listings...</div>;
        }

        return (
            <div className="max-w-4xl mx-auto px-6 py-10">
                <Link href="/userDashboard" className="text-natural hover:text-primary mb-6 inline-block">
                    ← Back to Dashboard
                </Link>
                <h1 className="text-2xl font-semibold mb-6">All Saved Listing</h1>
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
                    <p className="text-neutral">No saved listings found.</p>
                ) : (
                    <div className="space-y-3">
                        {filteredItems.map((item, index) => (
                            <div key={`${item.listing_type}-${item.listing_id}-${index}`}
                                className="border border-neutral/20 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p  className="font-semibold text-black">
                                                {getItemTitle(item)}
                                            </p>
                                            <p className="text-sm text-neutral-500 capitalize">
                                                {typeLabels[item.listing_type] || item.listing_type}
                                            </p>
                                        </div>
                                        <Link href={getItemHref(item)} 
                                            className="text-primary hover:underline text-sm">
                                            View Details
                                        </Link>
                                    </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }
            