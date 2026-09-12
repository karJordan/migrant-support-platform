export type CommunityEvent = {
    id: number;
    category_id?: number | null;
    title: string;
    location: string;
    event_date: string;
    event_time: string;
    description: string;
    status: "pending" | "approved" | "rejected";
};