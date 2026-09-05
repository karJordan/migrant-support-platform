import SaveButton from "./SaveButton";

type CommunityEventProps = {
    id: string | number;
    name: string;
    category: string;
    description: string;
};

export default function CommunityEventCard({
    id,
    name,
    category,
    description,
}: CommunityEventProps) {
    return (
        <div className="border border-neutral/20 rounded-xl p-5 bg-white">
            <div className="flex items-start justify-between">
            <span className="text-sm text-primary font-medium">
                {name}
            </span>
            <SaveButton itemType="community_group" itemId={id} />
            </div>
            <h2 className="text-xl font-semibold mt-2">
                {category}
            </h2>

            <p className="text-neutral mt-2">
                {description}
            </p>
        </div>
    );
}