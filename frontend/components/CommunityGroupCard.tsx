import Card from "@/components/ui/Card";
import { Users } from "lucide-react";

type CommunityGroupProps = {
    id: string | number;
    name: string;
    category: string;
    description: string;
};

export default function CommunityGroupCard({ name, category }: CommunityGroupProps) {
    return (
        <Card hoverable className="h-full">
            <div className="flex items-start gap-3">
                <div aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary"><Users size={22} /></div>
                <div className="min-w-0 flex-1">
                    <h2 className="break-words text-base font-semibold leading-snug">{name}</h2>
                    <p className="mt-1 break-words text-sm text-text-secondary">{category || "Community group"}</p>
                </div>
            </div>
        </Card>
    );
}
