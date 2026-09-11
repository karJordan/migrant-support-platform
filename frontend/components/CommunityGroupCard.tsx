import Card from "@/components/ui/Card";
import SaveButton from "./SaveButton";

type CommunityGroupProps = {
    id: string | number;
    name: string;
    category: string;
    description: string;
};

export default function CommunityGroupCard({
    id,
    name,
    category,
    description,
}: CommunityGroupProps) {
    return (
        <Card hoverable>
            <div className="flex items-start justify-between gap-4">
            <h2 className="heading-4 min-w-0 break-words">
                {name}
            </h2>
            <SaveButton itemType="community_group" itemId={id} />
            </div>
            <p className="mt-2 text-sm font-medium text-text-secondary">
                {category}
            </p>

            <p className="text-text-secondary mt-2 break-words">
                {description}
            </p>
        </Card>
    );
}
