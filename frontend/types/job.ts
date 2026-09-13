export type Job = {
    id: number;
    category_id?: number | null;
    title: string;
    company: string;
    location: string;
    employment_type: string;
    description: string;
    status: "pending" | "approved" | "rejected";
};