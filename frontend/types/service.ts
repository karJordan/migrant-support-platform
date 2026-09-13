export type Service = {
    id: number;
    category_id?: number | null;
    name: string;
    category: string;
    description: string;
    location: string;
    phone: string;
    website: string;
};