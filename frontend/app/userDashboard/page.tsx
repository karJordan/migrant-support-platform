"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function UserDashboardPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
    const [savedCount, setSavedCount] = useState(0);
    const [loadingSaved, setLoadingSaved] = useState(true);
    const [itemDetails, setItemDetails] = useState<Record<string, SavedItemDetail>>({});
    const [selectedItem, setSelectedItem] = useState<SavedItem | null>(null);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [isLoading, user, router]);

    useEffect(() => {
        if (user) {
            fetchSavedItems();
        }
    }, [user]);

    async function fetchSavedItems() {
        setLoadingSaved(true);
        try {
            const response = await fetch(`http://localhost:4000/api/saved/${user?.id}`);
            const data = await response.json();
            setSavedItems(data.slice(0, 5));
            setSavedCount(data.length);
            await fetchItemDetails(data.slice(0, 5));
        } catch (error) {
            console.error("Error fetching saved items:", error);
        } finally {
            setLoadingSaved(false);
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

    if (isLoading || !user) return null;

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <h1 className="text-2xl font-semibold mb-2">Welcome back, {user.name}</h1>
            <p className="text-neutral mb-8">This is your dashboard.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/saved" className="border border-neutral/20 rounded-xl p-4 hover:border-primary transition-colors hover:shadow-sm">
                    <p className="text-2xl font-semibold text-primary">{savedCount}</p>
                    <p className="text-sm text-neutral">Saved Listings</p>
                </Link>
                <div className="border border-neutral/20 rounded-xl p-4">
                    <p className="text-2xl font-semibold text-primary">0</p>
                    <p className="text-sm text-neutral">My Posts</p>
                </div>
                <div className="border border-neutral/20 rounded-xl p-4">
                    <p className="text-2xl font-semibold text-primary">0</p>
                    <p className="text-sm text-neutral">Messages</p>
                </div>
            </div>

            <div className="bg-white border border-neutral/20 rounded-xl p-6 mt-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Recently Saved</h2>
                    {savedCount > 0 && (
                        <Link href="/saved" className="text-primary text-sm hover:underline">
                            View All ({savedCount})
                        </Link>
                    )}
                </div>

                {loadingSaved ? (
                  <p className="text-neutral">Loading saved items...</p>
                  ) : savedItems.length === 0 ? (
                  <p className="text-neutral">You have no saved items.</p>
                  ) : (
    <ul className="space-y-2">
        {savedItems.map((item) => {
            return (
                <li key={`${item.listing_type}-${item.listing_id}`}>
                    <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedItem(item)}
                        onKeyDown={(keyEvent) => {
                            if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                                keyEvent.preventDefault();
                                setSelectedItem(item);
                            }
                        }}
                        className="text-primary hover:underline cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    >
                        {getItemTitle(item)} ({getTypeLabel(item.listing_type)})
                    </div>
                </li>
            );
        })}
    </ul>
                )}
            </div>

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